import {
  extractText,
  extractPageText,
  getPageCount,
  PageText,
} from './pdfTextExtractor';
import {
  getCachedPageText,
  getAllCachedPages,
  isTextCached,
  cacheMultiplePages,
  clearCachedText,
  getCacheStats,
} from '../db/queries/extractedText';

export interface BookContent {
  bookId: number;
  pageCount: number;
  pages: PageText[];
  extractedAt: number; // timestamp
}

export class TextExtractor {
  // Keep memory cache for active session (faster access)
  private static memoryCache = new Map<string, BookContent>();

  /**
   * Extract all text from a PDF book with database caching
   * @param filePath Absolute path to the PDF file
   * @param bookId Database ID of the book
   * @param forceRefresh Force re-extraction even if cached
   * @returns Book content with all pages
   */
  static async extractBook(
    filePath: string,
    bookId: number,
    forceRefresh: boolean = false,
  ): Promise<BookContent> {
    const cacheKey = `${bookId}-${filePath}`;
    const bookIdStr = bookId.toString();

    // Check memory cache first (fastest)
    if (!forceRefresh && this.memoryCache.has(cacheKey)) {
      console.log(`[TextExtractor] Using memory cache for book ${bookId}`);
      return this.memoryCache.get(cacheKey)!;
    }

    // Check database cache
    if (!forceRefresh && isTextCached(bookIdStr)) {
      console.log(
        `[TextExtractor] Loading from database cache for book ${bookId}`,
      );
      try {
        const cachedPages = getAllCachedPages(bookIdStr);

        if (cachedPages.length > 0) {
          const bookContent: BookContent = {
            bookId,
            pageCount: cachedPages.length,
            pages: cachedPages,
            extractedAt: Date.now(),
          };

          // Store in memory cache for this session
          this.memoryCache.set(cacheKey, bookContent);

          console.log(
            `[TextExtractor] Loaded ${cachedPages.length} pages from cache`,
          );
          return bookContent;
        }
      } catch (error) {
        console.warn(
          '[TextExtractor] Failed to load from cache, will re-extract:',
          error,
        );
      }
    }

    // No cache or force refresh - extract from PDF
    console.log(`[TextExtractor] Extracting text from book ${bookId}...`);
    const startTime = Date.now();

    try {
      const result = await extractText(filePath);

      const bookContent: BookContent = {
        bookId,
        pageCount: result.pageCount,
        pages: result.pages,
        extractedAt: Date.now(),
      };

      // Store in both memory and database cache
      this.memoryCache.set(cacheKey, bookContent);

      // Save to database asynchronously (don't block UI)
      this.saveToDatabaseCache(bookIdStr, result.pages).catch(error => {
        console.error('[TextExtractor] Failed to cache to database:', error);
      });

      const duration = Date.now() - startTime;
      console.log(
        `[TextExtractor] Extracted ${result.pageCount} pages in ${duration}ms`,
      );

      return bookContent;
    } catch (error) {
      console.error('[TextExtractor] Extraction failed:', error);
      throw error;
    }
  }

  /**
   * Save extracted pages to database cache (async)
   */
  private static async saveToDatabaseCache(
    bookId: string,
    pages: PageText[],
  ): Promise<void> {
    try {
      console.log(
        `[TextExtractor] Caching ${pages.length} pages to database...`,
      );
      cacheMultiplePages(bookId, pages);
      console.log('[TextExtractor] Successfully cached to database');
    } catch (error) {
      console.error('[TextExtractor] Database caching failed:', error);
      throw error;
    }
  }

  /**
   * Extract text from a single page (with caching)
   * @param filePath Absolute path to the PDF file
   * @param bookId Database ID of the book
   * @param pageNumber Page number (1-indexed)
   * @returns Text content of the page
   */
  static async extractPage(
    filePath: string,
    bookId: number,
    pageNumber: number,
  ): Promise<string> {
    const bookIdStr = bookId.toString();

    // Check database cache first
    const cached = getCachedPageText(bookIdStr, pageNumber);
    if (cached) {
      console.log(`[TextExtractor] Using cached page ${pageNumber}`);
      return cached;
    }

    // Extract from PDF
    try {
      const text = await extractPageText(filePath, pageNumber);

      // Cache for future use (async)
      cacheMultiplePages(bookIdStr, [{ pageNumber, text }]);

      return text;
    } catch (error) {
      console.error(
        `[TextExtractor] Failed to extract page ${pageNumber}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Get total page count without extracting text
   * @param filePath Absolute path to the PDF file
   * @returns Number of pages
   */
  static async getPageCount(filePath: string): Promise<number> {
    try {
      return await getPageCount(filePath);
    } catch (error) {
      console.error('[TextExtractor] Failed to get page count:', error);
      throw error;
    }
  }

  /**
   * Clear cache for a specific book or all books
   * @param bookId Optional book ID to clear specific cache
   */
  static clearCache(bookId?: number): void {
    if (bookId !== undefined) {
      // Clear memory cache
      const keysToDelete: string[] = [];
      this.memoryCache.forEach((_, key) => {
        if (key.startsWith(`${bookId}-`)) {
          keysToDelete.push(key);
        }
      });
      keysToDelete.forEach(key => this.memoryCache.delete(key));

      // Clear database cache
      clearCachedText(bookId.toString());

      console.log(`[TextExtractor] Cleared all caches for book ${bookId}`);
    } else {
      // Clear all memory cache
      this.memoryCache.clear();
      console.log('[TextExtractor] Cleared memory cache');
    }
  }

  /**
   * Get cache size (memory only)
   * @returns Number of cached books in memory
   */
  static getCacheSize(): number {
    return this.memoryCache.size;
  }

  /**
   * Get cache statistics
   */
  static getCacheStats() {
    const dbStats = getCacheStats();
    return {
      memory: this.memoryCache.size,
      database: dbStats,
    };
  }
}

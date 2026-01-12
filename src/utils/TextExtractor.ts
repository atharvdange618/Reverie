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
  extractedAt: number;
}

export class TextExtractor {
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

    if (!forceRefresh && this.memoryCache.has(cacheKey)) {
      return this.memoryCache.get(cacheKey)!;
    }

    if (!forceRefresh && isTextCached(bookIdStr)) {
      try {
        const cachedPages = getAllCachedPages(bookIdStr);

        if (cachedPages.length > 0) {
          const bookContent: BookContent = {
            bookId,
            pageCount: cachedPages.length,
            pages: cachedPages,
            extractedAt: Date.now(),
          };

          this.memoryCache.set(cacheKey, bookContent);

          return bookContent;
        }
      } catch (error) {
        console.warn(
          '[TextExtractor] Failed to load from cache, will re-extract:',
          error,
        );
      }
    }

    try {
      const result = await extractText(filePath);

      const bookContent: BookContent = {
        bookId,
        pageCount: result.pageCount,
        pages: result.pages,
        extractedAt: Date.now(),
      };

      this.memoryCache.set(cacheKey, bookContent);

      this.saveToDatabaseCache(bookIdStr, result.pages).catch(error => {
        console.error('[TextExtractor] Failed to cache to database:', error);
      });

      return bookContent;
    } catch (error) {
      console.error('[TextExtractor] Extraction failed:', error);
      throw error;
    }
  }

  /**
   * Save extracted pages to database cache
   */
  private static async saveToDatabaseCache(
    bookId: string,
    pages: PageText[],
  ): Promise<void> {
    try {
      cacheMultiplePages(bookId, pages);
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

    const cached = getCachedPageText(bookIdStr, pageNumber);
    if (cached) {
      return cached;
    }

    try {
      const text = await extractPageText(filePath, pageNumber);

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
      const keysToDelete: string[] = [];
      this.memoryCache.forEach((_, key) => {
        if (key.startsWith(`${bookId}-`)) {
          keysToDelete.push(key);
        }
      });
      keysToDelete.forEach(key => this.memoryCache.delete(key));

      clearCachedText(bookId.toString());
    } else {
      this.memoryCache.clear();
    }
  }

  /**
   * Get cache size
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

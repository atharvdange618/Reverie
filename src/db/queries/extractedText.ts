/**
 * Database queries for extracted text caching
 */

import { executeQuery, executeUpdate } from '../database';

export interface ExtractedTextRow {
  id: number;
  bookId: string;
  pageNumber: number;
  text: string;
  extractedAt: string;
}

export interface CachedPageText {
  pageNumber: number;
  text: string;
}

/**
 * Get cached text for a specific page
 */
export const getCachedPageText = (
  bookId: string,
  pageNumber: number,
): string | null => {
  const rows = executeQuery<ExtractedTextRow>(
    'SELECT text FROM extracted_text WHERE bookId = ? AND pageNumber = ?',
    [bookId, pageNumber],
  );

  return rows.length > 0 ? rows[0].text : null;
};

/**
 * Get all cached pages for a book
 */
export const getAllCachedPages = (bookId: string): CachedPageText[] => {
  const rows = executeQuery<ExtractedTextRow>(
    'SELECT pageNumber, text FROM extracted_text WHERE bookId = ? ORDER BY pageNumber ASC',
    [bookId],
  );

  return rows.map(row => ({
    pageNumber: row.pageNumber,
    text: row.text,
  }));
};

/**
 * Check if text is cached for a book
 */
export const isTextCached = (bookId: string): boolean => {
  const rows = executeQuery<{ count: number }>(
    'SELECT COUNT(*) as count FROM extracted_text WHERE bookId = ?',
    [bookId],
  );

  return rows.length > 0 && rows[0].count > 0;
};

/**
 * Get count of cached pages
 */
export const getCachedPageCount = (bookId: string): number => {
  const rows = executeQuery<{ count: number }>(
    'SELECT COUNT(*) as count FROM extracted_text WHERE bookId = ?',
    [bookId],
  );

  return rows.length > 0 ? rows[0].count : 0;
};

/**
 * Cache extracted text for a page
 */
export const cachePageText = (
  bookId: string,
  pageNumber: number,
  text: string,
): void => {
  const now = new Date().toISOString();

  executeUpdate(
    `INSERT OR REPLACE INTO extracted_text (bookId, pageNumber, text, extractedAt)
     VALUES (?, ?, ?, ?)`,
    [bookId, pageNumber, text, now],
  );
};

/**
 * Cache multiple pages at once
 */
export const cacheMultiplePages = (
  bookId: string,
  pages: Array<{ pageNumber: number; text: string }>,
): void => {
  const now = new Date().toISOString();

  pages.forEach(page => {
    executeUpdate(
      `INSERT OR REPLACE INTO extracted_text (bookId, pageNumber, text, extractedAt)
       VALUES (?, ?, ?, ?)`,
      [bookId, page.pageNumber, page.text, now],
    );
  });
};

/**
 * Clear cached text for a book
 */
export const clearCachedText = (bookId: string): void => {
  executeUpdate('DELETE FROM extracted_text WHERE bookId = ?', [bookId]);
};

/**
 * Clear all cached text
 */
export const clearAllCachedText = (): void => {
  executeUpdate('DELETE FROM extracted_text', []);
};

/**
 * Get cache statistics
 */
export const getCacheStats = (): {
  totalBooks: number;
  totalPages: number;
  oldestCache: string | null;
} => {
  const bookCount = executeQuery<{ count: number }>(
    'SELECT COUNT(DISTINCT bookId) as count FROM extracted_text',
    [],
  );

  const pageCount = executeQuery<{ count: number }>(
    'SELECT COUNT(*) as count FROM extracted_text',
    [],
  );

  const oldest = executeQuery<{ extractedAt: string }>(
    'SELECT extractedAt FROM extracted_text ORDER BY extractedAt ASC LIMIT 1',
    [],
  );

  return {
    totalBooks: bookCount.length > 0 ? bookCount[0].count : 0,
    totalPages: pageCount.length > 0 ? pageCount[0].count : 0,
    oldestCache: oldest.length > 0 ? oldest[0].extractedAt : null,
  };
};

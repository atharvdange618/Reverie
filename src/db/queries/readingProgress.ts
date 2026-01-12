/**
 * Database queries for reading progress tracking
 */

import { executeQuery, executeUpdate } from '../database';

export interface ReadingProgress {
  bookId: string;
  currentPage: number;
  scrollPosition: number;
  totalPages: number;
  lastReadAt: string;
  readingMode: 'pdf' | 'book';
}

/**
 * Get reading progress for a book
 */
export const getReadingProgress = (bookId: string): ReadingProgress | null => {
  const rows = executeQuery<ReadingProgress>(
    'SELECT * FROM reading_progress WHERE bookId = ?',
    [bookId],
  );

  return rows.length > 0 ? rows[0] : null;
};

/**
 * Save reading progress
 */
export const saveReadingProgress = (
  bookId: string,
  currentPage: number,
  scrollPosition: number = 0,
  totalPages: number = 0,
  readingMode: 'pdf' | 'book' = 'pdf',
): void => {
  const now = new Date().toISOString();

  executeUpdate(
    `INSERT OR REPLACE INTO reading_progress 
     (bookId, currentPage, scrollPosition, totalPages, lastReadAt, readingMode)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [bookId, currentPage, scrollPosition, totalPages, now, readingMode],
  );
};

/**
 * Update current page only
 */
export const updateCurrentPage = (
  bookId: string,
  currentPage: number,
): void => {
  const now = new Date().toISOString();

  executeUpdate(
    `UPDATE reading_progress 
     SET currentPage = ?, lastReadAt = ?
     WHERE bookId = ?`,
    [currentPage, now, bookId],
  );
};

/**
 * Update scroll position only
 */
export const updateScrollPosition = (
  bookId: string,
  scrollPosition: number,
): void => {
  const now = new Date().toISOString();

  executeUpdate(
    `UPDATE reading_progress 
     SET scrollPosition = ?, lastReadAt = ?
     WHERE bookId = ?`,
    [scrollPosition, now, bookId],
  );
};

/**
 * Clear progress for a book
 */
export const clearReadingProgress = (bookId: string): void => {
  executeUpdate('DELETE FROM reading_progress WHERE bookId = ?', [bookId]);
};

/**
 * Get all books with reading progress
 */
export const getAllReadingProgress = (): ReadingProgress[] => {
  return executeQuery<ReadingProgress>(
    'SELECT * FROM reading_progress ORDER BY lastReadAt DESC',
    [],
  );
};

/**
 * Get recently read books
 */
export const getRecentlyReadBooks = (limit: number = 10): ReadingProgress[] => {
  return executeQuery<ReadingProgress>(
    'SELECT * FROM reading_progress ORDER BY lastReadAt DESC LIMIT ?',
    [limit],
  );
};

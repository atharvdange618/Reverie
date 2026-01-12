/**
 * Reverie Book Queries
 */

import { v4 as uuidv4 } from 'uuid';
import { executeQuery, executeUpdate } from '../database';
import { Book, BookWithProgress } from '../../types';

/**
 * Get all books ordered by last opened
 */
export const getAllBooks = (): BookWithProgress[] => {
  const books = executeQuery<Book>(
    'SELECT * FROM books ORDER BY lastOpenedAt DESC',
  );

  return books.map(book => ({
    ...book,
    progress:
      book.totalPages > 0
        ? Math.round((book.currentPage / book.totalPages) * 100)
        : 0,
  }));
};

/**
 * Get a single book by ID
 */
export const getBookById = (id: string): BookWithProgress | null => {
  const books = executeQuery<Book>('SELECT * FROM books WHERE id = ?', [id]);

  if (books.length === 0) return null;

  const book = books[0];
  return {
    ...book,
    progress:
      book.totalPages > 0
        ? Math.round((book.currentPage / book.totalPages) * 100)
        : 0,
  };
};

/**
 * Get the most recently opened book
 */
export const getLastOpenedBook = (): BookWithProgress | null => {
  const books = executeQuery<Book>(
    'SELECT * FROM books WHERE lastOpenedAt IS NOT NULL ORDER BY lastOpenedAt DESC LIMIT 1',
  );

  if (books.length === 0) return null;

  const book = books[0];
  return {
    ...book,
    progress:
      book.totalPages > 0
        ? Math.round((book.currentPage / book.totalPages) * 100)
        : 0,
  };
};

/**
 * Add a new book
 */
export const addBook = (
  title: string,
  filePath: string,
  totalPages: number,
): Book => {
  const id = uuidv4();
  const now = new Date().toISOString();

  executeUpdate(
    `INSERT INTO books (id, title, filePath, currentPage, totalPages, lastOpenedAt, createdAt)
     VALUES (?, ?, ?, 1, ?, ?, ?)`,
    [id, title, filePath, totalPages, now, now],
  );

  return {
    id,
    title,
    filePath,
    currentPage: 1,
    totalPages,
    lastOpenedAt: now,
    createdAt: now,
  };
};

/**
 * Update book reading progress
 */
export const updateBookProgress = (id: string, currentPage: number): void => {
  const now = new Date().toISOString();

  executeUpdate(
    'UPDATE books SET currentPage = ?, lastOpenedAt = ? WHERE id = ?',
    [currentPage, now, id],
  );
};

/**
 * Update book total pages
 */
export const updateBookTotalPages = (id: string, totalPages: number): void => {
  executeUpdate('UPDATE books SET totalPages = ? WHERE id = ?', [
    totalPages,
    id,
  ]);
};

/**
 * Update book title
 */
export const updateBookTitle = (id: string, title: string): void => {
  executeUpdate('UPDATE books SET title = ? WHERE id = ?', [title, id]);
};

/**
 * Delete a book and all its annotations
 */
export const deleteBook = (id: string): void => {
  executeUpdate('DELETE FROM books WHERE id = ?', [id]);
};

/**
 * Get reading statistics
 */
export const getReadingStats = (): {
  totalBooks: number;
  completedBooks: number;
  totalPagesRead: number;
} => {
  const books = getAllBooks();

  const totalBooks = books.length;
  const completedBooks = books.filter(b => b.progress >= 100).length;
  const totalPagesRead = books.reduce((sum, b) => sum + b.currentPage, 0);

  return {
    totalBooks,
    completedBooks,
    totalPagesRead,
  };
};

/**
 * Mark book as completion celebrated
 */
export const markBookCompletionCelebrated = (id: string): void => {
  executeUpdate('UPDATE books SET completionCelebrated = 1 WHERE id = ?', [id]);
};

/**
 * Check if book completion has been celebrated
 */
export const isBookCompletionCelebrated = (id: string): boolean => {
  const books = executeQuery<{ completionCelebrated: number }>(
    'SELECT completionCelebrated FROM books WHERE id = ?',
    [id],
  );
  return books.length > 0 && books[0].completionCelebrated === 1;
};

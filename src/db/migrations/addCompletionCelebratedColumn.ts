/**
 * Migration: Add completionCelebrated column to books table
 *
 * Adds a flag to track whether the book completion celebration
 * has been shown for each book.
 */

import { executeUpdate, executeQuery } from '../database';

export const addCompletionCelebratedColumn = (): void => {
  try {
    const tableInfo = executeQuery<{ name: string }>(
      'PRAGMA table_info(books)',
    );
    const columnExists = tableInfo.some(
      col => col.name === 'completionCelebrated',
    );

    if (columnExists) {
      return;
    }

    executeUpdate(`
      ALTER TABLE books 
      ADD COLUMN completionCelebrated INTEGER DEFAULT 0
    `);
  } catch (error) {
    console.error('❌ Migration failed: addCompletionCelebratedColumn', error);
  }
};

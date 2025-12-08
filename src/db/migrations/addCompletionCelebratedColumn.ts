/**
 * Migration: Add completionCelebrated column to books table
 *
 * Adds a flag to track whether the book completion celebration
 * has been shown for each book.
 */

import { executeUpdate } from '../database';

export const addCompletionCelebratedColumn = (): void => {
  try {
    executeUpdate(`
      ALTER TABLE books 
      ADD COLUMN completionCelebrated INTEGER DEFAULT 0
    `);
    console.log(
      '✅ Migration: Added completionCelebrated column to books table',
    );
  } catch (error) {
    console.error('❌ Migration failed: addCompletionCelebratedColumn', error);
  }
};

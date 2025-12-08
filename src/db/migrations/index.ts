/**
 * Database Migrations
 *
 * Run these migrations on app startup to ensure data integrity
 */

import { removeDuplicateBookmarks } from './removeDuplicateBookmarks';
import { addCompletionCelebratedColumn } from './addCompletionCelebratedColumn';

export const runMigrations = (): void => {
  try {
    console.log('Running database migrations...');

    // Remove duplicate bookmarks (one-time migration)
    removeDuplicateBookmarks();

    // Add completionCelebrated column to books table
    addCompletionCelebratedColumn();

    console.log('All migrations completed successfully');
  } catch (error) {
    console.error('Migration error:', error);
  }
};

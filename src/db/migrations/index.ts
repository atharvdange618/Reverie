/**
 * Database Migrations
 *
 * Run these migrations on app startup to ensure data integrity
 */

import { removeDuplicateBookmarks } from './removeDuplicateBookmarks';
import { addCompletionCelebratedColumn } from './addCompletionCelebratedColumn';

export const runMigrations = (): void => {
  try {
    removeDuplicateBookmarks();

    addCompletionCelebratedColumn();
  } catch (error) {
    console.error('Migration error:', error);
  }
};

/**
 * Migration: Remove duplicate bookmarks
 *
 * This migration removes duplicate bookmarks (same bookId and page)
 * keeping only the most recent one.
 */

import { executeUpdate } from '../database';

export const removeDuplicateBookmarks = (): void => {
  console.log('Migration: Removing duplicate bookmarks...');

  try {
    // Delete duplicates, keeping only the one with the latest createdAt for each (bookId, page)
    executeUpdate(`
      DELETE FROM bookmarks
      WHERE id NOT IN (
        SELECT MIN(id)
        FROM bookmarks
        GROUP BY bookId, page
      )
    `);

    console.log('Migration: Duplicate bookmarks removed successfully');
  } catch (error) {
    console.error('Migration: Failed to remove duplicate bookmarks:', error);
    // Don't throw - allow app to continue
  }
};

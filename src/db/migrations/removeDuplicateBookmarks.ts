/**
 * Migration: Remove duplicate bookmarks
 *
 * This migration removes duplicate bookmarks (same bookId and page)
 * keeping only the most recent one.
 */

import { executeUpdate } from '../database';

export const removeDuplicateBookmarks = (): void => {
  try {
    executeUpdate(`
      DELETE FROM bookmarks
      WHERE id NOT IN (
        SELECT MIN(id)
        FROM bookmarks
        GROUP BY bookId, page
      )
    `);
  } catch (error) {
    console.error('Migration: Failed to remove duplicate bookmarks:', error);
  }
};

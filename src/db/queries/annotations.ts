/**
 * Reverie Annotation Queries
 *
 * Bookmarks, Highlights, Emoji Reactions
 */

import { v4 as uuidv4 } from 'uuid';
import { executeQuery, executeUpdate } from '../database';
import {
  Bookmark,
  Highlight,
  FreehandHighlight,
  EmojiReaction,
  HighlightColor,
} from '../../types';

// ============ Bookmarks ============

export const getBookmarks = (bookId: string): Bookmark[] => {
  return executeQuery<Bookmark>(
    'SELECT * FROM bookmarks WHERE bookId = ? ORDER BY page ASC',
    [bookId],
  );
};

export const isPageBookmarked = (bookId: string, page: number): boolean => {
  const results = executeQuery<{ count: number }>(
    'SELECT COUNT(*) as count FROM bookmarks WHERE bookId = ? AND page = ?',
    [bookId, page],
  );
  return results[0]?.count > 0;
};

export const addBookmark = (bookId: string, page: number): Bookmark => {
  const id = uuidv4();
  const now = new Date().toISOString();

  executeUpdate(
    'INSERT INTO bookmarks (id, bookId, page, createdAt) VALUES (?, ?, ?, ?)',
    [id, bookId, page, now],
  );

  return { id, bookId, page, createdAt: now };
};

export const removeBookmark = (bookId: string, page: number): void => {
  executeUpdate('DELETE FROM bookmarks WHERE bookId = ? AND page = ?', [
    bookId,
    page,
  ]);
};

export const toggleBookmark = (bookId: string, page: number): boolean => {
  const isBookmarked = isPageBookmarked(bookId, page);

  if (isBookmarked) {
    removeBookmark(bookId, page);
    return false;
  } else {
    addBookmark(bookId, page);
    return true;
  }
};

// ============ Highlights (Rectangle) ============

export const getHighlights = (bookId: string, page?: number): Highlight[] => {
  if (page !== undefined) {
    return executeQuery<Highlight>(
      'SELECT * FROM highlights WHERE bookId = ? AND page = ? ORDER BY createdAt ASC',
      [bookId, page],
    );
  }
  return executeQuery<Highlight>(
    'SELECT * FROM highlights WHERE bookId = ? ORDER BY page ASC, createdAt ASC',
    [bookId],
  );
};

export const addHighlight = (
  bookId: string,
  page: number,
  x: number,
  y: number,
  width: number,
  height: number,
  color: HighlightColor,
): Highlight => {
  const id = uuidv4();
  const now = new Date().toISOString();

  executeUpdate(
    `INSERT INTO highlights (id, bookId, page, x, y, width, height, color, createdAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, bookId, page, x, y, width, height, color, now],
  );

  return { id, bookId, page, x, y, width, height, color, createdAt: now };
};

export const updateHighlightColor = (
  id: string,
  color: HighlightColor,
): void => {
  executeUpdate('UPDATE highlights SET color = ? WHERE id = ?', [color, id]);
};

export const deleteHighlight = (id: string): void => {
  executeUpdate('DELETE FROM highlights WHERE id = ?', [id]);
};

// ============ Freehand Highlights ============

export const getFreehandHighlights = (
  bookId: string,
  page?: number,
): FreehandHighlight[] => {
  if (page !== undefined) {
    return executeQuery<FreehandHighlight>(
      'SELECT * FROM freehand_highlights WHERE bookId = ? AND page = ? ORDER BY createdAt ASC',
      [bookId, page],
    );
  }
  return executeQuery<FreehandHighlight>(
    'SELECT * FROM freehand_highlights WHERE bookId = ? ORDER BY page ASC, createdAt ASC',
    [bookId],
  );
};

export const addFreehandHighlight = (
  bookId: string,
  page: number,
  path: string,
  color: HighlightColor,
  strokeWidth: number,
): FreehandHighlight => {
  const id = uuidv4();
  const now = new Date().toISOString();

  executeUpdate(
    `INSERT INTO freehand_highlights (id, bookId, page, path, color, strokeWidth, createdAt)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [id, bookId, page, path, color, strokeWidth, now],
  );

  return { id, bookId, page, path, color, strokeWidth, createdAt: now };
};

export const deleteFreehandHighlight = (id: string): void => {
  executeUpdate('DELETE FROM freehand_highlights WHERE id = ?', [id]);
};

// ============ Emoji Reactions ============

export const getEmojiReactions = (
  bookId: string,
  page?: number,
): EmojiReaction[] => {
  if (page !== undefined) {
    return executeQuery<EmojiReaction>(
      'SELECT * FROM emoji_reactions WHERE bookId = ? AND page = ? ORDER BY createdAt ASC',
      [bookId, page],
    );
  }
  return executeQuery<EmojiReaction>(
    'SELECT * FROM emoji_reactions WHERE bookId = ? ORDER BY page ASC, createdAt ASC',
    [bookId],
  );
};

export const addEmojiReaction = (
  bookId: string,
  page: number,
  x: number,
  y: number,
  emoji: string,
): EmojiReaction => {
  const id = uuidv4();
  const now = new Date().toISOString();

  executeUpdate(
    `INSERT INTO emoji_reactions (id, bookId, page, x, y, emoji, createdAt)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [id, bookId, page, x, y, emoji, now],
  );

  return { id, bookId, page, x, y, emoji, createdAt: now };
};

export const deleteEmojiReaction = (id: string): void => {
  executeUpdate('DELETE FROM emoji_reactions WHERE id = ?', [id]);
};

// ============ Bulk Operations ============

export const getAnnotationCounts = (
  bookId: string,
): {
  bookmarks: number;
  highlights: number;
  freehandHighlights: number;
  emojiReactions: number;
} => {
  const [bookmarks] = executeQuery<{ count: number }>(
    'SELECT COUNT(*) as count FROM bookmarks WHERE bookId = ?',
    [bookId],
  );
  const [highlights] = executeQuery<{ count: number }>(
    'SELECT COUNT(*) as count FROM highlights WHERE bookId = ?',
    [bookId],
  );
  const [freehand] = executeQuery<{ count: number }>(
    'SELECT COUNT(*) as count FROM freehand_highlights WHERE bookId = ?',
    [bookId],
  );
  const [emojis] = executeQuery<{ count: number }>(
    'SELECT COUNT(*) as count FROM emoji_reactions WHERE bookId = ?',
    [bookId],
  );

  return {
    bookmarks: bookmarks?.count ?? 0,
    highlights: highlights?.count ?? 0,
    freehandHighlights: freehand?.count ?? 0,
    emojiReactions: emojis?.count ?? 0,
  };
};

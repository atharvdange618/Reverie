/**
 * Reverie Annotation Store
 *
 * Manages bookmarks, highlights, and emoji reactions
 */

import { create } from 'zustand';
import {
  Bookmark,
  Highlight,
  FreehandHighlight,
  EmojiReaction,
  HighlightColor,
} from '../types';
import {
  getBookmarks,
  addBookmark as dbAddBookmark,
  toggleBookmark as dbToggleBookmark,
  getHighlights,
  addHighlight as dbAddHighlight,
  updateHighlightColor as dbUpdateHighlightColor,
  deleteHighlight as dbDeleteHighlight,
  getFreehandHighlights,
  addFreehandHighlight as dbAddFreehandHighlight,
  deleteFreehandHighlight as dbDeleteFreehandHighlight,
  getEmojiReactions,
  addEmojiReaction as dbAddEmojiReaction,
  deleteEmojiReaction as dbDeleteEmojiReaction,
  getAnnotationCounts,
} from '../db';

interface AnnotationState {
  // Current book annotations
  currentBookId: string | null;
  bookmarks: Bookmark[];
  highlights: Highlight[];
  freehandHighlights: FreehandHighlight[];
  emojiReactions: EmojiReaction[];

  // Loading state
  isLoading: boolean;

  // Annotation counts
  counts: {
    bookmarks: number;
    highlights: number;
    freehandHighlights: number;
    emojiReactions: number;
  };

  // Actions
  loadAnnotations: (bookId: string) => void;
  clearAnnotations: () => void;

  // Bookmark actions
  toggleBookmark: (page: number) => boolean;
  isBookmarked: (page: number) => boolean;

  // Highlight actions
  addHighlight: (
    page: number,
    x: number,
    y: number,
    width: number,
    height: number,
    color: HighlightColor,
  ) => Highlight;
  updateHighlightColor: (id: string, color: HighlightColor) => void;
  deleteHighlight: (id: string) => void;
  getPageHighlights: (page: number) => Highlight[];

  // Freehand highlight actions
  addFreehandHighlight: (
    page: number,
    path: string,
    color: HighlightColor,
    strokeWidth: number,
  ) => FreehandHighlight;
  deleteFreehandHighlight: (id: string) => void;
  getPageFreehandHighlights: (page: number) => FreehandHighlight[];

  // Emoji reaction actions
  addEmojiReaction: (
    page: number,
    x: number,
    y: number,
    emoji: string,
  ) => EmojiReaction;
  deleteEmojiReaction: (id: string) => void;
  getPageEmojiReactions: (page: number) => EmojiReaction[];

  // Refresh counts
  refreshCounts: () => void;
}

export const useAnnotationStore = create<AnnotationState>((set, get) => ({
  // Initial state
  currentBookId: null,
  bookmarks: [],
  highlights: [],
  freehandHighlights: [],
  emojiReactions: [],
  isLoading: false,
  counts: {
    bookmarks: 0,
    highlights: 0,
    freehandHighlights: 0,
    emojiReactions: 0,
  },

  // Load all annotations for a book
  loadAnnotations: bookId => {
    set({ isLoading: true, currentBookId: bookId });

    try {
      const bookmarks = getBookmarks(bookId);
      const highlights = getHighlights(bookId);
      const freehandHighlights = getFreehandHighlights(bookId);
      const emojiReactions = getEmojiReactions(bookId);
      const counts = getAnnotationCounts(bookId);

      set({
        bookmarks,
        highlights,
        freehandHighlights,
        emojiReactions,
        counts,
        isLoading: false,
      });
    } catch (error) {
      console.error('Failed to load annotations:', error);
      set({ isLoading: false });
    }
  },

  // Clear annotations
  clearAnnotations: () => {
    set({
      currentBookId: null,
      bookmarks: [],
      highlights: [],
      freehandHighlights: [],
      emojiReactions: [],
      counts: {
        bookmarks: 0,
        highlights: 0,
        freehandHighlights: 0,
        emojiReactions: 0,
      },
    });
  },

  // Bookmarks
  toggleBookmark: page => {
    const { currentBookId } = get();
    if (!currentBookId) throw new Error('No book loaded');

    const isNowBookmarked = dbToggleBookmark(currentBookId, page);

    if (isNowBookmarked) {
      const bookmark = dbAddBookmark(currentBookId, page);
      set(state => ({
        bookmarks: [...state.bookmarks, bookmark].sort(
          (a, b) => a.page - b.page,
        ),
        counts: { ...state.counts, bookmarks: state.counts.bookmarks + 1 },
      }));
    } else {
      set(state => ({
        bookmarks: state.bookmarks.filter(b => b.page !== page),
        counts: { ...state.counts, bookmarks: state.counts.bookmarks - 1 },
      }));
    }

    return isNowBookmarked;
  },

  isBookmarked: page => {
    return get().bookmarks.some(b => b.page === page);
  },

  // Highlights
  addHighlight: (page, x, y, width, height, color) => {
    const { currentBookId } = get();
    if (!currentBookId) throw new Error('No book loaded');

    const highlight = dbAddHighlight(
      currentBookId,
      page,
      x,
      y,
      width,
      height,
      color,
    );

    set(state => ({
      highlights: [...state.highlights, highlight],
      counts: { ...state.counts, highlights: state.counts.highlights + 1 },
    }));

    return highlight;
  },

  updateHighlightColor: (id, color) => {
    dbUpdateHighlightColor(id, color);

    set(state => ({
      highlights: state.highlights.map(h =>
        h.id === id ? { ...h, color } : h,
      ),
    }));
  },

  deleteHighlight: id => {
    dbDeleteHighlight(id);

    set(state => {
      const newHighlights = state.highlights.filter(h => h.id !== id);
      return {
        highlights: newHighlights,
        counts: { ...state.counts, highlights: state.counts.highlights - 1 },
      };
    });
  },

  getPageHighlights: page => {
    return get().highlights.filter(h => h.page === page);
  },

  // Freehand highlights
  addFreehandHighlight: (page, path, color, strokeWidth) => {
    const { currentBookId } = get();
    if (!currentBookId) throw new Error('No book loaded');

    const highlight = dbAddFreehandHighlight(
      currentBookId,
      page,
      path,
      color,
      strokeWidth,
    );

    set(state => ({
      freehandHighlights: [...state.freehandHighlights, highlight],
      counts: {
        ...state.counts,
        freehandHighlights: state.counts.freehandHighlights + 1,
      },
    }));

    return highlight;
  },

  deleteFreehandHighlight: id => {
    dbDeleteFreehandHighlight(id);

    set(state => ({
      freehandHighlights: state.freehandHighlights.filter(h => h.id !== id),
      counts: {
        ...state.counts,
        freehandHighlights: state.counts.freehandHighlights - 1,
      },
    }));
  },

  getPageFreehandHighlights: page => {
    return get().freehandHighlights.filter(h => h.page === page);
  },

  // Emoji reactions
  addEmojiReaction: (page, x, y, emoji) => {
    const { currentBookId } = get();
    if (!currentBookId) throw new Error('No book loaded');

    const reaction = dbAddEmojiReaction(currentBookId, page, x, y, emoji);

    set(state => ({
      emojiReactions: [...state.emojiReactions, reaction],
      counts: {
        ...state.counts,
        emojiReactions: state.counts.emojiReactions + 1,
      },
    }));

    return reaction;
  },

  deleteEmojiReaction: id => {
    dbDeleteEmojiReaction(id);

    set(state => ({
      emojiReactions: state.emojiReactions.filter(r => r.id !== id),
      counts: {
        ...state.counts,
        emojiReactions: state.counts.emojiReactions - 1,
      },
    }));
  },

  getPageEmojiReactions: page => {
    return get().emojiReactions.filter(r => r.page === page);
  },

  // Refresh counts
  refreshCounts: () => {
    const { currentBookId } = get();
    if (!currentBookId) return;

    const counts = getAnnotationCounts(currentBookId);
    set({ counts });
  },
}));

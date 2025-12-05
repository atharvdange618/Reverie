/**
 * Reverie Book Store
 *
 * Manages books and reading state
 */

import { create } from 'zustand';
import { BookWithProgress } from '../types';
import {
  getAllBooks,
  getBookById,
  getLastOpenedBook,
  addBook as dbAddBook,
  updateBookProgress as dbUpdateProgress,
  updateBookTotalPages as dbUpdateTotalPages,
  updateBookTitle as dbUpdateTitle,
  deleteBook as dbDeleteBook,
  getReadingStats,
} from '../db';

interface BookState {
  // State
  books: BookWithProgress[];
  currentBook: BookWithProgress | null;
  lastOpenedBook: BookWithProgress | null;
  isLoading: boolean;

  // Stats
  stats: {
    totalBooks: number;
    completedBooks: number;
    totalPagesRead: number;
  };

  // Actions
  initialize: () => void;
  loadBooks: () => void;
  loadBook: (id: string) => BookWithProgress | null;
  addBook: (
    title: string,
    filePath: string,
    totalPages: number,
  ) => BookWithProgress;
  updateProgress: (id: string, page: number) => void;
  updateTotalPages: (id: string, totalPages: number) => void;
  updateTitle: (id: string, title: string) => void;
  deleteBook: (id: string) => void;
  setCurrentBook: (book: BookWithProgress | null) => void;
  refreshStats: () => void;
}

export const useBookStore = create<BookState>((set, get) => ({
  // Initial state
  books: [],
  currentBook: null,
  lastOpenedBook: null,
  isLoading: true,
  stats: {
    totalBooks: 0,
    completedBooks: 0,
    totalPagesRead: 0,
  },

  // Initialize
  initialize: () => {
    try {
      get().loadBooks();
      const lastOpened = getLastOpenedBook();
      const stats = getReadingStats();

      set({
        lastOpenedBook: lastOpened,
        stats,
        isLoading: false,
      });
    } catch (error) {
      console.error('Failed to initialize book store:', error);
      set({ isLoading: false });
    }
  },

  // Load all books
  loadBooks: () => {
    try {
      const books = getAllBooks();
      set({ books });
    } catch (error) {
      console.error('Failed to load books:', error);
    }
  },

  // Load single book
  loadBook: id => {
    try {
      const book = getBookById(id);
      if (book) {
        set({ currentBook: book });
      }
      return book;
    } catch (error) {
      console.error('Failed to load book:', error);
      return null;
    }
  },

  // Add new book
  addBook: (title, filePath, totalPages) => {
    const book = dbAddBook(title, filePath, totalPages);
    const bookWithProgress: BookWithProgress = {
      ...book,
      progress: 0,
    };

    set(state => ({
      books: [bookWithProgress, ...state.books],
      lastOpenedBook: bookWithProgress,
    }));

    get().refreshStats();
    return bookWithProgress;
  },

  // Update reading progress
  updateProgress: (id, page) => {
    dbUpdateProgress(id, page);

    set(state => {
      const updateBook = (book: BookWithProgress): BookWithProgress => {
        if (book.id !== id) return book;
        const progress =
          book.totalPages > 0 ? Math.round((page / book.totalPages) * 100) : 0;
        return { ...book, currentPage: page, progress };
      };

      return {
        books: state.books.map(updateBook),
        currentBook: state.currentBook ? updateBook(state.currentBook) : null,
        lastOpenedBook: state.lastOpenedBook
          ? updateBook(state.lastOpenedBook)
          : null,
      };
    });

    get().refreshStats();
  },

  // Update total pages (called when PDF is first loaded)
  updateTotalPages: (id, totalPages) => {
    dbUpdateTotalPages(id, totalPages);

    set(state => {
      const updateBook = (book: BookWithProgress): BookWithProgress => {
        if (book.id !== id) return book;
        const progress =
          totalPages > 0 ? Math.round((book.currentPage / totalPages) * 100) : 0;
        return { ...book, totalPages, progress };
      };

      return {
        books: state.books.map(updateBook),
        currentBook: state.currentBook ? updateBook(state.currentBook) : null,
        lastOpenedBook: state.lastOpenedBook
          ? updateBook(state.lastOpenedBook)
          : null,
      };
    });
  },

  // Update book title
  updateTitle: (id, title) => {
    dbUpdateTitle(id, title);

    set(state => {
      const updateBook = (book: BookWithProgress): BookWithProgress => {
        if (book.id !== id) return book;
        return { ...book, title };
      };

      return {
        books: state.books.map(updateBook),
        currentBook: state.currentBook ? updateBook(state.currentBook) : null,
        lastOpenedBook: state.lastOpenedBook
          ? updateBook(state.lastOpenedBook)
          : null,
      };
    });
  },

  // Delete book
  deleteBook: id => {
    dbDeleteBook(id);

    set(state => ({
      books: state.books.filter(b => b.id !== id),
      currentBook: state.currentBook?.id === id ? null : state.currentBook,
      lastOpenedBook:
        state.lastOpenedBook?.id === id ? null : state.lastOpenedBook,
    }));

    get().refreshStats();
  },

  // Set current book
  setCurrentBook: book => {
    set({ currentBook: book });
  },

  // Refresh stats
  refreshStats: () => {
    try {
      const stats = getReadingStats();
      set({ stats });
    } catch (error) {
      console.error('Failed to refresh stats:', error);
    }
  },
}));

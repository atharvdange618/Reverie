/**
 * Reverie Database Setup
 *
 * SQLite database for persistent storage using react-native-quick-sqlite
 */

import { open, QuickSQLiteConnection } from 'react-native-quick-sqlite';
import { runMigrations } from './migrations';

const DATABASE_NAME = 'reverie.db';
const DATABASE_VERSION = 1; // For future migrations

let database: QuickSQLiteConnection | null = null;

// Log database version for debugging
console.log(`Reverie DB v${DATABASE_VERSION}`);

/**
 * Get database instance (singleton)
 */
export const getDatabase = (): QuickSQLiteConnection => {
  if (database) {
    return database;
  }

  database = open({ name: DATABASE_NAME });
  initializeTables(database);

  // Run migrations to clean up data
  runMigrations();

  // Create unique index AFTER migration to prevent duplicates
  database.execute(`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_bookmarks_unique ON bookmarks(bookId, page);
  `);
  console.log('✅ Unique index for bookmarks created');

  return database;
};

/**
 * Initialize all database tables
 */
const initializeTables = (db: QuickSQLiteConnection): void => {
  // Books table
  db.execute(`
    CREATE TABLE IF NOT EXISTS books (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      filePath TEXT NOT NULL,
      currentPage INTEGER DEFAULT 1,
      totalPages INTEGER DEFAULT 0,
      lastOpenedAt TEXT,
      createdAt TEXT NOT NULL
    );
  `);

  // Bookmarks table
  db.execute(`
    CREATE TABLE IF NOT EXISTS bookmarks (
      id TEXT PRIMARY KEY,
      bookId TEXT NOT NULL,
      page INTEGER NOT NULL,
      createdAt TEXT NOT NULL,
      FOREIGN KEY (bookId) REFERENCES books(id) ON DELETE CASCADE
    );
  `);

  // Highlights table (rectangle-based)
  db.execute(`
    CREATE TABLE IF NOT EXISTS highlights (
      id TEXT PRIMARY KEY,
      bookId TEXT NOT NULL,
      page INTEGER NOT NULL,
      x REAL NOT NULL,
      y REAL NOT NULL,
      width REAL NOT NULL,
      height REAL NOT NULL,
      color TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      FOREIGN KEY (bookId) REFERENCES books(id) ON DELETE CASCADE
    );
  `);

  // Freehand highlights table (for marker-style annotations)
  db.execute(`
    CREATE TABLE IF NOT EXISTS freehand_highlights (
      id TEXT PRIMARY KEY,
      bookId TEXT NOT NULL,
      page INTEGER NOT NULL,
      path TEXT NOT NULL,
      color TEXT NOT NULL,
      strokeWidth REAL NOT NULL,
      createdAt TEXT NOT NULL,
      FOREIGN KEY (bookId) REFERENCES books(id) ON DELETE CASCADE
    );
  `);

  // Emoji reactions table
  db.execute(`
    CREATE TABLE IF NOT EXISTS emoji_reactions (
      id TEXT PRIMARY KEY,
      bookId TEXT NOT NULL,
      page INTEGER NOT NULL,
      x REAL NOT NULL,
      y REAL NOT NULL,
      emoji TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      FOREIGN KEY (bookId) REFERENCES books(id) ON DELETE CASCADE
    );
  `);

  // Settings table (key-value store)
  db.execute(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  // Audio tracks table (for user-added tracks)
  db.execute(`
    CREATE TABLE IF NOT EXISTS audio_tracks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      artist TEXT,
      filePath TEXT NOT NULL,
      isDefault INTEGER DEFAULT 0,
      createdAt TEXT NOT NULL
    );
  `);

  // Extracted text cache table (for BookReader)
  db.execute(`
    CREATE TABLE IF NOT EXISTS extracted_text (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      bookId TEXT NOT NULL,
      pageNumber INTEGER NOT NULL,
      text TEXT NOT NULL,
      extractedAt TEXT NOT NULL,
      UNIQUE(bookId, pageNumber),
      FOREIGN KEY (bookId) REFERENCES books(id) ON DELETE CASCADE
    );
  `);

  // Reading progress table (for both PDF and Book modes)
  db.execute(`
    CREATE TABLE IF NOT EXISTS reading_progress (
      bookId TEXT PRIMARY KEY,
      currentPage INTEGER NOT NULL DEFAULT 1,
      scrollPosition REAL DEFAULT 0,
      totalPages INTEGER DEFAULT 0,
      lastReadAt TEXT NOT NULL,
      readingMode TEXT DEFAULT 'pdf',
      FOREIGN KEY (bookId) REFERENCES books(id) ON DELETE CASCADE
    );
  `);

  // Create indexes for better query performance
  db.execute(`
    CREATE INDEX IF NOT EXISTS idx_bookmarks_bookId ON bookmarks(bookId);
  `);

  // NOTE: Unique index for bookmarks is created AFTER migration runs
  // to clean up duplicates first (see getDatabase function)

  db.execute(`
    CREATE INDEX IF NOT EXISTS idx_highlights_bookId ON highlights(bookId);
  `);
  db.execute(`
    CREATE INDEX IF NOT EXISTS idx_freehand_highlights_bookId ON freehand_highlights(bookId);
  `);
  db.execute(`
    CREATE INDEX IF NOT EXISTS idx_emoji_reactions_bookId ON emoji_reactions(bookId);
  `);
  db.execute(`
    CREATE INDEX IF NOT EXISTS idx_extracted_text_bookId ON extracted_text(bookId);
  `);
  db.execute(`
    CREATE INDEX IF NOT EXISTS idx_extracted_text_page ON extracted_text(bookId, pageNumber);
  `);

  console.log('✅ Database tables initialized');
};

/**
 * Close database connection
 */
export const closeDatabase = (): void => {
  if (database) {
    database.close();
    database = null;
    console.log('Database closed');
  }
};

/**
 * Execute a query and return results
 */
export const executeQuery = <T>(
  query: string,
  params: (string | number | null)[] = [],
): T[] => {
  const db = getDatabase();
  const result = db.execute(query, params);

  const rows: T[] = [];
  if (result.rows && result.rows.length > 0) {
    for (let i = 0; i < result.rows.length; i++) {
      rows.push(result.rows.item(i) as T);
    }
  }

  return rows;
};

/**
 * Execute a query without returning results (INSERT, UPDATE, DELETE)
 */
export const executeUpdate = (
  query: string,
  params: (string | number | null)[] = [],
): number => {
  const db = getDatabase();
  const result = db.execute(query, params);
  return result.rowsAffected ?? 0;
};

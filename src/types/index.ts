/**
 * Reverie Type Definitions
 */

import { ThemeMode, HighlightColor } from '../theme';
export type { ThemeMode, HighlightColor } from '../theme';

// ============ Book Types ============

export interface Book {
  id: string;
  title: string;
  filePath: string;
  currentPage: number;
  totalPages: number;
  lastOpenedAt: string;
  createdAt: string;
}

export interface BookWithProgress extends Book {
  progress: number; // 0-100
}

// ============ Annotation Types ============

export interface Bookmark {
  id: string;
  bookId: string;
  page: number;
  createdAt: string;
}

export interface Highlight {
  id: string;
  bookId: string;
  page: number;
  x: number; // X coordinate (%)
  y: number; // Y coordinate (%)
  width: number; // Width (%)
  height: number; // Height (%)
  color: HighlightColor;
  createdAt: string;
}

export interface FreehandHighlight {
  id: string;
  bookId: string;
  page: number;
  path: string; // SVG path data or Skia path
  color: HighlightColor;
  strokeWidth: number;
  createdAt: string;
}

export interface EmojiReaction {
  id: string;
  bookId: string;
  page: number;
  x: number; // X coordinate (%)
  y: number; // Y coordinate (%)
  emoji: string; // Emoji character
  createdAt: string;
}

// ============ Settings Types ============

export interface AppSettings {
  theme: ThemeMode;
  readerFontSize: number; // 14-24
  readingMode: 'paged' | 'scroll';
  ambientMusicEnabled: boolean;
  ambientMusicVolume: number; // 0-1
  ttsEnabled: boolean;
  ttsVoice: string | null;
  ttsSpeed: number; // 0.5-2
  defaultHighlightColor: HighlightColor;
  hasCompletedOnboarding: boolean;
  easterEggTapCount: number; // For tracking hidden icon taps

  // Reading customization settings
  bookReaderFontSize: number; // 0.8-1.5 multiplier
  bookReaderFontFamily: 'literata' | 'inter'; // Font family for book reader
  bookReaderLineSpacing: number; // 1.2-2.0 multiplier
}

export const defaultSettings: AppSettings = {
  theme: 'light',
  readerFontSize: 18,
  readingMode: 'paged',
  ambientMusicEnabled: false,
  ambientMusicVolume: 0.5,
  ttsEnabled: false,
  ttsVoice: null,
  ttsSpeed: 1,
  defaultHighlightColor: 'yellow',
  hasCompletedOnboarding: false,
  easterEggTapCount: 0,

  // Reading defaults
  bookReaderFontSize: 1.0,
  bookReaderFontFamily: 'literata',
  bookReaderLineSpacing: 1.6,
};

// ============ Navigation Types ============

export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  MainTabs: undefined;
  Reader: { bookId: string };
};

export type MainTabParamList = {
  Home: undefined;
  Library: undefined;
  Settings: undefined;
};

// ============ Audio Types ============

export interface AudioTrack {
  id: string;
  title: string;
  artist?: string;
  filePath: string;
  isDefault: boolean; // true for bundled tracks
}

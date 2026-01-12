/**
 * Reverie Type Definitions
 */

import { ThemeMode, HighlightColor } from '../theme';
export type { ThemeMode, HighlightColor } from '../theme';

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
  progress: number;
}

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
  x: number;
  y: number;
  width: number;
  height: number;
  color: HighlightColor;
  createdAt: string;
}

export interface FreehandHighlight {
  id: string;
  bookId: string;
  page: number;
  path: string;
  color: HighlightColor;
  strokeWidth: number;
  createdAt: string;
}

export interface EmojiReaction {
  id: string;
  bookId: string;
  page: number;
  x: number;
  y: number;
  emoji: string;
  createdAt: string;
}

export interface AppSettings {
  theme: ThemeMode;
  readerFontSize: number;
  readingMode: 'paged' | 'scroll';
  ambientMusicEnabled: boolean;
  ambientMusicVolume: number;
  ttsEnabled: boolean;
  ttsVoice: string | null;
  ttsSpeed: number;
  defaultHighlightColor: HighlightColor;
  hasCompletedOnboarding: boolean;
  easterEggTapCount: number;

  bookReaderFontSize: number;
  bookReaderFontFamily: 'literata' | 'inter';
  bookReaderLineSpacing: number;
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

  bookReaderFontSize: 1.0,
  bookReaderFontFamily: 'literata',
  bookReaderLineSpacing: 1.6,
};

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

export interface AudioTrack {
  id: string;
  title: string;
  artist?: string;
  filePath: string;
  isDefault: boolean;
}

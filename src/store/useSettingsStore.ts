/**
 * Reverie Settings Store
 *
 * Manages app settings with persistence
 */

import { create } from 'zustand';
import {
  AppSettings,
  defaultSettings,
  ThemeMode,
  HighlightColor,
} from '../types';
import { getAllSettings, setSetting as dbSetSetting } from '../db';
import { getThemeColors, ThemeColors } from '../theme';

interface SettingsState extends AppSettings {
  // Computed / Aliases
  themeColors: ThemeColors;
  themeMode: ThemeMode; // Alias for theme
  ttsRate: number; // Alias for ttsSpeed
  ambientVolume: number; // Alias for ambientMusicVolume
  isLoading: boolean;

  // Actions
  initialize: () => void;
  setTheme: (theme: ThemeMode) => void;
  setReaderFontSize: (size: number) => void;
  setReadingMode: (mode: 'paged' | 'scroll') => void;
  setAmbientMusic: (enabled: boolean) => void;
  setAmbientMusicEnabled: (enabled: boolean) => void;
  setAmbientMusicVolume: (volume: number) => void;
  setAmbientVolume: (volume: number) => void;
  setTtsEnabled: (enabled: boolean) => void;
  setTtsVoice: (voice: string | null) => void;
  setTtsSpeed: (speed: number) => void;
  setTtsRate: (rate: number) => void;
  setDefaultHighlightColor: (color: HighlightColor) => void;
  completeOnboarding: () => void;
  incrementEasterEggTap: () => number;
  resetEasterEggTaps: () => void;

  // Book reader customization
  setBookReaderFontSize: (size: number) => void;
  setBookReaderFontFamily: (family: 'literata' | 'inter') => void;
  setBookReaderLineSpacing: (spacing: number) => void;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  // Initial state
  ...defaultSettings,
  themeColors: getThemeColors(defaultSettings.theme),
  themeMode: defaultSettings.theme,
  ttsRate: defaultSettings.ttsSpeed,
  ambientVolume: defaultSettings.ambientMusicVolume,
  isLoading: true,

  // Initialize from database
  initialize: () => {
    try {
      const settings = getAllSettings();
      set({
        ...settings,
        themeColors: getThemeColors(settings.theme),
        themeMode: settings.theme,
        ttsRate: settings.ttsSpeed,
        ambientVolume: settings.ambientMusicVolume,
        isLoading: false,
      });
    } catch (error) {
      console.error('Failed to load settings:', error);
      set({ isLoading: false });
    }
  },

  // Theme
  setTheme: theme => {
    dbSetSetting('theme', theme);
    set({ theme, themeMode: theme, themeColors: getThemeColors(theme) });
  },

  // Reader font size
  setReaderFontSize: readerFontSize => {
    dbSetSetting('readerFontSize', readerFontSize);
    set({ readerFontSize });
  },

  // Reading mode
  setReadingMode: readingMode => {
    dbSetSetting('readingMode', readingMode);
    set({ readingMode });
  },

  // Ambient music
  setAmbientMusic: ambientMusicEnabled => {
    dbSetSetting('ambientMusicEnabled', ambientMusicEnabled);
    set({ ambientMusicEnabled });
  },

  setAmbientMusicEnabled: ambientMusicEnabled => {
    dbSetSetting('ambientMusicEnabled', ambientMusicEnabled);
    set({ ambientMusicEnabled });
  },

  setAmbientMusicVolume: ambientMusicVolume => {
    dbSetSetting('ambientMusicVolume', ambientMusicVolume);
    set({ ambientMusicVolume, ambientVolume: ambientMusicVolume });
  },

  setAmbientVolume: volume => {
    dbSetSetting('ambientMusicVolume', volume);
    set({ ambientMusicVolume: volume, ambientVolume: volume });
  },

  // TTS
  setTtsEnabled: ttsEnabled => {
    dbSetSetting('ttsEnabled', ttsEnabled);
    set({ ttsEnabled });
  },

  setTtsVoice: ttsVoice => {
    dbSetSetting('ttsVoice', ttsVoice);
    set({ ttsVoice });
  },

  setTtsSpeed: ttsSpeed => {
    dbSetSetting('ttsSpeed', ttsSpeed);
    set({ ttsSpeed, ttsRate: ttsSpeed });
  },

  setTtsRate: rate => {
    dbSetSetting('ttsSpeed', rate);
    set({ ttsSpeed: rate, ttsRate: rate });
  },

  // Highlight color
  setDefaultHighlightColor: defaultHighlightColor => {
    dbSetSetting('defaultHighlightColor', defaultHighlightColor);
    set({ defaultHighlightColor });
  },

  // Onboarding
  completeOnboarding: () => {
    dbSetSetting('hasCompletedOnboarding', true);
    set({ hasCompletedOnboarding: true });
  },

  // Easter egg
  incrementEasterEggTap: () => {
    const newCount = get().easterEggTapCount + 1;
    dbSetSetting('easterEggTapCount', newCount);
    set({ easterEggTapCount: newCount });
    return newCount;
  },

  resetEasterEggTaps: () => {
    dbSetSetting('easterEggTapCount', 0);
    set({ easterEggTapCount: 0 });
  },

  // Book reader customization
  setBookReaderFontSize: bookReaderFontSize => {
    const clamped = Math.max(0.8, Math.min(1.5, bookReaderFontSize));
    dbSetSetting('bookReaderFontSize', clamped);
    set({ bookReaderFontSize: clamped });
  },

  setBookReaderFontFamily: bookReaderFontFamily => {
    dbSetSetting('bookReaderFontFamily', bookReaderFontFamily);
    set({ bookReaderFontFamily });
  },

  setBookReaderLineSpacing: bookReaderLineSpacing => {
    const clamped = Math.max(1.2, Math.min(2.0, bookReaderLineSpacing));
    dbSetSetting('bookReaderLineSpacing', clamped);
    set({ bookReaderLineSpacing: clamped });
  },
}));

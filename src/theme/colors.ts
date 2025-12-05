/**
 * Reverie Color System
 *
 * A soft, warm color palette with dark red and lavender accents
 * Designed for a cozy reading experience
 */

export const colors = {
  // Light Theme
  light: {
    background: '#FAF8F5',
    surface: '#FFFFFF',
    textPrimary: '#2D2A26',
    textSecondary: '#6B6560',
    accentPrimary: '#8B2942', // Dark red
    accentSecondary: '#B8A9C9', // Lavender
    border: '#E8E4DF',
    divider: '#F0ECE7',
    overlay: 'rgba(45, 42, 38, 0.5)',
    success: '#4A7C59',
    error: '#B33A3A',
    warning: '#C4883A',
  },

  // Dark Theme
  dark: {
    background: '#1A1A1A',
    surface: '#252525',
    textPrimary: '#F5F0E8',
    textSecondary: '#A89F94',
    accentPrimary: '#A83250', // Muted dark red
    accentSecondary: '#9B8BB4', // Dusty lavender
    border: '#3A3A3A',
    divider: '#2F2F2F',
    overlay: 'rgba(0, 0, 0, 0.7)',
    success: '#5A9C6B',
    error: '#D45A5A',
    warning: '#D4A85A',
  },

  // Sepia Theme
  sepia: {
    background: '#F4E8D1',
    surface: '#FDF6E8',
    textPrimary: '#5C4033',
    textSecondary: '#7A6552',
    accentPrimary: '#722F37', // Deep burgundy
    accentSecondary: '#A68B9C', // Dusty mauve
    border: '#E0D4C0',
    divider: '#EBE0CC',
    overlay: 'rgba(92, 64, 51, 0.5)',
    success: '#5C7A4A',
    error: '#8B3A3A',
    warning: '#A67C3A',
  },

  // Common colors (theme-independent)
  common: {
    white: '#FFFFFF',
    black: '#000000',
    transparent: 'transparent',
  },

  // Highlight colors for annotations
  highlights: {
    yellow: '#FFF3B0',
    pink: '#FFD6E0',
    blue: '#C5E0F7',
    green: '#D4EDDA',
    purple: '#E8D5F2',
    orange: '#FFE0CC',
  },
} as const;

export type ThemeMode = 'light' | 'dark' | 'sepia';
export type ThemeColors =
  | (typeof colors)['light']
  | (typeof colors)['dark']
  | (typeof colors)['sepia'];
export type HighlightColor = keyof typeof colors.highlights;

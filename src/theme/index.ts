/**
 * Reverie Theme System
 *
 * Exports all theme-related constants and utilities
 */

export {
  colors,
  type ThemeMode,
  type ThemeColors,
  type HighlightColor,
} from './colors';
export {
  fontFamilies,
  fontSizes,
  lineHeights,
  letterSpacing,
  typography,
} from './typography';
export { spacing, borderRadius, shadows, iconSizes } from './spacing';

import { colors, ThemeMode, ThemeColors } from './colors';

/**
 * Get theme colors based on current mode
 */
export const getThemeColors = (mode: ThemeMode): ThemeColors => {
  return colors[mode];
};

/**
 * Default theme configuration
 */
export const defaultTheme: ThemeMode = 'light';

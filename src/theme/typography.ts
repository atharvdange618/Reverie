/**
 * Reverie Typography System
 *
 * Literata - Serif font for reading, quotes, and personal messages
 * Inter - Sans-serif font for UI elements
 */

import { TextStyle } from 'react-native';

export const fontFamilies = {
  // Literata - Reading font
  literata: {
    regular: 'Literata-Regular',
    medium: 'Literata-Medium',
    semiBold: 'Literata-SemiBold',
    italic: 'Literata-Italic',
  },
  // Inter - UI font
  inter: {
    regular: 'Inter_28pt-Regular',
    medium: 'Inter_28pt-Medium',
    semiBold: 'Inter_28pt-SemiBold',
    bold: 'Inter_28pt-Bold',
  },
} as const;

export const fontSizes = {
  xs: 10,
  sm: 12,
  md: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
  '5xl': 48,
} as const;

export const lineHeights = {
  tight: 1.2,
  normal: 1.5,
  relaxed: 1.75,
  loose: 2,
} as const;

export const letterSpacing = {
  tight: -0.5,
  normal: 0,
  wide: 0.5,
  wider: 1,
} as const;

export const typography = {
  ui: {
    h1: {
      fontFamily: fontFamilies.inter.bold,
      fontSize: fontSizes['3xl'],
      lineHeight: fontSizes['3xl'] * lineHeights.tight,
      letterSpacing: letterSpacing.tight,
    } as TextStyle,
    h2: {
      fontFamily: fontFamilies.inter.semiBold,
      fontSize: fontSizes['2xl'],
      lineHeight: fontSizes['2xl'] * lineHeights.tight,
      letterSpacing: letterSpacing.tight,
    } as TextStyle,
    h3: {
      fontFamily: fontFamilies.inter.semiBold,
      fontSize: fontSizes.xl,
      lineHeight: fontSizes.xl * lineHeights.normal,
    } as TextStyle,
    h4: {
      fontFamily: fontFamilies.inter.medium,
      fontSize: fontSizes.lg,
      lineHeight: fontSizes.lg * lineHeights.normal,
    } as TextStyle,
    body: {
      fontFamily: fontFamilies.inter.regular,
      fontSize: fontSizes.base,
      lineHeight: fontSizes.base * lineHeights.normal,
    } as TextStyle,
    bodyMedium: {
      fontFamily: fontFamilies.inter.medium,
      fontSize: fontSizes.base,
      lineHeight: fontSizes.base * lineHeights.normal,
    } as TextStyle,
    small: {
      fontFamily: fontFamilies.inter.regular,
      fontSize: fontSizes.sm,
      lineHeight: fontSizes.sm * lineHeights.normal,
    } as TextStyle,
    caption: {
      fontFamily: fontFamilies.inter.regular,
      fontSize: fontSizes.xs,
      lineHeight: fontSizes.xs * lineHeights.normal,
    } as TextStyle,
    button: {
      fontFamily: fontFamilies.inter.semiBold,
      fontSize: fontSizes.base,
      lineHeight: fontSizes.base * lineHeights.tight,
      letterSpacing: letterSpacing.wide,
    } as TextStyle,
    label: {
      fontFamily: fontFamilies.inter.medium,
      fontSize: fontSizes.sm,
      lineHeight: fontSizes.sm * lineHeights.normal,
      letterSpacing: letterSpacing.wide,
    } as TextStyle,
  },

  reading: {
    quote: {
      fontFamily: fontFamilies.literata.italic,
      fontSize: fontSizes.xl,
      lineHeight: fontSizes.xl * lineHeights.relaxed,
    } as TextStyle,
    message: {
      fontFamily: fontFamilies.literata.regular,
      fontSize: fontSizes.lg,
      lineHeight: fontSizes.lg * lineHeights.relaxed,
    } as TextStyle,
    title: {
      fontFamily: fontFamilies.literata.semiBold,
      fontSize: fontSizes['2xl'],
      lineHeight: fontSizes['2xl'] * lineHeights.normal,
    } as TextStyle,
    body: {
      fontFamily: fontFamilies.literata.regular,
      fontSize: fontSizes.base,
      lineHeight: fontSizes.base * lineHeights.loose,
    } as TextStyle,
    caption: {
      fontFamily: fontFamilies.literata.regular,
      fontSize: fontSizes.sm,
      lineHeight: fontSizes.sm * lineHeights.relaxed,
    } as TextStyle,
  },
} as const;

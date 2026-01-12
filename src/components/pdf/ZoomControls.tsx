/**
 * Zoom Controls Component
 *
 * Simple zoom in/out buttons for PDF reader
 */

import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { ZoomIn, ZoomOut } from 'lucide-react-native';

import { spacing, borderRadius, ThemeColors } from '../../theme';

interface ZoomControlsProps {
  themeColors: ThemeColors;
  currentZoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  minZoom?: number;
  maxZoom?: number;
}

export const ZoomControls: React.FC<ZoomControlsProps> = ({
  themeColors,
  currentZoom,
  onZoomIn,
  onZoomOut,
  onReset,
  minZoom = 0.5,
  maxZoom = 3.0,
}) => {
  const zoomPercentage = Math.round(currentZoom * 100);
  const canZoomIn = currentZoom < maxZoom;
  const canZoomOut = currentZoom > minZoom;
  const canReset = currentZoom !== 1.0;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: themeColors.surface,
          borderColor: themeColors.border,
        },
      ]}
    >
      <TouchableOpacity
        onPress={onZoomOut}
        disabled={!canZoomOut}
        style={[styles.button, !canZoomOut && styles.buttonDisabled]}
      >
        <ZoomOut
          size={18}
          color={
            canZoomOut ? themeColors.textPrimary : themeColors.textSecondary
          }
        />
      </TouchableOpacity>

      <TouchableOpacity onPress={onReset} disabled={!canReset}>
        <Text
          style={[
            styles.zoomText,
            {
              color: canReset
                ? themeColors.accentPrimary
                : themeColors.textSecondary,
            },
          ]}
        >
          {zoomPercentage}%
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={onZoomIn}
        disabled={!canZoomIn}
        style={[styles.button, !canZoomIn && styles.buttonDisabled]}
      >
        <ZoomIn
          size={18}
          color={
            canZoomIn ? themeColors.textPrimary : themeColors.textSecondary
          }
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    gap: spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  button: {
    padding: spacing.xs,
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  zoomText: {
    fontSize: 12,
    fontWeight: '600',
    minWidth: 40,
    textAlign: 'center',
  },
});

export default ZoomControls;

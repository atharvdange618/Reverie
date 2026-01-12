/**
 * TTS Toolbar Component
 *
 * Replaces the regular toolbar when TTS mode is active.
 * - Play/Pause button
 * - Speed selector (0.5x, 1x, 1.5x, 2x)
 * - Close button to exit TTS mode
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { Play, Pause, X, Gauge } from 'lucide-react-native';
import { useTtsStore, TTS_SPEEDS } from '../../store/useTtsStore';
import { typography, spacing, borderRadius } from '../../theme';

interface TtsToolbarProps {
  themeColors: {
    surface: string;
    border: string;
    textPrimary: string;
    textSecondary: string;
    accentPrimary: string;
    background: string;
  };
  onClose: () => void;
}

export const TtsToolbar: React.FC<TtsToolbarProps> = ({
  themeColors,
  onClose,
}) => {
  const { isSpeaking, isPaused, speedIndex, cycleSpeed, pause, resume, stop } =
    useTtsStore();

  const isActive = isSpeaking || isPaused;

  const handlePlayPause = () => {
    if (isSpeaking) {
      pause();
    } else if (isPaused) {
      resume();
    }
  };

  const handleClose = () => {
    stop();
    onClose();
  };

  const currentSpeedLabel = TTS_SPEEDS[speedIndex].label;

  const getStatusText = () => {
    if (isSpeaking) return 'Speaking...';
    if (isPaused) return 'Paused';
    return 'TTS Ready';
  };

  return (
    <Animated.View
      entering={FadeIn.duration(200)}
      exiting={FadeOut.duration(200)}
      style={[
        styles.container,
        {
          backgroundColor: themeColors.surface,
          borderTopColor: themeColors.border,
        },
      ]}
    >
      <View style={styles.labelContainer}>
        <View
          style={[
            styles.speakingIndicator,
            {
              backgroundColor: isSpeaking
                ? themeColors.accentPrimary
                : themeColors.textSecondary,
            },
          ]}
        />
        <Text style={[styles.label, { color: themeColors.textPrimary }]}>
          {getStatusText()}
        </Text>
      </View>

      <View style={styles.controlsRow}>
        <TouchableOpacity
          onPress={cycleSpeed}
          style={[
            styles.speedButton,
            {
              backgroundColor: themeColors.background,
              borderColor: themeColors.border,
            },
          ]}
        >
          <Gauge size={16} color={themeColors.textSecondary} />
          <Text style={[styles.speedText, { color: themeColors.textPrimary }]}>
            {currentSpeedLabel}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handlePlayPause}
          style={[
            styles.playButton,
            { backgroundColor: themeColors.accentPrimary },
          ]}
          disabled={!isActive}
        >
          {isSpeaking ? (
            <Pause size={24} color="#FFFFFF" />
          ) : (
            <Play size={24} color="#FFFFFF" />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleClose}
          style={[
            styles.closeButton,
            {
              backgroundColor: themeColors.background,
              borderColor: themeColors.border,
            },
          ]}
        >
          <X size={20} color={themeColors.textSecondary} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    paddingBottom: spacing.md,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  speakingIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.xs,
  },
  label: {
    ...typography.ui.bodyMedium,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  speedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    gap: spacing.xs,
  },
  speedText: {
    ...typography.ui.bodyMedium,
    minWidth: 32,
    textAlign: 'center',
  },
  playButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
});

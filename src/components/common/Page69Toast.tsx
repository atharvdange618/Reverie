/**
 * Page 69 Toast
 *
 * Playful easter egg toast shown when user reaches page 69.
 * Subtle and cheeky! 😏
 */

import React, { useEffect } from 'react';
import { Text, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  FadeInUp,
  FadeOutUp,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { typography, spacing, borderRadius, shadows } from '../../theme';
import { useSettingsStore } from '../../store';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Page69ToastProps {
  visible: boolean;
}

export const Page69Toast: React.FC<Page69ToastProps> = ({ visible }) => {
  const { themeColors } = useSettingsStore();

  // Wiggle animation for the emoji
  const rotation = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      rotation.value = withRepeat(
        withSequence(
          withTiming(-10, { duration: 100 }),
          withTiming(10, { duration: 100 }),
          withTiming(-10, { duration: 100 }),
          withTiming(10, { duration: 100 }),
          withTiming(0, { duration: 100 }),
        ),
        2,
        false,
      );
    }
  }, [visible, rotation]);

  const emojiAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  if (!visible) return null;

  return (
    <Animated.View
      entering={FadeInUp.duration(400).springify()}
      exiting={FadeOutUp.duration(400)}
      style={[
        styles.container,
        {
          backgroundColor: themeColors.surface,
          borderColor: themeColors.border,
        },
        shadows.lg,
      ]}
    >
      <Animated.Text style={[styles.emoji, emojiAnimatedStyle]}>
        😏
      </Animated.Text>
      <Text
        style={[
          typography.reading.message,
          styles.message,
          { color: themeColors.textPrimary },
        ]}
      >
        Nice.
      </Text>
      <Text
        style={[
          typography.ui.small,
          styles.subtext,
          { color: themeColors.textSecondary },
        ]}
      >
        (You know I had to.)
      </Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 100,
    alignSelf: 'center',
    width: SCREEN_WIDTH - spacing.xl * 4,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    padding: spacing.lg,
    alignItems: 'center',
    zIndex: 1000,
  },
  emoji: {
    fontSize: 40,
    marginBottom: spacing.sm,
  },
  message: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  subtext: {
    fontStyle: 'italic',
  },
});

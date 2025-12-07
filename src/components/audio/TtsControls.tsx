/**
 * TTS Controls Component
 *
 * Floating controls for Text-to-Speech reading
 * Appears when TTS is active in the reader
 */

import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Play, Pause, X, Volume2 } from 'lucide-react-native';
import Tts from 'react-native-tts';

import { spacing, borderRadius, typography, ThemeColors } from '../../theme';

interface TtsControlsProps {
  themeColors: ThemeColors;
  text: string;
  onClose: () => void;
}

export const TtsControls: React.FC<TtsControlsProps> = ({
  themeColors,
  text,
  onClose,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isTtsReady, setIsTtsReady] = useState(false);

  // Animation for speaking indicator
  const pulseAnim = useSharedValue(1);

  // Initialize TTS
  useEffect(() => {
    const initTts = async () => {
      try {
        await Tts.setDefaultLanguage('en-US');
        await Tts.setDefaultRate(0.5);
        await Tts.setDefaultPitch(1.0);
        setIsTtsReady(true);
      } catch (error) {
        console.error('TTS initialization error:', error);
      }
    };

    initTts();

    // TTS event listeners
    Tts.addEventListener('tts-start', () => {
      setIsPlaying(true);
    });

    Tts.addEventListener('tts-finish', () => {
      setIsPlaying(false);
    });

    Tts.addEventListener('tts-cancel', () => {
      setIsPlaying(false);
    });

    return () => {
      Tts.stop();
    };
  }, []);

  // Pulse animation when speaking
  useEffect(() => {
    if (isPlaying) {
      pulseAnim.value = withRepeat(
        withTiming(1.2, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        -1,
        true,
      );
    } else {
      pulseAnim.value = withSpring(1);
    }
  }, [isPlaying, pulseAnim]);

  const handlePlayPause = useCallback(async () => {
    if (!isTtsReady) return;

    if (isPlaying) {
      await Tts.stop();
      setIsPlaying(false);
    } else {
      await Tts.speak(text);
    }
  }, [isPlaying, isTtsReady, text]);

  const handleStop = useCallback(async () => {
    await Tts.stop();
    setIsPlaying(false);
    onClose();
  }, [onClose]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseAnim.value }],
  }));

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
      {/* Speaking Indicator */}
      <Animated.View
        style={[
          styles.speakingIndicator,
          pulseStyle,
          {
            backgroundColor: isPlaying
              ? themeColors.accentPrimary + '30'
              : themeColors.border,
          },
        ]}
      >
        <Volume2
          size={18}
          color={
            isPlaying ? themeColors.accentPrimary : themeColors.textSecondary
          }
        />
      </Animated.View>

      {/* Status Text */}
      <View style={styles.statusContainer}>
        <Text style={[styles.statusText, { color: themeColors.textPrimary }]}>
          {isPlaying ? 'Reading aloud...' : 'Text-to-Speech'}
        </Text>
        <Text style={[styles.hintText, { color: themeColors.textSecondary }]}>
          {isTtsReady ? 'Ready' : 'Initializing...'}
        </Text>
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity
          onPress={handlePlayPause}
          disabled={!isTtsReady}
          style={[
            styles.playButton,
            {
              backgroundColor: isTtsReady
                ? themeColors.accentPrimary
                : themeColors.border,
            },
          ]}
        >
          {isPlaying ? (
            <Pause size={20} color="#FFFFFF" fill="#FFFFFF" />
          ) : (
            <Play size={20} color="#FFFFFF" fill="#FFFFFF" />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleStop}
          style={[styles.closeButton, { borderColor: themeColors.border }]}
        >
          <X size={18} color={themeColors.textSecondary} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  speakingIndicator: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusContainer: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  statusText: {
    ...typography.ui.body,
    fontWeight: '600',
  },
  hintText: {
    ...typography.ui.caption,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
});

export default TtsControls;

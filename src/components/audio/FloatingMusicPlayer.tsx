/**
 * Floating Music Player Component
 *
 * A beautiful mini music player that floats over the reader
 * Shows track info, progress, and controls
 */

import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withTiming,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  ChevronDown,
  ChevronUp,
} from 'lucide-react-native';

import { useMusicStore, AMBIENT_TRACKS } from '../../store/useMusicStore';
import { useTtsStore } from '../../store/useTtsStore';
import { spacing, borderRadius, typography, ThemeColors } from '../../theme';

const COLLAPSED_HEIGHT = 56;
const EXPANDED_HEIGHT = 220;

interface FloatingMusicPlayerProps {
  themeColors: ThemeColors;
  isOnReaderScreen?: boolean;
}

export const FloatingMusicPlayer: React.FC<FloatingMusicPlayerProps> = ({
  themeColors,
  isOnReaderScreen = false,
}) => {
  const {
    isPlaying,
    currentTrackIndex,
    currentTime,
    duration,
    toggleMusic,
    nextTrack,
    previousTrack,
    playTrack,
    updateProgress,
  } = useMusicStore();

  const { isSpeaking: isTtsSpeaking } = useTtsStore();

  const [isExpanded, setIsExpanded] = useState(false);

  const expandProgress = useSharedValue(0);
  const pulseAnim = useSharedValue(1);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isPlaying) {
      interval = setInterval(() => {
        updateProgress();
      }, 500);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, updateProgress]);

  useEffect(() => {
    if (isPlaying) {
      pulseAnim.value = withRepeat(
        withTiming(1.1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        -1,
        true,
      );
    } else {
      pulseAnim.value = withTiming(1);
    }
  }, [isPlaying, pulseAnim]);

  const toggleExpand = useCallback(() => {
    setIsExpanded(prev => !prev);
    expandProgress.value = withSpring(isExpanded ? 0 : 1, {
      damping: 15,
      stiffness: 150,
    });
  }, [isExpanded, expandProgress]);

  const currentTrack = AMBIENT_TRACKS[currentTrackIndex];
  const progress = duration > 0 ? currentTime / duration : 0;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const containerStyle = useAnimatedStyle(() => ({
    height: interpolate(
      expandProgress.value,
      [0, 1],
      [COLLAPSED_HEIGHT, EXPANDED_HEIGHT],
    ),
  }));

  const iconPulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseAnim.value }],
  }));

  if (isTtsSpeaking) {
    return null;
  }

  const bottomPosition = isOnReaderScreen ? 145 : 85;

  return (
    <Animated.View
      style={[
        styles.container,
        containerStyle,
        {
          backgroundColor: themeColors.surface,
          borderColor: themeColors.border,
          bottom: bottomPosition,
        },
      ]}
    >
      <TouchableOpacity
        style={styles.collapsedRow}
        onPress={toggleExpand}
        activeOpacity={0.8}
      >
        <Animated.View
          style={[
            styles.trackIconContainer,
            iconPulseStyle,
            { backgroundColor: themeColors.accentSecondary + '30' },
          ]}
        >
          <Text style={styles.trackEmoji}>{currentTrack.icon}</Text>
        </Animated.View>

        <View style={styles.trackInfo}>
          <Text
            style={[styles.trackTitle, { color: themeColors.textPrimary }]}
            numberOfLines={1}
          >
            {currentTrack.title}
          </Text>
          <Text
            style={[styles.trackArtist, { color: themeColors.textSecondary }]}
          >
            {currentTrack.artist}
          </Text>
        </View>

        <View style={styles.miniControls}>
          <TouchableOpacity
            onPress={toggleMusic}
            style={[
              styles.playButton,
              { backgroundColor: themeColors.accentPrimary },
            ]}
          >
            {isPlaying ? (
              <Pause size={18} color="#FFFFFF" fill="#FFFFFF" />
            ) : (
              <Play size={18} color="#FFFFFF" fill="#FFFFFF" />
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={toggleExpand} style={styles.expandButton}>
            {isExpanded ? (
              <ChevronDown size={20} color={themeColors.textSecondary} />
            ) : (
              <ChevronUp size={20} color={themeColors.textSecondary} />
            )}
          </TouchableOpacity>
        </View>
      </TouchableOpacity>

      <View
        style={[
          styles.progressContainer,
          { backgroundColor: themeColors.border },
        ]}
      >
        <View
          style={[
            styles.progressBar,
            {
              backgroundColor: themeColors.accentSecondary,
              width: `${progress * 100}%`,
            },
          ]}
        />
      </View>

      <View style={styles.timeRow}>
        <Text style={[styles.timeText, { color: themeColors.textSecondary }]}>
          {formatTime(currentTime)}
        </Text>
        <Text style={[styles.timeText, { color: themeColors.textSecondary }]}>
          {formatTime(duration)}
        </Text>
      </View>

      {isExpanded && (
        <View style={styles.expandedContent}>
          <View style={styles.fullControls}>
            <TouchableOpacity onPress={previousTrack} style={styles.skipButton}>
              <SkipBack size={24} color={themeColors.textPrimary} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={toggleMusic}
              style={[
                styles.playButtonLarge,
                { backgroundColor: themeColors.accentPrimary },
              ]}
            >
              {isPlaying ? (
                <Pause size={28} color="#FFFFFF" fill="#FFFFFF" />
              ) : (
                <Play size={28} color="#FFFFFF" fill="#FFFFFF" />
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={nextTrack} style={styles.skipButton}>
              <SkipForward size={24} color={themeColors.textPrimary} />
            </TouchableOpacity>
          </View>

          <View style={styles.trackSelection}>
            {AMBIENT_TRACKS.map((track, index) => (
              <TouchableOpacity
                key={track.id}
                onPress={() => playTrack(index)}
                style={[
                  styles.trackOption,
                  {
                    backgroundColor:
                      index === currentTrackIndex
                        ? themeColors.accentSecondary + '40'
                        : 'transparent',
                    borderColor:
                      index === currentTrackIndex
                        ? themeColors.accentSecondary
                        : themeColors.border,
                  },
                ]}
              >
                <Text style={styles.trackOptionEmoji}>{track.icon}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  collapsedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    height: COLLAPSED_HEIGHT - 4,
  },
  trackIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trackEmoji: {
    fontSize: 20,
  },
  trackInfo: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  trackTitle: {
    ...typography.ui.body,
    fontWeight: '600',
  },
  trackArtist: {
    ...typography.ui.caption,
  },
  miniControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  playButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  expandButton: {
    padding: spacing.xs,
  },
  progressContainer: {
    height: 4,
    width: '100%',
    marginTop: 4,
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
  },
  expandedContent: {
    padding: spacing.md,
    paddingTop: spacing.xs,
  },
  fullControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xl,
  },
  skipButton: {
    padding: spacing.sm,
  },
  playButtonLarge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  timeText: {
    ...typography.ui.caption,
    fontSize: 11,
  },
  trackSelection: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  trackOption: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  trackOptionEmoji: {
    fontSize: 20,
  },
});

export default FloatingMusicPlayer;

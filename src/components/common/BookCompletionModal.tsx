/**
 * Book Completion Modal
 *
 * Easter egg modal shown when user finishes reading a book (reaches 100% progress).
 * Shows a beating heart with a personal congratulatory message.
 */

import React, { useEffect } from 'react';
import {
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  ZoomIn,
  ZoomOut,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import { Heart, Sparkles } from 'lucide-react-native';

import { typography, spacing, borderRadius } from '../../theme';
import { useSettingsStore } from '../../store';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface BookCompletionModalProps {
  visible: boolean;
  bookTitle: string;
  onClose: () => void;
}

const completionMessages = [
  `You finished another beautiful story.

Every page you turned, every word you absorbed... I hope it brought you the peace and escape you needed.

Here's to all the worlds you explore through books. 💗`,

  `Another journey complete.

I love watching you get lost in stories, the way you light up talking about characters that feel real to you.

May your next adventure be just as magical. 💗`,

  `You did it! Another book down.

Reading with you, even when we're apart, feels like the most intimate thing. Every highlight, every note... it's like seeing into your soul.

What's next on your reading list? 💗`,

  `Congratulations, bookworm! 📚

The way you devour stories amazes me. Each book you finish is another world you've lived in, another life you've experienced.

I'm so proud of you. 💗`,

  `Look at you go!

Another story read, another escape taken, another piece of your heart given to fictional worlds.

You're the most beautiful reader I know. 💗`,
];

export const BookCompletionModal: React.FC<BookCompletionModalProps> = ({
  visible,
  bookTitle,
  onClose,
}) => {
  const { themeColors } = useSettingsStore();

  const heartScale = useSharedValue(0);
  const sparkle1Opacity = useSharedValue(0);
  const sparkle2Opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      heartScale.value = withSequence(
        withTiming(1.5, { duration: 600 }),
        withTiming(1, { duration: 300 }),
        withRepeat(
          withSequence(
            withTiming(1.15, { duration: 400 }),
            withTiming(1, { duration: 400 }),
          ),
          -1,
          false,
        ),
      );

      sparkle1Opacity.value = withDelay(
        400,
        withRepeat(
          withSequence(
            withTiming(1, { duration: 800 }),
            withTiming(0, { duration: 800 }),
          ),
          -1,
          false,
        ),
      );

      sparkle2Opacity.value = withDelay(
        800,
        withRepeat(
          withSequence(
            withTiming(1, { duration: 800 }),
            withTiming(0, { duration: 800 }),
          ),
          -1,
          false,
        ),
      );
    }
  }, [visible, heartScale, sparkle1Opacity, sparkle2Opacity]);

  const heartAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heartScale.value }],
  }));

  const sparkle1AnimatedStyle = useAnimatedStyle(() => ({
    opacity: sparkle1Opacity.value,
  }));

  const sparkle2AnimatedStyle = useAnimatedStyle(() => ({
    opacity: sparkle2Opacity.value,
  }));

  const message =
    completionMessages[Math.floor(Math.random() * completionMessages.length)];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <Animated.View
        entering={FadeIn.duration(400)}
        exiting={FadeOut.duration(300)}
        style={styles.overlay}
      >
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />

        <Animated.View
          entering={ZoomIn.duration(600).springify()}
          exiting={ZoomOut.duration(400)}
          style={[
            styles.modalContent,
            {
              backgroundColor: themeColors.surface,
              borderColor: themeColors.border,
            },
          ]}
        >
          <Animated.View style={[styles.sparkle1, sparkle1AnimatedStyle]}>
            <Sparkles size={24} color="#FFD700" />
          </Animated.View>
          <Animated.View style={[styles.sparkle2, sparkle2AnimatedStyle]}>
            <Sparkles size={20} color="#FFB6C1" />
          </Animated.View>

          <Animated.View style={[styles.heartContainer, heartAnimatedStyle]}>
            <Heart size={80} color="#FFB6C1" fill="#FFB6C1" />
          </Animated.View>

          <Text
            style={[
              typography.reading.title,
              styles.bookTitle,
              { color: themeColors.accentPrimary },
            ]}
            numberOfLines={2}
          >
            {bookTitle}
          </Text>

          <Text
            style={[
              typography.reading.message,
              styles.message,
              { color: themeColors.textPrimary },
            ]}
          >
            {message}
          </Text>

          <TouchableOpacity
            onPress={onClose}
            style={[
              styles.closeButton,
              { backgroundColor: themeColors.accentPrimary },
            ]}
          >
            <Text
              style={[
                typography.ui.button,
                styles.closeButtonText,
                { color: themeColors.background },
              ]}
            >
              Continue Reading
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
  },
  modalContent: {
    width: SCREEN_WIDTH - spacing.xl * 2,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    padding: spacing.xl,
    alignItems: 'center',
  },
  sparkle1: {
    position: 'absolute',
    top: spacing.xl,
    right: spacing.xl,
  },
  sparkle2: {
    position: 'absolute',
    top: spacing.xl * 2,
    left: spacing.xl,
  },
  heartContainer: {
    alignItems: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
  },
  bookTitle: {
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  message: {
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.xl,
  },
  closeButton: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    marginTop: spacing.md,
  },
  closeButtonText: {
    fontWeight: '600',
  },
});

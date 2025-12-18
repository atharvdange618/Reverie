/**
 * Confession Modal
 *
 * Hidden easter egg modal revealed by tapping the moon icon 3-7 times.
 * Shows a personal message.
 */

import React, { useEffect } from 'react';
import {
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Dimensions,
  ScrollView,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  SlideInDown,
  SlideOutDown,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { Heart, X } from 'lucide-react-native';

import { typography, spacing, borderRadius } from '../../theme';
import { useSettingsStore } from '../../store';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface ConfessionModalProps {
  visible: boolean;
  onClose: () => void;
}

export const ConfessionModal: React.FC<ConfessionModalProps> = ({
  visible,
  onClose,
}) => {
  const { themeColors } = useSettingsStore();

  // Beating heart animation
  const heartScale = useSharedValue(1);

  useEffect(() => {
    if (visible) {
      heartScale.value = withRepeat(
        withSequence(
          withTiming(1.2, { duration: 400 }),
          withTiming(1, { duration: 400 }),
        ),
        -1,
        false,
      );
    }
  }, [visible, heartScale]);

  const heartAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heartScale.value }],
  }));

  const confessionMessage = `I built this for you because reading is your escape, your peace, your joy.

Every feature, every detail, every soft color... I thought of you.

The way you lose yourself in books, the way you highlight your favorite lines, the way you come back to them when you need comfort.

This isn't just an app. It's a gift wrapped in code.

For all the stories you've shared with me, for all the quotes you've read aloud, for the way your eyes light up when you talk about a book that moved you.

This is yours. Made with more love than I know how to put into words.

— Atharv`;

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
          entering={SlideInDown.duration(500).springify()}
          exiting={SlideOutDown.duration(400)}
          style={[
            styles.modalContent,
            {
              backgroundColor: themeColors.surface,
              borderColor: themeColors.border,
            },
          ]}
        >
          {/* Close button */}
          <TouchableOpacity
            onPress={onClose}
            style={styles.closeButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <X size={24} color={themeColors.textSecondary} />
          </TouchableOpacity>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Beating heart */}
            <Animated.View style={[styles.heartContainer, heartAnimatedStyle]}>
              <Heart size={48} color="#FFB6C1" fill="#FFB6C1" />
            </Animated.View>

            {/* Confession message */}
            <Text
              style={[
                typography.reading.message,
                styles.message,
                { color: themeColors.textPrimary },
              ]}
            >
              {confessionMessage}
            </Text>
          </ScrollView>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  modalContent: {
    width: SCREEN_WIDTH - spacing.xl * 2,
    maxHeight: '80%',
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    padding: spacing.xl,
    marginBottom: spacing.xl,
  },
  closeButton: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    zIndex: 10,
  },
  scrollContent: {
    paddingBottom: spacing.md,
  },
  heartContainer: {
    alignItems: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
  message: {
    textAlign: 'center',
    lineHeight: 26,
  },
});

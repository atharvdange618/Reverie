/**
 * Onboarding Screen
 *
 * A beautiful welcome experience for first-time users
 * with personalized messages and a soft aesthetic
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { CommonActions, useNavigation } from '@react-navigation/native';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { useSettingsStore } from '../store';
import { typography, spacing, borderRadius } from '../theme';

// Onboarding pages
const pages = [
  {
    emoji: '🎂',
    title: 'Happy Birthday',
    message:
      'This is Reverie - your personal reading sanctuary.\n\nI built this for you because I know how much\nbooks mean to you.',
  },
  {
    emoji: '💗',
    title: 'Made Just for You',
    message:
      'Every feature here was designed thinking of you.\nThe way you lose yourself in books,\nthe way you highlight your favorite lines.',
  },
  {
    emoji: '✨',
    title: 'Your Features',
    message:
      'Highlight and annotate like a real book.\nDraw freehand on pages.\nBookmark favorite moments.\nListen with text-to-speech.',
  },
  {
    emoji: '📖',
    title: 'A Love Letter',
    message:
      "This isn't just an app.\nIt's a love letter to the reader in you.\n\nMade with more love than I know\nhow to put into words.\n\n— Atharv",
  },
];

export const OnboardingScreen = () => {
  const navigation = useNavigation();
  const { themeColors, completeOnboarding } = useSettingsStore();
  const [currentPage, setCurrentPage] = useState(0);
  const buttonScale = useSharedValue(1);

  const finishOnboarding = () => {
    completeOnboarding();
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'MainTabs' }],
      }),
    );
  };

  const handleNext = () => {
    if (currentPage < pages.length - 1) {
      setCurrentPage(currentPage + 1);
    } else {
      finishOnboarding();
    }
  };

  const handleSkip = () => {
    finishOnboarding();
  };

  const handlePressIn = () => {
    buttonScale.value = withSpring(0.95);
  };

  const handlePressOut = () => {
    buttonScale.value = withSpring(1);
  };

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const page = pages[currentPage];
  const isLastPage = currentPage === pages.length - 1;

  return (
    <View
      style={[styles.container, { backgroundColor: themeColors.background }]}
    >
      {/* Skip button */}
      {!isLastPage && (
        <Animated.View
          entering={FadeIn.delay(500)}
          style={styles.skipContainer}
        >
          <TouchableOpacity onPress={handleSkip}>
            <Text
              style={[typography.ui.body, { color: themeColors.textSecondary }]}
            >
              Skip
            </Text>
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* Content */}
      <View style={styles.content}>
        <Animated.View
          key={currentPage}
          entering={FadeInDown.duration(400)}
          exiting={FadeOut.duration(200)}
          style={styles.pageContent}
        >
          <Text style={styles.emoji}>{page.emoji}</Text>

          <Text
            style={[
              typography.reading.title,
              styles.title,
              { color: themeColors.accentPrimary },
            ]}
          >
            {page.title}
          </Text>

          <Text
            style={[
              typography.reading.message,
              styles.message,
              { color: themeColors.textSecondary },
            ]}
          >
            {page.message}
          </Text>
        </Animated.View>
      </View>

      {/* Dots indicator */}
      <View style={styles.dotsContainer}>
        {pages.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              {
                backgroundColor:
                  index === currentPage
                    ? themeColors.accentPrimary
                    : themeColors.border,
                width: index === currentPage ? 24 : 8,
              },
            ]}
          />
        ))}
      </View>

      {/* Button */}
      <Animated.View style={[styles.buttonContainer, buttonAnimatedStyle]}>
        <TouchableOpacity
          onPress={handleNext}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={[
            styles.button,
            { backgroundColor: themeColors.accentPrimary },
          ]}
          activeOpacity={1}
        >
          <Text style={[typography.ui.button, styles.buttonText]}>
            {isLastPage ? 'Begin Reading ✨' : 'Continue'}
          </Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Decorative elements */}
      <View
        style={[
          styles.decorTop,
          { backgroundColor: themeColors.accentSecondary },
        ]}
      />
      <View
        style={[
          styles.decorBottom,
          { backgroundColor: themeColors.accentSecondary },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  skipContainer: {
    position: 'absolute',
    top: 60,
    right: spacing.lg,
    zIndex: 10,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing['2xl'],
  },
  pageContent: {
    alignItems: 'center',
  },
  emoji: {
    fontSize: 72,
    marginBottom: spacing.xl,
  },
  title: {
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  message: {
    textAlign: 'center',
    lineHeight: 28,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing['2xl'],
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  buttonContainer: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing['3xl'],
  },
  button: {
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
  },
  decorTop: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 150,
    height: 150,
    borderRadius: 75,
    opacity: 0.1,
  },
  decorBottom: {
    position: 'absolute',
    bottom: -30,
    left: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
    opacity: 0.1,
  },
});

export default OnboardingScreen;

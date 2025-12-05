/**
 * Home Screen
 *
 * The cozy landing page with:
 * - Personalized greeting
 * - Continue reading card
 * - Reading stats
 * - Quick actions
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  BookOpen,
  Library,
  CheckCircle,
  FileText,
  Sparkles,
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Animated, {
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { useSettingsStore, useBookStore } from '../store';
import { typography, spacing, borderRadius, shadows } from '../theme';
import type { RootStackParamList } from '../navigation/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

// Get time-based greeting
const getGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  if (hour < 21) return 'Good evening';
  return 'Sweet dreams';
};

// Get reading encouragement based on time/stats
const getEncouragement = (hasLastBook: boolean): string => {
  const messages = hasLastBook
    ? [
        'Ready to continue your journey?',
        'Your story awaits...',
        'Where were we?',
        "Let's get lost in the pages.",
        'Time for a reading break?',
      ]
    : [
        'Start a new adventure today.',
        'Every great journey begins with a page.',
        'Find your next escape.',
        'A world of stories awaits.',
      ];
  return messages[Math.floor(Math.random() * messages.length)];
};

export const HomeScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { themeColors } = useSettingsStore();
  const { lastOpenedBook, stats, isLoading } = useBookStore();
  const [greeting] = useState(getGreeting());
  const [encouragement] = useState(getEncouragement(!!lastOpenedBook));

  // Animation for the continue reading card
  const cardScale = useSharedValue(1);

  const handleContinueReading = () => {
    if (lastOpenedBook) {
      cardScale.value = withSpring(0.98, {}, () => {
        cardScale.value = withSpring(1);
      });
      navigation.navigate('Reader', { bookId: lastOpenedBook.id });
    }
  };

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cardScale.value }],
  }));

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: themeColors.background }]}
      edges={['top']}
    >
      <ScrollView
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with greeting */}
        <Animated.View entering={FadeIn.duration(600)} style={styles.header}>
          <View style={styles.greetingRow}>
            <Text
              style={[
                typography.reading.title,
                styles.greeting,
                { color: themeColors.accentPrimary },
              ]}
            >
              {greeting}
            </Text>
            <Sparkles size={24} color={themeColors.accentSecondary} />
          </View>
          <Text
            style={[
              typography.reading.message,
              styles.encouragement,
              { color: themeColors.textSecondary },
            ]}
          >
            {encouragement}
          </Text>
        </Animated.View>

        {/* Continue Reading Card */}
        {lastOpenedBook && (
          <Animated.View entering={FadeInDown.duration(600).delay(200)}>
            <Animated.View style={cardAnimatedStyle}>
              <TouchableOpacity
                onPress={handleContinueReading}
                activeOpacity={0.9}
                style={[
                  styles.continueCard,
                  {
                    backgroundColor: themeColors.surface,
                    borderColor: themeColors.border,
                  },
                  shadows.md,
                ]}
              >
                <View style={styles.continueCardHeader}>
                  <Text
                    style={[
                      typography.ui.label,
                      { color: themeColors.accentSecondary },
                    ]}
                  >
                    CONTINUE READING
                  </Text>
                  <BookOpen size={24} color={themeColors.accentSecondary} />
                </View>

                <Text
                  style={[
                    typography.reading.title,
                    styles.bookTitle,
                    { color: themeColors.textPrimary },
                  ]}
                  numberOfLines={2}
                >
                  {lastOpenedBook.title}
                </Text>

                {/* Progress bar */}
                <View style={styles.progressContainer}>
                  <View
                    style={[
                      styles.progressTrack,
                      { backgroundColor: themeColors.divider },
                    ]}
                  >
                    <View
                      style={[
                        styles.progressFill,
                        {
                          backgroundColor: themeColors.accentPrimary,
                          width: `${lastOpenedBook.progress || 0}%`,
                        },
                      ]}
                    />
                  </View>
                  <Text
                    style={[
                      typography.ui.small,
                      { color: themeColors.textSecondary },
                    ]}
                  >
                    {lastOpenedBook.progress || 0}% complete
                  </Text>
                </View>

                <View style={styles.continueButton}>
                  <Text
                    style={[
                      typography.ui.button,
                      { color: themeColors.accentPrimary },
                    ]}
                  >
                    Continue →
                  </Text>
                </View>
              </TouchableOpacity>
            </Animated.View>
          </Animated.View>
        )}

        {/* Empty State - No books yet */}
        {!lastOpenedBook && !isLoading && (
          <Animated.View
            entering={FadeInDown.duration(600).delay(200)}
            style={[
              styles.emptyCard,
              {
                backgroundColor: themeColors.surface,
                borderColor: themeColors.border,
              },
              shadows.sm,
            ]}
          >
            <View style={styles.emptyIconContainer}>
              <Library size={48} color={themeColors.textSecondary} />
            </View>
            <Text
              style={[
                typography.ui.h3,
                { color: themeColors.textPrimary, textAlign: 'center' },
              ]}
            >
              Your library is empty
            </Text>
            <Text
              style={[
                typography.ui.body,
                {
                  color: themeColors.textSecondary,
                  textAlign: 'center',
                  marginTop: spacing.sm,
                },
              ]}
            >
              Add your first book from the Library tab
            </Text>
          </Animated.View>
        )}

        {/* Reading Stats */}
        <Animated.View
          entering={FadeInDown.duration(600).delay(400)}
          style={styles.statsSection}
        >
          <Text
            style={[
              typography.ui.label,
              styles.sectionLabel,
              { color: themeColors.textSecondary },
            ]}
          >
            YOUR READING JOURNEY
          </Text>

          <View style={styles.statsGrid}>
            <View
              style={[
                styles.statCard,
                {
                  backgroundColor: themeColors.surface,
                  borderColor: themeColors.border,
                },
              ]}
            >
              <View style={styles.statIconContainer}>
                <Library size={24} color={themeColors.accentPrimary} />
              </View>
              <Text
                style={[typography.ui.h2, { color: themeColors.accentPrimary }]}
              >
                {stats.totalBooks}
              </Text>
              <Text
                style={[
                  typography.ui.small,
                  { color: themeColors.textSecondary },
                ]}
              >
                Books
              </Text>
            </View>

            <View
              style={[
                styles.statCard,
                {
                  backgroundColor: themeColors.surface,
                  borderColor: themeColors.border,
                },
              ]}
            >
              <View style={styles.statIconContainer}>
                <CheckCircle size={24} color={themeColors.accentPrimary} />
              </View>
              <Text
                style={[typography.ui.h2, { color: themeColors.accentPrimary }]}
              >
                {stats.completedBooks}
              </Text>
              <Text
                style={[
                  typography.ui.small,
                  { color: themeColors.textSecondary },
                ]}
              >
                Completed
              </Text>
            </View>

            <View
              style={[
                styles.statCard,
                {
                  backgroundColor: themeColors.surface,
                  borderColor: themeColors.border,
                },
              ]}
            >
              <View style={styles.statIconContainer}>
                <FileText size={24} color={themeColors.accentPrimary} />
              </View>
              <Text
                style={[typography.ui.h2, { color: themeColors.accentPrimary }]}
              >
                {stats.totalPagesRead}
              </Text>
              <Text
                style={[
                  typography.ui.small,
                  { color: themeColors.textSecondary },
                ]}
              >
                Pages Read
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Easter Egg Quote */}
        <Animated.View
          entering={FadeInDown.duration(600).delay(600)}
          style={styles.quoteSection}
        >
          <Text
            style={[
              typography.reading.quote,
              styles.quote,
              { color: themeColors.textSecondary },
            ]}
          >
            "Some books are to be tasted, others to be swallowed, and some few
            to be chewed and digested."
          </Text>
          <Text
            style={[
              typography.ui.small,
              styles.quoteAuthor,
              { color: themeColors.accentSecondary },
            ]}
          >
            — Francis Bacon
          </Text>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.lg,
    paddingBottom: spacing['3xl'],
  },
  header: {
    marginBottom: spacing['2xl'],
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  greeting: {
    marginBottom: spacing.xs,
  },
  encouragement: {
    opacity: 0.9,
  },
  continueCard: {
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    marginBottom: spacing['2xl'],
  },
  continueCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  bookTitle: {
    marginBottom: spacing.lg,
  },
  progressContainer: {
    marginBottom: spacing.lg,
  },
  progressTrack: {
    height: 6,
    borderRadius: borderRadius.full,
    marginBottom: spacing.sm,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: borderRadius.full,
  },
  continueButton: {
    alignItems: 'flex-end',
  },
  emptyCard: {
    borderRadius: borderRadius.xl,
    padding: spacing['2xl'],
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: spacing['2xl'],
  },
  emptyIconContainer: {
    marginBottom: spacing.lg,
  },
  statsSection: {
    marginBottom: spacing['2xl'],
  },
  sectionLabel: {
    marginBottom: spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  statCard: {
    flex: 1,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    alignItems: 'center',
  },
  statIconContainer: {
    marginBottom: spacing.xs,
  },
  quoteSection: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginTop: spacing.lg,
  },
  quote: {
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: spacing.md,
  },
  quoteAuthor: {
    textAlign: 'center',
  },
});

export default HomeScreen;

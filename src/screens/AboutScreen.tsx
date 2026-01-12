/**
 * About Screen
 *
 * Personal message from the developer to the recipient.
 * The heart of why this app exists.
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { Heart, Sparkles, Book, Moon, ArrowLeft } from 'lucide-react-native';
import { useSettingsStore } from '../store';
import { typography, spacing, borderRadius } from '../theme';

export const AboutScreen = () => {
  const navigation = useNavigation();
  const { themeColors } = useSettingsStore();

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: themeColors.background }]}
      edges={['top']}
    >
      <Animated.View
        entering={FadeIn.duration(400)}
        style={[styles.header, { borderBottomColor: themeColors.border }]}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <ArrowLeft size={24} color={themeColors.textPrimary} />
        </TouchableOpacity>
        <Text style={[typography.ui.h3, { color: themeColors.textPrimary }]}>
          About Reverie
        </Text>
        <View style={{ width: 24 }} />
      </Animated.View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          entering={FadeInDown.duration(400).delay(100)}
          style={styles.iconContainer}
        >
          <View
            style={[
              styles.iconCircle,
              {
                backgroundColor: themeColors.surface,
                borderColor: themeColors.border,
              },
            ]}
          >
            <Moon size={48} color={themeColors.accentPrimary} />
          </View>
          <Text
            style={[
              typography.ui.h2,
              { color: themeColors.textPrimary, marginTop: spacing.md },
            ]}
          >
            Reverie
          </Text>
          <Text
            style={[
              typography.ui.body,
              { color: themeColors.textSecondary, marginTop: spacing.xs },
            ]}
          >
            Version 1.0.0
          </Text>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.duration(400).delay(200)}
          style={[
            styles.messageCard,
            {
              backgroundColor: themeColors.surface,
              borderColor: themeColors.border,
            },
          ]}
        >
          <View style={styles.messageHeader}>
            <Heart
              size={24}
              color={themeColors.accentPrimary}
              fill={themeColors.accentPrimary}
            />
            <Text
              style={[
                typography.ui.h4,
                { color: themeColors.textPrimary, marginLeft: spacing.sm },
              ]}
            >
              A Personal Note
            </Text>
          </View>

          <Text
            style={[
              typography.reading.message,
              {
                color: themeColors.textPrimary,
                marginTop: spacing.lg,
              },
            ]}
          >
            This isn't just an app.
          </Text>

          <Text
            style={[
              typography.reading.message,
              {
                color: themeColors.textPrimary,
                marginTop: spacing.md,
              },
            ]}
          >
            It's every late night I thought about you getting lost in a story.
            Every time you told me about a book that wrecked you. Every world
            you've disappeared into.
          </Text>

          <Text
            style={[
              typography.reading.message,
              {
                color: themeColors.textPrimary,
                marginTop: spacing.md,
              },
            ]}
          >
            I wanted to build something that felt like yours. A quiet corner
            where you can just be with your books. No ads, no tracking, no
            noise. Just you and the words.
          </Text>

          <Text
            style={[
              typography.reading.message,
              {
                color: themeColors.textPrimary,
                marginTop: spacing.md,
              },
            ]}
          >
            I thought about the colors you love, the way you hold a book, those
            dark romance stories that pull you in. Every detail here the
            highlights, the emojis, even the ambient rain it's all for you.
          </Text>

          <Text
            style={[
              typography.reading.message,
              {
                color: themeColors.textPrimary,
                marginTop: spacing.md,
              },
            ]}
          >
            There are little surprises hidden throughout. Some you'll find right
            away, others might take time. But they're all there because I wanted
            you to smile when you discovered them.
          </Text>

          <Text
            style={[
              typography.reading.quote,
              {
                color: themeColors.accentPrimary,
                marginTop: spacing.xl,
              },
            ]}
          >
            This is a gift from me in the form of code.
          </Text>

          <Text
            style={[
              typography.reading.message,
              {
                color: themeColors.textPrimary,
                marginTop: spacing.md,
              },
            ]}
          >
            Happy Birthday. 🌙
          </Text>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.duration(400).delay(300)}
          style={[
            styles.featuresCard,
            {
              backgroundColor: themeColors.surface,
              borderColor: themeColors.border,
            },
          ]}
        >
          <Text
            style={[
              typography.ui.h4,
              { color: themeColors.textPrimary, marginBottom: spacing.md },
            ]}
          >
            Built With
          </Text>

          <View style={styles.featureItem}>
            <Book size={18} color={themeColors.accentSecondary} />
            <Text
              style={[
                typography.ui.body,
                { color: themeColors.textSecondary, marginLeft: spacing.sm },
              ]}
            >
              Immersive reading experience
            </Text>
          </View>

          <View style={styles.featureItem}>
            <Sparkles size={18} color={themeColors.accentSecondary} />
            <Text
              style={[
                typography.ui.body,
                { color: themeColors.textSecondary, marginLeft: spacing.sm },
              ]}
            >
              Personal touches & easter eggs
            </Text>
          </View>

          <View style={styles.featureItem}>
            <Heart size={18} color={themeColors.accentSecondary} />
            <Text
              style={[
                typography.ui.body,
                { color: themeColors.textSecondary, marginLeft: spacing.sm },
              ]}
            >
              Dark romance aesthetic
            </Text>
          </View>

          <View style={styles.featureItem}>
            <Moon size={18} color={themeColors.accentSecondary} />
            <Text
              style={[
                typography.ui.body,
                { color: themeColors.textSecondary, marginLeft: spacing.sm },
              ]}
            >
              Thoughtful attention to detail
            </Text>
          </View>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.duration(400).delay(400)}
          style={styles.footer}
        >
          <Text
            style={[
              typography.reading.quote,
              {
                color: themeColors.textSecondary,
                textAlign: 'center',
                fontSize: 16,
                fontStyle: 'italic',
              },
            ]}
          >
            "You're in my veins, and I cannot get you out."
          </Text>
          <Text
            style={[
              typography.ui.caption,
              {
                color: themeColors.accentSecondary,
                textAlign: 'center',
                marginTop: spacing.sm,
                fontSize: 24,
              },
            ]}
          >
            ♡
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: spacing.xs,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing['5xl'],
  },
  iconContainer: {
    alignItems: 'center',
    marginVertical: spacing.xl,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageCard: {
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    padding: spacing.xl,
    marginBottom: spacing.lg,
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featuresCard: {
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  footer: {
    alignItems: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.xl,
  },
});

/**
 * Loading With Quote
 *
 * Displays a loading spinner with rotating dark romance quotes.
 * Used during app startup, book import, and PDF rendering.
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { typography, spacing } from '../../theme';

const DARK_ROMANCE_QUOTES = [
  'Some books ruin you in the best way.',
  'Lost in pages, found in words.',
  'Between these pages, darkness becomes beautiful.',
  'Every story is a heartbeat waiting to be felt.',
  'The best escapes are written in ink.',
  'In the quiet of reading, we find ourselves.',
  'Where words end, emotions begin.',
];

interface LoadingWithQuoteProps {
  themeColors: any;
  message?: string;
}

export const LoadingWithQuote: React.FC<LoadingWithQuoteProps> = ({
  themeColors,
  message,
}) => {
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(
    Math.floor(Math.random() * DARK_ROMANCE_QUOTES.length),
  );

  useEffect(() => {
    // Rotate quotes every 4 seconds
    const interval = setInterval(() => {
      setCurrentQuoteIndex(
        prevIndex => (prevIndex + 1) % DARK_ROMANCE_QUOTES.length,
      );
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <View
      style={[styles.container, { backgroundColor: themeColors.background }]}
    >
      <View style={styles.content}>
        <ActivityIndicator
          size="large"
          color={themeColors.accentPrimary}
          style={styles.spinner}
        />

        {message && (
          <Text
            style={[
              typography.ui.bodyMedium,
              { color: themeColors.textPrimary, marginTop: spacing.md },
            ]}
          >
            {message}
          </Text>
        )}

        <Animated.View
          key={currentQuoteIndex}
          entering={FadeIn.duration(800)}
          exiting={FadeOut.duration(400)}
          style={styles.quoteContainer}
        >
          <Text
            style={[
              typography.ui.body,
              {
                color: themeColors.textSecondary,
                textAlign: 'center',
                fontStyle: 'italic',
              },
            ]}
          >
            "{DARK_ROMANCE_QUOTES[currentQuoteIndex]}"
          </Text>
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  spinner: {
    marginBottom: spacing.sm,
  },
  quoteContainer: {
    marginTop: spacing.xl,
    maxWidth: 300,
  },
});

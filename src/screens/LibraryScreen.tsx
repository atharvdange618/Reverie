/**
 * Library Screen
 *
 * Displays all books in a beautiful grid with:
 * - Add book button
 * - Book cards with cover/title/progress
 * - Empty state
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Animated, {
  FadeIn,
  FadeInUp,
  Layout,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { useSettingsStore, useBookStore } from '../store';
import { typography, spacing, borderRadius, shadows } from '../theme';
import type { RootStackParamList } from '../navigation/types';
import type { BookWithProgress } from '../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const { width } = Dimensions.get('window');
const CARD_GAP = spacing.md;
const CARD_WIDTH = (width - spacing.lg * 2 - CARD_GAP) / 2;

// Get a book cover color based on the title
const getBookColor = (title: string, colors: any): string => {
  const colorOptions = [
    colors.accentPrimary,
    colors.accentSecondary,
    '#6B8E7D', // Sage
    '#9B7E6E', // Taupe
    '#7E6B9B', // Violet
  ];
  const hash = title
    .split('')
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colorOptions[hash % colorOptions.length];
};

// Get a decorative pattern for the book cover
const getBookPattern = (title: string): string => {
  const patterns = ['✦', '◇', '○', '❋', '✧', '◈'];
  const hash = title
    .split('')
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return patterns[hash % patterns.length];
};

interface BookCardProps {
  book: BookWithProgress;
  onPress: () => void;
  onLongPress: () => void;
  themeColors: any;
  index: number;
}

const BookCard = ({
  book,
  onPress,
  onLongPress,
  themeColors,
  index,
}: BookCardProps) => {
  const scale = useSharedValue(1);
  const bookColor = getBookColor(book.title, themeColors);
  const pattern = getBookPattern(book.title);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  return (
    <Animated.View
      entering={FadeInUp.duration(400).delay(index * 100)}
      layout={Layout.springify()}
      style={animatedStyle}
    >
      <TouchableOpacity
        onPress={onPress}
        onLongPress={onLongPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
        style={[
          styles.bookCard,
          {
            backgroundColor: themeColors.surface,
            borderColor: themeColors.border,
          },
          shadows.sm,
        ]}
      >
        {/* Book Cover */}
        <View style={[styles.bookCover, { backgroundColor: bookColor }]}>
          <Text style={styles.bookPattern}>
            {pattern} {pattern} {pattern}
          </Text>
          <Text style={styles.bookPattern}>
            {pattern} {pattern}
          </Text>
          <Text style={styles.bookPattern}>
            {pattern} {pattern} {pattern}
          </Text>
        </View>

        {/* Book Info */}
        <View style={styles.bookInfo}>
          <Text
            style={[
              typography.ui.bodyMedium,
              { color: themeColors.textPrimary },
            ]}
            numberOfLines={2}
          >
            {book.title}
          </Text>

          {/* Progress */}
          <View style={styles.progressRow}>
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
                    backgroundColor: bookColor,
                    width: `${book.progress || 0}%`,
                  },
                ]}
              />
            </View>
            <Text
              style={[
                typography.ui.caption,
                { color: themeColors.textSecondary },
              ]}
            >
              {book.progress || 0}%
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

export const LibraryScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { themeColors } = useSettingsStore();
  const { books, deleteBook, isLoading } = useBookStore();

  const handleAddBook = () => {
    // TODO: Implement when document picker is available
    Alert.alert('Coming Soon', 'PDF import will be available soon! 📚', [
      { text: 'OK', style: 'default' },
    ]);
  };

  const handleOpenBook = (book: BookWithProgress) => {
    navigation.navigate('Reader', { bookId: book.id });
  };

  const handleDeleteBook = (book: BookWithProgress) => {
    Alert.alert(
      'Delete Book',
      `Are you sure you want to delete "${book.title}"? This will remove all your annotations.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteBook(book.id),
        },
      ],
    );
  };

  const renderBook = ({
    item,
    index,
  }: {
    item: BookWithProgress;
    index: number;
  }) => (
    <BookCard
      book={item}
      onPress={() => handleOpenBook(item)}
      onLongPress={() => handleDeleteBook(item)}
      themeColors={themeColors}
      index={index}
    />
  );

  const renderHeader = () => (
    <Animated.View entering={FadeIn.duration(400)} style={styles.header}>
      <Text style={[typography.ui.h2, { color: themeColors.textPrimary }]}>
        Your Library 📚
      </Text>
      <Text
        style={[
          typography.ui.body,
          { color: themeColors.textSecondary, marginTop: spacing.xs },
        ]}
      >
        {books.length === 0
          ? 'No books yet'
          : `${books.length} book${books.length === 1 ? '' : 's'}`}
      </Text>
    </Animated.View>
  );

  const renderEmpty = () => (
    <Animated.View
      entering={FadeInUp.duration(600).delay(200)}
      style={[
        styles.emptyContainer,
        {
          backgroundColor: themeColors.surface,
          borderColor: themeColors.border,
        },
      ]}
    >
      <Text style={styles.emptyEmoji}>📖</Text>
      <Text
        style={[
          typography.ui.h3,
          { color: themeColors.textPrimary, textAlign: 'center' },
        ]}
      >
        No books yet
      </Text>
      <Text
        style={[
          typography.ui.body,
          {
            color: themeColors.textSecondary,
            textAlign: 'center',
            marginTop: spacing.sm,
            marginBottom: spacing.lg,
          },
        ]}
      >
        Add your first PDF to start reading
      </Text>
      <TouchableOpacity
        onPress={handleAddBook}
        style={[
          styles.addButtonLarge,
          { backgroundColor: themeColors.accentPrimary },
        ]}
      >
        <Text style={[typography.ui.button, { color: '#FFFFFF' }]}>
          + Add Book
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <View
      style={[styles.container, { backgroundColor: themeColors.background }]}
    >
      <FlatList
        data={books}
        renderItem={renderBook}
        keyExtractor={item => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={!isLoading ? renderEmpty : null}
        showsVerticalScrollIndicator={false}
      />

      {/* Floating Add Button */}
      {books.length > 0 && (
        <Animated.View entering={FadeIn.duration(400).delay(300)}>
          <TouchableOpacity
            onPress={handleAddBook}
            style={[
              styles.fab,
              { backgroundColor: themeColors.accentPrimary },
              shadows.lg,
            ]}
          >
            <Text style={styles.fabIcon}>+</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: spacing.lg,
    paddingBottom: spacing['5xl'],
  },
  header: {
    marginBottom: spacing.xl,
    marginTop: spacing.md,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: CARD_GAP,
  },
  bookCard: {
    width: CARD_WIDTH,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  bookCover: {
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.9,
  },
  bookPattern: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.3)',
    letterSpacing: 8,
  },
  bookInfo: {
    padding: spacing.md,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  progressTrack: {
    flex: 1,
    height: 4,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: borderRadius.full,
  },
  emptyContainer: {
    borderRadius: borderRadius.xl,
    padding: spacing['2xl'],
    borderWidth: 1,
    alignItems: 'center',
    marginTop: spacing['2xl'],
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: spacing.lg,
  },
  addButtonLarge: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
  },
  fab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.xl,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fabIcon: {
    fontSize: 28,
    color: '#FFFFFF',
    marginTop: -2,
  },
});

export default LibraryScreen;

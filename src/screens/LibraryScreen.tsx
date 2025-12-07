/**
 * Library Screen
 *
 * Displays all books in a beautiful grid with:
 * - Add book button
 * - Book cards with cover/title/progress
 * - Empty state
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
import { BookOpen, Plus, Library } from 'lucide-react-native';

import { useSettingsStore, useBookStore } from '../store';
import { typography, spacing, borderRadius, shadows } from '../theme';
import { pickPdfFile, extractTitleFromFilename } from '../utils/pdf';
import { Dialog } from '../components/common';
import type { RootStackParamList } from '../navigation/types';
import type { BookWithProgress } from '../types';
import { PdfThumbnail } from '../components/pdf';

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
  const [thumbnailLoaded, setThumbnailLoaded] = useState(false);
  const [thumbnailError, setThumbnailError] = useState(false);
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
    >
      <Animated.View style={animatedStyle}>
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
          {/* Book Cover - PDF Thumbnail or Fallback */}
          <View style={[styles.bookCover, { backgroundColor: bookColor }]}>
            {!thumbnailError && (
              <View style={styles.thumbnailContainer}>
                <PdfThumbnail
                  source={book.filePath}
                  width={CARD_WIDTH}
                  height={120}
                  backgroundColor={bookColor}
                  onLoad={() => setThumbnailLoaded(true)}
                  onError={() => setThumbnailError(true)}
                />
              </View>
            )}
            {/* Fallback pattern overlay - shows while loading or on error */}
            {(!thumbnailLoaded || thumbnailError) && (
              <View style={styles.patternOverlay}>
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
            )}
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
    </Animated.View>
  );
};

export const LibraryScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { themeColors } = useSettingsStore();
  const { books, deleteBook, addBook, isLoading } = useBookStore();
  const [isImporting, setIsImporting] = useState(false);
  const [dialog, setDialog] = useState<{
    visible: boolean;
    title: string;
    message: string;
    buttons: Array<{
      text: string;
      onPress?: () => void;
      style?: 'default' | 'cancel' | 'destructive';
    }>;
  }>({ visible: false, title: '', message: '', buttons: [] });

  const handleAddBook = async () => {
    try {
      setIsImporting(true);
      const result = await pickPdfFile();

      if (result) {
        const title = extractTitleFromFilename(result.name);
        const newBook = addBook(title, result.uri, 0);

        setDialog({
          visible: true,
          title: 'Book Added! 📚',
          message: `"${title}" has been added to your library.`,
          buttons: [
            { text: 'OK', style: 'cancel' },
            {
              text: 'Open Now',
              style: 'default',
              onPress: () =>
                navigation.navigate('Reader', { bookId: newBook.id }),
            },
          ],
        });
      }
    } catch (error: any) {
      setDialog({
        visible: true,
        title: 'Import Failed',
        message:
          error?.message || 'Could not import the PDF file. Please try again.',
        buttons: [{ text: 'OK', style: 'default' }],
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleOpenBook = (book: BookWithProgress) => {
    navigation.navigate('Reader', { bookId: book.id });
  };

  const handleDeleteBook = (book: BookWithProgress) => {
    setDialog({
      visible: true,
      title: 'Delete Book',
      message: `Are you sure you want to delete "${book.title}"? This will remove all your annotations.`,
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteBook(book.id),
        },
      ],
    });
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
      <View style={styles.headerRow}>
        <Text style={[typography.ui.h2, { color: themeColors.textPrimary }]}>
          Your Library
        </Text>
        <Library size={24} color={themeColors.accentPrimary} />
      </View>
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
      <BookOpen size={64} color={themeColors.textSecondary} />
      <Text
        style={[
          typography.ui.h3,
          {
            color: themeColors.textPrimary,
            textAlign: 'center',
            marginTop: spacing.lg,
          },
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
        <View style={styles.addButtonContent}>
          <Plus size={18} color="#FFFFFF" />
          <Text
            style={[
              typography.ui.button,
              { color: '#FFFFFF', marginLeft: spacing.xs },
            ]}
          >
            Add
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: themeColors.background }]}
      edges={['top']}
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
            disabled={isImporting}
            style={[
              styles.fab,
              { backgroundColor: themeColors.accentPrimary },
              shadows.lg,
            ]}
          >
            {isImporting ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Plus size={28} color="#FFFFFF" />
            )}
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* Custom Dialog */}
      <Dialog
        visible={dialog.visible}
        title={dialog.title}
        message={dialog.message}
        buttons={dialog.buttons}
        onDismiss={() => setDialog({ ...dialog, visible: false })}
      />
    </SafeAreaView>
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
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  addButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
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
    position: 'relative',
  },
  thumbnailContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  patternOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
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
    bottom: spacing['5xl'],
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

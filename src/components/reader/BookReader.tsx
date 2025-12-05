import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  ScrollView,
  Text,
  ActivityIndicator,
  StyleSheet,
  useColorScheme,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Dimensions,
  Pressable,
} from 'react-native';
import { BookContent, TextExtractor } from '../../utils';
import { colors, fontFamilies, spacing, typography } from '../../theme';
import { useSettingsStore } from '../../store';
import {
  getReadingProgress,
  saveReadingProgress,
} from '../../db/queries/readingProgress';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export interface BookReaderProps {
  /** Absolute path to the PDF file */
  filePath: string;
  /** Database ID of the book */
  bookId: number;
  /** Current page number (1-indexed) */
  currentPage?: number;
  /** Callback when page changes during scroll */
  onPageChanged?: (page: number, totalPages?: number) => void;
  /** Callback when book loading is complete */
  onLoadComplete?: (totalPages: number) => void;
  /** Font size multiplier (0.8 - 1.5) */
  fontSize?: number;
  /** Line height multiplier (1.2 - 2.0) */
  lineSpacing?: number;
  /** Whether to use dark mode */
  enableDarkMode?: boolean;
  /** Callback to toggle UI controls visibility */
  onToggleControls?: () => void;
}

export const BookReader: React.FC<BookReaderProps> = React.memo(
  ({
    filePath,
    bookId,
    currentPage: _currentPage,
    onPageChanged: _onPageChanged,
    onLoadComplete: _onLoadComplete,
    fontSize: propFontSize,
    lineSpacing: propLineSpacing,
    enableDarkMode,
    onToggleControls,
  }) => {
    const systemColorScheme = useColorScheme();
    const isDark = enableDarkMode ?? systemColorScheme === 'dark';

    // Get settings from store
    const { bookReaderFontSize, bookReaderFontFamily, bookReaderLineSpacing } =
      useSettingsStore();

    const [bookContent, setBookContent] = useState<BookContent | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [scrollPosition, setScrollPosition] = useState(0);

    const scrollViewRef = useRef<ScrollView>(null);
    const bookIdStr = bookId.toString();

    const fontSize = React.useMemo(
      () => propFontSize ?? bookReaderFontSize,
      [propFontSize, bookReaderFontSize],
    );
    const lineSpacing = React.useMemo(
      () => propLineSpacing ?? bookReaderLineSpacing,
      [propLineSpacing, bookReaderLineSpacing],
    );
    const fontFamily = React.useMemo(
      () =>
        bookReaderFontFamily === 'inter'
          ? fontFamilies.inter.regular
          : fontFamilies.literata.regular,
      [bookReaderFontFamily],
    );

    // Define theme before any conditional returns
    const theme = {
      background: isDark ? '#121212' : '#FAFAFA',
      surface: isDark ? '#1E1E1E' : '#FFFFFF',
      text: isDark ? '#E8E8E8' : '#1A1A1A',
      textSecondary: isDark ? '#A0A0A0' : '#666666',
      accent: isDark ? '#BB86FC' : '#6200EE',
      divider: isDark ? '#2C2C2C' : '#E0E0E0',
      border: isDark ? '#3A3A3A' : '#E8E4DF',
    };

    const loadBook = React.useCallback(async () => {
      setLoading(true);
      setError(null);

      try {
        // Load book content with caching
        const content = await TextExtractor.extractBook(filePath, bookId);
        setBookContent(content);

        // Notify parent of total pages
        const totalPages = content.pages.length;
        _onLoadComplete?.(totalPages);

        // Restore reading progress
        const progress = getReadingProgress(bookIdStr);
        if (progress && progress.readingMode === 'book') {
          setCurrentPage(progress.currentPage);
          setScrollPosition(progress.scrollPosition);
          _onPageChanged?.(progress.currentPage, totalPages);

          // Restore scroll position after content loads
          setTimeout(() => {
            if (scrollViewRef.current && progress.scrollPosition > 0) {
              scrollViewRef.current.scrollTo({
                x: progress.scrollPosition,
                y: 0,
                animated: false,
              });
            }
          }, 100);
        } else if (_currentPage) {
          setCurrentPage(_currentPage);
          _onPageChanged?.(_currentPage, totalPages);
        } else {
          _onPageChanged?.(1, totalPages);
        }
      } catch (err) {
        console.error('[BookReader] Failed to load book:', err);
        setError(err instanceof Error ? err.message : 'Failed to load book');
      } finally {
        setLoading(false);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filePath, bookId, bookIdStr]);

    useEffect(() => {
      loadBook();
    }, [loadBook]);

    // Save progress when unmounting or scrolling
    useEffect(() => {
      return () => {
        if (bookContent) {
          saveReadingProgress(
            bookIdStr,
            currentPage,
            scrollPosition,
            bookContent.pageCount,
            'book',
          );
        }
      };
    }, [bookIdStr, currentPage, scrollPosition, bookContent]);

    // Handle scroll events to track position and current page
    const handleScroll = React.useCallback(
      (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const { x } = event.nativeEvent.contentOffset;
        setScrollPosition(x);

        // Calculate current page based on scroll position
        const pageIndex = Math.round(x / SCREEN_WIDTH);
        const newPage = Math.max(
          1,
          Math.min(pageIndex + 1, bookContent?.pages.length || 1),
        );

        if (newPage !== currentPage && bookContent) {
          setCurrentPage(newPage);
          _onPageChanged?.(newPage, bookContent.pages.length);
        }
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [currentPage, bookContent],
    );

    const baseFontSize = 14;
    const actualFontSize = baseFontSize * fontSize;
    const actualLineHeight = actualFontSize * lineSpacing;

    if (loading) {
      return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
          <ActivityIndicator size="large" color={theme.text} />
          <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
            Extracting text from PDF...
          </Text>
        </View>
      );
    }

    if (error || !bookContent) {
      return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
          <Text style={[styles.errorText, { color: colors.light.warning }]}>
            {error || 'Failed to load book'}
          </Text>
        </View>
      );
    }

    return (
      <View
        style={[styles.readerContainer, { backgroundColor: theme.background }]}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          decelerationRate="fast"
        >
          {bookContent.pages.map(page => (
            <Pressable
              key={page.pageNumber}
              onPress={onToggleControls}
              style={[styles.pageWrapper, { width: SCREEN_WIDTH }]}
            >
              <View style={styles.pageInnerWrapper}>
                {/* Centered book page block */}
                <View
                  style={[
                    styles.bookPage,
                    {
                      backgroundColor: theme.surface,
                      borderColor: theme.border,
                    },
                  ]}
                >
                  {/* Page number at top */}
                  <Text
                    style={[styles.pageNumber, { color: theme.textSecondary }]}
                  >
                    {page.pageNumber}
                  </Text>

                  {/* Main reading content - Scrollable */}
                  <ScrollView
                    style={styles.contentWrapper}
                    showsVerticalScrollIndicator={false}
                    bounces={false}
                  >
                    {formatExtractedText(page.text)
                      .split('\n\n')
                      .filter(para => para.trim().length > 0)
                      .map((paragraph, pIndex) => {
                        // Detect if this is likely a chapter heading
                        const isHeading =
                          paragraph.length < 60 &&
                          (paragraph.toLowerCase().includes('chapter') ||
                            paragraph.match(/^[A-Z\s]+$/) ||
                            pIndex === 0);

                        return (
                          <Text
                            key={`p-${page.pageNumber}-${pIndex}`}
                            style={[
                              isHeading
                                ? styles.chapterHeading
                                : styles.paragraph,
                              {
                                color: theme.text,
                                fontSize: isHeading
                                  ? actualFontSize * 1.3
                                  : actualFontSize,
                                lineHeight: isHeading
                                  ? actualFontSize * 1.5
                                  : actualLineHeight,
                                fontFamily: isHeading
                                  ? fontFamilies.literata.semiBold
                                  : fontFamily,
                              },
                            ]}
                          >
                            {paragraph}
                          </Text>
                        );
                      })}
                  </ScrollView>
                </View>
              </View>
            </Pressable>
          ))}

          {/* Reading complete indicator */}
          <Pressable
            onPress={onToggleControls}
            style={[styles.endOfBook, { width: SCREEN_WIDTH }]}
          >
            <Text
              style={[styles.endOfBookText, { color: theme.textSecondary }]}
            >
              — End of Book —
            </Text>
          </Pressable>
        </ScrollView>
      </View>
    );
  },
);

BookReader.displayName = 'BookReader';

// Helper function to format extracted text for better readability
const formatExtractedText = (text: string): string => {
  return (
    text
      // Normalize paragraph breaks (replace 2+ newlines with exactly 2)
      .replace(/\n{2,}/g, '\n\n')
      // Remove hyphenation at line breaks (rejoin hyphenated words)
      .replace(/-\n/g, '')
      // Join lines within paragraphs (single newline becomes space)
      .replace(/([^\n])\n([^\n])/g, '$1 $2')
      // Clean up multiple spaces
      .replace(/  +/g, ' ')
      .trim()
  );
};

const styles = StyleSheet.create({
  // Loading and error states
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  loadingText: {
    ...typography.ui.body,
    marginTop: spacing.md,
    fontSize: 14,
    opacity: 0.7,
  },
  errorText: {
    ...typography.ui.body,
    textAlign: 'center',
  },

  // Main reader layout
  readerContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: spacing['3xl'],
  },

  // Page structure
  pageWrapper: {
    width: SCREEN_WIDTH,
  },
  pageInnerWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  bookPage: {
    width: '95%',
    maxWidth: 600,
    height: '95%',
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing['2xl'],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  pageNumber: {
    fontSize: 12,
    fontFamily: fontFamilies.literata.medium,
    textAlign: 'center',
    marginBottom: spacing.lg,
    opacity: 0.5,
    letterSpacing: 1,
  },

  // Content styling
  contentWrapper: {
    flex: 1,
  },
  paragraph: {
    marginBottom: spacing.md,
    textAlign: 'justify',
    letterSpacing: 0.2,
  },
  chapterHeading: {
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
    textAlign: 'center',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },

  // End of book
  endOfBook: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing['2xl'],
  },
  endOfBookText: {
    fontSize: 14,
    fontFamily: fontFamilies.literata.italic,
    letterSpacing: 2,
    opacity: 0.5,
  },
});

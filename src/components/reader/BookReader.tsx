import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  memo,
} from 'react';
import {
  View,
  ScrollView,
  Text,
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
import { LoadingWithQuote } from '../common';
import {
  getReadingProgress,
  saveReadingProgress,
} from '../../db/queries/readingProgress';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export interface BookReaderProps {
  filePath: string;
  bookId: number;
  currentPage?: number;
  onPageChanged?: (page: number, totalPages?: number) => void;
  onLoadComplete?: (totalPages: number) => void;
  fontSize?: number;
  lineSpacing?: number;
  enableDarkMode?: boolean;
  onToggleControls?: () => void;
}

export const BookReader: React.FC<BookReaderProps> = memo(
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

    const { bookReaderFontSize, bookReaderFontFamily, bookReaderLineSpacing } =
      useSettingsStore();

    const [bookContent, setBookContent] = useState<BookContent | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { themeColors } = useSettingsStore();
    const [currentPage, setCurrentPage] = useState(1);
    const [scrollPosition, setScrollPosition] = useState(0);

    const scrollViewRef = useRef<ScrollView>(null);
    const bookIdStr = bookId.toString();

    const fontSize = useMemo(
      () => propFontSize ?? bookReaderFontSize,
      [propFontSize, bookReaderFontSize],
    );
    const lineSpacing = useMemo(
      () => propLineSpacing ?? bookReaderLineSpacing,
      [propLineSpacing, bookReaderLineSpacing],
    );
    const fontFamily = useMemo(
      () =>
        bookReaderFontFamily === 'inter'
          ? fontFamilies.inter.regular
          : fontFamilies.literata.regular,
      [bookReaderFontFamily],
    );

    const theme = {
      background: isDark ? '#121212' : '#FAFAFA',
      surface: isDark ? '#1E1E1E' : '#FFFFFF',
      text: isDark ? '#E8E8E8' : '#1A1A1A',
      textSecondary: isDark ? '#A0A0A0' : '#666666',
      accent: isDark ? '#BB86FC' : '#6200EE',
      divider: isDark ? '#2C2C2C' : '#E0E0E0',
      border: isDark ? '#3A3A3A' : '#E8E4DF',
    };

    const loadBook = useCallback(async () => {
      setLoading(true);
      setError(null);

      try {
        const content = await TextExtractor.extractBook(filePath, bookId);
        setBookContent(content);

        const totalPages = content.pages.length;
        _onLoadComplete?.(totalPages);

        const progress = getReadingProgress(bookIdStr);
        if (progress && progress.readingMode === 'book') {
          setCurrentPage(progress.currentPage);
          setScrollPosition(progress.scrollPosition);
          _onPageChanged?.(progress.currentPage, totalPages);

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

    const handleScroll = useCallback(
      (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const { x } = event.nativeEvent.contentOffset;
        setScrollPosition(x);

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
        <LoadingWithQuote
          themeColors={themeColors}
          message="Preparing your book..."
        />
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
                <View
                  style={[
                    styles.bookPage,
                    {
                      backgroundColor: theme.surface,
                      borderColor: theme.border,
                    },
                  ]}
                >
                  <Text
                    style={[styles.pageNumber, { color: theme.textSecondary }]}
                  >
                    {page.pageNumber}
                  </Text>

                  <ScrollView
                    style={styles.contentWrapper}
                    showsVerticalScrollIndicator={false}
                    bounces={false}
                  >
                    {formatExtractedText(page.text)
                      .split('\n\n')
                      .filter(para => para.trim().length > 0)
                      .map((paragraph, pIndex) => {
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

const formatExtractedText = (text: string): string => {
  return text
    .replace(/\n{2,}/g, '\n\n')
    .replace(/-\n/g, '')
    .replace(/([^\n])\n([^\n])/g, '$1 $2')
    .replace(/  +/g, ' ')
    .trim();
};

const styles = StyleSheet.create({
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

  readerContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: spacing['3xl'],
  },

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

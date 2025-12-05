/**
 * Reader Screen
 *
 * The main PDF reading experience with:
 * - PDF viewer
 * - Annotation tools (highlights, freehand, emojis)
 * - Bookmark toggle
 * - TTS controls
 * - Page navigation
 */

import React, { useState, useCallback, useEffect, ReactNode } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import {
  ArrowLeft,
  Bookmark,
  BookmarkCheck,
  Highlighter,
  Pencil,
  Smile,
  Volume2,
  AlertTriangle,
  BookOpen,
} from 'lucide-react-native';
import { useSettingsStore, useBookStore, useAnnotationStore } from '../store';
import { typography, spacing, borderRadius, shadows } from '../theme';
import { PdfViewer } from '../components/pdf';
import { BookReader } from '../components/reader';
import type { RootStackParamList } from '../navigation/types';
import {
  getReadingProgress,
  saveReadingProgress,
} from '../db/queries/readingProgress';

type ReaderRouteProp = RouteProp<RootStackParamList, 'Reader'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

// Annotation tool types
type AnnotationTool = 'none' | 'highlight' | 'freehand' | 'emoji';

// Tool button component
const ToolButton = ({
  icon,
  isActive,
  onPress,
  themeColors,
}: {
  icon: ReactNode;
  isActive: boolean;
  onPress: () => void;
  themeColors: any;
}) => (
  <TouchableOpacity
    onPress={onPress}
    style={[
      styles.toolButton,
      {
        backgroundColor: isActive
          ? themeColors.accentPrimary
          : themeColors.surface,
        borderColor: isActive ? themeColors.accentPrimary : themeColors.border,
      },
    ]}
  >
    {icon}
  </TouchableOpacity>
);

export const ReaderScreen = () => {
  const route = useRoute<ReaderRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const { themeColors, readingMode, theme } = useSettingsStore();
  const { loadBook, currentBook, updateProgress, updateTotalPages } =
    useBookStore();
  const { loadAnnotations, toggleBookmark, isBookmarked } =
    useAnnotationStore();

  const { bookId } = route.params;

  // State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [activeTool, setActiveTool] = useState<AnnotationTool>('none');
  const [isLoading, setIsLoading] = useState(true);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [controlsVisible, setControlsVisible] = useState(true);

  // Load book and annotations
  useEffect(() => {
    const book = loadBook(bookId);
    if (book) {
      const progress = getReadingProgress(bookId);
      if (progress && progress.readingMode === 'pdf') {
        setCurrentPage(progress.currentPage);
        setTotalPages(progress.totalPages);
      } else {
        setCurrentPage(book.currentPage || 1);
        setTotalPages(book.totalPages);
      }
      loadAnnotations(bookId);
    }
    setIsLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookId]);

  // Handle page change
  const handlePageChange = useCallback(
    (page: number, total?: number) => {
      setCurrentPage(page);
      const updatedTotal = total || totalPages;
      if (total) {
        setTotalPages(total);
      }
      updateProgress(bookId, page);

      saveReadingProgress(bookId, page, 0, updatedTotal, 'pdf');
    },
    [bookId, updateProgress, totalPages],
  );

  // Handle bookmark toggle
  const handleBookmark = useCallback(() => {
    toggleBookmark(currentPage);
  }, [currentPage, toggleBookmark]);

  // Handle tool selection
  const handleToolSelect = useCallback(
    (tool: AnnotationTool) => {
      setActiveTool(activeTool === tool ? 'none' : tool);
    },
    [activeTool],
  );

  // Handle PDF load complete
  const handleLoadComplete = useCallback(
    (total: number) => {
      setTotalPages(total);
      if (
        currentBook &&
        (currentBook.totalPages === 0 || currentBook.totalPages !== total)
      ) {
        updateTotalPages(bookId, total);
      }
      setIsLoading(false);
    },
    [currentBook, bookId, updateTotalPages],
  );

  // Handle PDF error
  const handlePdfError = useCallback((error: any) => {
    setPdfError(error?.message || 'Unknown error loading PDF');
    setIsLoading(false);
  }, []);

  // Go back
  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  // Toggle controls visibility
  const handleToggleControls = useCallback(() => {
    setControlsVisible(prev => !prev);
  }, []);

  // Calculate progress
  const progress =
    totalPages > 0 ? Math.round((currentPage / totalPages) * 100) : 0;

  if (isLoading) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: themeColors.background },
        ]}
      >
        <ActivityIndicator size="large" color={themeColors.accentPrimary} />
        <Text
          style={[
            typography.ui.body,
            { color: themeColors.textSecondary, marginTop: spacing.md },
          ]}
        >
          Loading book...
        </Text>
      </View>
    );
  }

  if (!currentBook) {
    return (
      <View
        style={[
          styles.errorContainer,
          { backgroundColor: themeColors.background },
        ]}
      >
        <BookOpen size={64} color={themeColors.textSecondary} />
        <Text
          style={[
            typography.ui.h3,
            { color: themeColors.textPrimary, marginTop: spacing.md },
          ]}
        >
          Book not found
        </Text>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <View style={styles.backButtonContent}>
            <ArrowLeft size={16} color={themeColors.accentPrimary} />
            <Text
              style={[
                typography.ui.button,
                { color: themeColors.accentPrimary, marginLeft: spacing.xs },
              ]}
            >
              Go Back
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: themeColors.background }]}
      edges={['top', 'bottom']}
    >
      <StatusBar hidden={!controlsVisible} />

      {/* Top Bar - Toggleable */}
      {controlsVisible && (
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(200)}
          style={[
            styles.topBar,
            {
              backgroundColor: themeColors.surface,
              borderBottomColor: themeColors.border,
            },
          ]}
        >
        <TouchableOpacity onPress={handleBack} style={styles.topBarButton}>
          <ArrowLeft size={24} color={themeColors.textPrimary} />
        </TouchableOpacity>

        <View style={styles.topBarCenter}>
          <Text
            style={[
              typography.ui.bodyMedium,
              { color: themeColors.textPrimary },
            ]}
            numberOfLines={1}
          >
            {currentBook.title}
          </Text>
          <Text
            style={[
              typography.ui.caption,
              { color: themeColors.textSecondary },
            ]}
          >
            Page {currentPage} of {totalPages}
          </Text>
        </View>

        <TouchableOpacity onPress={handleBookmark} style={styles.topBarButton}>
          {isBookmarked(currentPage) ? (
            <BookmarkCheck size={24} color={themeColors.accentPrimary} />
          ) : (
            <Bookmark size={24} color={themeColors.textSecondary} />
          )}
        </TouchableOpacity>
        </Animated.View>
      )}

      {/* PDF Viewer */}
      <View style={styles.readerArea}>
        {pdfError ? (
          <View
            style={[
              styles.errorState,
              { backgroundColor: themeColors.surface },
            ]}
          >
            <AlertTriangle size={48} color={themeColors.textSecondary} />
            <Text
              style={[
                typography.ui.h3,
                { color: themeColors.textPrimary, marginTop: spacing.md },
              ]}
            >
              Failed to load PDF
            </Text>
            <Text
              style={[
                typography.ui.body,
                styles.errorText,
                { color: themeColors.textSecondary },
              ]}
            >
              {pdfError}
            </Text>
          </View>
        ) : theme === 'dark' ? (
          <BookReader
            filePath={currentBook.filePath}
            bookId={
              typeof currentBook.id === 'string'
                ? parseInt(currentBook.id, 10)
                : currentBook.id
            }
            currentPage={currentPage}
            onPageChanged={handlePageChange}
            onLoadComplete={handleLoadComplete}
            enableDarkMode={true}
            onToggleControls={handleToggleControls}
          />
        ) : (
          <PdfViewer
            source={currentBook.filePath}
            page={currentPage}
            onPageChange={handlePageChange}
            onLoadComplete={handleLoadComplete}
            onError={handlePdfError}
            readingMode={readingMode}
            backgroundColor={themeColors.background}
          />
        )}
      </View>

      {/* Bottom Toolbar - Toggleable */}
      {controlsVisible && (
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(200)}
          style={[
            styles.bottomToolbar,
            {
              backgroundColor: themeColors.surface,
              borderTopColor: themeColors.border,
            },
          ]}
        >
        {/* Progress indicator */}
        <View style={styles.progressContainer}>
          <View
            style={[
              styles.progressBar,
              { backgroundColor: themeColors.divider },
            ]}
          >
            <View
              style={[
                styles.progressFill,
                {
                  backgroundColor: themeColors.accentPrimary,
                  width: `${progress}%`,
                },
              ]}
            />
          </View>
          <Text
            style={[typography.ui.small, { color: themeColors.textSecondary }]}
          >
            {progress}%
          </Text>
        </View>

        {/* Annotation Tools */}
        <View style={styles.toolsRow}>
          <ToolButton
            icon={
              <Highlighter
                size={22}
                color={
                  activeTool === 'highlight'
                    ? '#FFFFFF'
                    : themeColors.textSecondary
                }
              />
            }
            isActive={activeTool === 'highlight'}
            onPress={() => handleToolSelect('highlight')}
            themeColors={themeColors}
          />
          <ToolButton
            icon={
              <Pencil
                size={22}
                color={
                  activeTool === 'freehand'
                    ? '#FFFFFF'
                    : themeColors.textSecondary
                }
              />
            }
            isActive={activeTool === 'freehand'}
            onPress={() => handleToolSelect('freehand')}
            themeColors={themeColors}
          />
          <ToolButton
            icon={
              <Smile
                size={22}
                color={
                  activeTool === 'emoji' ? '#FFFFFF' : themeColors.textSecondary
                }
              />
            }
            isActive={activeTool === 'emoji'}
            onPress={() => handleToolSelect('emoji')}
            themeColors={themeColors}
          />
          <ToolButton
            icon={<Volume2 size={22} color={themeColors.textSecondary} />}
            isActive={false}
            onPress={() => {
              // TODO: TTS toggle
            }}
            themeColors={themeColors}
          />
        </View>
        </Animated.View>
      )}

      {/* Active Tool Indicator */}
      {activeTool !== 'none' && (
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(200)}
          style={[
            styles.toolIndicator,
            { backgroundColor: themeColors.accentPrimary },
            shadows.lg,
          ]}
        >
          <View style={styles.toolIndicatorContent}>
            {activeTool === 'highlight' && (
              <>
                <Highlighter size={16} color="#FFFFFF" />
                <Text style={styles.toolIndicatorText}>Highlight Mode</Text>
              </>
            )}
            {activeTool === 'freehand' && (
              <>
                <Pencil size={16} color="#FFFFFF" />
                <Text style={styles.toolIndicatorText}>Drawing Mode</Text>
              </>
            )}
            {activeTool === 'emoji' && (
              <>
                <Smile size={16} color="#FFFFFF" />
                <Text style={styles.toolIndicatorText}>Emoji Mode</Text>
              </>
            )}
          </View>
        </Animated.View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  backButton: {
    marginTop: spacing.xl,
    padding: spacing.md,
  },
  backButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
  },
  topBarButton: {
    padding: spacing.sm,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topBarCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  readerArea: {
    flex: 1,
  },
  errorState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    margin: spacing.md,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
  },
  errorText: {
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  bottomToolbar: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  progressBar: {
    flex: 1,
    height: 3,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: borderRadius.full,
  },
  toolsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    gap: spacing.sm,
  },
  toolButton: {
    flex: 1,
    height: 52,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
  },
  toolIndicator: {
    position: 'absolute',
    top: 80,
    alignSelf: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.full,
  },
  toolIndicatorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  toolIndicatorText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
});

export default ReaderScreen;

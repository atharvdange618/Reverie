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

import React, {
  useState,
  useCallback,
  useEffect,
  ReactNode,
  useMemo,
  useRef,
} from 'react';
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
  List,
} from 'lucide-react-native';
import {
  useSettingsStore,
  useBookStore,
  useAnnotationStore,
  useTtsStore,
} from '../store';
import { typography, spacing, borderRadius, shadows } from '../theme';
import { PdfViewerWithAnnotations } from '../components/pdf';
import { BookReaderWithAnnotations } from '../components/reader';
import { TtsToolbar } from '../components/audio';
import {
  BookmarksList,
  BookCompletionModal,
  Page69Toast,
  DeveloperNoteModal,
} from '../components/common';
import type { RootStackParamList } from '../navigation/types';
import type { HighlightColor } from '../types';
import {
  getReadingProgress,
  saveReadingProgress,
} from '../db/queries/readingProgress';
import {
  markBookCompletionCelebrated,
  isBookCompletionCelebrated,
} from '../db/queries/books';

type ReaderRouteProp = RouteProp<RootStackParamList, 'Reader'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

type AnnotationTool = 'none' | 'highlight' | 'freehand' | 'emoji';

const ToolButton = ({
  icon,
  isActive,
  onPress,
  onLongPress,
  themeColors,
}: {
  icon: ReactNode;
  isActive: boolean;
  onPress: () => void;
  onLongPress?: () => void;
  themeColors: any;
}) => (
  <TouchableOpacity
    onPress={onPress}
    onLongPress={onLongPress}
    delayLongPress={800}
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
  const {
    loadAnnotations,
    toggleBookmark,
    isBookmarked,
    bookmarks,
    addHighlight,
    updateHighlight,
    deleteHighlight,
    highlights,
    addFreehandHighlight,
    deleteFreehandHighlight,
    freehandHighlights,
    addEmojiReaction,
    updateEmojiReaction,
    deleteEmojiReaction,
    emojiReactions,
  } = useAnnotationStore();

  const { bookId } = route.params;

  const { initialize: initializeTts, speakPage, stop: stopTts } = useTtsStore();

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [activeTool, setActiveTool] = useState<AnnotationTool>('none');
  const [highlightColor, setHighlightColor] =
    useState<HighlightColor>('yellow');
  const [highlightSize, setHighlightSize] = useState<
    'small' | 'medium' | 'large'
  >('medium');
  const [isLoading, setIsLoading] = useState(true);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [isTtsMode, setIsTtsMode] = useState(false);
  const [showBookmarksList, setShowBookmarksList] = useState(false);
  const [pdfKey, setPdfKey] = useState(0);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [showPage69Toast, setShowPage69Toast] = useState(false);
  const [showDeveloperNote, setShowDeveloperNote] = useState(false);
  const [developerNoteContent, setDeveloperNoteContent] = useState({
    title: '',
    message: '',
  });
  const [bookReaderLoading, setBookReaderLoading] = useState(false);

  useEffect(() => {
    initializeTts();
  }, [initializeTts]);

  // Proactively set loading state when switching TO dark theme
  // Only watch theme changes, not currentPage, to avoid stale values
  const prevThemeRef = useRef(theme);
  useEffect(() => {
    const previousTheme = prevThemeRef.current;
    if (previousTheme !== 'dark' && theme === 'dark' && currentPage > 1) {
      console.log(
        'Theme switched to dark, setting loading for page:',
        currentPage,
      );
      setBookReaderLoading(true);
    } else if (theme !== 'dark') {
      setBookReaderLoading(false);
    }
    prevThemeRef.current = theme;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme]); // Only depend on theme to get current value of currentPage at theme change time

  useEffect(() => {
    const book = loadBook(bookId);
    if (book) {
      const progress = getReadingProgress(bookId);
      if (progress && progress.readingMode === 'pdf') {
        setCurrentPage(progress.currentPage);
        setTotalPages(progress.totalPages);
      } else {
        // Only set loading for initial dark mode load, not theme switches
        if (theme === 'dark') {
          setBookReaderLoading(true);
        }
        setCurrentPage(book.currentPage || 1);
        setTotalPages(book.totalPages);
      }
      loadAnnotations(bookId);
    }
    setIsLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookId]);

  const handlePageChange = useCallback(
    (page: number, total?: number) => {
      setCurrentPage(page);
      const updatedTotal = total || totalPages;
      if (total) {
        setTotalPages(total);
      }
      updateProgress(bookId, page);

      saveReadingProgress(bookId, page, 0, updatedTotal, 'pdf');

      if (page === 69) {
        setShowPage69Toast(true);
        setTimeout(() => {
          setShowPage69Toast(false);
        }, 4000);
      }

      if (page === updatedTotal && updatedTotal > 0) {
        const alreadyCelebrated = isBookCompletionCelebrated(bookId);
        if (!alreadyCelebrated) {
          setTimeout(() => {
            setShowCompletionModal(true);
            markBookCompletionCelebrated(bookId);
          }, 800);
        }
      }

      if (isTtsMode && currentBook?.filePath) {
        stopTts();
        setTimeout(() => {
          speakPage(currentBook.filePath, page);
        }, 100);
      }
    },
    [
      bookId,
      updateProgress,
      totalPages,
      isTtsMode,
      currentBook,
      stopTts,
      speakPage,
    ],
  );

  const getRareBookmarkIcon = useMemo(() => {
    if (!isBookmarked(currentPage)) return null;

    const random = Math.random();
    if (random < 0.1) {
      const rareIcons = ['✨', '💫', '🌙', '⭐', '💝', '🦋'];
      return rareIcons[Math.floor(Math.random() * rareIcons.length)];
    }
    return null;
  }, [currentPage, isBookmarked]);

  const handleBookmark = useCallback(() => {
    toggleBookmark(currentPage);
  }, [currentPage, toggleBookmark]);

  const handleToolSelect = useCallback(
    (tool: AnnotationTool) => {
      setActiveTool(activeTool === tool ? 'none' : tool);
    },
    [activeTool],
  );

  const handleAnnotationLongPress = useCallback((tool: string) => {
    const notes: Record<string, { title: string; message: string }> = {
      highlight: {
        title: 'Why Highlights?',
        message: `Because I know you underline your favorite passages in real books. You go back to them when you need to feel something again.

I wanted you to have that here too. Mark the words that matter. Come back to them whenever you need.

Your highlights are safe here, just like the ones in your favorite worn-out paperbacks.`,
      },
      freehand: {
        title: 'Why Freehand Drawing?',
        message: `I've seen you doodle in the margins. Little stars, hearts, underlines that aren't quite straight.

This is for those moments. When you want to mark something your way, not perfectly, but yours.

Draw on your books. Make them messy. Make them real.`,
      },
      emoji: {
        title: 'Why Emoji Reactions?',
        message: `Sometimes words aren't enough. Sometimes a book makes you feel something so big that all you can do is drop a 😭 or a 🔥 in the margin.

This is for those moments when you just need to react, to express, to feel.

Your emotions matter. Even the ones that are just emojis.`,
      },
      tts: {
        title: 'Why Text-to-Speech?',
        message: `I know you love the deep voices of male leads in dark romance audiobooks. The way they make every word feel more intense, more real.

I wanted to give you that option here. So you can close your eyes and just listen. Let the words wash over you.

Pick a voice that feels right. One that makes the story come alive the way you love.`,
      },
    };

    const note = notes[tool];
    if (note) {
      setDeveloperNoteContent(note);
      setShowDeveloperNote(true);
    }
  }, []);

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

  const handlePdfError = useCallback((error: any) => {
    setPdfError(error?.message || 'Unknown error loading PDF');
    setIsLoading(false);
  }, []);

  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleToggleControls = useCallback(() => {
    setControlsVisible(prev => !prev);
  }, []);

  const handleNavigateToBookmark = useCallback(
    (page: number) => {
      setCurrentPage(page);
      setPdfKey(prev => prev + 1);
      updateProgress(bookId, page);
      saveReadingProgress(
        bookId,
        page,
        0,
        totalPages,
        theme === 'dark' ? 'book' : 'pdf',
      );

      if (isTtsMode && currentBook?.filePath) {
        stopTts();
        setTimeout(() => {
          speakPage(currentBook.filePath, page);
        }, 100);
      }
    },
    [
      bookId,
      totalPages,
      theme,
      isTtsMode,
      currentBook,
      updateProgress,
      stopTts,
      speakPage,
    ],
  );

  const handleActivateTts = useCallback(() => {
    if (!currentBook?.filePath) return;

    setIsTtsMode(true);
    setActiveTool('none');

    speakPage(currentBook.filePath, currentPage);
  }, [currentBook, currentPage, speakPage]);

  const handleDeactivateTts = useCallback(() => {
    setIsTtsMode(false);
    stopTts();
  }, [stopTts]);

  const handleAddHighlight = useCallback(
    (
      page: number,
      x: number,
      y: number,
      width: number,
      height: number,
      _color: HighlightColor,
    ) => {
      addHighlight(page, x, y, width, height, highlightColor);
    },
    [addHighlight, highlightColor],
  );

  const handleDeleteHighlight = useCallback(
    (id: string) => {
      deleteHighlight(id);
    },
    [deleteHighlight],
  );

  const handleAddFreehand = useCallback(
    (
      page: number,
      path: string,
      color: HighlightColor,
      strokeWidth: number,
    ) => {
      addFreehandHighlight(page, path, color, strokeWidth);
    },
    [addFreehandHighlight],
  );

  const handleDeleteFreehand = useCallback(
    (id: string) => {
      deleteFreehandHighlight(id);
    },
    [deleteFreehandHighlight],
  );

  const handleAddEmoji = useCallback(
    (page: number, x: number, y: number, emoji: string) => {
      addEmojiReaction(page, x, y, emoji);
    },
    [addEmojiReaction],
  );

  const handleUpdateEmoji = useCallback(
    (id: string, x: number, y: number) => {
      updateEmojiReaction(id, x, y);
    },
    [updateEmojiReaction],
  );

  const handleUpdateHighlight = useCallback(
    (id: string, x: number, y: number, width: number, height: number) => {
      updateHighlight(id, x, y, width, height);
    },
    [updateHighlight],
  );

  const handleDeleteEmoji = useCallback(
    (id: string) => {
      deleteEmojiReaction(id);
    },
    [deleteEmojiReaction],
  );

  const handleBookReaderLoadingChange = useCallback(
    (loading: boolean) => {
      console.log(
        'BookReader loading state changed:',
        loading,
        'Current page:',
        currentPage,
      );
      // Always update the loading state from BookReader
      setBookReaderLoading(loading);
    },
    [currentPage],
  );

  const progress =
    totalPages > 0 ? Math.round((currentPage / totalPages) * 100) : 0;

  const pageHighlights = useMemo(
    () => highlights.filter(h => h.page === currentPage),
    [highlights, currentPage],
  );

  const pageFreehand = useMemo(
    () => freehandHighlights.filter(h => h.page === currentPage),
    [freehandHighlights, currentPage],
  );

  const pageEmojis = useMemo(
    () => emojiReactions.filter(e => e.page === currentPage),
    [emojiReactions, currentPage],
  );

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

          <View style={styles.topBarRight}>
            <TouchableOpacity
              onPress={() => setShowBookmarksList(true)}
              style={styles.topBarButton}
            >
              <List size={24} color={themeColors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleBookmark}
              style={styles.topBarButton}
            >
              {isBookmarked(currentPage) ? (
                getRareBookmarkIcon ? (
                  <Text style={styles.rareBookmarkIcon}>
                    {getRareBookmarkIcon}
                  </Text>
                ) : (
                  <BookmarkCheck size={24} color={themeColors.accentPrimary} />
                )
              ) : (
                <Bookmark size={24} color={themeColors.textSecondary} />
              )}
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}

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
          <BookReaderWithAnnotations
            key={`reader-${bookId}-${pdfKey}`}
            filePath={currentBook.filePath}
            bookId={bookId}
            currentPage={currentPage}
            onPageChanged={handlePageChange}
            onLoadComplete={handleLoadComplete}
            onLoadingChange={handleBookReaderLoadingChange}
            enableDarkMode={true}
            onToggleControls={handleToggleControls}
            activeTool={activeTool}
            themeColors={themeColors}
            highlightColor={highlightColor}
            highlightSize={highlightSize}
            onAddHighlight={handleAddHighlight}
            onUpdateHighlight={handleUpdateHighlight}
            onDeleteHighlight={handleDeleteHighlight}
            onAddFreehand={handleAddFreehand}
            onDeleteFreehand={handleDeleteFreehand}
            onAddEmoji={handleAddEmoji}
            onUpdateEmoji={handleUpdateEmoji}
            onDeleteEmoji={handleDeleteEmoji}
            pageHighlights={pageHighlights}
            pageFreehand={pageFreehand}
            pageEmojis={pageEmojis}
          />
        ) : (
          <PdfViewerWithAnnotations
            key={`pdf-${bookId}-${pdfKey}`}
            source={currentBook.filePath}
            page={currentPage}
            onPageChange={handlePageChange}
            onLoadComplete={handleLoadComplete}
            onError={handlePdfError}
            readingMode={readingMode}
            backgroundColor={themeColors.background}
            activeTool={activeTool}
            bookId={bookId}
            themeColors={themeColors}
            highlightColor={highlightColor}
            highlightSize={highlightSize}
            onAddHighlight={handleAddHighlight}
            onUpdateHighlight={handleUpdateHighlight}
            onDeleteHighlight={handleDeleteHighlight}
            onAddFreehand={handleAddFreehand}
            onDeleteFreehand={handleDeleteFreehand}
            onAddEmoji={handleAddEmoji}
            onUpdateEmoji={handleUpdateEmoji}
            onDeleteEmoji={handleDeleteEmoji}
            pageHighlights={pageHighlights}
            pageFreehand={pageFreehand}
            pageEmojis={pageEmojis}
          />
        )}
      </View>

      {controlsVisible && !isTtsMode && (
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
              style={[
                typography.ui.small,
                { color: themeColors.textSecondary },
              ]}
            >
              {progress}%
            </Text>
          </View>

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
              onLongPress={() => handleAnnotationLongPress('highlight')}
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
              onLongPress={() => handleAnnotationLongPress('freehand')}
              themeColors={themeColors}
            />
            <ToolButton
              icon={
                <Smile
                  size={22}
                  color={
                    activeTool === 'emoji'
                      ? '#FFFFFF'
                      : themeColors.textSecondary
                  }
                />
              }
              isActive={activeTool === 'emoji'}
              onPress={() => handleToolSelect('emoji')}
              onLongPress={() => handleAnnotationLongPress('emoji')}
              themeColors={themeColors}
            />
            <ToolButton
              icon={
                <Volume2
                  size={22}
                  color={isTtsMode ? '#FFFFFF' : themeColors.textSecondary}
                />
              }
              isActive={isTtsMode}
              onPress={handleActivateTts}
              onLongPress={() => handleAnnotationLongPress('tts')}
              themeColors={themeColors}
            />
          </View>
        </Animated.View>
      )}

      {controlsVisible && isTtsMode && (
        <TtsToolbar themeColors={themeColors} onClose={handleDeactivateTts} />
      )}

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

      {activeTool === 'highlight' && (
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(200)}
          style={[
            styles.highlightOptions,
            {
              backgroundColor: themeColors.surface,
              borderColor: themeColors.border,
            },
            shadows.md,
          ]}
        >
          <View style={styles.optionsSection}>
            <Text
              style={[
                typography.ui.small,
                { color: themeColors.textSecondary, marginBottom: spacing.xs },
              ]}
            >
              Color
            </Text>
            <View style={styles.colorOptions}>
              {[
                { color: 'yellow' as const, hex: '#FFEB3B' },
                { color: 'green' as const, hex: '#4CAF50' },
                { color: 'blue' as const, hex: '#2196F3' },
                { color: 'pink' as const, hex: '#E91E63' },
                { color: 'purple' as const, hex: '#9C27B0' },
                { color: 'orange' as const, hex: '#FF9800' },
              ].map(({ color, hex }) => (
                <TouchableOpacity
                  key={color}
                  onPress={() => setHighlightColor(color)}
                  style={[
                    styles.colorButton,
                    { backgroundColor: hex },
                    highlightColor === color && [
                      styles.selectedColorButton,
                      { borderColor: themeColors.accentPrimary },
                    ],
                  ]}
                />
              ))}
            </View>
          </View>

          <View style={styles.optionsSection}>
            <Text
              style={[
                typography.ui.small,
                { color: themeColors.textSecondary, marginBottom: spacing.xs },
              ]}
            >
              Size
            </Text>
            <View style={styles.sizeOptions}>
              {(['small', 'medium', 'large'] as const).map(size => {
                const isSelected = highlightSize === size;
                const textColor = isSelected
                  ? '#FFFFFF'
                  : themeColors.textSecondary;
                const bgColor = isSelected
                  ? themeColors.accentPrimary
                  : themeColors.background;
                return (
                  <TouchableOpacity
                    key={size}
                    onPress={() => setHighlightSize(size)}
                    style={[
                      styles.sizeButton,
                      {
                        backgroundColor: bgColor,
                        borderColor: themeColors.border,
                      },
                    ]}
                  >
                    <Text style={[typography.ui.small, { color: textColor }]}>
                      {size.charAt(0).toUpperCase() + size.slice(1)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </Animated.View>
      )}

      {activeTool === 'freehand' && (
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(200)}
          style={[
            styles.highlightOptions,
            {
              backgroundColor: themeColors.surface,
              borderColor: themeColors.border,
            },
            shadows.md,
          ]}
        >
          <View style={styles.optionsSection}>
            <Text
              style={[
                typography.ui.small,
                { color: themeColors.textSecondary, marginBottom: spacing.xs },
              ]}
            >
              Color
            </Text>
            <View style={styles.colorOptions}>
              {[
                { color: 'yellow' as const, hex: '#FFEB3B' },
                { color: 'green' as const, hex: '#4CAF50' },
                { color: 'blue' as const, hex: '#2196F3' },
                { color: 'pink' as const, hex: '#E91E63' },
                { color: 'purple' as const, hex: '#9C27B0' },
                { color: 'orange' as const, hex: '#FF9800' },
              ].map(({ color, hex }) => (
                <TouchableOpacity
                  key={color}
                  onPress={() => setHighlightColor(color)}
                  style={[
                    styles.colorButton,
                    { backgroundColor: hex },
                    highlightColor === color && [
                      styles.selectedColorButton,
                      { borderColor: themeColors.accentPrimary },
                    ],
                  ]}
                />
              ))}
            </View>
          </View>

          <View style={styles.optionsSection}>
            <Text
              style={[
                typography.ui.small,
                { color: themeColors.textSecondary, marginBottom: spacing.xs },
              ]}
            >
              Brush Size
            </Text>
            <View style={styles.sizeOptions}>
              {(['small', 'medium', 'large'] as const).map(size => {
                const isSelected = highlightSize === size;
                const textColor = isSelected
                  ? '#FFFFFF'
                  : themeColors.textSecondary;
                const bgColor = isSelected
                  ? themeColors.accentPrimary
                  : themeColors.background;
                return (
                  <TouchableOpacity
                    key={size}
                    onPress={() => setHighlightSize(size)}
                    style={[
                      styles.sizeButton,
                      {
                        backgroundColor: bgColor,
                        borderColor: themeColors.border,
                      },
                    ]}
                  >
                    <Text style={[typography.ui.small, { color: textColor }]}>
                      {size.charAt(0).toUpperCase() + size.slice(1)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </Animated.View>
      )}

      <BookmarksList
        visible={showBookmarksList}
        bookmarks={bookmarks}
        currentPage={currentPage}
        onClose={() => setShowBookmarksList(false)}
        onSelectPage={handleNavigateToBookmark}
        themeColors={themeColors}
      />

      <Page69Toast visible={showPage69Toast} />

      {bookReaderLoading && theme === 'dark' && (
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(200)}
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: 'rgba(0, 0, 0, 0.9)',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 9999,
              elevation: 9999,
            },
          ]}
        >
          <View
            style={{
              backgroundColor: themeColors.surface,
              padding: spacing['2xl'],
              borderRadius: borderRadius.xl,
              alignItems: 'center',
              maxWidth: '80%',
              ...shadows.lg,
            }}
          >
            <ActivityIndicator size="large" color={themeColors.accentPrimary} />
            <Text
              style={[
                typography.ui.bodyMedium,
                {
                  color: themeColors.textPrimary,
                  marginTop: spacing.lg,
                  textAlign: 'center',
                },
              ]}
            >
              Scrolling to page {currentPage}
            </Text>
          </View>
        </Animated.View>
      )}

      <BookCompletionModal
        visible={showCompletionModal}
        bookTitle={currentBook?.title || 'Book'}
        onClose={() => setShowCompletionModal(false)}
      />

      <DeveloperNoteModal
        visible={showDeveloperNote}
        title={developerNoteContent.title}
        message={developerNoteContent.message}
        onClose={() => setShowDeveloperNote(false)}
      />
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
  topBarRight: {
    flexDirection: 'row',
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
  highlightOptions: {
    position: 'absolute',
    top: 130,
    alignSelf: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    minWidth: 280,
    zIndex: 100,
    elevation: 100,
  },
  optionsSection: {
    marginBottom: spacing.sm,
  },
  colorOptions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  colorButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedColorButton: {
    borderWidth: 3,
  },
  sizeOptions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  sizeButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  rareBookmarkIcon: {
    fontSize: 24,
    textAlign: 'center',
  },
});

export default ReaderScreen;

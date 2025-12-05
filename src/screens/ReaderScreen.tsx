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

import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Animated, {
  FadeIn,
  FadeOut,
  SlideInUp,
  SlideOutDown,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { useSettingsStore, useBookStore, useAnnotationStore } from '../store';
import { typography, spacing, borderRadius, shadows } from '../theme';
import type { RootStackParamList } from '../navigation/types';

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
  icon: string;
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
    <Text style={styles.toolIcon}>{icon}</Text>
  </TouchableOpacity>
);

export const ReaderScreen = () => {
  const route = useRoute<ReaderRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const { themeColors } = useSettingsStore();
  const { loadBook, currentBook, updateProgress } = useBookStore();
  const { loadAnnotations, toggleBookmark, isBookmarked } =
    useAnnotationStore();

  const { bookId } = route.params;

  // State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [activeTool, setActiveTool] = useState<AnnotationTool>('none');
  const [isLoading, setIsLoading] = useState(true);

  // Animations
  const controlsOpacity = useSharedValue(1);

  // Load book and annotations
  useEffect(() => {
    const book = loadBook(bookId);
    if (book) {
      setCurrentPage(book.currentPage || 1);
      setTotalPages(book.totalPages);
      loadAnnotations(bookId);
    }
    setIsLoading(false);
  }, [bookId]);

  // Toggle controls visibility
  const toggleControls = useCallback(() => {
    setShowControls(prev => !prev);
    controlsOpacity.value = withTiming(showControls ? 0 : 1, { duration: 200 });
  }, [showControls]);

  // Handle page change
  const handlePageChange = useCallback(
    (page: number) => {
      setCurrentPage(page);
      updateProgress(bookId, page);
    },
    [bookId, updateProgress],
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

  // Go back
  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  // Calculate progress
  const progress =
    totalPages > 0 ? Math.round((currentPage / totalPages) * 100) : 0;

  const controlsAnimatedStyle = useAnimatedStyle(() => ({
    opacity: controlsOpacity.value,
  }));

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
        <Text style={styles.errorEmoji}>📖</Text>
        <Text style={[typography.ui.h3, { color: themeColors.textPrimary }]}>
          Book not found
        </Text>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Text
            style={[typography.ui.button, { color: themeColors.accentPrimary }]}
          >
            ← Go Back
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View
      style={[styles.container, { backgroundColor: themeColors.background }]}
    >
      <StatusBar hidden={!showControls} />

      {/* PDF Viewer Placeholder */}
      <TouchableOpacity
        style={styles.readerArea}
        onPress={toggleControls}
        activeOpacity={1}
      >
        <View
          style={[
            styles.pdfPlaceholder,
            { backgroundColor: themeColors.surface },
          ]}
        >
          <Text style={styles.pdfEmoji}>📄</Text>
          <Text style={[typography.ui.h3, { color: themeColors.textPrimary }]}>
            PDF Viewer
          </Text>
          <Text
            style={[
              typography.ui.body,
              { color: themeColors.textSecondary, marginTop: spacing.sm },
            ]}
          >
            Page {currentPage} of {totalPages}
          </Text>
          <Text
            style={[
              typography.ui.small,
              {
                color: themeColors.textSecondary,
                marginTop: spacing.lg,
                textAlign: 'center',
              },
            ]}
          >
            (PDF rendering will be available{'\n'}when react-native-pdf builds
            successfully)
          </Text>
        </View>
      </TouchableOpacity>

      {/* Top Controls */}
      {showControls && (
        <Animated.View
          entering={SlideInUp.duration(200)}
          exiting={SlideOutDown.duration(200)}
          style={[
            styles.topControls,
            { backgroundColor: themeColors.surface },
            shadows.md,
          ]}
        >
          <SafeAreaView style={styles.topControlsInner}>
            <TouchableOpacity onPress={handleBack} style={styles.backTouchable}>
              <Text
                style={[
                  typography.ui.body,
                  { color: themeColors.accentPrimary },
                ]}
              >
                ← Back
              </Text>
            </TouchableOpacity>

            <View style={styles.titleContainer}>
              <Text
                style={[
                  typography.ui.bodyMedium,
                  { color: themeColors.textPrimary },
                ]}
                numberOfLines={1}
              >
                {currentBook.title}
              </Text>
            </View>

            <TouchableOpacity
              onPress={handleBookmark}
              style={styles.bookmarkTouchable}
            >
              <Text style={styles.bookmarkIcon}>
                {isBookmarked(currentPage) ? '🔖' : '📑'}
              </Text>
            </TouchableOpacity>
          </SafeAreaView>
        </Animated.View>
      )}

      {/* Bottom Controls */}
      {showControls && (
        <Animated.View
          entering={SlideInUp.duration(200)}
          exiting={SlideOutDown.duration(200)}
          style={[
            styles.bottomControls,
            { backgroundColor: themeColors.surface },
            shadows.md,
          ]}
        >
          {/* Progress bar */}
          <View style={styles.progressSection}>
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

          {/* Annotation Tools */}
          <View style={styles.toolsSection}>
            <ToolButton
              icon="🖍️"
              isActive={activeTool === 'highlight'}
              onPress={() => handleToolSelect('highlight')}
              themeColors={themeColors}
            />
            <ToolButton
              icon="✏️"
              isActive={activeTool === 'freehand'}
              onPress={() => handleToolSelect('freehand')}
              themeColors={themeColors}
            />
            <ToolButton
              icon="😊"
              isActive={activeTool === 'emoji'}
              onPress={() => handleToolSelect('emoji')}
              themeColors={themeColors}
            />
            <ToolButton
              icon="🔊"
              isActive={false}
              onPress={() => {
                // TODO: TTS toggle
              }}
              themeColors={themeColors}
            />
          </View>

          {/* Page Navigation */}
          <View style={styles.pageNavSection}>
            <TouchableOpacity
              onPress={() => handlePageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage <= 1}
              style={[
                styles.navButton,
                { opacity: currentPage <= 1 ? 0.3 : 1 },
              ]}
            >
              <Text
                style={[
                  typography.ui.body,
                  { color: themeColors.accentPrimary },
                ]}
              >
                ◀ Prev
              </Text>
            </TouchableOpacity>

            <Text
              style={[
                typography.ui.bodyMedium,
                { color: themeColors.textPrimary },
              ]}
            >
              {currentPage} / {totalPages}
            </Text>

            <TouchableOpacity
              onPress={() =>
                handlePageChange(Math.min(totalPages, currentPage + 1))
              }
              disabled={currentPage >= totalPages}
              style={[
                styles.navButton,
                { opacity: currentPage >= totalPages ? 0.3 : 1 },
              ]}
            >
              <Text
                style={[
                  typography.ui.body,
                  { color: themeColors.accentPrimary },
                ]}
              >
                Next ▶
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}

      {/* Active Tool Indicator */}
      {activeTool !== 'none' && showControls && (
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(200)}
          style={[
            styles.toolIndicator,
            { backgroundColor: themeColors.accentPrimary },
          ]}
        >
          <Text style={styles.toolIndicatorText}>
            {activeTool === 'highlight' && '🖍️ Highlight Mode'}
            {activeTool === 'freehand' && '✏️ Drawing Mode'}
            {activeTool === 'emoji' && '😊 Emoji Mode'}
          </Text>
        </Animated.View>
      )}
    </View>
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
  errorEmoji: {
    fontSize: 64,
    marginBottom: spacing.lg,
  },
  backButton: {
    marginTop: spacing.xl,
    padding: spacing.md,
  },
  readerArea: {
    flex: 1,
  },
  pdfPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    margin: spacing.md,
    borderRadius: borderRadius.lg,
  },
  pdfEmoji: {
    fontSize: 64,
    marginBottom: spacing.lg,
  },
  topControls: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  topControlsInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.md,
  },
  backTouchable: {
    padding: spacing.sm,
  },
  titleContainer: {
    flex: 1,
    marginHorizontal: spacing.md,
    alignItems: 'center',
  },
  bookmarkTouchable: {
    padding: spacing.sm,
  },
  bookmarkIcon: {
    fontSize: 24,
  },
  bottomControls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.md,
    paddingBottom: spacing.xl,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
  },
  progressSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
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
  toolsSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  toolButton: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  toolIcon: {
    fontSize: 20,
  },
  pageNavSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  navButton: {
    padding: spacing.sm,
  },
  toolIndicator: {
    position: 'absolute',
    top: 100,
    alignSelf: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  toolIndicatorText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
});

export default ReaderScreen;

/**
 * Book Reader with Annotations
 *
 * Wraps the BookReader component with annotation overlays for dark mode
 */

import React, { useState, useCallback } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { BookReader } from './BookReader';
import {
  HighlightOverlay,
  FreehandOverlay,
  EmojiPicker,
  EmojiReactionOverlay,
} from '../annotations';
import {
  HighlightColor,
  Highlight,
  EmojiReaction,
  FreehandHighlight,
} from '../../types';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface BookReaderWithAnnotationsProps {
  filePath: string;
  bookId: string;
  currentPage: number;
  onPageChanged?: (page: number, totalPages?: number) => void;
  onLoadComplete?: (totalPages: number) => void;
  fontSize?: number;
  lineSpacing?: number;
  enableDarkMode?: boolean;
  onToggleControls?: () => void;

  activeTool: 'none' | 'highlight' | 'freehand' | 'emoji';
  themeColors: any;
  highlightColor: HighlightColor;
  highlightSize: 'small' | 'medium' | 'large';

  onAddHighlight: (
    page: number,
    x: number,
    y: number,
    width: number,
    height: number,
    color: HighlightColor,
  ) => void;
  onUpdateHighlight: (
    id: string,
    x: number,
    y: number,
    width: number,
    height: number,
  ) => void;
  onDeleteHighlight: (id: string) => void;
  onAddFreehand: (
    page: number,
    path: string,
    color: HighlightColor,
    strokeWidth: number,
  ) => void;
  onDeleteFreehand: (id: string) => void;
  onAddEmoji: (page: number, x: number, y: number, emoji: string) => void;
  onUpdateEmoji: (id: string, x: number, y: number) => void;
  onDeleteEmoji: (id: string) => void;

  pageHighlights: Highlight[];
  pageFreehand: FreehandHighlight[];
  pageEmojis: EmojiReaction[];
}

export const BookReaderWithAnnotations: React.FC<
  BookReaderWithAnnotationsProps
> = ({
  filePath,
  bookId,
  currentPage,
  onPageChanged,
  onLoadComplete,
  fontSize,
  lineSpacing,
  enableDarkMode,
  onToggleControls,
  activeTool,
  themeColors,
  highlightColor,
  highlightSize,
  onAddHighlight,
  onUpdateHighlight,
  onDeleteHighlight,
  onAddFreehand,
  onDeleteFreehand,
  onAddEmoji,
  onUpdateEmoji,
  onDeleteEmoji,
  pageHighlights,
  pageFreehand,
  pageEmojis,
}) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [pendingEmojiPosition, setPendingEmojiPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const handleAddHighlight = useCallback(
    (x: number, y: number, w: number, h: number) => {
      onAddHighlight(currentPage, x, y, w, h, highlightColor);
    },
    [currentPage, highlightColor, onAddHighlight],
  );

  const handleOpenEmojiPicker = useCallback((x: number, y: number) => {
    setPendingEmojiPosition({ x, y });
    setShowEmojiPicker(true);
  }, []);

  const handleSelectEmoji = useCallback(
    (emoji: string) => {
      if (pendingEmojiPosition) {
        onAddEmoji(
          currentPage,
          pendingEmojiPosition.x,
          pendingEmojiPosition.y,
          emoji,
        );
        setPendingEmojiPosition(null);
      }
      setShowEmojiPicker(false);
    },
    [currentPage, pendingEmojiPosition, onAddEmoji],
  );

  return (
    <View style={styles.container}>
      <BookReader
        filePath={filePath}
        bookId={parseInt(bookId, 10)}
        currentPage={currentPage}
        onPageChanged={onPageChanged}
        onLoadComplete={onLoadComplete}
        fontSize={fontSize}
        lineSpacing={lineSpacing}
        enableDarkMode={enableDarkMode}
        onToggleControls={onToggleControls}
      />

      <View
        style={StyleSheet.absoluteFill}
        pointerEvents={activeTool !== 'none' ? 'auto' : 'box-none'}
      >
        {(activeTool === 'highlight' || pageHighlights.length > 0) && (
          <HighlightOverlay
            highlights={pageHighlights}
            isDrawingMode={activeTool === 'highlight'}
            selectedColor={highlightColor}
            highlightSize={highlightSize}
            pageWidth={SCREEN_WIDTH}
            pageHeight={SCREEN_HEIGHT}
            onAddHighlight={handleAddHighlight}
            onUpdateHighlight={onUpdateHighlight}
            onDeleteHighlight={onDeleteHighlight}
            themeColors={themeColors}
          />
        )}

        {(activeTool === 'freehand' || pageFreehand.length > 0) && (
          <FreehandOverlay
            isActive={activeTool === 'freehand'}
            color={highlightColor}
            strokeWidth={
              highlightSize === 'small'
                ? 8
                : highlightSize === 'medium'
                ? 12
                : 16
            }
            onPathComplete={(pathData: string) =>
              onAddFreehand(
                currentPage,
                pathData,
                highlightColor,
                highlightSize === 'small'
                  ? 8
                  : highlightSize === 'medium'
                  ? 12
                  : 16,
              )
            }
            existingPaths={pageFreehand}
            onDeletePath={onDeleteFreehand}
            selectedPathId={null}
            onSelectPath={() => {}}
          />
        )}

        {(activeTool === 'emoji' || pageEmojis.length > 0) && (
          <EmojiReactionOverlay
            reactions={pageEmojis}
            isPlacementMode={activeTool === 'emoji'}
            pageWidth={SCREEN_WIDTH}
            pageHeight={SCREEN_HEIGHT}
            onAddReaction={(x, y, emoji) =>
              onAddEmoji(currentPage, x, y, emoji)
            }
            onUpdateReaction={onUpdateEmoji}
            onDeleteReaction={onDeleteEmoji}
            onOpenEmojiPicker={handleOpenEmojiPicker}
            themeColors={themeColors}
          />
        )}
      </View>

      <EmojiPicker
        visible={showEmojiPicker}
        onSelectEmoji={handleSelectEmoji}
        onClose={() => setShowEmojiPicker(false)}
        themeColors={themeColors}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

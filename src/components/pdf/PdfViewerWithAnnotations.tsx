/**
 * PDF Viewer with Annotations
 *
 * Wraps the PdfViewer component with annotation overlays
 */

import React, { useState, useCallback } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { PdfViewer } from './PdfViewer';
import {
  HighlightOverlay,
  EmojiPicker,
  EmojiReactionOverlay,
} from '../annotations';
import { HighlightColor, Highlight, EmojiReaction } from '../../types';

const { width, height } = Dimensions.get('window');

interface PdfViewerWithAnnotationsProps {
  source: string;
  page: number;
  onPageChange: (page: number, totalPages: number) => void;
  onLoadComplete?: (totalPages: number) => void;
  onError?: (error: any) => void;
  readingMode?: 'paged' | 'scroll';
  backgroundColor?: string;

  // Annotation props
  activeTool: 'none' | 'highlight' | 'freehand' | 'emoji';
  bookId: string;
  themeColors: any;
  highlightColor: HighlightColor;
  highlightSize: 'small' | 'medium' | 'large';

  // Annotation callbacks
  onAddHighlight: (
    page: number,
    x: number,
    y: number,
    width: number,
    height: number,
    color: HighlightColor,
  ) => void;
  onDeleteHighlight: (id: string) => void;
  onAddEmoji: (page: number, x: number, y: number, emoji: string) => void;
  onDeleteEmoji: (id: string) => void;

  // Current page annotations
  pageHighlights: Highlight[];
  pageEmojis: EmojiReaction[];
}

export const PdfViewerWithAnnotations: React.FC<
  PdfViewerWithAnnotationsProps
> = ({
  source,
  page,
  onPageChange,
  onLoadComplete,
  onError,
  readingMode = 'paged',
  backgroundColor = '#FFFFFF',
  activeTool,
  bookId: _bookId,
  themeColors,
  highlightColor,
  highlightSize,
  onAddHighlight,
  onDeleteHighlight,
  onAddEmoji,
  onDeleteEmoji,
  pageHighlights,
  pageEmojis,
}) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [pendingEmojiPosition, setPendingEmojiPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);

  // Handle adding a highlight
  const handleAddHighlight = useCallback(
    (x: number, y: number, w: number, h: number) => {
      onAddHighlight(page, x, y, w, h, highlightColor);
    },
    [page, highlightColor, onAddHighlight],
  );

  // Handle opening emoji picker
  const handleOpenEmojiPicker = useCallback(() => {
    setShowEmojiPicker(true);
  }, []);

  // Handle selecting an emoji
  const handleSelectEmoji = useCallback(
    (emoji: string) => {
      if (pendingEmojiPosition) {
        onAddEmoji(page, pendingEmojiPosition.x, pendingEmojiPosition.y, emoji);
        setPendingEmojiPosition(null);
      }
      setShowEmojiPicker(false);
    },
    [page, pendingEmojiPosition, onAddEmoji],
  );

  return (
    <View style={styles.container}>
      {/* PDF Viewer */}
      <PdfViewer
        source={source}
        page={page}
        onPageChange={onPageChange}
        onLoadComplete={onLoadComplete}
        onError={onError}
        readingMode={readingMode}
        backgroundColor={backgroundColor}
      />

      {/* Annotation Overlays */}
      <View
        style={StyleSheet.absoluteFill}
        pointerEvents={activeTool !== 'none' ? 'auto' : 'box-none'}
      >
        {/* Highlight Overlay */}
        {(activeTool === 'highlight' || pageHighlights.length > 0) && (
          <HighlightOverlay
            highlights={pageHighlights}
            isDrawingMode={activeTool === 'highlight'}
            selectedColor={highlightColor}
            highlightSize={highlightSize}
            pageWidth={width}
            pageHeight={height}
            onAddHighlight={handleAddHighlight}
            onDeleteHighlight={onDeleteHighlight}
            themeColors={themeColors}
          />
        )}

        {/* Emoji Reaction Overlay */}
        {(activeTool === 'emoji' || pageEmojis.length > 0) && (
          <EmojiReactionOverlay
            reactions={pageEmojis}
            isPlacementMode={activeTool === 'emoji'}
            pageWidth={width}
            pageHeight={height}
            onAddReaction={(x, y, emoji) => onAddEmoji(page, x, y, emoji)}
            onDeleteReaction={onDeleteEmoji}
            onOpenEmojiPicker={handleOpenEmojiPicker}
            themeColors={themeColors}
          />
        )}
      </View>

      {/* Emoji Picker Modal */}
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

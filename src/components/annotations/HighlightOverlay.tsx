/**
 * Highlight Overlay
 *
 * Renders rectangle highlights over PDF and handles drawing new highlights
 */

import React, { useState, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  runOnJS,
  withSpring,
} from 'react-native-reanimated';
import { Trash2 } from 'lucide-react-native';
import { Highlight, HighlightColor } from '../../types';
import { borderRadius } from '../../theme';

interface HighlightOverlayProps {
  highlights: Highlight[];
  isDrawingMode: boolean;
  selectedColor: HighlightColor;
  highlightSize: 'small' | 'medium' | 'large';
  pageWidth: number;
  pageHeight: number;
  onAddHighlight: (x: number, y: number, width: number, height: number) => void;
  onUpdateHighlight: (
    id: string,
    x: number,
    y: number,
    width: number,
    height: number,
  ) => void;
  onDeleteHighlight: (id: string) => void;
  themeColors: any;
}

const HIGHLIGHT_OPACITY = 0.55;

const COLOR_MAP: Record<HighlightColor, string> = {
  yellow: '#FFF3B0',
  green: '#D4EDDA',
  blue: '#C5E0F7',
  pink: '#FFD6E0',
  purple: '#E8D5F2',
  orange: '#FFE0CC',
};

const MIN_SIZE_MAP = {
  small: 15,
  medium: 20,
  large: 25,
};

interface HighlightBoxProps {
  highlight: Highlight;
  isSelected: boolean;
  pageWidth: number;
  pageHeight: number;
  onPress: () => void;
  onUpdate: (
    id: string,
    x: number,
    y: number,
    width: number,
    height: number,
  ) => void;
  onDelete: () => void;
  themeColors: any;
}

const HighlightBox: React.FC<HighlightBoxProps> = ({
  highlight,
  isSelected,
  pageWidth,
  pageHeight,
  onPress,
  onUpdate,
  onDelete,
  themeColors,
}) => {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const isDragging = useSharedValue(false);

  const toPixels = useCallback(
    (percent: number, dimension: 'width' | 'height') => {
      return (percent / 100) * (dimension === 'width' ? pageWidth : pageHeight);
    },
    [pageWidth, pageHeight],
  );

  const toPercent = useCallback(
    (pixels: number, dimension: 'width' | 'height') => {
      return (pixels / (dimension === 'width' ? pageWidth : pageHeight)) * 100;
    },
    [pageWidth, pageHeight],
  );

  const handleUpdatePosition = useCallback(
    (deltaX: number, deltaY: number) => {
      const currentX = toPixels(highlight.x, 'width');
      const currentY = toPixels(highlight.y, 'height');

      const finalX = currentX + deltaX;
      const finalY = currentY + deltaY;

      onUpdate(
        highlight.id,
        toPercent(finalX, 'width'),
        toPercent(finalY, 'height'),
        highlight.width,
        highlight.height,
      );
    },
    [
      highlight.id,
      highlight.x,
      highlight.y,
      highlight.width,
      highlight.height,
      onUpdate,
      toPixels,
      toPercent,
    ],
  );

  const panGesture = Gesture.Pan()
    .onStart(() => {
      'worklet';
      isDragging.value = true;
    })
    .onUpdate(event => {
      'worklet';
      translateX.value = event.translationX;
      translateY.value = event.translationY;
    })
    .onEnd(() => {
      'worklet';
      const finalX = translateX.value;
      const finalY = translateY.value;

      isDragging.value = false;
      translateX.value = withSpring(0);
      translateY.value = withSpring(0);

      runOnJS(handleUpdatePosition)(finalX, finalY);
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
    opacity: isDragging.value ? 0.7 : 1,
  }));

  return (
    <Animated.View
      style={[
        styles.highlightContainer,
        {
          left: toPixels(highlight.x, 'width'),
          top: toPixels(highlight.y, 'height'),
          width: toPixels(highlight.width, 'width'),
          height: toPixels(highlight.height, 'height'),
        },
        animatedStyle,
      ]}
    >
      <GestureDetector gesture={panGesture}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onPress}
          style={[
            styles.highlight,
            {
              backgroundColor: COLOR_MAP[highlight.color],
              opacity: HIGHLIGHT_OPACITY,
            },
            isSelected && [
              styles.selectedBorder,
              {
                borderColor: themeColors.accentPrimary,
                opacity: HIGHLIGHT_OPACITY + 0.1,
              },
            ],
          ]}
        />
      </GestureDetector>
      {isSelected && (
        <TouchableOpacity
          style={[
            styles.deleteButton,
            { backgroundColor: themeColors.error || '#EF4444' },
          ]}
          onPress={onDelete}
        >
          <Trash2 size={16} color="#FFFFFF" />
        </TouchableOpacity>
      )}
    </Animated.View>
  );
};

export const HighlightOverlay: React.FC<HighlightOverlayProps> = ({
  highlights,
  isDrawingMode,
  selectedColor,
  highlightSize,
  pageWidth,
  pageHeight,
  onAddHighlight,
  onUpdateHighlight,
  onDeleteHighlight,
  themeColors,
}) => {
  const [selectedHighlight, setSelectedHighlight] = useState<string | null>(
    null,
  );

  const startX = useSharedValue(0);
  const startY = useSharedValue(0);
  const currentX = useSharedValue(0);
  const currentY = useSharedValue(0);
  const isDrawing = useSharedValue(false);

  const toPercent = useCallback(
    (pixels: number, dimension: 'width' | 'height') => {
      return (pixels / (dimension === 'width' ? pageWidth : pageHeight)) * 100;
    },
    [pageWidth, pageHeight],
  );

  const handleAddHighlightJS = useCallback(
    (sX: number, sY: number, cX: number, cY: number) => {
      const minX = Math.min(sX, cX);
      const minY = Math.min(sY, cY);
      const maxX = Math.max(sX, cX);
      const maxY = Math.max(sY, cY);

      const width = maxX - minX;
      const height = maxY - minY;

      const minSize = MIN_SIZE_MAP[highlightSize];
      if (width >= minSize || height >= minSize) {
        onAddHighlight(
          toPercent(minX, 'width'),
          toPercent(minY, 'height'),
          toPercent(width, 'width'),
          toPercent(height, 'height'),
        );
      }
    },
    [onAddHighlight, toPercent, highlightSize],
  );

  const panGesture = Gesture.Pan()
    .enabled(isDrawingMode)
    .onStart(event => {
      'worklet';
      startX.value = event.x;
      startY.value = event.y;
      currentX.value = event.x;
      currentY.value = event.y;
      isDrawing.value = true;
    })
    .onUpdate(event => {
      'worklet';
      currentX.value = event.x;
      currentY.value = event.y;
    })
    .onEnd(() => {
      'worklet';
      const sX = startX.value;
      const sY = startY.value;
      const cX = currentX.value;
      const cY = currentY.value;

      isDrawing.value = false;

      runOnJS(handleAddHighlightJS)(sX, sY, cX, cY);
    });

  const animatedDrawingStyle = useAnimatedStyle(() => {
    const minX = Math.min(startX.value, currentX.value);
    const minY = Math.min(startY.value, currentY.value);
    const width = Math.abs(currentX.value - startX.value);
    const height = Math.abs(currentY.value - startY.value);

    return {
      position: 'absolute' as const,
      left: minX,
      top: minY,
      width,
      height,
      backgroundColor: COLOR_MAP[selectedColor],
      opacity: isDrawing.value ? HIGHLIGHT_OPACITY + 0.15 : 0,
      borderWidth: 2,
      borderColor: COLOR_MAP[selectedColor],
      borderStyle: 'dashed' as const,
    };
  });

  const handleHighlightPress = useCallback(
    (id: string) => {
      if (!isDrawingMode) {
        setSelectedHighlight(prev => (prev === id ? null : id));
      }
    },
    [isDrawingMode],
  );

  const handleDeleteHighlight = useCallback(
    (id: string) => {
      onDeleteHighlight(id);
      setSelectedHighlight(null);
    },
    [onDeleteHighlight],
  );

  return (
    <GestureDetector gesture={panGesture}>
      <View
        style={StyleSheet.absoluteFill}
        pointerEvents={isDrawingMode ? 'auto' : 'box-none'}
      >
        {highlights.map(highlight => {
          const isSelected = selectedHighlight === highlight.id;
          return (
            <View
              key={highlight.id}
              pointerEvents={isDrawingMode ? 'none' : 'auto'}
            >
              <HighlightBox
                highlight={highlight}
                isSelected={isSelected}
                pageWidth={pageWidth}
                pageHeight={pageHeight}
                onPress={() => handleHighlightPress(highlight.id)}
                onUpdate={onUpdateHighlight}
                onDelete={() => handleDeleteHighlight(highlight.id)}
                themeColors={themeColors}
              />
            </View>
          );
        })}

        <Animated.View style={animatedDrawingStyle} />
      </View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  highlight: {
    flex: 1,
    borderRadius: borderRadius.sm,
  },
  deleteButton: {
    position: 'absolute',
    top: -12,
    right: -12,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  highlightContainer: {
    position: 'absolute',
  },
  selectedBorder: {
    borderWidth: 2,
  },
});

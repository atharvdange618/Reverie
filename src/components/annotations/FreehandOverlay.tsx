/**
 * Freehand Overlay Component
 *
 * Allows users to draw freehand highlights like a marker using Skia
 */

import React, { useState, useMemo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';
import {
  Canvas,
  Path,
  Skia,
  SkPath,
  BlurMask,
} from '@shopify/react-native-skia';
import { FreehandHighlight, HighlightColor } from '../../types';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface FreehandOverlayProps {
  isActive: boolean;
  color: HighlightColor;
  strokeWidth: number;
  onPathComplete: (pathData: string) => void;
  existingPaths: FreehandHighlight[];
  onDeletePath: (id: string) => void;
  selectedPathId: string | null;
  onSelectPath: (id: string | null) => void;
}

const COLOR_MAP: Record<HighlightColor, string> = {
  yellow: '#FFEB3B',
  green: '#4CAF50',
  blue: '#2196F3',
  pink: '#E91E63',
  purple: '#9C27B0',
  orange: '#FF9800',
};

const STROKE_WIDTH_MAP = {
  small: 8,
  medium: 12,
  large: 16,
};

export const FreehandOverlay: React.FC<FreehandOverlayProps> = ({
  isActive,
  color,
  strokeWidth,
  onPathComplete,
  existingPaths,
  onDeletePath: _onDeletePath,
  selectedPathId: _selectedPathId,
  onSelectPath: _onSelectPath,
}) => {
  const [currentPath, setCurrentPath] = useState<SkPath | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Get hex color from color name
  const hexColor = useMemo(() => COLOR_MAP[color], [color]);

  // Convert strokeWidth to actual pixel width
  const actualStrokeWidth = useMemo(() => {
    if (typeof strokeWidth === 'number') {
      return strokeWidth;
    }
    const sizeKey = strokeWidth as 'small' | 'medium' | 'large';
    return STROKE_WIDTH_MAP[sizeKey];
  }, [strokeWidth]);

  // Touch handler for drawing
  const panGesture = Gesture.Pan()
    .onStart(event => {
      if (!isActive) return;

      const { x, y } = event;
      const path = Skia.Path.Make();
      path.moveTo(x, y);
      runOnJS(setCurrentPath)(path);
      runOnJS(setIsDrawing)(true);
    })
    .onUpdate(event => {
      if (!isActive || !currentPath) return;

      const { x, y } = event;
      currentPath.lineTo(x, y);
      runOnJS(setCurrentPath)(currentPath.copy()); // Force re-render
    })
    .onEnd(() => {
      if (!isActive || !currentPath) return;

      // Convert path to SVG string for storage
      const pathString = currentPath.toSVGString();

      // Only save if path has meaningful length
      if (pathString && pathString.length > 10) {
        runOnJS(onPathComplete)(pathString);
      }

      runOnJS(setCurrentPath)(null);
      runOnJS(setIsDrawing)(false);
    }); // Convert existing paths from SVG strings back to Skia paths
  const renderedPaths = useMemo(() => {
    return existingPaths.map(fh => {
      const path = Skia.Path.MakeFromSVGString(fh.path);
      return {
        id: fh.id,
        path: path || Skia.Path.Make(),
        color: COLOR_MAP[fh.color],
        strokeWidth: fh.strokeWidth,
      };
    });
  }, [existingPaths]);

  return (
    <View style={styles.container} pointerEvents={isActive ? 'auto' : 'none'}>
      <GestureDetector gesture={panGesture}>
        <View style={styles.canvas}>
          <Canvas style={styles.canvas}>
            {/* Render existing paths */}
            {renderedPaths.map(item => (
              <Path
                key={item.id}
                path={item.path}
                color={item.color}
                style="stroke"
                strokeWidth={item.strokeWidth}
                opacity={0.4}
                strokeCap="round"
                strokeJoin="round"
              >
                <BlurMask blur={1} style="solid" />
              </Path>
            ))}

            {/* Render current path being drawn */}
            {isDrawing && currentPath && (
              <Path
                path={currentPath}
                color={hexColor}
                style="stroke"
                strokeWidth={actualStrokeWidth}
                opacity={0.5}
                strokeCap="round"
                strokeJoin="round"
              >
                <BlurMask blur={1} style="solid" />
              </Path>
            )}
          </Canvas>
        </View>
      </GestureDetector>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
  },
  canvas: {
    flex: 1,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
});

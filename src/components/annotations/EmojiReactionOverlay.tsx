/**
 * Emoji Reaction Overlay
 *
 * Renders emoji reactions on the PDF page and handles placement
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { Trash2 } from 'lucide-react-native';
import { EmojiReaction } from '../../types';

interface EmojiReactionOverlayProps {
  reactions: EmojiReaction[];
  isPlacementMode: boolean;
  pageWidth: number;
  pageHeight: number;
  onAddReaction: (x: number, y: number, emoji: string) => void;
  onUpdateReaction: (id: string, x: number, y: number) => void;
  onDeleteReaction: (id: string) => void;
  onOpenEmojiPicker: (x: number, y: number) => void;
  themeColors: any;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface ReactionButtonProps {
  reaction: EmojiReaction;
  isSelected: boolean;
  pageWidth: number;
  pageHeight: number;
  onPress: (id: string) => void;
  onUpdate: (id: string, x: number, y: number) => void;
  onDelete: (id: string) => void;
  themeColors: any;
}

const ReactionButton: React.FC<ReactionButtonProps> = ({
  reaction,
  isSelected,
  pageWidth,
  pageHeight,
  onPress,
  onUpdate,
  onDelete,
  themeColors,
}) => {
  const scale = useSharedValue(1);
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
    (newX: number, newY: number) => {
      const currentX = toPixels(reaction.x, 'width');
      const currentY = toPixels(reaction.y, 'height');

      const finalX = currentX + newX;
      const finalY = currentY + newY;

      onUpdate(
        reaction.id,
        toPercent(finalX, 'width'),
        toPercent(finalY, 'height'),
      );
    },
    [reaction.id, reaction.x, reaction.y, onUpdate, toPixels, toPercent],
  );

  const panGesture = Gesture.Pan()
    .onStart(() => {
      'worklet';
      isDragging.value = true;
      scale.value = 1.3;
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
      scale.value = isSelected ? 1.2 : 1;

      translateX.value = 0;
      translateY.value = 0;

      runOnJS(handleUpdatePosition)(finalX, finalY);
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: withSpring(scale.value) },
    ],
    opacity: isDragging.value ? 0.8 : 1,
  }));

  useEffect(() => {
    if (!isDragging.value) {
      scale.value = isSelected ? 1.2 : 1;
    }
  }, [isSelected, scale, isDragging]);

  return (
    <View
      style={[
        styles.reactionContainer,
        {
          left: toPixels(reaction.x, 'width'),
          top: toPixels(reaction.y, 'height'),
        },
      ]}
    >
      <GestureDetector gesture={panGesture}>
        <AnimatedTouchable
          activeOpacity={0.8}
          onPress={() => onPress(reaction.id)}
          style={[
            styles.reactionButton,
            animatedStyle,
            isSelected && styles.reactionButtonSelected,
          ]}
        >
          <Text style={styles.emojiText}>{reaction.emoji}</Text>
        </AnimatedTouchable>
      </GestureDetector>

      {isSelected && (
        <TouchableOpacity
          style={[
            styles.deleteButton,
            { backgroundColor: themeColors.error || '#EF4444' },
          ]}
          onPress={() => onDelete(reaction.id)}
        >
          <Trash2 size={14} color="#FFFFFF" />
        </TouchableOpacity>
      )}
    </View>
  );
};

export const EmojiReactionOverlay: React.FC<EmojiReactionOverlayProps> = ({
  reactions,
  isPlacementMode,
  pageWidth,
  pageHeight,
  onAddReaction: _onAddReaction,
  onUpdateReaction,
  onDeleteReaction,
  onOpenEmojiPicker,
  themeColors,
}) => {
  const [selectedReaction, setSelectedReaction] = useState<string | null>(null);

  const toPercent = (pixels: number, dimension: 'width' | 'height') => {
    return (pixels / (dimension === 'width' ? pageWidth : pageHeight)) * 100;
  };

  const handlePagePress = (event: any) => {
    if (isPlacementMode) {
      const { locationX, locationY } = event.nativeEvent;
      const x = toPercent(locationX, 'width');
      const y = toPercent(locationY, 'height');

      onOpenEmojiPicker(x, y);
    }
  };

  const handleReactionPress = (id: string) => {
    if (!isPlacementMode) {
      setSelectedReaction(selectedReaction === id ? null : id);
    }
  };

  const handleDeleteReaction = (id: string) => {
    onDeleteReaction(id);
    setSelectedReaction(null);
  };

  return (
    <Pressable
      style={StyleSheet.absoluteFill}
      onPress={handlePagePress}
      pointerEvents={isPlacementMode ? 'auto' : 'box-none'}
    >
      {reactions.map(reaction => {
        const isSelected = selectedReaction === reaction.id;
        return (
          <ReactionButton
            key={reaction.id}
            reaction={reaction}
            isSelected={isSelected}
            pageWidth={pageWidth}
            pageHeight={pageHeight}
            onPress={handleReactionPress}
            onUpdate={onUpdateReaction}
            onDelete={handleDeleteReaction}
            themeColors={themeColors}
          />
        );
      })}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  reactionContainer: {
    position: 'absolute',
  },
  reactionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  reactionButtonSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  emojiText: {
    fontSize: 24,
  },
  deleteButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
});

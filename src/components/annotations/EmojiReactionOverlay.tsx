/**
 * Emoji Reaction Overlay
 *
 * Renders emoji reactions on the PDF page and handles placement
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { Trash2 } from 'lucide-react-native';
import { EmojiReaction } from '../../types';

interface EmojiReactionOverlayProps {
  reactions: EmojiReaction[];
  isPlacementMode: boolean;
  pageWidth: number;
  pageHeight: number;
  onAddReaction: (x: number, y: number, emoji: string) => void;
  onDeleteReaction: (id: string) => void;
  onOpenEmojiPicker: () => void;
  themeColors: any;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

// Animated reaction button component
interface ReactionButtonProps {
  reaction: EmojiReaction;
  isSelected: boolean;
  pageWidth: number;
  pageHeight: number;
  onPress: (id: string) => void;
  onDelete: (id: string) => void;
  themeColors: any;
}

const ReactionButton: React.FC<ReactionButtonProps> = ({
  reaction,
  isSelected,
  pageWidth,
  pageHeight,
  onPress,
  onDelete,
  themeColors,
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(scale.value) }],
  }));

  useEffect(() => {
    scale.value = isSelected ? 1.2 : 1;
  }, [isSelected, scale]);

  // Convert percentage to pixels
  const toPixels = (percent: number, dimension: 'width' | 'height') => {
    return (percent / 100) * (dimension === 'width' ? pageWidth : pageHeight);
  };

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
  onDeleteReaction,
  onOpenEmojiPicker,
  themeColors,
}) => {
  const [selectedReaction, setSelectedReaction] = useState<string | null>(null);

  // Handle tap on page to place emoji
  const handlePagePress = (_event: any) => {
    if (isPlacementMode) {
      // TODO: Store tap position for emoji placement
      // const { locationX, locationY } = event.nativeEvent;
      // const x = toPercent(locationX, 'width');
      // const y = toPercent(locationY, 'height');

      // Show emoji picker at this position
      onOpenEmojiPicker();

      // Position will be handled in parent component for now
    }
  };

  // Handle reaction press
  const handleReactionPress = (id: string) => {
    if (!isPlacementMode) {
      setSelectedReaction(selectedReaction === id ? null : id);
    }
  };

  // Handle delete reaction
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
      {/* Render all reactions */}
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

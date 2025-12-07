/**
 * Highlight Color Picker
 *
 * A simple color picker for selecting highlight colors
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Pressable,
} from 'react-native';
import { Check } from 'lucide-react-native';
import { HighlightColor } from '../../types';
import { typography, spacing, borderRadius, shadows } from '../../theme';

interface HighlightColorPickerProps {
  visible: boolean;
  selectedColor: HighlightColor;
  onSelectColor: (color: HighlightColor) => void;
  onClose: () => void;
  themeColors: any;
}

const HIGHLIGHT_COLORS: {
  color: HighlightColor;
  hex: string;
  label: string;
}[] = [
  { color: 'yellow', hex: '#FFEB3B', label: 'Yellow' },
  { color: 'green', hex: '#4CAF50', label: 'Green' },
  { color: 'blue', hex: '#2196F3', label: 'Blue' },
  { color: 'pink', hex: '#E91E63', label: 'Pink' },
  { color: 'purple', hex: '#9C27B0', label: 'Purple' },
];

export const HighlightColorPicker: React.FC<HighlightColorPickerProps> = ({
  visible,
  selectedColor,
  onSelectColor,
  onClose,
  themeColors,
}) => {
  const handleSelectColor = (color: HighlightColor) => {
    onSelectColor(color);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable
          style={[
            styles.container,
            { backgroundColor: themeColors.surface },
            shadows.xl,
          ]}
          onPress={e => e.stopPropagation()}
        >
          <Text
            style={[
              typography.ui.h4,
              { color: themeColors.textPrimary, marginBottom: spacing.md },
            ]}
          >
            Select Highlight Color
          </Text>

          <View style={styles.colorGrid}>
            {HIGHLIGHT_COLORS.map(({ color, hex, label }) => {
              const isSelected = selectedColor === color;
              return (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorOption,
                    { borderColor: themeColors.border },
                    isSelected && {
                      borderColor: themeColors.accentPrimary,
                      borderWidth: 2,
                    },
                  ]}
                  onPress={() => handleSelectColor(color)}
                >
                  <View
                    style={[
                      styles.colorCircle,
                      { backgroundColor: hex },
                      shadows.sm,
                    ]}
                  >
                    {isSelected && (
                      <View style={styles.checkContainer}>
                        <Check size={20} color="#FFFFFF" strokeWidth={3} />
                      </View>
                    )}
                  </View>
                  <Text
                    style={[
                      typography.ui.small,
                      {
                        color: themeColors.textSecondary,
                        marginTop: spacing.xs,
                      },
                    ]}
                  >
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '85%',
    maxWidth: 400,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    gap: spacing.md,
  },
  colorOption: {
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    minWidth: 70,
  },
  colorCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 20,
    padding: 2,
  },
});

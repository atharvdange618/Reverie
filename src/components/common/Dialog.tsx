/**
 * Dialog Component
 *
 * A custom dialog/modal that matches the app's aesthetic.
 * Replaces the native Alert.alert with a beautiful themed alternative.
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Dimensions,
  TouchableWithoutFeedback,
} from 'react-native';
import Animated, { FadeIn, FadeOut, SlideInDown, SlideOutDown } from 'react-native-reanimated';
import { useSettingsStore } from '../../store';
import { typography, spacing, borderRadius, shadows } from '../../theme';

const { width } = Dimensions.get('window');
const DIALOG_WIDTH = Math.min(width - spacing.xl * 2, 400);

export interface DialogButton {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

export interface DialogProps {
  visible: boolean;
  title: string;
  message: string;
  buttons: DialogButton[];
  onDismiss?: () => void;
}

export const Dialog: React.FC<DialogProps> = ({
  visible,
  title,
  message,
  buttons,
  onDismiss,
}) => {
  const { themeColors } = useSettingsStore();

  const handleBackdropPress = () => {
    const hasCancelButton = buttons.some(btn => btn.style === 'cancel');
    if (hasCancelButton && onDismiss) {
      onDismiss();
    }
  };

  const handleButtonPress = (button: DialogButton) => {
    if (button.onPress) {
      button.onPress();
    }
    if (onDismiss) {
      onDismiss();
    }
  };

  const getButtonColor = (style?: string) => {
    switch (style) {
      case 'destructive':
        return '#EF4444';
      case 'cancel':
        return themeColors.textSecondary;
      default:
        return themeColors.accentPrimary;
    }
  };

  const getButtonWeight = (style?: string) => {
    return style === 'cancel' ? typography.ui.body : typography.ui.bodyMedium;
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onDismiss}
    >
      <TouchableWithoutFeedback onPress={handleBackdropPress}>
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(200)}
          style={styles.backdrop}
        >
          <TouchableWithoutFeedback>
            <Animated.View
              entering={SlideInDown.duration(300).springify()}
              exiting={SlideOutDown.duration(200)}
              style={[
                styles.dialog,
                {
                  backgroundColor: themeColors.surface,
                  borderColor: themeColors.border,
                },
                shadows.lg,
              ]}
            >
              <Text
                style={[
                  typography.ui.h3,
                  { color: themeColors.textPrimary, textAlign: 'center' },
                ]}
              >
                {title}
              </Text>

              <Text
                style={[
                  typography.ui.body,
                  {
                    color: themeColors.textSecondary,
                    textAlign: 'center',
                    marginTop: spacing.sm,
                  },
                ]}
              >
                {message}
              </Text>

              <View style={styles.buttonContainer}>
                {buttons.map((button, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => handleButtonPress(button)}
                    style={[
                      styles.button,
                      button.style === 'cancel' && styles.cancelButton,
                      button.style === 'destructive' && styles.destructiveButton,
                      button.style === 'default' && [
                        styles.primaryButton,
                        { backgroundColor: themeColors.accentPrimary },
                      ],
                    ]}
                  >
                    <Text
                      style={[
                        getButtonWeight(button.style),
                        {
                          color:
                            button.style === 'default'
                              ? '#FFFFFF'
                              : getButtonColor(button.style),
                          textAlign: 'center',
                        },
                      ]}
                    >
                      {button.text}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Animated.View>
          </TouchableWithoutFeedback>
        </Animated.View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dialog: {
    width: DIALOG_WIDTH,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    padding: spacing.xl,
  },
  buttonContainer: {
    marginTop: spacing.xl,
    gap: spacing.sm,
  },
  button: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: 'transparent',
  },
  destructiveButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  primaryButton: {
    // backgroundColor set dynamically
  },
});

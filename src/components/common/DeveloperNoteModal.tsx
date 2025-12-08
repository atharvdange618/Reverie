/**
 * Developer Note Modal
 *
 * Hidden easter egg revealed by long-pressing specific UI elements.
 * Shows personal notes about why certain features exist.
 */

import React from 'react';
import {
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Dimensions,
  ScrollView,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  SlideInDown,
  SlideOutDown,
} from 'react-native-reanimated';
import { X, Heart } from 'lucide-react-native';

import { typography, spacing, borderRadius } from '../../theme';
import { useSettingsStore } from '../../store';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface DeveloperNoteModalProps {
  visible: boolean;
  title: string;
  message: string;
  onClose: () => void;
}

export const DeveloperNoteModal: React.FC<DeveloperNoteModalProps> = ({
  visible,
  title,
  message,
  onClose,
}) => {
  const { themeColors } = useSettingsStore();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <Animated.View
        entering={FadeIn.duration(400)}
        exiting={FadeOut.duration(300)}
        style={styles.overlay}
      >
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />

        <Animated.View
          entering={SlideInDown.duration(500).springify()}
          exiting={SlideOutDown.duration(400)}
          style={[
            styles.modalContent,
            {
              backgroundColor: themeColors.surface,
              borderColor: themeColors.border,
            },
          ]}
        >
          {/* Close button */}
          <TouchableOpacity
            onPress={onClose}
            style={styles.closeButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <X size={24} color={themeColors.textSecondary} />
          </TouchableOpacity>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Header with heart icon */}
            <Animated.View
              entering={FadeIn.duration(600).delay(200)}
              style={styles.headerContainer}
            >
              <Heart size={32} color="#FFB6C1" fill="#FFB6C1" />
              <Text
                style={[
                  typography.reading.title,
                  styles.title,
                  { color: themeColors.accentPrimary },
                ]}
              >
                {title}
              </Text>
            </Animated.View>

            {/* Developer note message */}
            <Animated.View entering={FadeIn.duration(600).delay(400)}>
              <Text
                style={[
                  typography.reading.message,
                  styles.message,
                  { color: themeColors.textPrimary },
                ]}
              >
                {message}
              </Text>
            </Animated.View>

            {/* Signature */}
            <Animated.View entering={FadeIn.duration(600).delay(600)}>
              <Text
                style={[
                  typography.reading.quote,
                  styles.signature,
                  { color: themeColors.accentSecondary },
                ]}
              >
                — Atharv
              </Text>
            </Animated.View>
          </ScrollView>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  modalContent: {
    width: SCREEN_WIDTH - spacing.xl * 2,
    maxHeight: '75%',
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    padding: spacing.xl,
    marginBottom: spacing.xl,
  },
  closeButton: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    zIndex: 10,
  },
  scrollContent: {
    paddingBottom: spacing.md,
  },
  headerContainer: {
    alignItems: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  title: {
    textAlign: 'center',
    marginTop: spacing.md,
  },
  message: {
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: spacing.xl,
  },
  signature: {
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

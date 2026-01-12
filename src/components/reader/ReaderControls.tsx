import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  useColorScheme,
  Modal,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { spacing, typography, fontFamilies } from '../../theme';
import { useSettingsStore } from '../../store';

export interface ReaderControlsProps {
  visible: boolean;
  onClose: () => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const ReaderControls: React.FC<ReaderControlsProps> = ({
  visible,
  onClose,
  currentPage,
  totalPages,
  onPageChange,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const {
    bookReaderFontSize,
    bookReaderFontFamily,
    bookReaderLineSpacing,
    setBookReaderFontSize,
    setBookReaderFontFamily,
    setBookReaderLineSpacing,
  } = useSettingsStore();

  const [activeTab, setActiveTab] = useState<'typography' | 'navigation'>(
    'typography',
  );

  const theme = {
    background: isDark ? '#1E1E1E' : '#FFFFFF',
    surface: isDark ? '#2C2C2C' : '#F5F5F5',
    text: isDark ? '#E8E8E8' : '#1A1A1A',
    textSecondary: isDark ? '#A0A0A0' : '#666666',
    border: isDark ? '#3C3C3C' : '#E0E0E0',
    accent: isDark ? '#BB86FC' : '#6200EE',
    overlay: isDark ? 'rgba(0,0,0,0.85)' : 'rgba(0,0,0,0.5)',
  };

  const fontSizePercent = Math.round(bookReaderFontSize * 100);
  const lineSpacingPercent = Math.round(bookReaderLineSpacing * 100);

  const validTotalPages = Math.max(1, totalPages || 1);
  const validCurrentPage = Math.max(1, Math.min(currentPage, validTotalPages));

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable
        style={[styles.overlay, { backgroundColor: theme.overlay }]}
        onPress={onClose}
      >
        <Pressable
          style={[styles.panel, { backgroundColor: theme.background }]}
          onPress={e => e.stopPropagation()}
        >
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.text }]}>
              Reading Controls
            </Text>

            <View style={[styles.tabs, { backgroundColor: theme.surface }]}>
              <Pressable
                style={[
                  styles.tab,
                  activeTab === 'typography' && {
                    backgroundColor: theme.accent,
                  },
                ]}
                onPress={() => setActiveTab('typography')}
              >
                <Text
                  style={[
                    styles.tabText,
                    {
                      color:
                        activeTab === 'typography'
                          ? '#FFFFFF'
                          : theme.textSecondary,
                    },
                  ]}
                >
                  Typography
                </Text>
              </Pressable>

              <Pressable
                style={[
                  styles.tab,
                  activeTab === 'navigation' && {
                    backgroundColor: theme.accent,
                  },
                ]}
                onPress={() => setActiveTab('navigation')}
              >
                <Text
                  style={[
                    styles.tabText,
                    {
                      color:
                        activeTab === 'navigation'
                          ? '#FFFFFF'
                          : theme.textSecondary,
                    },
                  ]}
                >
                  Navigation
                </Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.content}>
            {activeTab === 'typography' ? (
              <View style={styles.section}>
                <View style={styles.control}>
                  <View style={styles.controlHeader}>
                    <Text style={[styles.label, { color: theme.text }]}>
                      Font Size
                    </Text>
                    <Text style={[styles.value, { color: theme.accent }]}>
                      {fontSizePercent}%
                    </Text>
                  </View>
                  <Slider
                    style={styles.slider}
                    minimumValue={0.8}
                    maximumValue={1.5}
                    step={0.05}
                    value={bookReaderFontSize}
                    onValueChange={setBookReaderFontSize}
                    minimumTrackTintColor={theme.accent}
                    maximumTrackTintColor={theme.border}
                    thumbTintColor={theme.accent}
                  />
                  <View style={styles.sliderLabels}>
                    <Text
                      style={[
                        styles.sliderLabel,
                        { color: theme.textSecondary },
                      ]}
                    >
                      A
                    </Text>
                    <Text
                      style={[
                        styles.sliderLabel,
                        styles.largeLabel,
                        { color: theme.textSecondary },
                      ]}
                    >
                      A
                    </Text>
                  </View>
                </View>

                <View style={styles.control}>
                  <View style={styles.controlHeader}>
                    <Text style={[styles.label, { color: theme.text }]}>
                      Line Spacing
                    </Text>
                    <Text style={[styles.value, { color: theme.accent }]}>
                      {lineSpacingPercent}%
                    </Text>
                  </View>
                  <Slider
                    style={styles.slider}
                    minimumValue={1.2}
                    maximumValue={2.0}
                    step={0.1}
                    value={bookReaderLineSpacing}
                    onValueChange={setBookReaderLineSpacing}
                    minimumTrackTintColor={theme.accent}
                    maximumTrackTintColor={theme.border}
                    thumbTintColor={theme.accent}
                  />
                  <View style={styles.sliderLabels}>
                    <Text
                      style={[
                        styles.sliderLabel,
                        { color: theme.textSecondary },
                      ]}
                    >
                      Compact
                    </Text>
                    <Text
                      style={[
                        styles.sliderLabel,
                        { color: theme.textSecondary },
                      ]}
                    >
                      Relaxed
                    </Text>
                  </View>
                </View>

                <View style={styles.control}>
                  <Text style={[styles.label, { color: theme.text }]}>
                    Font Family
                  </Text>
                  <View style={styles.fontOptions}>
                    <Pressable
                      style={[
                        styles.fontOption,
                        { borderColor: theme.border },
                        bookReaderFontFamily === 'literata' && {
                          backgroundColor: theme.accent,
                          borderColor: theme.accent,
                        },
                      ]}
                      onPress={() => setBookReaderFontFamily('literata')}
                    >
                      <Text
                        style={[
                          styles.fontOptionText,
                          {
                            fontFamily: fontFamilies.literata.regular,
                            color:
                              bookReaderFontFamily === 'literata'
                                ? '#FFFFFF'
                                : theme.text,
                          },
                        ]}
                      >
                        Literata
                      </Text>
                    </Pressable>

                    <Pressable
                      style={[
                        styles.fontOption,
                        { borderColor: theme.border },
                        bookReaderFontFamily === 'inter' && {
                          backgroundColor: theme.accent,
                          borderColor: theme.accent,
                        },
                      ]}
                      onPress={() => setBookReaderFontFamily('inter')}
                    >
                      <Text
                        style={[
                          styles.fontOptionText,
                          {
                            fontFamily: fontFamilies.inter.regular,
                            color:
                              bookReaderFontFamily === 'inter'
                                ? '#FFFFFF'
                                : theme.text,
                          },
                        ]}
                      >
                        Inter
                      </Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            ) : (
              <View style={styles.section}>
                <View style={styles.control}>
                  <Text style={[styles.label, { color: theme.text }]}>
                    Jump to Page
                  </Text>
                  <View style={styles.pageNavigation}>
                    <Text
                      style={[styles.pageText, { color: theme.textSecondary }]}
                    >
                      Page {validCurrentPage} of {validTotalPages}
                    </Text>
                  </View>
                  <Slider
                    style={styles.slider}
                    minimumValue={1}
                    maximumValue={validTotalPages}
                    step={1}
                    value={validCurrentPage}
                    onValueChange={onPageChange}
                    minimumTrackTintColor={theme.accent}
                    maximumTrackTintColor={theme.border}
                    thumbTintColor={theme.accent}
                  />
                  <View style={styles.sliderLabels}>
                    <Text
                      style={[
                        styles.sliderLabel,
                        { color: theme.textSecondary },
                      ]}
                    >
                      1
                    </Text>
                    <Text
                      style={[
                        styles.sliderLabel,
                        { color: theme.textSecondary },
                      ]}
                    >
                      {validTotalPages}
                    </Text>
                  </View>
                </View>

                <View style={styles.quickActions}>
                  <Pressable
                    style={[
                      styles.actionButton,
                      { backgroundColor: theme.surface },
                    ]}
                    onPress={() =>
                      onPageChange(Math.max(1, validCurrentPage - 1))
                    }
                    disabled={validCurrentPage === 1}
                  >
                    <Text
                      style={[styles.actionButtonText, { color: theme.text }]}
                    >
                      ← Previous
                    </Text>
                  </Pressable>

                  <Pressable
                    style={[
                      styles.actionButton,
                      { backgroundColor: theme.surface },
                    ]}
                    onPress={() =>
                      onPageChange(
                        Math.min(validTotalPages, validCurrentPage + 1),
                      )
                    }
                    disabled={validCurrentPage === validTotalPages}
                  >
                    <Text
                      style={[styles.actionButtonText, { color: theme.text }]}
                    >
                      Next →
                    </Text>
                  </Pressable>
                </View>
              </View>
            )}
          </View>

          <Pressable
            style={[styles.closeButton, { backgroundColor: theme.surface }]}
            onPress={onClose}
          >
            <Text style={[styles.closeButtonText, { color: theme.text }]}>
              Done
            </Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  panel: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: spacing.xl,
    maxHeight: '70%',
  },
  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
  },
  title: {
    ...typography.ui.h3,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  tabs: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: spacing.xs,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: 10,
    alignItems: 'center',
  },
  tabText: {
    ...typography.ui.caption,
    fontFamily: fontFamilies.inter.medium,
  },
  content: {
    paddingHorizontal: spacing.xl,
  },
  section: {
    gap: spacing.xl,
  },
  control: {
    gap: spacing.sm,
  },
  controlHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    ...typography.ui.body,
    fontFamily: fontFamilies.inter.medium,
  },
  value: {
    ...typography.ui.caption,
    fontFamily: fontFamilies.inter.semiBold,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xs,
  },
  sliderLabel: {
    ...typography.ui.caption,
    fontSize: 12,
  },
  largeLabel: {
    fontSize: 16,
  },
  fontOptions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  fontOption: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
  },
  fontOptionText: {
    fontSize: 16,
  },
  pageNavigation: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  pageText: {
    ...typography.ui.body,
    fontSize: 18,
    fontFamily: fontFamilies.inter.medium,
  },
  quickActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  actionButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  actionButtonText: {
    ...typography.ui.body,
    fontFamily: fontFamilies.inter.medium,
  },
  closeButton: {
    marginHorizontal: spacing.xl,
    marginTop: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  closeButtonText: {
    ...typography.ui.body,
    fontFamily: fontFamilies.inter.semiBold,
  },
});

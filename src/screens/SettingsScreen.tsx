/**
 * Settings Screen
 *
 * App preferences including:
 * - Theme selection (Light/Dark/Sepia)
 * - Font size adjustment
 * - TTS settings
 * - Audio preferences
 * - About section with easter eggs
 */

import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import {
  Settings,
  Volume2,
  Music,
  VolumeX,
  Heart,
  Sparkles,
  Sun,
  Moon,
  Scroll,
  Type,
  ChevronRight,
  Mic,
} from 'lucide-react-native';

import { useSettingsStore, useMusicStore } from '../store';
import { typography, spacing, borderRadius, colors } from '../theme';
import type { ThemeMode } from '../theme/colors';

const SectionHeader = ({
  title,
  themeColors,
}: {
  title: string;
  themeColors: any;
}) => (
  <Text
    style={[
      typography.ui.label,
      styles.sectionHeader,
      { color: themeColors.textSecondary },
    ]}
  >
    {title}
  </Text>
);

const SettingsRow = ({
  icon,
  title,
  subtitle,
  right,
  onPress,
  themeColors,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  onPress?: () => void;
  themeColors: any;
}) => (
  <TouchableOpacity
    onPress={onPress}
    disabled={!onPress}
    style={[
      styles.settingsRow,
      { backgroundColor: themeColors.surface, borderColor: themeColors.border },
    ]}
    activeOpacity={onPress ? 0.7 : 1}
  >
    <View style={styles.rowIcon}>{icon}</View>
    <View style={styles.rowContent}>
      <Text style={[typography.ui.body, { color: themeColors.textPrimary }]}>
        {title}
      </Text>
      {subtitle && (
        <Text
          style={[
            typography.ui.small,
            { color: themeColors.textSecondary, marginTop: 2 },
          ]}
        >
          {subtitle}
        </Text>
      )}
    </View>
    {right}
  </TouchableOpacity>
);

const ThemeButton = ({
  mode,
  label,
  icon,
  isSelected,
  onPress,
  themeColors,
}: {
  mode: ThemeMode;
  label: string;
  icon: React.ReactNode;
  isSelected: boolean;
  onPress: () => void;
  themeColors: any;
}) => {
  const previewColors = colors[mode];

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.themeButton,
        {
          backgroundColor: previewColors.background,
          borderColor: isSelected
            ? themeColors.accentPrimary
            : themeColors.border,
          borderWidth: isSelected ? 2 : 1,
        },
      ]}
    >
      <View
        style={[
          styles.themePreview,
          { backgroundColor: previewColors.surface },
        ]}
      >
        {icon}
      </View>
      <Text
        style={[
          typography.ui.small,
          {
            color: isSelected
              ? themeColors.accentPrimary
              : themeColors.textSecondary,
            fontWeight: isSelected ? '600' : '400',
          },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const FontSizeSelector = ({ themeColors }: { themeColors: any }) => {
  const { bookReaderFontSize, setBookReaderFontSize } = useSettingsStore();

  const sizeOptions = [
    { multiplier: 1.0, label: '14' },
    { multiplier: 1.14, label: '16' },
    { multiplier: 1.29, label: '18' },
    { multiplier: 1.43, label: '20' },
    { multiplier: 1.57, label: '22' },
    { multiplier: 1.71, label: '24' },
  ];

  const currentSize =
    sizeOptions.find(
      opt => Math.abs(opt.multiplier - bookReaderFontSize) < 0.05,
    ) || sizeOptions[2];

  return (
    <View style={styles.fontSizeContainer}>
      <View style={styles.fontSizeRow}>
        {sizeOptions.map(({ multiplier, label }) => {
          const isSelected = Math.abs(multiplier - bookReaderFontSize) < 0.05;
          return (
            <TouchableOpacity
              key={multiplier}
              onPress={() => setBookReaderFontSize(multiplier)}
              style={[
                styles.fontSizeButton,
                {
                  backgroundColor: isSelected
                    ? themeColors.accentPrimary
                    : themeColors.surface,
                  borderColor: isSelected
                    ? themeColors.accentPrimary
                    : themeColors.border,
                },
              ]}
            >
              <Text
                style={[
                  {
                    fontSize: Number(label) * 0.7,
                    color: isSelected ? '#FFFFFF' : themeColors.textSecondary,
                    fontWeight: isSelected ? '600' : '400',
                  },
                ]}
              >
                A
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <Text
        style={[
          typography.ui.small,
          {
            color: themeColors.textSecondary,
            textAlign: 'center',
            marginTop: spacing.sm,
          },
        ]}
      >
        Current: {currentSize.label}pt
      </Text>
    </View>
  );
};

export const SettingsScreen = () => {
  const navigation = useNavigation();
  const {
    themeColors,
    themeMode,
    setTheme,
    ttsEnabled,
    setTtsEnabled,
    ttsRate,
    setTtsRate,
    ambientMusicEnabled,
    setAmbientMusicEnabled,
    ambientVolume,
    setAmbientVolume,
  } = useSettingsStore();

  const { initialize, toggleMusic, setVolume, isPlaying } = useMusicStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (ambientMusicEnabled && !isPlaying) {
      toggleMusic();
    } else if (!ambientMusicEnabled && isPlaying) {
      toggleMusic();
    }
  }, [ambientMusicEnabled, isPlaying, toggleMusic]);

  useEffect(() => {
    setVolume(ambientVolume);
  }, [ambientVolume, setVolume]);

  const handleMusicToggle = async (enabled: boolean) => {
    setAmbientMusicEnabled(enabled);
  };

  const handleVolumeChange = async (volume: number) => {
    setAmbientVolume(volume);
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: themeColors.background }]}
      edges={['top']}
    >
      <ScrollView
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeIn.duration(400)} style={styles.header}>
          <View style={styles.headerRow}>
            <Text
              style={[typography.ui.h2, { color: themeColors.textPrimary }]}
            >
              Settings
            </Text>
            <Settings size={24} color={themeColors.textSecondary} />
          </View>
          <Text
            style={[
              typography.ui.body,
              { color: themeColors.textSecondary, marginTop: spacing.xs },
            ]}
          >
            Make it yours
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(400).delay(100)}>
          <SectionHeader title="APPEARANCE" themeColors={themeColors} />
          <View style={styles.themeContainer}>
            <ThemeButton
              mode="light"
              label="Light"
              icon={<Sun size={20} color={colors.light.textPrimary} />}
              isSelected={themeMode === 'light'}
              onPress={() => setTheme('light')}
              themeColors={themeColors}
            />
            <ThemeButton
              mode="dark"
              label="Dark"
              icon={<Moon size={20} color={colors.dark.textPrimary} />}
              isSelected={themeMode === 'dark'}
              onPress={() => setTheme('dark')}
              themeColors={themeColors}
            />
            <ThemeButton
              mode="sepia"
              label="Sepia"
              icon={<Scroll size={20} color={colors.sepia.textPrimary} />}
              isSelected={themeMode === 'sepia'}
              onPress={() => setTheme('sepia')}
              themeColors={themeColors}
            />
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(400).delay(200)}>
          <SectionHeader title="READER" themeColors={themeColors} />
          <View
            style={[
              styles.card,
              {
                backgroundColor: themeColors.surface,
                borderColor: themeColors.border,
              },
            ]}
          >
            <View style={styles.cardHeader}>
              <Type size={20} color={themeColors.accentPrimary} />
              <Text
                style={[
                  typography.ui.bodyMedium,
                  { color: themeColors.textPrimary },
                ]}
              >
                Font Size
              </Text>
            </View>
            <FontSizeSelector themeColors={themeColors} />
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(400).delay(300)}>
          <SectionHeader title="AUDIO" themeColors={themeColors} />

          <SettingsRow
            icon={<Volume2 size={20} color={themeColors.accentPrimary} />}
            title="Text-to-Speech"
            subtitle="Read pages aloud"
            themeColors={themeColors}
            right={
              <Switch
                value={ttsEnabled}
                onValueChange={setTtsEnabled}
                trackColor={{
                  false: themeColors.border,
                  true: themeColors.accentSecondary,
                }}
                thumbColor={
                  ttsEnabled ? themeColors.accentPrimary : themeColors.surface
                }
              />
            }
          />

          {ttsEnabled && (
            <View
              style={[
                styles.subCard,
                {
                  backgroundColor: themeColors.surface,
                  borderColor: themeColors.border,
                },
              ]}
            >
              <Text
                style={[
                  typography.ui.small,
                  {
                    color: themeColors.textSecondary,
                    marginBottom: spacing.sm,
                  },
                ]}
              >
                Reading Speed: {ttsRate.toFixed(1)}x
              </Text>
              <View style={styles.speedButtons}>
                {[0.5, 0.75, 1.0, 1.25, 1.5].map(rate => (
                  <TouchableOpacity
                    key={rate}
                    onPress={() => setTtsRate(rate)}
                    style={[
                      styles.speedButton,
                      {
                        backgroundColor:
                          ttsRate === rate
                            ? themeColors.accentPrimary
                            : 'transparent',
                        borderColor:
                          ttsRate === rate
                            ? themeColors.accentPrimary
                            : themeColors.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        typography.ui.small,
                        {
                          color:
                            ttsRate === rate
                              ? '#FFFFFF'
                              : themeColors.textSecondary,
                        },
                      ]}
                    >
                      {rate}x
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                onPress={() => navigation.navigate('VoiceSelection')}
                style={[
                  styles.voiceSelectionButton,
                  {
                    backgroundColor: themeColors.background,
                    borderColor: themeColors.border,
                  },
                ]}
              >
                <Mic size={16} color={themeColors.accentPrimary} />
                <Text
                  style={[
                    typography.ui.body,
                    {
                      color: themeColors.textPrimary,
                      flex: 1,
                      marginLeft: spacing.sm,
                    },
                  ]}
                >
                  Select Voice
                </Text>
                <ChevronRight size={18} color={themeColors.textSecondary} />
              </TouchableOpacity>
            </View>
          )}

          <SettingsRow
            icon={<Music size={20} color={themeColors.accentPrimary} />}
            title="Ambient Music"
            subtitle="Soft background sounds"
            themeColors={themeColors}
            right={
              <Switch
                value={ambientMusicEnabled}
                onValueChange={handleMusicToggle}
                trackColor={{
                  false: themeColors.border,
                  true: themeColors.accentSecondary,
                }}
                thumbColor={
                  ambientMusicEnabled
                    ? themeColors.accentPrimary
                    : themeColors.surface
                }
              />
            }
          />

          {ambientMusicEnabled && (
            <View
              style={[
                styles.subCard,
                {
                  backgroundColor: themeColors.surface,
                  borderColor: themeColors.border,
                },
              ]}
            >
              <Text
                style={[
                  typography.ui.small,
                  {
                    color: themeColors.textSecondary,
                    marginBottom: spacing.sm,
                  },
                ]}
              >
                Volume: {Math.round(ambientVolume * 100)}%
              </Text>
              <View style={styles.volumeRow}>
                <VolumeX size={16} color={themeColors.textSecondary} />
                <View
                  style={[
                    styles.volumeTrack,
                    { backgroundColor: themeColors.border },
                  ]}
                >
                  <View
                    style={[
                      styles.volumeFill,
                      {
                        backgroundColor: themeColors.accentPrimary,
                        width: `${ambientVolume * 100}%`,
                      },
                    ]}
                  />
                </View>
                <Volume2 size={16} color={themeColors.textSecondary} />
              </View>
              <View style={styles.volumeButtons}>
                {[0.25, 0.5, 0.75, 1.0].map(vol => (
                  <TouchableOpacity
                    key={vol}
                    onPress={() => handleVolumeChange(vol)}
                    style={[
                      styles.volumeButton,
                      {
                        backgroundColor:
                          ambientVolume === vol
                            ? themeColors.accentSecondary
                            : 'transparent',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        typography.ui.small,
                        {
                          color:
                            ambientVolume === vol
                              ? themeColors.textPrimary
                              : themeColors.textSecondary,
                        },
                      ]}
                    >
                      {Math.round(vol * 100)}%
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(400).delay(400)}>
          <SectionHeader title="ABOUT" themeColors={themeColors} />

          <SettingsRow
            icon={<Heart size={20} color={themeColors.accentPrimary} />}
            title="About Reverie"
            subtitle="A personal note from the developer"
            onPress={() => navigation.navigate('About')}
            themeColors={themeColors}
          />

          <SettingsRow
            icon={<Sparkles size={20} color={themeColors.accentPrimary} />}
            title="Version"
            subtitle="1.0.0"
            themeColors={themeColors}
          />
        </Animated.View>

        <Animated.View
          entering={FadeInDown.duration(400).delay(500)}
          style={styles.footer}
        >
          <Text
            style={[
              typography.reading.quote,
              {
                color: themeColors.textSecondary,
                textAlign: 'center',
                fontSize: 14,
              },
            ]}
          >
            "You're in my veins, and I cannot get you out."
          </Text>
          <Text
            style={[
              typography.ui.caption,
              {
                color: themeColors.accentSecondary,
                textAlign: 'center',
                marginTop: spacing.xs,
              },
            ]}
          >
            ♡
          </Text>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.lg,
    paddingBottom: spacing['5xl'],
  },
  header: {
    marginBottom: spacing.xl,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  sectionHeader: {
    marginBottom: spacing.md,
    marginTop: spacing.lg,
  },
  themeContainer: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  themeButton: {
    flex: 1,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
  },
  themePreview: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  card: {
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  fontSizeContainer: {
    marginTop: spacing.sm,
  },
  fontSizeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  fontSizeButton: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    marginBottom: spacing.sm,
  },
  rowIcon: {
    marginRight: spacing.md,
  },
  rowContent: {
    flex: 1,
  },
  subCard: {
    marginLeft: spacing['2xl'],
    marginBottom: spacing.sm,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
  },
  speedButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  speedButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    borderWidth: 1,
  },
  volumeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  volumeTrack: {
    flex: 1,
    height: 6,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  volumeFill: {
    height: '100%',
    borderRadius: borderRadius.full,
  },
  volumeButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  volumeButton: {
    flex: 1,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
  },
  voiceSelectionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    marginTop: spacing.md,
  },
  footer: {
    marginTop: spacing['3xl'],
    paddingHorizontal: spacing.lg,
  },
});

export default SettingsScreen;

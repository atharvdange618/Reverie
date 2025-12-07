/**
 * Voice Selection Screen
 *
 * Allows users to:
 * - See all available TTS voices
 * - Preview each voice by tapping
 * - Select their preferred voice
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ArrowLeft, Volume2, Check } from 'lucide-react-native';
import Tts from 'react-native-tts';

import { useSettingsStore, useTtsStore } from '../store';
import { typography, spacing, borderRadius } from '../theme';

interface Voice {
  id: string;
  name: string;
  language: string;
  quality?: number;
  notInstalled?: boolean;
}

const PREVIEW_TEXT =
  'Hello! This is how I sound when reading your books. I hope you enjoy listening to me.';

export const VoiceSelectionScreen = () => {
  const navigation = useNavigation();
  const { themeColors } = useSettingsStore();
  const { selectedVoiceId, setVoice } = useTtsStore();

  const [voices, setVoices] = useState<Voice[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewingId, setPreviewingId] = useState<string | null>(null);

  // Load voices on mount
  useEffect(() => {
    const loadVoices = async () => {
      try {
        await Tts.getInitStatus();
        const allVoices = await Tts.voices();

        // Filter to English voices that are installed
        const englishVoices = allVoices.filter(
          (v: Voice) => v.language?.startsWith('en') && !v.notInstalled,
        );

        // Separate network (high quality) voices from local voices
        const networkVoices = englishVoices.filter(
          (v: Voice) =>
            v.id?.toLowerCase().includes('network') ||
            v.id?.toLowerCase().includes('neural') ||
            v.id?.toLowerCase().includes('wavenet'),
        );

        const localVoices = englishVoices.filter(
          (v: Voice) =>
            !v.id?.toLowerCase().includes('network') &&
            !v.id?.toLowerCase().includes('neural') &&
            !v.id?.toLowerCase().includes('wavenet'),
        );

        // Sort network voices first, then by quality
        const sortVoices = (voices: Voice[]) => {
          return voices.sort((a: Voice, b: Voice) => {
            // Prioritize higher quality
            if (a.quality && b.quality) {
              return b.quality - a.quality;
            }
            return a.name.localeCompare(b.name);
          });
        };

        // Combine: network voices first, then local
        const sortedVoices = [
          ...sortVoices(networkVoices),
          ...sortVoices(localVoices),
        ];

        setVoices(sortedVoices);

        console.log(
          `[VoiceSelection] Found ${networkVoices.length} network voices, ${localVoices.length} local voices`,
        );
      } catch (error) {
        console.error('[VoiceSelection] Error loading voices:', error);
      } finally {
        setLoading(false);
      }
    };

    loadVoices();

    // Stop TTS when leaving screen
    return () => {
      Tts.stop();
    };
  }, []);

  // Preview a voice
  const handlePreview = useCallback(async (voice: Voice) => {
    try {
      // Stop any current preview
      Tts.stop();

      setPreviewingId(voice.id);

      // Set this voice temporarily for preview
      await Tts.setDefaultVoice(voice.id);
      Tts.setDefaultRate(0.5); // Normal speed

      // Speak preview text
      Tts.speak(PREVIEW_TEXT);

      // Clear previewing state after a delay
      setTimeout(() => {
        setPreviewingId(null);
      }, 5000);
    } catch (error) {
      console.error('[VoiceSelection] Preview error:', error);
      setPreviewingId(null);
    }
  }, []);

  // Select a voice
  const handleSelect = useCallback(
    async (voice: Voice) => {
      try {
        Tts.stop();
        await setVoice(voice.id);

        // Show confirmation by previewing
        await Tts.setDefaultVoice(voice.id);
        Tts.speak('Voice selected!');

        // Go back after short delay
        setTimeout(() => {
          navigation.goBack();
        }, 1500);
      } catch (error) {
        console.error('[VoiceSelection] Selection error:', error);
      }
    },
    [setVoice, navigation],
  );

  const renderVoiceItem = ({ item, index }: { item: Voice; index: number }) => {
    const isSelected = item.id === selectedVoiceId;
    const isPreviewing = item.id === previewingId;

    // Check if this is a high-quality network voice
    const isNetworkVoice =
      item.id?.toLowerCase().includes('network') ||
      item.id?.toLowerCase().includes('neural') ||
      item.id?.toLowerCase().includes('wavenet');

    // Extract readable name from voice ID
    const displayName =
      item.name || item.id.split('-').slice(-1)[0] || 'Unknown';
    const languageLabel = item.language?.replace('_', '-') || 'en';

    return (
      <Animated.View entering={FadeInDown.delay(index * 50).duration(300)}>
        <TouchableOpacity
          style={[
            styles.voiceItem,
            {
              backgroundColor: isSelected
                ? themeColors.accentPrimary + '20'
                : themeColors.surface,
              borderColor: isSelected
                ? themeColors.accentPrimary
                : isNetworkVoice
                ? themeColors.accentSecondary + '60'
                : themeColors.border,
            },
          ]}
          onPress={() => handlePreview(item)}
          activeOpacity={0.7}
        >
          <View style={styles.voiceInfo}>
            <View style={styles.voiceHeader}>
              <Text
                style={[styles.voiceName, { color: themeColors.textPrimary }]}
                numberOfLines={1}
              >
                {displayName}
              </Text>
              {isNetworkVoice && (
                <View
                  style={[
                    styles.networkBadge,
                    { backgroundColor: themeColors.accentSecondary + '30' },
                  ]}
                >
                  <Text
                    style={[
                      styles.networkBadgeText,
                      { color: themeColors.accentSecondary },
                    ]}
                  >
                    HD
                  </Text>
                </View>
              )}
              {isSelected && (
                <View
                  style={[
                    styles.selectedBadge,
                    { backgroundColor: themeColors.accentPrimary },
                  ]}
                >
                  <Check size={12} color="#FFFFFF" />
                </View>
              )}
            </View>

            <Text
              style={[
                styles.voiceLanguage,
                { color: themeColors.textSecondary },
              ]}
            >
              {languageLabel} • {item.id}
            </Text>
          </View>

          <View style={styles.voiceActions}>
            {/* Preview button */}
            <TouchableOpacity
              style={[
                styles.previewButton,
                {
                  backgroundColor: isPreviewing
                    ? themeColors.accentPrimary
                    : themeColors.background,
                  borderColor: themeColors.border,
                },
              ]}
              onPress={() => handlePreview(item)}
            >
              <Volume2
                size={18}
                color={isPreviewing ? '#FFFFFF' : themeColors.textSecondary}
              />
            </TouchableOpacity>

            {/* Select button */}
            <TouchableOpacity
              style={[
                styles.selectButton,
                {
                  backgroundColor: isSelected
                    ? themeColors.accentPrimary
                    : themeColors.background,
                  borderColor: isSelected
                    ? themeColors.accentPrimary
                    : themeColors.border,
                },
              ]}
              onPress={() => handleSelect(item)}
            >
              <Text
                style={[
                  styles.selectButtonText,
                  {
                    color: isSelected ? '#FFFFFF' : themeColors.textPrimary,
                  },
                ]}
              >
                {isSelected ? 'Selected' : 'Select'}
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: themeColors.background }]}
      edges={['top']}
    >
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: themeColors.surface,
            borderBottomColor: themeColors.border,
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => {
            Tts.stop();
            navigation.goBack();
          }}
          style={styles.backButton}
        >
          <ArrowLeft size={24} color={themeColors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: themeColors.textPrimary }]}>
          Select TTS Voice
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Instructions */}
      <View
        style={[styles.instructions, { backgroundColor: themeColors.surface }]}
      >
        <Text
          style={[
            styles.instructionsText,
            { color: themeColors.textSecondary },
          ]}
        >
          Tap a voice to preview it. Tap "Select" to use it for reading. Voices
          marked with HD are high-quality network voices.
        </Text>
      </View>

      {/* Voice List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={themeColors.accentPrimary} />
          <Text
            style={[styles.loadingText, { color: themeColors.textSecondary }]}
          >
            Loading voices...
          </Text>
        </View>
      ) : voices.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text
            style={[styles.emptyText, { color: themeColors.textSecondary }]}
          >
            No English voices found on your device.
          </Text>
        </View>
      ) : (
        <FlatList
          data={voices}
          renderItem={renderVoiceItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: spacing.sm,
  },
  headerTitle: {
    flex: 1,
    ...typography.ui.h3,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  instructions: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginBottom: spacing.sm,
  },
  instructionsText: {
    ...typography.ui.body,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...typography.ui.body,
    marginTop: spacing.md,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyText: {
    ...typography.ui.body,
    textAlign: 'center',
  },
  listContent: {
    padding: spacing.md,
    paddingBottom: spacing['2xl'],
  },
  voiceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1.5,
    marginBottom: spacing.sm,
  },
  voiceInfo: {
    flex: 1,
  },
  voiceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  voiceName: {
    ...typography.ui.bodyMedium,
    fontSize: 16,
  },
  selectedBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  networkBadge: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  networkBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  voiceLanguage: {
    ...typography.ui.small,
    marginTop: 2,
  },
  voiceActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  previewButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  selectButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1.5,
  },
  selectButtonText: {
    ...typography.ui.bodyMedium,
    fontSize: 14,
  },
});

export default VoiceSelectionScreen;

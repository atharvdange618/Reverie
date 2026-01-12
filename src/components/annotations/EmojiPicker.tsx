/**
 * Emoji Picker
 *
 * A full emoji picker using emoji-mart data
 */

import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Pressable,
  ScrollView,
  TextInput,
  FlatList,
} from 'react-native';
import { Search, X } from 'lucide-react-native';
import { typography, spacing, borderRadius, shadows } from '../../theme';

interface EmojiPickerProps {
  visible: boolean;
  onSelectEmoji: (emoji: string) => void;
  onClose: () => void;
  themeColors: any;
}

interface EmojiData {
  id: string;
  name: string;
  keywords: string[];
  skins: Array<{ native: string }>;
  native?: string;
}

interface CategoryData {
  id: string;
  emojis: string[];
}

interface EmojiMartData {
  emojis: Record<string, EmojiData>;
  categories: CategoryData[];
}

const CATEGORIES = [
  { id: 'people', label: '😊 Smileys' },
  { id: 'nature', label: '🌿 Nature' },
  { id: 'foods', label: '🍕 Food' },
  { id: 'activity', label: '⚽ Activity' },
  { id: 'places', label: '✈️ Travel' },
  { id: 'objects', label: '💡 Objects' },
  { id: 'symbols', label: '❤️ Symbols' },
  { id: 'flags', label: '🎌 Flags' },
];

const FREQUENTLY_USED = [
  '❤️',
  '😊',
  '😍',
  '🔥',
  '✨',
  '💕',
  '👀',
  '💭',
  '📖',
  '✅',
  '💡',
  '🎯',
];

export const EmojiPicker: React.FC<EmojiPickerProps> = ({
  visible,
  onSelectEmoji,
  onClose,
  themeColors,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('people');
  const [searchQuery, setSearchQuery] = useState('');
  const [emojiData, setEmojiData] = useState<EmojiMartData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('https://cdn.jsdelivr.net/npm/@emoji-mart/data')
      .then(response => response.json())
      .then((data: EmojiMartData) => {
        setEmojiData(data);
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Failed to load emoji data:', error);
        setIsLoading(false);
      });
  }, []);

  const displayedEmojis = useMemo(() => {
    if (!emojiData) {
      return [];
    }

    const emojiMap = emojiData.emojis;
    const categories = emojiData.categories;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      return Object.values(emojiMap)
        .filter(
          emoji =>
            emoji.name.toLowerCase().includes(query) ||
            emoji.keywords?.some(kw => kw.toLowerCase().includes(query)),
        )
        .slice(0, 50)
        .map(emoji => emoji.skins?.[0]?.native || emoji.native || '');
    }

    const category = categories.find(cat => cat.id === selectedCategory);
    if (!category) {
      return [];
    }

    return category.emojis
      .map(emojiId => {
        const emoji = emojiMap[emojiId];
        return emoji?.skins?.[0]?.native || emoji?.native || '';
      })
      .filter(Boolean);
  }, [emojiData, selectedCategory, searchQuery]);

  const handleSelectEmoji = (emoji: string) => {
    onSelectEmoji(emoji);
    setSearchQuery('');
    onClose();
  };

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
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
          <View style={styles.header}>
            <Text
              style={[
                typography.ui.h4,
                styles.headerText,
                { color: themeColors.textPrimary },
              ]}
            >
              Choose Emoji
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={themeColors.textSecondary} />
            </TouchableOpacity>
          </View>

          <View
            style={[
              styles.searchContainer,
              {
                backgroundColor: themeColors.background,
                borderColor: themeColors.border,
              },
            ]}
          >
            <Search size={18} color={themeColors.textSecondary} />
            <TextInput
              style={[
                styles.searchInput,
                typography.ui.body,
                { color: themeColors.textPrimary },
              ]}
              placeholder="Search emojis..."
              placeholderTextColor={themeColors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={handleClearSearch}>
                <X size={18} color={themeColors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>

          {!searchQuery && (
            <View style={styles.frequentSection}>
              <Text
                style={[
                  typography.ui.caption,
                  {
                    color: themeColors.textSecondary,
                    marginBottom: spacing.sm,
                  },
                ]}
              >
                FREQUENTLY USED
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.frequentList}
              >
                {FREQUENTLY_USED.map((emoji, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.emojiButton,
                      { backgroundColor: themeColors.background },
                    ]}
                    onPress={() => handleSelectEmoji(emoji)}
                  >
                    <Text style={styles.emojiText}>{emoji}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {!searchQuery && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.categoryTabs}
              contentContainerStyle={styles.categoryTabsContent}
            >
              {CATEGORIES.map(category => {
                const isActive = selectedCategory === category.id;
                return (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.categoryTab,
                      {
                        backgroundColor: isActive
                          ? themeColors.accentPrimary
                          : themeColors.background,
                        borderColor: isActive
                          ? themeColors.accentPrimary
                          : themeColors.border,
                      },
                    ]}
                    onPress={() => setSelectedCategory(category.id)}
                  >
                    <Text
                      style={[
                        typography.ui.small,
                        isActive
                          ? styles.activeCategoryText
                          : { color: themeColors.textSecondary },
                      ]}
                    >
                      {category.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}

          <FlatList
            data={displayedEmojis}
            keyExtractor={(item, index) => `${item}-${index}`}
            numColumns={8}
            contentContainerStyle={styles.emojiGrid}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.emojiButton}
                onPress={() => handleSelectEmoji(item)}
              >
                <Text style={styles.emojiText}>{item}</Text>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Text
                  style={[
                    typography.ui.body,
                    { color: themeColors.textSecondary },
                  ]}
                >
                  {isLoading
                    ? 'Loading emojis...'
                    : searchQuery
                    ? 'No emojis found'
                    : 'No emojis in category'}
                </Text>
              </View>
            }
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    maxHeight: '80%',
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    paddingBottom: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    paddingBottom: spacing.md,
  },
  headerText: {
    flex: 1,
  },
  activeCategoryText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  closeButton: {
    padding: spacing.xs,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    padding: 0,
    margin: 0,
  },
  frequentSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  frequentList: {
    gap: spacing.sm,
  },
  categoryTabs: {
    marginBottom: spacing.md,
  },
  categoryTabsContent: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  categoryTab: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
  emojiGrid: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  emojiButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: borderRadius.md,
  },
  emojiText: {
    fontSize: 28,
  },
  emptyState: {
    padding: spacing.xl,
    alignItems: 'center',
  },
});

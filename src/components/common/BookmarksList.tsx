/**
 * Bookmarks List Modal
 *
 * Shows all bookmarked pages for current book
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  FlatList,
  Dimensions,
} from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { X, BookmarkCheck } from 'lucide-react-native';
import { Bookmark } from '../../types';
import { typography, spacing, borderRadius } from '../../theme';

const { width, height } = Dimensions.get('window');

interface BookmarksListProps {
  visible: boolean;
  bookmarks: Bookmark[];
  currentPage: number;
  onClose: () => void;
  onSelectPage: (page: number) => void;
  themeColors: any;
}

export const BookmarksList: React.FC<BookmarksListProps> = ({
  visible,
  bookmarks,
  currentPage,
  onClose,
  onSelectPage,
  themeColors,
}) => {
  const handleSelectBookmark = (page: number) => {
    onSelectPage(page);
    onClose();
  };

  // Generate rare bookmark icon (10% chance)
  const getRareBookmarkIcon = (page: number): string | null => {
    const random = (page * 7) % 100; // Deterministic based on page number
    if (random < 10) {
      const rareIcons = ['✨', '💫', '🌙', '⭐', '💝', '🦋'];
      return rareIcons[page % rareIcons.length];
    }
    return null;
  };

  const renderBookmark = ({ item }: { item: Bookmark }) => {
    const isCurrentPage = item.page === currentPage;
    const rareIcon = getRareBookmarkIcon(item.page);

    return (
      <TouchableOpacity
        style={[
          styles.bookmarkItem,
          {
            backgroundColor: isCurrentPage
              ? themeColors.accentPrimary + '15'
              : themeColors.surface,
            borderColor: isCurrentPage
              ? themeColors.accentPrimary
              : themeColors.border,
          },
        ]}
        onPress={() => handleSelectBookmark(item.page)}
        activeOpacity={0.7}
      >
        <View style={styles.bookmarkIcon}>
          {rareIcon ? (
            <Text style={styles.rareIcon}>{rareIcon}</Text>
          ) : (
            <BookmarkCheck
              size={20}
              color={
                isCurrentPage
                  ? themeColors.accentPrimary
                  : themeColors.textSecondary
              }
            />
          )}
        </View>
        <View style={styles.bookmarkInfo}>
          <Text
            style={[
              typography.ui.bodyMedium,
              {
                color: isCurrentPage
                  ? themeColors.accentPrimary
                  : themeColors.textPrimary,
              },
            ]}
          >
            Page {item.page}
          </Text>
          {isCurrentPage && (
            <Text
              style={[
                typography.ui.caption,
                { color: themeColors.accentPrimary },
              ]}
            >
              Current page
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Animated.View
        entering={FadeIn.duration(200)}
        exiting={FadeOut.duration(200)}
        style={[styles.backdrop, { backgroundColor: 'rgba(0, 0, 0, 0.7)' }]}
      >
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={onClose}
        />

        <Animated.View
          entering={FadeIn.duration(300).delay(100)}
          style={[
            styles.container,
            {
              backgroundColor: themeColors.background,
              borderColor: themeColors.border,
            },
          ]}
        >
          {/* Header */}
          <View
            style={[styles.header, { borderBottomColor: themeColors.border }]}
          >
            <Text
              style={[typography.ui.h3, { color: themeColors.textPrimary }]}
            >
              Bookmarks
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={themeColors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Bookmarks List */}
          {bookmarks.length === 0 ? (
            <View style={styles.emptyState}>
              <BookmarkCheck
                size={48}
                color={themeColors.textSecondary}
                strokeWidth={1.5}
              />
              <Text
                style={[
                  typography.ui.body,
                  { color: themeColors.textSecondary, marginTop: spacing.md },
                ]}
              >
                No bookmarks yet
              </Text>
              <Text
                style={[
                  typography.ui.caption,
                  {
                    color: themeColors.textSecondary,
                    marginTop: spacing.xs,
                    textAlign: 'center',
                  },
                ]}
              >
                Tap the bookmark icon to save your favorite pages
              </Text>
            </View>
          ) : (
            <FlatList
              data={bookmarks.sort((a, b) => a.page - b.page)}
              renderItem={renderBookmark}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            />
          )}
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  container: {
    width: Math.min(width - spacing.xl * 2, 400),
    maxHeight: height * 0.7,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  closeButton: {
    padding: spacing.xs,
  },
  listContent: {
    padding: spacing.md,
  },
  bookmarkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
  },
  bookmarkIcon: {
    marginRight: spacing.md,
  },
  rareIcon: {
    fontSize: 20,
    textAlign: 'center',
  },
  bookmarkInfo: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xl * 2,
    paddingHorizontal: spacing.xl,
  },
});

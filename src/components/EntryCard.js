import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, MOODS } from '../constants/colors';

export default function EntryCard({ entry, onPress, onToggleFavorite }) {
  const moodObj = MOODS.find((m) => m.id === entry.mood);
  const wordCount = entry.text ? entry.text.trim().split(/\s+/).filter(Boolean).length : 0;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.75}>
      {entry.photoUri ? (
        <Image source={{ uri: entry.photoUri }} style={styles.thumb} />
      ) : (
        <View style={[styles.thumb, styles.noPhoto]}>
          <Ionicons name="book-outline" size={26} color={COLORS.muted} />
        </View>
      )}

      <View style={styles.info}>
        <View style={styles.topRow}>
          <Text style={styles.title} numberOfLines={1}>
            {entry.title}
          </Text>
          <TouchableOpacity
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            onPress={(e) => {
              e.stopPropagation();
              onToggleFavorite?.(entry.id);
            }}
          >
            <Ionicons
              name={entry.isFavorite ? 'star' : 'star-outline'}
              size={18}
              color={entry.isFavorite ? COLORS.favorite : COLORS.muted}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.metaRow}>
          <Text style={styles.date}>
            {new Date(entry.createdAt).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </Text>
          {wordCount > 0 ? (
            <Text style={styles.wordCount}>• {wordCount} words</Text>
          ) : null}
          {moodObj ? (
            <View style={styles.moodBadge}>
              <Text style={styles.moodEmoji}>{moodObj.emoji}</Text>
            </View>
          ) : null}
        </View>

        {entry.text ? (
          <Text style={styles.preview} numberOfLines={2}>
            {entry.text}
          </Text>
        ) : null}

        {entry.tags && entry.tags.length > 0 ? (
          <View style={styles.tagsRow}>
            {entry.tags.slice(0, 3).map((tag) => (
              <View key={tag} style={styles.tagBadge}>
                <Text style={styles.tagBadgeText}>#{tag}</Text>
              </View>
            ))}
            {entry.tags.length > 3 ? (
              <Text style={styles.moreTagsText}>+{entry.tags.length - 3}</Text>
            ) : null}
          </View>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  thumb: {
    width: 72,
    height: 72,
    borderRadius: 10,
    marginRight: 12,
    backgroundColor: '#F3F4F6',
  },
  noPhoto: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: { flex: 1, justifyContent: 'center' },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
    flex: 1,
    marginRight: 6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
    marginBottom: 4,
  },
  date: { fontSize: 11, color: COLORS.muted },
  wordCount: { fontSize: 11, color: COLORS.muted },
  moodBadge: {
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  moodEmoji: { fontSize: 12 },
  preview: { fontSize: 13, color: '#374151', lineHeight: 18 },
  tagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  tagBadge: {
    backgroundColor: COLORS.tagBg,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  tagBadgeText: { fontSize: 10, color: COLORS.tagText, fontWeight: '600' },
  moreTagsText: { fontSize: 10, color: COLORS.muted },
});

import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  Share,
  Platform,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useEntries } from '../context/EntriesContext';
import PhotoViewerModal from '../components/PhotoViewerModal';
import ConfirmModal from '../components/ConfirmModal';
import { COLORS, MOODS } from '../constants/colors';

export default function EntryDetailsScreen({ route, navigation }) {
  const { id } = route.params;
  const { getEntry, deleteEntry, toggleFavorite } = useEntries();
  const [viewerVisible, setViewerVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

  const entry = getEntry(id);

  if (!entry) {
    return (
      <View style={styles.center}>
        <Ionicons name="document-text-outline" size={48} color={COLORS.muted} />
        <Text style={styles.notFoundText}>Entry not found or already deleted.</Text>
        <TouchableOpacity style={styles.goBackButton} onPress={() => navigation.navigate('Entries')}>
          <Text style={styles.goBackText}>Back to Journal</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const moodObj = MOODS.find((m) => m.id === entry.mood);
  const wordCount = entry.text ? entry.text.trim().split(/\s+/).filter(Boolean).length : 0;
  const readingTime = Math.max(1, Math.ceil(wordCount / 180));

  const handleConfirmDelete = async () => {
    setDeleteModalVisible(false);
    navigation.navigate('Entries');
    await deleteEntry(id);
  };

  const handleShare = async () => {
    try {
      const shareContent = `${entry.title}\n\n${entry.text || ''}\n\n— Logged with Photo Journal`;
      if (Platform.OS === 'web') {
        if (navigator.share) {
          await navigator.share({ title: entry.title, text: shareContent });
        } else if (navigator.clipboard) {
          await navigator.clipboard.writeText(shareContent);
          alert('Entry copied to clipboard!');
        }
      } else {
        await Share.share({ message: shareContent, title: entry.title });
      }
    } catch (e) {
      console.log('Share error:', e);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Photo header with tap to view */}
      {entry.photoUri ? (
        <TouchableOpacity
          style={styles.photoContainer}
          onPress={() => setViewerVisible(true)}
          activeOpacity={0.9}
        >
          <Image source={{ uri: entry.photoUri }} style={styles.photo} />
          <View style={styles.expandBadge}>
            <Ionicons name="expand-outline" size={14} color="#fff" />
            <Text style={styles.expandText}>Full screen</Text>
          </View>
        </TouchableOpacity>
      ) : null}

      {/* Title & Action Buttons */}
      <View style={styles.headerRow}>
        <Text style={styles.title}>{entry.title}</Text>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => toggleFavorite(id)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons
            name={entry.isFavorite ? 'star' : 'star-outline'}
            size={24}
            color={entry.isFavorite ? COLORS.favorite : COLORS.muted}
          />
        </TouchableOpacity>
      </View>

      {/* Meta tags (Date, Word count, Mood) */}
      <View style={styles.metaRow}>
        <Text style={styles.date}>
          {new Date(entry.createdAt).toLocaleDateString(undefined, {
            weekday: 'short',
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          })}
        </Text>
        <Text style={styles.metaDot}>•</Text>
        <Text style={styles.metaText}>{wordCount} words ({readingTime} min read)</Text>
      </View>

      {/* Mood Badge */}
      {moodObj ? (
        <View style={styles.moodPill}>
          <Text style={styles.moodEmoji}>{moodObj.emoji}</Text>
          <Text style={styles.moodLabel}>Felt {moodObj.label.toLowerCase()}</Text>
        </View>
      ) : null}

      {/* Tags */}
      {entry.tags && entry.tags.length > 0 ? (
        <View style={styles.tagsContainer}>
          {entry.tags.map((tag) => (
            <View key={tag} style={styles.tagBadge}>
              <Text style={styles.tagBadgeText}>#{tag}</Text>
            </View>
          ))}
        </View>
      ) : null}

      <View style={styles.divider} />

      {/* Main Text Content */}
      <Text style={styles.text}>{entry.text || 'No thoughts recorded for this entry.'}</Text>

      {/* Action Buttons Row: Edit, Share, Delete */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => navigation.navigate('EditEntry', { id })}
          activeOpacity={0.8}
        >
          <Ionicons name="create-outline" size={18} color="#fff" />
          <Text style={styles.editButtonText}>Edit Entry</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.shareButton}
          onPress={handleShare}
          activeOpacity={0.8}
        >
          <Ionicons name="share-outline" size={18} color={COLORS.primary} />
          <Text style={styles.shareButtonText}>Share</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => setDeleteModalVisible(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="trash-outline" size={18} color={COLORS.danger} />
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>

      {/* Photo Viewer Modal */}
      <PhotoViewerModal
        visible={viewerVisible}
        uri={entry.photoUri}
        onClose={() => setViewerVisible(false)}
      />

      {/* In-App Confirmation Modal */}
      <ConfirmModal
        visible={deleteModalVisible}
        title="Delete this entry?"
        message={`"${entry.title}" will be permanently removed. This cannot be undone.`}
        confirmText="Delete"
        isDestructive={true}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteModalVisible(false)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 16, paddingBottom: 50 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  notFoundText: { fontSize: 16, color: COLORS.muted, marginTop: 12, textAlign: 'center' },
  goBackButton: {
    marginTop: 16,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 8,
  },
  goBackText: { color: '#fff', fontWeight: '700' },
  photoContainer: {
    width: '100%',
    height: 250,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    backgroundColor: '#E5E7EB',
  },
  photo: { width: '100%', height: '100%', borderRadius: 16 },
  expandBadge: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  expandText: { color: '#fff', fontSize: 11, fontWeight: '600' },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  title: { fontSize: 22, fontWeight: '800', color: COLORS.text, flex: 1, lineHeight: 28 },
  iconButton: { padding: 4 },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 6,
  },
  date: { fontSize: 12, color: COLORS.muted },
  metaDot: { fontSize: 12, color: COLORS.muted },
  metaText: { fontSize: 12, color: COLORS.muted },
  moodPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    marginTop: 10,
    gap: 6,
  },
  moodEmoji: { fontSize: 14 },
  moodLabel: { fontSize: 12, color: COLORS.primary, fontWeight: '600' },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 10,
  },
  tagBadge: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  tagBadgeText: { fontSize: 11, color: COLORS.muted, fontWeight: '600' },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 18 },
  text: { fontSize: 16, color: '#1F2937', lineHeight: 26, minHeight: 80 },
  actionsContainer: {
    marginTop: 36,
    gap: 10,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 12,
  },
  editButtonText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.primaryLight,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.primaryBorder,
  },
  shareButtonText: { color: COLORS.primary, fontWeight: '700', fontSize: 15 },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FEE2E2',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FECACA',
    marginTop: 4,
  },
  deleteButtonText: { color: COLORS.danger, fontWeight: '700', fontSize: 15 },
});

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useEntries } from '../context/EntriesContext';
import { takePhoto, pickFromGallery } from '../utils/photo';
import { COLORS, MOODS, PRESET_TAGS } from '../constants/colors';

export default function EditEntryScreen({ route, navigation }) {
  const { id } = route.params;
  const { getEntry, updateEntry } = useEntries();
  const entry = getEntry(id);

  const [title, setTitle] = useState(entry?.title || '');
  const [text, setText] = useState(entry?.text || '');
  const [photoUri, setPhotoUri] = useState(entry?.photoUri || null);
  const [mood, setMood] = useState(entry?.mood || 'happy');
  const [tags, setTags] = useState(entry?.tags || []);
  const [customTag, setCustomTag] = useState('');
  const [isFavorite, setIsFavorite] = useState(Boolean(entry?.isFavorite));
  const [error, setError] = useState('');

  if (!entry) {
    return (
      <View style={styles.center}>
        <Text style={{ color: COLORS.muted }}>Entry not found.</Text>
      </View>
    );
  }

  const handleAddPhoto = () => {
    if (Platform.OS === 'web') {
      pickFromGallery().then((uri) => {
        if (uri) setPhotoUri(uri);
      });
      return;
    }
    Alert.alert('Change Photo', 'Choose where the photo comes from', [
      {
        text: 'Camera',
        onPress: async () => {
          const uri = await takePhoto();
          if (uri) setPhotoUri(uri);
        },
      },
      {
        text: 'Gallery',
        onPress: async () => {
          const uri = await pickFromGallery();
          if (uri) setPhotoUri(uri);
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const toggleTag = (tagName) => {
    if (tags.includes(tagName)) {
      setTags(tags.filter((t) => t !== tagName));
    } else {
      setTags([...tags, tagName]);
    }
  };

  const handleAddCustomTag = () => {
    const trimmed = customTag.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setCustomTag('');
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      setError('Title is required.');
      return;
    }

    await updateEntry(id, {
      title: title.trim(),
      text: text.trim(),
      photoUri,
      mood,
      tags,
      isFavorite,
    });

    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={100}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {/* Photo Box */}
        <TouchableOpacity style={styles.photoBox} onPress={handleAddPhoto}>
          {photoUri ? (
            <Image source={{ uri: photoUri }} style={styles.photo} />
          ) : (
            <View style={styles.photoPlaceholder}>
              <Ionicons name="camera-outline" size={36} color={COLORS.muted} />
              <Text style={styles.photoText}>Add or change photo</Text>
            </View>
          )}
        </TouchableOpacity>
        {photoUri ? (
          <TouchableOpacity onPress={() => setPhotoUri(null)}>
            <Text style={styles.removePhoto}>Remove photo</Text>
          </TouchableOpacity>
        ) : null}

        {error ? <Text style={styles.error}>{error}</Text> : null}

        {/* Title */}
        <Text style={styles.label}>Title *</Text>
        <TextInput
          style={styles.input}
          placeholder="Title"
          value={title}
          onChangeText={(v) => {
            setTitle(v);
            if (error) setError('');
          }}
          maxLength={80}
        />

        {/* Mood Selector */}
        <Text style={styles.label}>How were you feeling?</Text>
        <View style={styles.moodRow}>
          {MOODS.map((m) => {
            const isSelected = mood === m.id;
            return (
              <TouchableOpacity
                key={m.id}
                onPress={() => setMood(m.id)}
                style={[styles.moodItem, isSelected && styles.moodItemSelected]}
              >
                <Text style={styles.moodEmoji}>{m.emoji}</Text>
                <Text
                  style={[
                    styles.moodLabel,
                    isSelected && { color: COLORS.primary, fontWeight: '700' },
                  ]}
                >
                  {m.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Favorite toggle */}
        <TouchableOpacity
          style={styles.favoriteRow}
          onPress={() => setIsFavorite(!isFavorite)}
        >
          <Ionicons
            name={isFavorite ? 'star' : 'star-outline'}
            size={22}
            color={isFavorite ? COLORS.favorite : COLORS.muted}
          />
          <Text style={[styles.favoriteText, isFavorite && { color: COLORS.favorite }]}>
            {isFavorite ? 'Marked as Favorite' : 'Mark as Favorite'}
          </Text>
        </TouchableOpacity>

        {/* Tags */}
        <Text style={styles.label}>Tags</Text>
        <View style={styles.tagsContainer}>
          {PRESET_TAGS.map((tag) => {
            const isSelected = tags.includes(tag);
            return (
              <TouchableOpacity
                key={tag}
                onPress={() => toggleTag(tag)}
                style={[styles.tagChip, isSelected && styles.tagChipSelected]}
              >
                <Text
                  style={[styles.tagText, isSelected && styles.tagTextSelected]}
                >
                  #{tag}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.customTagRow}>
          <TextInput
            style={styles.customTagInput}
            placeholder="Add custom tag..."
            value={customTag}
            onChangeText={setCustomTag}
            onSubmitEditing={handleAddCustomTag}
          />
          <TouchableOpacity style={styles.addTagButton} onPress={handleAddCustomTag}>
            <Text style={styles.addTagText}>+ Add</Text>
          </TouchableOpacity>
        </View>

        {/* Journal Text */}
        <Text style={styles.label}>Journal Entry</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Write your thoughts..."
          value={text}
          onChangeText={setText}
          multiline
          textAlignVertical="top"
        />

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveText}>Save Changes</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 16, paddingBottom: 40 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  photoBox: {
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
  },
  photo: { width: '100%', height: '100%' },
  photoPlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  photoText: { color: COLORS.muted, marginTop: 6, fontSize: 13 },
  removePhoto: { color: COLORS.danger, textAlign: 'center', marginTop: 8, fontSize: 13 },
  error: { color: COLORS.danger, marginTop: 12 },
  label: { fontSize: 13, fontWeight: '700', color: COLORS.text, marginTop: 16, marginBottom: 8 },
  input: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
  },
  textArea: { height: 140 },
  moodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: COLORS.card,
    padding: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  moodItem: {
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  moodItemSelected: {
    backgroundColor: COLORS.primaryLight,
  },
  moodEmoji: { fontSize: 22 },
  moodLabel: { fontSize: 10, color: COLORS.muted, marginTop: 2 },
  favoriteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
    padding: 12,
    backgroundColor: COLORS.card,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  favoriteText: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  tagChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tagChipSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  tagText: { fontSize: 12, color: COLORS.muted },
  tagTextSelected: { color: '#fff', fontWeight: '600' },
  customTagRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  customTagInput: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
  },
  addTagButton: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 14,
    justifyContent: 'center',
    borderRadius: 8,
  },
  addTagText: { color: COLORS.primary, fontWeight: '600', fontSize: 13 },
  saveButton: {
    backgroundColor: COLORS.primary,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 24,
  },
  saveText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});

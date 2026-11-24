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
import { COLORS, MOODS, PRESET_TAGS, DAILY_PROMPTS } from '../constants/colors';

export default function AddEntryScreen({ route, navigation }) {
  const { addEntry } = useEntries();
  const [title, setTitle] = useState(route?.params?.initialTitle || '');
  const [text, setText] = useState(route?.params?.initialText || '');
  const [photoUri, setPhotoUri] = useState(null);
  const [mood, setMood] = useState('happy');
  const [tags, setTags] = useState([]);
  const [customTag, setCustomTag] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [promptIndex, setPromptIndex] = useState(0);
  const [showPromptBox, setShowPromptBox] = useState(true);
  const [error, setError] = useState('');

  const handleAddPhoto = () => {
    if (Platform.OS === 'web') {
      pickFromGallery().then((uri) => {
        if (uri) setPhotoUri(uri);
      });
      return;
    }
    Alert.alert('Add Photo', 'Choose where the photo comes from', [
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

  const handleUsePrompt = (promptText) => {
    if (text) {
      setText(`${text}\n\n${promptText}\n`);
    } else {
      setText(`${promptText}\n`);
    }
    setShowPromptBox(false);
  };

  const nextPrompt = () => {
    setPromptIndex((prev) => (prev + 1) % DAILY_PROMPTS.length);
  };

  const handleSave = async () => {
    if (!title.trim()) {
      setError('Title is required.');
      return;
    }
    await addEntry({
      title: title.trim(),
      text: text.trim(),
      photoUri,
      mood,
      tags,
      isFavorite,
    });
    navigation.goBack();
  };

  const wordCount = text.trim() ? text.trim().split(/\s+/).filter(Boolean).length : 0;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={100}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {/* Daily Prompt Suggestion Card */}
        {showPromptBox ? (
          <View style={styles.promptCard}>
            <View style={styles.promptHeader}>
              <View style={styles.promptTitleRow}>
                <Ionicons name="sparkles" size={16} color={COLORS.primary} />
                <Text style={styles.promptTitle}>Daily Inspiration</Text>
              </View>
              <View style={styles.promptActions}>
                <TouchableOpacity onPress={nextPrompt} style={styles.promptActionBtn}>
                  <Ionicons name="shuffle-outline" size={16} color={COLORS.muted} />
                  <Text style={styles.promptActionText}>Next</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setShowPromptBox(false)}>
                  <Ionicons name="close" size={16} color={COLORS.muted} />
                </TouchableOpacity>
              </View>
            </View>
            <Text style={styles.promptText}>"{DAILY_PROMPTS[promptIndex]}"</Text>
            <TouchableOpacity
              style={styles.usePromptBtn}
              onPress={() => handleUsePrompt(DAILY_PROMPTS[promptIndex])}
            >
              <Text style={styles.usePromptText}>+ Use this prompt</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {/* Photo area */}
        <TouchableOpacity style={styles.photoBox} onPress={handleAddPhoto}>
          {photoUri ? (
            <Image source={{ uri: photoUri }} style={styles.photo} />
          ) : (
            <View style={styles.photoPlaceholder}>
              <Ionicons name="camera-outline" size={38} color={COLORS.muted} />
              <Text style={styles.photoText}>Add a photo to your entry</Text>
              <Text style={styles.photoSubText}>Tap to pick from gallery or take photo</Text>
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
          placeholder="e.g. Sunrise ridge & unexpected thoughts"
          value={title}
          onChangeText={(value) => {
            setTitle(value);
            if (error) setError('');
          }}
          maxLength={80}
        />

        {/* Mood Selector */}
        <Text style={styles.label}>How are you feeling today?</Text>
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
            {isFavorite ? 'Marked as Favorite ⭐' : 'Mark as Favorite'}
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
                <Text style={[styles.tagText, isSelected && styles.tagTextSelected]}>
                  #{tag}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.customTagRow}>
          <TextInput
            style={styles.customTagInput}
            placeholder="Add custom tag (e.g. Hiking)..."
            value={customTag}
            onChangeText={setCustomTag}
            onSubmitEditing={handleAddCustomTag}
          />
          <TouchableOpacity style={styles.addTagButton} onPress={handleAddCustomTag}>
            <Text style={styles.addTagText}>+ Add</Text>
          </TouchableOpacity>
        </View>

        {/* What happened today textarea */}
        <View style={styles.labelRow}>
          <Text style={styles.label}>What happened today?</Text>
          <Text style={styles.wordCount}>{wordCount} words</Text>
        </View>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Write your thoughts, reflections, or moments from today..."
          value={text}
          onChangeText={setText}
          multiline
          textAlignVertical="top"
        />

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveText}>Save Entry</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 16, paddingBottom: 40 },
  promptCard: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.primaryBorder,
  },
  promptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  promptTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  promptTitle: { fontSize: 13, fontWeight: '700', color: COLORS.primary },
  promptActions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  promptActionBtn: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  promptActionText: { fontSize: 11, color: COLORS.muted },
  promptText: { fontSize: 13, fontStyle: 'italic', color: '#374151', lineHeight: 19 },
  usePromptBtn: { alignSelf: 'flex-start', marginTop: 10 },
  usePromptText: { fontSize: 12, fontWeight: '700', color: COLORS.primary },
  photoBox: {
    height: 190,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
  },
  photo: { width: '100%', height: '100%' },
  photoPlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  photoText: { color: COLORS.text, fontWeight: '600', marginTop: 6, fontSize: 13 },
  photoSubText: { color: COLORS.muted, fontSize: 11, marginTop: 2 },
  removePhoto: { color: COLORS.danger, textAlign: 'center', marginTop: 8, fontSize: 13 },
  error: { color: COLORS.danger, marginTop: 10, fontSize: 13 },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 6,
  },
  label: { fontSize: 13, fontWeight: '700', color: COLORS.text, marginTop: 16, marginBottom: 8 },
  wordCount: { fontSize: 11, color: COLORS.muted },
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
    marginTop: 14,
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

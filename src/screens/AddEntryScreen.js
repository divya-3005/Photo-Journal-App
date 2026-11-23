import React, { useState } from 'react';
import {
  View, Text, TextInput, Image, TouchableOpacity, ScrollView,
  KeyboardAvoidingView, Platform, Alert, StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useEntries } from '../context/EntriesContext';
import { takePhoto, pickFromGallery } from '../utils/photo';
import { COLORS } from '../constants/colors';

export default function AddEntryScreen({ navigation }) {
  const { addEntry } = useEntries();
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [photoUri, setPhotoUri] = useState(null);
  const [error, setError] = useState('');

  const handleAddPhoto = () => {
    Alert.alert('Add photo', 'Choose where the photo comes from', [
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

  const handleSave = async () => {
    if (!title.trim()) {
      setError('Title is required.');
      return;
    }
    await addEntry({ title: title.trim(), text: text.trim(), photoUri });
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={100}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {/* Photo area */}
        <TouchableOpacity style={styles.photoBox} onPress={handleAddPhoto}>
          {photoUri ? (
            <Image source={{ uri: photoUri }} style={styles.photo} />
          ) : (
            <View style={styles.photoPlaceholder}>
              <Ionicons name="camera-outline" size={36} color={COLORS.muted} />
              <Text style={styles.photoText}>Add a photo</Text>
            </View>
          )}
        </TouchableOpacity>
        {photoUri ? (
          <TouchableOpacity onPress={() => setPhotoUri(null)}>
            <Text style={styles.removePhoto}>Remove photo</Text>
          </TouchableOpacity>
        ) : null}

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Text style={styles.label}>Title</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Trip to the hills"
          value={title}
          onChangeText={(value) => {
            setTitle(value);
            if (error) setError('');
          }}
          maxLength={60}
        />

        <Text style={styles.label}>What happened today?</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Write your thoughts..."
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
  content: { padding: 16 },
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
  photoText: { color: COLORS.muted, marginTop: 6 },
  removePhoto: { color: COLORS.danger, textAlign: 'center', marginTop: 8 },
  error: { color: COLORS.danger, marginTop: 12 },
  label: { fontSize: 14, fontWeight: '600', color: COLORS.text, marginTop: 16, marginBottom: 6 },
  input: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
  },
  textArea: { height: 140 },
  saveButton: {
    backgroundColor: COLORS.primary,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 24,
  },
  saveText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});

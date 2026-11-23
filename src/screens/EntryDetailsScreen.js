import React, { useState } from 'react';
import {
  View, Text, Image, ScrollView, TouchableOpacity, Alert, StyleSheet,
} from 'react-native';
import { useEntries } from '../context/EntriesContext';
import PhotoViewerModal from '../components/PhotoViewerModal';
import { COLORS } from '../constants/colors';

export default function EntryDetailsScreen({ route, navigation }) {
  const { id } = route.params; // read the param sent from the list
  const { getEntry, deleteEntry } = useEntries();
  const [viewerVisible, setViewerVisible] = useState(false);

  const entry = getEntry(id);

  if (!entry) {
    return (
      <View style={styles.center}>
        <Text>Entry not found.</Text>
      </View>
    );
  }

  const handleDelete = () => {
    Alert.alert('Delete entry', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteEntry(id);
          navigation.goBack();
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {entry.photoUri ? (
        <TouchableOpacity onPress={() => setViewerVisible(true)}>
          <Image source={{ uri: entry.photoUri }} style={styles.photo} />
          <Text style={styles.hint}>Tap photo to view full screen</Text>
        </TouchableOpacity>
      ) : null}

      <Text style={styles.title}>{entry.title}</Text>
      <Text style={styles.date}>{new Date(entry.createdAt).toLocaleString()}</Text>
      <Text style={styles.text}>{entry.text || 'No text written.'}</Text>

      <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
        <Text style={styles.deleteText}>Delete Entry</Text>
      </TouchableOpacity>

      <PhotoViewerModal
        visible={viewerVisible}
        uri={entry.photoUri}
        onClose={() => setViewerVisible(false)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 16 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  photo: { width: '100%', height: 250, borderRadius: 12 },
  hint: { fontSize: 12, color: COLORS.muted, textAlign: 'center', marginTop: 4 },
  title: { fontSize: 24, fontWeight: '700', color: COLORS.text, marginTop: 16 },
  date: { fontSize: 13, color: COLORS.muted, marginTop: 4 },
  text: { fontSize: 16, color: COLORS.text, marginTop: 16, lineHeight: 24 },
  deleteButton: {
    marginTop: 32,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.danger,
    alignItems: 'center',
  },
  deleteText: { color: COLORS.danger, fontWeight: '700', fontSize: 16 },
});

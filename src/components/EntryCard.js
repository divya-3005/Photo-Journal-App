import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';

export default function EntryCard({ entry, onPress }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      {entry.photoUri ? (
        <Image source={{ uri: entry.photoUri }} style={styles.thumb} />
      ) : (
        <View style={[styles.thumb, styles.noPhoto]}>
          <Ionicons name="book-outline" size={24} color={COLORS.muted} />
        </View>
      )}

      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>{entry.title}</Text>
        <Text style={styles.date}>
          {new Date(entry.createdAt).toLocaleDateString()}
        </Text>
        {entry.text ? (
          <Text style={styles.preview} numberOfLines={2}>{entry.text}</Text>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    // iOS shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    // Android shadow
    elevation: 2,
  },
  thumb: { width: 64, height: 64, borderRadius: 8, marginRight: 12 },
  noPhoto: {
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: { flex: 1, justifyContent: 'center' },
  title: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  date: { fontSize: 12, color: COLORS.muted, marginTop: 2 },
  preview: { fontSize: 14, color: COLORS.text, marginTop: 4 },
});

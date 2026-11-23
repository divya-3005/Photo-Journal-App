import React, { useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, RefreshControl, StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useEntries } from '../context/EntriesContext';
import EntryCard from '../components/EntryCard';
import { COLORS } from '../constants/colors';

export default function EntriesScreen({ navigation }) {
  const { entries, loadEntries } = useEntries();
  const [refreshing, setRefreshing] = useState(false);

  // Pull-to-refresh: reload entries from AsyncStorage
  const onRefresh = async () => {
    setRefreshing(true);
    await loadEntries();
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={entries}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <EntryCard
            entry={item}
            onPress={() =>
              // Passing params to the next screen
              navigation.navigate('EntryDetails', { id: item.id, title: item.title })
            }
          />
        )}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="images-outline" size={48} color={COLORS.muted} />
            <Text style={styles.emptyTitle}>No entries yet</Text>
            <Text style={styles.emptyText}>Tap the + button to write your first one.</Text>
          </View>
        }
      />

      {/* Floating add button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddEntry')}
      >
        <Ionicons name="add" size={30} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  list: { padding: 16, flexGrow: 1 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: COLORS.text, marginTop: 12 },
  emptyText: { fontSize: 14, color: COLORS.muted, marginTop: 4 },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});

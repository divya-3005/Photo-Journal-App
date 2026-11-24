import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useEntries } from '../context/EntriesContext';
import EntryCard from '../components/EntryCard';
import { COLORS, MOODS, PRESET_TAGS } from '../constants/colors';

export default function EntriesScreen({ navigation }) {
  const { entries, loadEntries, toggleFavorite } = useEntries();
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all'); // 'all' | 'favorites' | moodId | tagName

  const onRefresh = async () => {
    setRefreshing(true);
    await loadEntries();
    setRefreshing(false);
  };

  // Filter & Search logic
  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      // 1. Text Search matching
      const matchesSearch =
        !searchQuery.trim() ||
        entry.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.text?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.tags?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchesSearch) return false;

      // 2. Chip Filter matching
      if (selectedFilter === 'all') return true;
      if (selectedFilter === 'favorites') return Boolean(entry.isFavorite);
      if (selectedFilter.startsWith('mood:')) {
        const moodId = selectedFilter.replace('mood:', '');
        return entry.mood === moodId;
      }
      if (selectedFilter.startsWith('tag:')) {
        const tagName = selectedFilter.replace('tag:', '');
        return entry.tags?.includes(tagName);
      }

      return true;
    });
  }, [entries, searchQuery, selectedFilter]);

  return (
    <View style={styles.container}>
      {/* Search Header */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color={COLORS.muted} style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search entries, thoughts, or tags..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            clearButtonMode="while-editing"
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={COLORS.muted} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Filter Chips Horizontal Scroll */}
      <View style={styles.filtersWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersScroll}
        >
          {/* All */}
          <TouchableOpacity
            style={[
              styles.filterChip,
              selectedFilter === 'all' && styles.filterChipActive,
            ]}
            onPress={() => setSelectedFilter('all')}
          >
            <Text
              style={[
                styles.filterChipText,
                selectedFilter === 'all' && styles.filterChipTextActive,
              ]}
            >
              All ({entries.length})
            </Text>
          </TouchableOpacity>

          {/* Favorites */}
          <TouchableOpacity
            style={[
              styles.filterChip,
              selectedFilter === 'favorites' && styles.filterChipActive,
            ]}
            onPress={() => setSelectedFilter('favorites')}
          >
            <Ionicons
              name="star"
              size={13}
              color={selectedFilter === 'favorites' ? '#fff' : COLORS.favorite}
              style={{ marginRight: 4 }}
            />
            <Text
              style={[
                styles.filterChipText,
                selectedFilter === 'favorites' && styles.filterChipTextActive,
              ]}
            >
              Favorites
            </Text>
          </TouchableOpacity>

          {/* Mood chips */}
          {MOODS.map((m) => {
            const key = `mood:${m.id}`;
            const isSelected = selectedFilter === key;
            return (
              <TouchableOpacity
                key={key}
                style={[styles.filterChip, isSelected && styles.filterChipActive]}
                onPress={() => setSelectedFilter(isSelected ? 'all' : key)}
              >
                <Text style={{ marginRight: 3, fontSize: 13 }}>{m.emoji}</Text>
                <Text
                  style={[
                    styles.filterChipText,
                    isSelected && styles.filterChipTextActive,
                  ]}
                >
                  {m.label}
                </Text>
              </TouchableOpacity>
            );
          })}

          {/* Tag chips */}
          {PRESET_TAGS.map((tag) => {
            const key = `tag:${tag}`;
            const isSelected = selectedFilter === key;
            return (
              <TouchableOpacity
                key={key}
                style={[styles.filterChip, isSelected && styles.filterChipActive]}
                onPress={() => setSelectedFilter(isSelected ? 'all' : key)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    isSelected && styles.filterChipTextActive,
                  ]}
                >
                  #{tag}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Entries List */}
      <FlatList
        data={filteredEntries}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <EntryCard
            entry={item}
            onPress={() =>
              navigation.navigate('EntryDetails', { id: item.id, title: item.title })
            }
            onToggleFavorite={toggleFavorite}
          />
        )}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            {searchQuery || selectedFilter !== 'all' ? (
              <>
                <Ionicons name="search-outline" size={44} color={COLORS.muted} />
                <Text style={styles.emptyTitle}>No matching entries</Text>
                <Text style={styles.emptyText}>
                  Try clearing your search or filter tags.
                </Text>
                <TouchableOpacity
                  style={styles.clearFilterButton}
                  onPress={() => {
                    setSearchQuery('');
                    setSelectedFilter('all');
                  }}
                >
                  <Text style={styles.clearFilterText}>Reset Filters</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Ionicons name="images-outline" size={48} color={COLORS.muted} />
                <Text style={styles.emptyTitle}>No entries yet</Text>
                <Text style={styles.emptyText}>Tap the + button to write your first entry.</Text>
              </>
            )}
          </View>
        }
      />

      {/* Floating Add Entry Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddEntry')}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={32} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  searchContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchInput: { flex: 1, fontSize: 14, color: COLORS.text },
  filtersWrapper: {
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
  },
  filtersScroll: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
  },
  filterChipText: { fontSize: 12, color: COLORS.muted, fontWeight: '500' },
  filterChipTextActive: { color: '#fff', fontWeight: '700' },
  list: { padding: 16, flexGrow: 1, paddingBottom: 80 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 60 },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: COLORS.text, marginTop: 12 },
  emptyText: { fontSize: 13, color: COLORS.muted, marginTop: 4, textAlign: 'center' },
  clearFilterButton: {
    marginTop: 16,
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  clearFilterText: { color: COLORS.primary, fontSize: 13, fontWeight: '600' },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
  },
});

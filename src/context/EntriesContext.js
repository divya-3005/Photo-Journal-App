import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const EntriesContext = createContext(null);
const ENTRIES_KEY = '@journal_entries';

const INITIAL_SEED_ENTRIES = [
  {
    id: 'seed-1',
    title: 'Sunrise hike at Rocky Point',
    text: 'Woke up at 5:30 AM to catch the first rays of light over the mountain ridge. The air was crisp and clear, and the views took my breath away. Moments like this remind me how good it feels to start the morning outdoors.',
    photoUri: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80',
    mood: 'amazing',
    tags: ['Travel', 'Fitness', 'Gratitude'],
    isFavorite: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 14).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 14).toISOString(),
  },
  {
    id: 'seed-2',
    title: 'Quiet coffee & reading chapter 4',
    text: 'Spent a calm afternoon tucked into the corner armchair at the neighborhood cafe with a warm flat white. Finally finished chapter 4 of the book I started last week. Deeply restorative.',
    photoUri: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&auto=format&fit=crop&q=80',
    mood: 'calm',
    tags: ['Personal', 'Gratitude'],
    isFavorite: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 42).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 42).toISOString(),
  },
];

export function EntriesProvider({ children }) {
  const [entries, setEntries] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    loadEntries();
  }, []);

  // Read entries from storage, seeding with initial entries if empty on first install
  const loadEntries = async () => {
    try {
      const json = await AsyncStorage.getItem(ENTRIES_KEY);
      if (json) {
        setEntries(JSON.parse(json));
      } else {
        // First run seed
        setEntries(INITIAL_SEED_ENTRIES);
        await AsyncStorage.setItem(ENTRIES_KEY, JSON.stringify(INITIAL_SEED_ENTRIES));
      }
    } catch (e) {
      console.log('Could not load entries:', e);
    } finally {
      setIsLoaded(true);
    }
  };

  const saveEntries = async (newEntries) => {
    setEntries(newEntries);
    await AsyncStorage.setItem(ENTRIES_KEY, JSON.stringify(newEntries));
  };

  const addEntry = async ({
    title,
    text = '',
    photoUri = null,
    mood = 'happy',
    tags = [],
    isFavorite = false,
  }) => {
    const newEntry = {
      id: Date.now().toString(),
      title: title.trim(),
      text: text.trim(),
      photoUri: photoUri || null,
      mood: mood || 'happy',
      tags: Array.isArray(tags) ? tags : [],
      isFavorite: Boolean(isFavorite),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await saveEntries([newEntry, ...entries]);
    return newEntry;
  };

  const updateEntry = async (id, updatedFields) => {
    const updated = entries.map((entry) => {
      if (String(entry.id) === String(id)) {
        return {
          ...entry,
          ...updatedFields,
          updatedAt: new Date().toISOString(),
        };
      }
      return entry;
    });
    await saveEntries(updated);
  };

  const toggleFavorite = async (id) => {
    const updated = entries.map((entry) => {
      if (String(entry.id) === String(id)) {
        return {
          ...entry,
          isFavorite: !entry.isFavorite,
        };
      }
      return entry;
    });
    await saveEntries(updated);
  };

  const deleteEntry = async (id) => {
    const updated = entries.filter((entry) => String(entry.id) !== String(id));
    await saveEntries(updated);
  };

  const getEntry = (id) => entries.find((entry) => String(entry.id) === String(id));

  return (
    <EntriesContext.Provider
      value={{
        entries,
        isLoaded,
        loadEntries,
        addEntry,
        updateEntry,
        toggleFavorite,
        deleteEntry,
        getEntry,
      }}
    >
      {children}
    </EntriesContext.Provider>
  );
}

export function useEntries() {
  const context = useContext(EntriesContext);
  if (!context) throw new Error('useEntries must be used inside EntriesProvider');
  return context;
}

import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const EntriesContext = createContext(null);
const ENTRIES_KEY = '@journal_entries';

export function EntriesProvider({ children }) {
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    loadEntries();
  }, []);

  // Read entries from phone storage
  const loadEntries = async () => {
    try {
      const json = await AsyncStorage.getItem(ENTRIES_KEY);
      setEntries(json ? JSON.parse(json) : []);
    } catch (e) {
      console.log('Could not load entries:', e);
    }
  };

  // Update state AND save to phone storage
  const saveEntries = async (newEntries) => {
    setEntries(newEntries);
    await AsyncStorage.setItem(ENTRIES_KEY, JSON.stringify(newEntries));
  };

  const addEntry = async ({ title, text, photoUri }) => {
    const newEntry = {
      id: Date.now().toString(),
      title,
      text,
      photoUri,
      createdAt: new Date().toISOString(),
    };
    await saveEntries([newEntry, ...entries]); // newest first
  };

  const deleteEntry = async (id) => {
    await saveEntries(entries.filter((entry) => entry.id !== id));
  };

  const getEntry = (id) => entries.find((entry) => entry.id === id);

  return (
    <EntriesContext.Provider
      value={{ entries, loadEntries, addEntry, deleteEntry, getEntry }}
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

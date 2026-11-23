import React from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useEntries } from '../context/EntriesContext';
import { COLORS } from '../constants/colors';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const { entries } = useEntries();

  const photoCount = entries.filter((entry) => entry.photoUri).length;

  const handleLogout = () => {
    Alert.alert('Log out', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{(user?.name ?? '?').charAt(0).toUpperCase()}</Text>
      </View>
      <Text style={styles.name}>{user?.name}</Text>

      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{entries.length}</Text>
          <Text style={styles.statLabel}>Entries</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{photoCount}</Text>
          <Text style={styles.statLabel}>Photos</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 24,
    backgroundColor: COLORS.background,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  avatarText: { color: '#fff', fontSize: 36, fontWeight: '700' },
  name: { fontSize: 22, fontWeight: '700', color: COLORS.text, marginTop: 12 },
  statsRow: { flexDirection: 'row', gap: 16, marginTop: 24 },
  statBox: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  statNumber: { fontSize: 24, fontWeight: '700', color: COLORS.primary },
  statLabel: { fontSize: 13, color: COLORS.muted, marginTop: 4 },
  logoutButton: {
    marginTop: 'auto',
    width: '100%',
    padding: 14,
    borderRadius: 10,
    backgroundColor: COLORS.danger,
    alignItems: 'center',
  },
  logoutText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});

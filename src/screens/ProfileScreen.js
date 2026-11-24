import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Share,
  Platform,
  Alert,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useEntries } from '../context/EntriesContext';
import ConfirmModal from '../components/ConfirmModal';
import { COLORS, MOODS } from '../constants/colors';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const { entries } = useEntries();
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);

  const photoCount = entries.filter((entry) => entry.photoUri).length;
  const favoriteCount = entries.filter((entry) => entry.isFavorite).length;

  const totalWords = entries.reduce((acc, entry) => {
    if (!entry.text) return acc;
    return acc + entry.text.trim().split(/\s+/).filter(Boolean).length;
  }, 0);

  const calculateStreak = () => {
    if (entries.length === 0) return 0;
    const dates = Array.from(
      new Set(
        entries.map((e) => new Date(e.createdAt).toISOString().split('T')[0])
      )
    ).sort().reverse();

    const todayStr = new Date().toISOString().split('T')[0];
    const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    if (dates[0] !== todayStr && dates[0] !== yesterdayStr) {
      return 0;
    }

    let streak = 1;
    for (let i = 0; i < dates.length - 1; i++) {
      const curr = new Date(dates[i]);
      const prev = new Date(dates[i + 1]);
      const diffTime = Math.abs(curr - prev);
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  };

  const streak = calculateStreak();

  const moodCounts = entries.reduce((acc, entry) => {
    const m = entry.mood || 'happy';
    acc[m] = (acc[m] || 0) + 1;
    return acc;
  }, {});

  const handleExportJournal = async () => {
    const exportData = {
      user: user?.name,
      exportedAt: new Date().toISOString(),
      totalEntries: entries.length,
      entries: entries.map((e) => ({
        id: e.id,
        title: e.title,
        text: e.text,
        mood: e.mood,
        tags: e.tags,
        isFavorite: e.isFavorite,
        createdAt: e.createdAt,
      })),
    };

    const jsonString = JSON.stringify(exportData, null, 2);

    if (Platform.OS === 'web') {
      try {
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `journal-backup-${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
      } catch (e) {
        alert('Journal exported! Copying to clipboard...');
        navigator.clipboard?.writeText(jsonString);
      }
    } else {
      try {
        await Share.share({
          title: 'My Photo Journal Backup',
          message: jsonString,
        });
      } catch (e) {
        Alert.alert('Export Failed', e.message);
      }
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Avatar & User Header */}
      <View style={styles.profileHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{(user?.name ?? '?').charAt(0).toUpperCase()}</Text>
        </View>
        <Text style={styles.name}>{user?.name || 'Journaler'}</Text>
        <Text style={styles.bio}>Daily Mindful Journaling</Text>
      </View>

      {/* Streak Banner */}
      <View style={styles.streakBanner}>
        <View style={styles.streakIconBox}>
          <Text style={styles.streakEmoji}>🔥</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.streakTitle}>
            {streak > 0 ? `${streak} Day Writing Streak!` : 'Start a New Streak Today'}
          </Text>
          <Text style={styles.streakSubtitle}>
            {streak > 0
              ? 'Consistency builds mindfulness. Keep it up!'
              : 'Write an entry today to ignite your streak.'}
          </Text>
        </View>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{entries.length}</Text>
          <Text style={styles.statLabel}>Entries</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{photoCount}</Text>
          <Text style={styles.statLabel}>Photos</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{favoriteCount}</Text>
          <Text style={styles.statLabel}>Favorites</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{totalWords}</Text>
          <Text style={styles.statLabel}>Words</Text>
        </View>
      </View>

      {/* Mood Distribution Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Mood Insights</Text>
        <Text style={styles.cardSubtitle}>How you've been feeling across your entries</Text>
        <View style={styles.moodBreakdown}>
          {MOODS.map((m) => {
            const count = moodCounts[m.id] || 0;
            const pct = entries.length > 0 ? Math.round((count / entries.length) * 100) : 0;
            return (
              <View key={m.id} style={styles.moodRowItem}>
                <Text style={styles.moodEmoji}>{m.emoji}</Text>
                <Text style={styles.moodName}>{m.label}</Text>
                <View style={styles.progressBarBg}>
                  <View style={[styles.progressBarFill, { width: `${pct}%` }]} />
                </View>
                <Text style={styles.moodPct}>{pct}%</Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* Data & Backup */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Data & Backup</Text>
        <TouchableOpacity style={styles.menuRow} onPress={handleExportJournal}>
          <View style={styles.menuRowLeft}>
            <Ionicons name="download-outline" size={20} color={COLORS.primary} />
            <Text style={styles.menuRowText}>Export All Entries (.json)</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={COLORS.muted} />
        </TouchableOpacity>
      </View>

      {/* Log Out Button */}
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={() => setLogoutModalVisible(true)}
        activeOpacity={0.8}
      >
        <Ionicons name="log-out-outline" size={18} color="#fff" />
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>

      {/* Logout Confirmation Modal */}
      <ConfirmModal
        visible={logoutModalVisible}
        title="Log Out?"
        message="Are you sure you want to log out of your journal?"
        confirmText="Log Out"
        isDestructive={true}
        onConfirm={() => {
          setLogoutModalVisible(false);
          logout();
        }}
        onCancel={() => setLogoutModalVisible(false)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 16, paddingBottom: 50 },
  profileHeader: { alignItems: 'center', marginTop: 12, marginBottom: 20 },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarText: { color: '#fff', fontSize: 32, fontWeight: '800' },
  name: { fontSize: 20, fontWeight: '800', color: COLORS.text, marginTop: 12 },
  bio: { fontSize: 13, color: COLORS.muted, marginTop: 2 },
  streakBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
  },
  streakIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FDE68A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  streakEmoji: { fontSize: 24 },
  streakTitle: { fontSize: 14, fontWeight: '700', color: '#92400E' },
  streakSubtitle: { fontSize: 12, color: '#B45309', marginTop: 1 },
  statsGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statNumber: { fontSize: 20, fontWeight: '800', color: COLORS.primary },
  statLabel: { fontSize: 11, color: COLORS.muted, marginTop: 2, fontWeight: '500' },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
  },
  cardTitle: { fontSize: 14, fontWeight: '700', color: COLORS.text },
  cardSubtitle: { fontSize: 12, color: COLORS.muted, marginTop: 2, marginBottom: 14 },
  moodBreakdown: { gap: 8 },
  moodRowItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  moodEmoji: { fontSize: 16 },
  moodName: { width: 60, fontSize: 12, color: COLORS.text, fontWeight: '500' },
  progressBarBg: {
    flex: 1,
    height: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 4,
  },
  moodPct: { width: 36, textAlign: 'right', fontSize: 11, color: COLORS.muted, fontWeight: '600' },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  menuRowLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  menuRowText: { fontSize: 14, color: COLORS.text, fontWeight: '500' },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 14,
    borderRadius: 12,
    backgroundColor: COLORS.danger,
    marginTop: 8,
  },
  logoutText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});

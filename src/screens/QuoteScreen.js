import React from 'react';
import {
  View, Text, TouchableOpacity, ActivityIndicator, Alert, StyleSheet,
} from 'react-native';
import { useQuery, useMutation } from '@tanstack/react-query';
import { COLORS } from '../constants/colors';

// GET request: fetch a random quote
async function fetchQuote() {
  const response = await fetch('https://dummyjson.com/quotes/random');
  if (!response.ok) throw new Error(`Server error: ${response.status}`);
  return response.json(); // { id, quote, author }
}

// POST request: "share" the quote (the test server pretends to save it)
async function shareQuote(quote) {
  const response = await fetch('https://dummyjson.com/posts/add', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: quote.quote, userId: 1 }),
  });
  if (!response.ok) throw new Error(`Server error: ${response.status}`);
  return response.json();
}

export default function QuoteScreen() {
  // useQuery = for GETTING data (handles loading, error, caching)
  const quoteQuery = useQuery({ queryKey: ['randomQuote'], queryFn: fetchQuote });

  // useMutation = for actions that SEND/CHANGE data
  const shareMutation = useMutation({
    mutationFn: shareQuote,
    onSuccess: (data) => Alert.alert('Shared!', `Server saved it with id ${data.id}.`),
    onError: (err) => Alert.alert('Share failed', err.message),
  });

  if (quoteQuery.isPending) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.muted}>Loading quote...</Text>
      </View>
    );
  }

  if (quoteQuery.isError) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{quoteQuery.error.message}</Text>
        <TouchableOpacity style={styles.button} onPress={() => quoteQuery.refetch()}>
          <Text style={styles.buttonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const quote = quoteQuery.data;

  return (
    <View style={styles.center}>
      <View style={styles.card}>
        <Text style={styles.quote}>"{quote.quote}"</Text>
        <Text style={styles.author}>— {quote.author}</Text>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={() => quoteQuery.refetch()}
        disabled={quoteQuery.isFetching}
      >
        <Text style={styles.buttonText}>
          {quoteQuery.isFetching ? 'Loading...' : 'New Quote'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.secondaryButton]}
        onPress={() => shareMutation.mutate(quote)}
        disabled={shareMutation.isPending}
      >
        <Text style={[styles.buttonText, styles.secondaryText]}>
          {shareMutation.isPending ? 'Sharing...' : 'Share Quote'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: COLORS.background,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    width: '100%',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  quote: { fontSize: 20, fontStyle: 'italic', color: COLORS.text, lineHeight: 30 },
  author: { fontSize: 16, color: COLORS.muted, marginTop: 16, textAlign: 'right' },
  muted: { color: COLORS.muted, marginTop: 8 },
  error: { color: COLORS.danger, marginBottom: 16, textAlign: 'center' },
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    width: '100%',
    marginBottom: 12,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  secondaryText: { color: COLORS.primary },
});

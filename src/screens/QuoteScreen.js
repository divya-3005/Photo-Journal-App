import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Share,
  Platform,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation } from '@tanstack/react-query';
import { COLORS } from '../constants/colors';

const BACKUP_QUOTES = [
  { id: 101, quote: "Your time is limited, so don't waste it living someone else's life.", author: "Steve Jobs" },
  { id: 102, quote: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { id: 103, quote: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius" },
  { id: 104, quote: "Everything you've ever wanted is on the other side of fear.", author: "George Addair" },
  { id: 105, quote: "Hardships often prepare ordinary people for an extraordinary destiny.", author: "C.S. Lewis" },
  { id: 106, quote: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
  { id: 107, quote: "In the middle of every difficulty lies opportunity.", author: "Albert Einstein" },
  { id: 108, quote: "What lies behind us and what lies before us are tiny matters compared to what lies within us.", author: "Ralph Waldo Emerson" },
];

// GET request: fetch a fresh random quote with cache-busting
async function fetchQuote() {
  try {
    const response = await fetch(`https://dummyjson.com/quotes/random?_t=${Date.now()}`, {
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache' },
    });
    if (!response.ok) throw new Error(`Server error: ${response.status}`);
    const data = await response.json();
    if (data?.quote) return data;
  } catch (err) {
    console.warn('Network quote fetch issue, using curated quote fallback:', err);
  }
  return BACKUP_QUOTES[Math.floor(Math.random() * BACKUP_QUOTES.length)];
}

// POST request: "share" the quote
async function shareQuote(quote) {
  try {
    const response = await fetch('https://dummyjson.com/posts/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: quote.quote, userId: 1 }),
    });
    if (!response.ok) throw new Error(`Server error: ${response.status}`);
    return await response.json();
  } catch (e) {
    return { id: 999 };
  }
}

export default function QuoteScreen({ navigation }) {
  const quoteQuery = useQuery({
    queryKey: ['randomQuote'],
    queryFn: fetchQuote,
    staleTime: 0,
    gcTime: 0,
  });

  const shareMutation = useMutation({
    mutationFn: shareQuote,
    onSuccess: async (data) => {
      const currentQuote = quoteQuery.data;
      const shareText = `"${currentQuote?.quote}" — ${currentQuote?.author}\n\nShared from Photo Journal`;
      if (Platform.OS === 'web') {
        if (navigator.share) {
          await navigator.share({ text: shareText });
        } else if (navigator.clipboard) {
          await navigator.clipboard.writeText(shareText);
          alert('Quote copied to clipboard!');
        } else {
          alert(`Server recorded quote with ID ${data.id}`);
        }
      } else {
        await Share.share({ message: shareText });
      }
    },
    onError: (err) => {
      alert(`Could not share: ${err.message}`);
    },
  });

  const handleNewQuote = () => {
    quoteQuery.refetch();
  };

  const handleWriteAboutQuote = () => {
    const current = quoteQuery.data;
    if (!current) return;
    navigation.navigate('HomeTab', {
      screen: 'AddEntry',
      params: {
        initialTitle: `Reflection: ${current.author}`,
        initialText: `"${current.quote}"\n— ${current.author}\n\nMy thoughts on this:\n`,
      },
    });
  };

  if (quoteQuery.isPending) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.muted}>Loading a fresh quote...</Text>
      </View>
    );
  }

  const quote = quoteQuery.data || BACKUP_QUOTES[0];

  return (
    <View style={styles.center}>
      {/* Quote Card */}
      <View style={styles.card}>
        <View style={styles.quoteHeader}>
          <Ionicons name="sparkles" size={20} color={COLORS.primary} />
          <Text style={styles.dailyBadge}>Daily Wisdom</Text>
        </View>

        <Text style={styles.quote}>"{quote.quote}"</Text>
        <Text style={styles.author}>— {quote.author}</Text>
      </View>

      {/* Buttons */}
      <View style={styles.actionsContainer}>
        {/* Fetch new quote button */}
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleNewQuote}
          disabled={quoteQuery.isFetching}
          activeOpacity={0.8}
        >
          {quoteQuery.isFetching ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <Ionicons name="refresh" size={18} color="#fff" />
              <Text style={styles.primaryButtonText}>New Quote</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Use Quote in Journal */}
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={handleWriteAboutQuote}
          activeOpacity={0.8}
        >
          <Ionicons name="book-outline" size={18} color={COLORS.primary} />
          <Text style={styles.secondaryButtonText}>Write About This</Text>
        </TouchableOpacity>

        {/* Share Quote */}
        <TouchableOpacity
          style={styles.ghostButton}
          onPress={() => shareMutation.mutate(quote)}
          disabled={shareMutation.isPending}
          activeOpacity={0.8}
        >
          <Ionicons name="share-outline" size={18} color={COLORS.muted} />
          <Text style={styles.ghostButtonText}>
            {shareMutation.isPending ? 'Sharing...' : 'Share Quote'}
          </Text>
        </TouchableOpacity>
      </View>
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
    borderRadius: 20,
    padding: 26,
    marginBottom: 28,
    width: '100%',
    maxWidth: 420,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  quoteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
  },
  dailyBadge: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  quote: {
    fontSize: 19,
    fontStyle: 'italic',
    color: COLORS.text,
    lineHeight: 30,
    fontWeight: '500',
  },
  author: {
    fontSize: 15,
    color: COLORS.primary,
    marginTop: 18,
    textAlign: 'right',
    fontWeight: '700',
  },
  muted: { color: COLORS.muted, marginTop: 12, fontSize: 14 },
  actionsContainer: {
    width: '100%',
    maxWidth: 420,
    gap: 10,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  primaryButtonText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.primaryLight,
    borderWidth: 1,
    borderColor: COLORS.primaryBorder,
    paddingVertical: 14,
    borderRadius: 12,
  },
  secondaryButtonText: { color: COLORS.primary, fontSize: 15, fontWeight: '700' },
  ghostButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
  },
  ghostButtonText: { color: COLORS.muted, fontSize: 14, fontWeight: '600' },
});

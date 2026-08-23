import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useTheme } from '@/src/hooks/useTheme';
import { getRecentAttempts } from '@/src/db';
import { ReadingAttempt } from '@/src/types/models';
import { EmptyState } from '@/src/components/EmptyState';
import { formatTime } from '@/src/utils/calculations';
import { spacing, fontSize, borderRadius } from '@/src/theme';

export default function HistoryTab() {
  const theme = useTheme();
  const [attempts, setAttempts] = useState<ReadingAttempt[]>([]);

  useFocusEffect(
    useCallback(() => {
      getRecentAttempts(50).then(setAttempts);
    }, [])
  );

  function formatDate(iso: string): string {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  }

  function renderAttempt({ item }: { item: ReadingAttempt }) {
    return (
      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
        <View style={styles.cardHeader}>
          <Text style={[styles.passageTitle, { color: theme.text }]} numberOfLines={1}>
            {item.passageTitleSnapshot || 'Untitled'}
          </Text>
          <Text style={[styles.date, { color: theme.textTertiary }]}>
            {formatDate(item.completedAt)}
          </Text>
        </View>

        <View style={styles.cardStats}>
          <View style={styles.stat}>
            <Text style={[styles.statValue, { color: theme.primary }]}>{Math.round(item.wpm)}</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>WPM</Text>
          </View>
          <View style={styles.stat}>
            <Text style={[styles.statValue, { color: theme.text }]}>{item.accuracy.toFixed(1)}%</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Accuracy</Text>
          </View>
          <View style={styles.stat}>
            <Text style={[styles.statValue, { color: theme.text }]}>
              {item.wordsCorrect}/{item.totalWords}
            </Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Correct</Text>
          </View>
          <View style={styles.stat}>
            <Text style={[styles.statValue, { color: theme.text }]}>{formatTime(item.elapsedMilliseconds)}</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Time</Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <FlatList
        data={attempts}
        keyExtractor={(item) => item.id}
        renderItem={renderAttempt}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <EmptyState
            icon="📊"
            title="No History Yet"
            message="Complete and save a fluency reading to see your history here."
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { padding: spacing.md },
  card: {
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  passageTitle: { fontSize: fontSize.md, fontWeight: '600', flex: 1, marginRight: spacing.sm },
  date: { fontSize: fontSize.xs },
  cardStats: { flexDirection: 'row', justifyContent: 'space-between' },
  stat: { alignItems: 'center' },
  statValue: { fontSize: fontSize.lg, fontWeight: '700' },
  statLabel: { fontSize: fontSize.xs, marginTop: 2 },
});

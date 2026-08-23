import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useTheme } from '@/src/hooks/useTheme';
import { getRecentAttempts } from '@/src/db';
import { ReadingAttempt } from '@/src/types/models';
import { EmptyState } from '@/src/components/EmptyState';
import { formatTime } from '@/src/utils/calculations';
import { spacing, fontSize, borderRadius, shadow } from '@/src/theme';

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
      <View style={[styles.card, shadow.sm, { backgroundColor: theme.card }]}>
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
            <Text style={[styles.statLabel, { color: theme.textTertiary }]}>WPM</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: theme.separator }]} />
          <View style={styles.stat}>
            <Text style={[styles.statValue, { color: theme.text }]}>{item.accuracy.toFixed(1)}%</Text>
            <Text style={[styles.statLabel, { color: theme.textTertiary }]}>Accuracy</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: theme.separator }]} />
          <View style={styles.stat}>
            <Text style={[styles.statValue, { color: theme.text }]}>
              {item.wordsCorrect}/{item.totalWords}
            </Text>
            <Text style={[styles.statLabel, { color: theme.textTertiary }]}>Correct</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: theme.separator }]} />
          <View style={styles.stat}>
            <Text style={[styles.statValue, { color: theme.text }]}>{formatTime(item.elapsedMilliseconds)}</Text>
            <Text style={[styles.statLabel, { color: theme.textTertiary }]}>Time</Text>
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
            icon="📈"
            title="No History Yet"
            message="Complete and save a fluency reading to see results here."
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { padding: spacing.lg },
  card: {
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  passageTitle: { fontSize: fontSize.md, fontWeight: '600', flex: 1, marginRight: spacing.sm },
  date: { fontSize: fontSize.xs },
  cardStats: { flexDirection: 'row', alignItems: 'center' },
  stat: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: fontSize.md, fontWeight: '700', fontVariant: ['tabular-nums'] },
  statLabel: { fontSize: 10, marginTop: 2, textTransform: 'uppercase', letterSpacing: 0.3 },
  statDivider: { width: 1, height: 28, opacity: 0.5 },
});

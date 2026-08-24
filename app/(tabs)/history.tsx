import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useTheme } from '@/src/hooks/useTheme';
import { ScreenHeader } from '@/src/components/ScreenHeader';
import { getRecentAttempts } from '@/src/db';
import { ReadingAttempt } from '@/src/types/models';
import { EmptyState } from '@/src/components/EmptyState';
import { formatTime } from '@/src/utils/calculations';
import { spacing, fontSize, borderRadius, typography, shadow } from '@/src/theme';

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
      <View style={[styles.card, shadow.sm, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
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
            <Text style={[styles.statValueLead, { color: theme.primary }]} numberOfLines={1} adjustsFontSizeToFit>{Math.round(item.wpm)}</Text>
            <Text style={[styles.statLabel, { color: theme.textTertiary }]}>WPM</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: theme.separator }]} />
          <View style={styles.stat}>
            <Text style={[styles.statValue, { color: theme.text }]} numberOfLines={1} adjustsFontSizeToFit>{item.accuracy.toFixed(1)}%</Text>
            <Text style={[styles.statLabel, { color: theme.textTertiary }]}>Accuracy</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: theme.separator }]} />
          <View style={styles.stat}>
            <Text style={[styles.statValue, { color: theme.text }]} numberOfLines={1} adjustsFontSizeToFit>
              {item.wordsCorrect}/{item.totalWords}
            </Text>
            <Text style={[styles.statLabel, { color: theme.textTertiary }]}>Correct</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: theme.separator }]} />
          <View style={styles.stat}>
            <Text style={[styles.statValue, { color: theme.text }]} numberOfLines={1} adjustsFontSizeToFit>{formatTime(item.elapsedMilliseconds)}</Text>
            <Text style={[styles.statLabel, { color: theme.textTertiary }]}>Time</Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScreenHeader
        title="History"
        subtitle={attempts.length > 0 ? `${attempts.length} recent ${attempts.length === 1 ? 'reading' : 'readings'}` : undefined}
      />
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
  list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.lg },
  card: {
    borderRadius: borderRadius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  passageTitle: { ...typography.cardTitle, flex: 1, marginRight: spacing.sm },
  date: { fontSize: fontSize.xs },
  cardStats: { flexDirection: 'row', alignItems: 'flex-end' },
  stat: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: fontSize.md, fontWeight: '600', ...typography.numeric },
  statValueLead: { fontSize: fontSize.xl, fontWeight: '700', ...typography.numeric },
  statLabel: { fontSize: 10, marginTop: 3, textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: '500' },
  statDivider: { width: StyleSheet.hairlineWidth, height: 30 },
});

import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, SectionList } from 'react-native';
import { useLocalSearchParams, useFocusEffect } from 'expo-router';
import { useTheme } from '@/src/hooks/useTheme';
import { getStudentById, getStudentPassageStats, getAttemptsByStudent } from '@/src/db';
import { Student, ReadingAttempt } from '@/src/types/models';
import { EmptyState } from '@/src/components/EmptyState';
import { StatBox } from '@/src/components/StatBox';
import { formatTime } from '@/src/utils/calculations';
import { spacing, fontSize, borderRadius } from '@/src/theme';
import type { StudentPassageStats } from '@/src/db/attempts';

export default function StudentDetailScreen() {
  const theme = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [student, setStudent] = useState<Student | null>(null);
  const [stats, setStats] = useState<StudentPassageStats[]>([]);
  const [attempts, setAttempts] = useState<ReadingAttempt[]>([]);

  useFocusEffect(
    useCallback(() => {
      if (id) loadData(id);
    }, [id])
  );

  async function loadData(studentId: string) {
    const [s, st, a] = await Promise.all([
      getStudentById(studentId),
      getStudentPassageStats(studentId),
      getAttemptsByStudent(studentId),
    ]);
    setStudent(s);
    setStats(st);
    setAttempts(a);
  }

  if (!student) return null;

  const bestWpm = attempts.length > 0 ? Math.max(...attempts.map((a) => a.wpm)) : 0;
  const latestWpm = attempts.length > 0 ? attempts[0].wpm : 0;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <View style={[styles.avatar, { backgroundColor: student.avatarColor }]}>
          <Text style={styles.avatarText}>{student.name.charAt(0).toUpperCase()}</Text>
        </View>
        <Text style={[styles.name, { color: theme.text }]}>{student.name}</Text>
        <Text style={[styles.sub, { color: theme.textSecondary }]}>
          {attempts.length} {attempts.length === 1 ? 'reading' : 'readings'}
        </Text>
      </View>

      {attempts.length > 0 && (
        <View style={styles.summaryRow}>
          <StatBox label="Latest WPM" value={Math.round(latestWpm)} highlight />
          <View style={{ width: spacing.sm }} />
          <StatBox label="Best WPM" value={Math.round(bestWpm)} />
          <View style={{ width: spacing.sm }} />
          <StatBox label="Readings" value={attempts.length} />
        </View>
      )}

      {stats.length === 0 ? (
        <EmptyState
          icon="📖"
          title="No Readings Yet"
          message="Complete a fluency reading to see progress here."
        />
      ) : (
        <FlatList
          data={stats}
          keyExtractor={(item, i) => item.passageId ?? `no-passage-${i}`}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => {
            const improvement = item.latestWpm - item.firstWpm;
            return (
              <View style={[styles.passageCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                <Text style={[styles.passageTitle, { color: theme.text }]}>
                  {item.passageTitle || 'Untitled'}
                </Text>
                <View style={styles.passageStats}>
                  <Text style={[styles.passStat, { color: theme.textSecondary }]}>
                    Latest: {Math.round(item.latestWpm)} WPM
                  </Text>
                  <Text style={[styles.passStat, { color: theme.textSecondary }]}>
                    Best: {Math.round(item.bestWpm)} WPM
                  </Text>
                  <Text style={[styles.passStat, { color: theme.textSecondary }]}>
                    {item.attemptCount} {item.attemptCount === 1 ? 'attempt' : 'attempts'}
                  </Text>
                  {item.attemptCount > 1 && (
                    <Text
                      style={[
                        styles.passStat,
                        { color: improvement >= 0 ? theme.success : theme.error },
                      ]}
                    >
                      {improvement >= 0 ? '+' : ''}{Math.round(improvement)} WPM
                    </Text>
                  )}
                </View>
              </View>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { alignItems: 'center', paddingVertical: spacing.lg },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  avatarText: { color: '#FFF', fontSize: 28, fontWeight: '700' },
  name: { fontSize: fontSize.xxl, fontWeight: '700' },
  sub: { fontSize: fontSize.md, marginTop: spacing.xs },
  summaryRow: { flexDirection: 'row', paddingHorizontal: spacing.md, marginBottom: spacing.md },
  listContent: { padding: spacing.md },
  passageCard: {
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  passageTitle: { fontSize: fontSize.lg, fontWeight: '600', marginBottom: spacing.xs },
  passageStats: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  passStat: { fontSize: fontSize.sm },
});

import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { useTheme } from '@/src/hooks/useTheme';
import { getStudentById, getStudentPassageStats, getAttemptsByStudent, deleteStudent, getStudentAttemptCount } from '@/src/db';
import { Student, ReadingAttempt } from '@/src/types/models';
import { EmptyState } from '@/src/components/EmptyState';
import { StatBox } from '@/src/components/StatBox';
import { formatTime } from '@/src/utils/calculations';
import { deleteStudentMessage } from '@/src/utils/messages';
import { spacing, fontSize, borderRadius, typography, shadow } from '@/src/theme';
import type { StudentPassageStats } from '@/src/db/attempts';

export default function StudentDetailScreen() {
  const theme = useTheme();
  const router = useRouter();
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

  async function handleDelete() {
    if (!student || !id) return;
    const count = await getStudentAttemptCount(id);
    const message = deleteStudentMessage(student.name, count);

    Alert.alert('Delete Student', message, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteStudent(id);
          router.back();
        },
      },
    ]);
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
        <Text style={[styles.sub, { color: theme.textTertiary }]}>
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
        <View style={styles.emptyContainer}>
          <EmptyState
            icon="📖"
            title="No Readings Yet"
            message="Complete a fluency reading to see progress here."
          />
        </View>
      ) : (
        <FlatList
          data={stats}
          keyExtractor={(item, i) => item.passageId ?? `no-passage-${i}`}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => {
            const improvement = item.latestWpm - item.firstWpm;
            return (
              <View style={[styles.passageCard, shadow.sm, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
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
                        { color: improvement >= 0 ? theme.success : theme.error, fontWeight: '600' },
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

      <View style={[styles.footer, { borderTopColor: theme.separator }]}>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDelete}
          activeOpacity={0.6}
          accessibilityRole="button"
          accessibilityLabel="Delete student"
        >
          <Text style={[styles.deleteText, { color: theme.error }]}>Delete Student</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { alignItems: 'center', paddingTop: spacing.sm, paddingBottom: spacing.lg },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  avatarText: { color: '#FFF', fontSize: fontSize.xl, fontWeight: '600' },
  name: { fontSize: fontSize.xl, fontWeight: '700', letterSpacing: -0.4 },
  sub: { fontSize: fontSize.sm, marginTop: 2 },
  summaryRow: { flexDirection: 'row', paddingHorizontal: spacing.lg, marginBottom: spacing.md },
  emptyContainer: { flex: 1 },
  listContent: { paddingHorizontal: spacing.lg, paddingBottom: spacing.lg },
  passageCard: {
    borderRadius: borderRadius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  passageTitle: { ...typography.cardTitle, marginBottom: spacing.sm },
  passageStats: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  passStat: { fontSize: fontSize.sm },
  footer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  deleteButton: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  deleteText: {
    fontSize: fontSize.md,
    fontWeight: '500',
  },
});

import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/src/hooks/useTheme';
import { useFluencyStore } from '@/src/state/fluencyStore';
import { Button } from '@/src/components/Button';
import { StatBox } from '@/src/components/StatBox';
import { saveReadingAttempt } from '@/src/db/attempts';
import { formatTime } from '@/src/utils/calculations';
import { generateId } from '@/src/utils/uuid';
import { spacing, fontSize, borderRadius } from '@/src/theme';

export default function ResultsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const store = useFluencyStore();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const totalWords = store.getEffectiveTotalWords();
  const elapsedMs = store.getEffectiveElapsedMs();
  const errorCount = store.getEffectiveErrorCount();
  const wordsCorrect = store.calculatedWordsCorrect ?? 0;
  const wpm = store.calculatedWpm ?? 0;
  const accuracy = store.calculatedAccuracy ?? 0;

  async function handleSave() {
    setSaving(true);
    try {
      const now = new Date().toISOString();
      await saveReadingAttempt(
        {
          id: generateId(),
          studentId: store.studentId,
          passageId: store.passageId,
          passageTitleSnapshot: store.passageTitle,
          totalWords,
          elapsedMilliseconds: elapsedMs,
          errorCount,
          wordsCorrect,
          wpm,
          accuracy,
          startedAt: store.startTimestamp ? new Date(store.startTimestamp).toISOString() : now,
          completedAt: store.stopTimestamp ? new Date(store.stopTimestamp).toISOString() : now,
        },
        store.errorEvents.map((e) => ({ elapsedMilliseconds: e.elapsedMilliseconds }))
      );
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setSaved(true);
    } catch (err) {
      Alert.alert('Save Failed', 'Could not save the reading attempt. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  function handleTryAgain() {
    store.resetForRetry();
    router.replace('/fluency/session');
  }

  function handleDone() {
    store.reset();
    router.dismissAll();
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]} edges={['bottom']}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.wpmValue, { color: theme.primary }]}>{Math.round(wpm)}</Text>
          <Text style={[styles.wpmLabel, { color: theme.textSecondary }]}>words per minute</Text>
        </View>

        {store.passageTitle ? (
          <Text style={[styles.passageInfo, { color: theme.textTertiary }]}>
            {store.studentName ? `${store.studentName} · ` : ''}{store.passageTitle}
          </Text>
        ) : null}

        <View style={[styles.statsCard, { backgroundColor: theme.surface }]}>
          <View style={styles.statsRow}>
            <StatBox label="Words Correct" value={`${wordsCorrect}/${totalWords}`} />
            <View style={{ width: spacing.sm }} />
            <StatBox label="Accuracy" value={`${accuracy.toFixed(1)}%`} />
          </View>
          <View style={styles.statsRow}>
            <StatBox label="Time" value={formatTime(elapsedMs)} />
            <View style={{ width: spacing.sm }} />
            <StatBox label="Errors" value={errorCount} />
          </View>
        </View>

        <View style={styles.actions}>
          {!saved ? (
            <Button title="Save Result" onPress={handleSave} loading={saving} />
          ) : (
            <View style={[styles.savedBanner, { backgroundColor: theme.successLight }]}>
              <Text style={[styles.savedText, { color: theme.success }]}>Saved</Text>
            </View>
          )}
          <View style={{ height: spacing.sm }} />
          <Button title="Try Again" variant="secondary" onPress={handleTryAgain} />
          <View style={{ height: spacing.sm }} />
          <Button title="Done" variant="ghost" onPress={handleDone} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { flex: 1, padding: spacing.lg, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: spacing.sm },
  wpmValue: { fontSize: 72, fontWeight: '800', fontVariant: ['tabular-nums'] },
  wpmLabel: { fontSize: fontSize.lg, fontWeight: '400' },
  passageInfo: { fontSize: fontSize.md, textAlign: 'center', marginBottom: spacing.lg },
  statsCard: {
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.xl,
  },
  statsRow: { flexDirection: 'row', marginBottom: spacing.sm },
  actions: { paddingHorizontal: spacing.md },
  savedBanner: {
    minHeight: 48,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  savedText: { fontSize: fontSize.lg, fontWeight: '600' },
});

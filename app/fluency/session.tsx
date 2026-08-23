import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, BackHandler } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/src/hooks/useTheme';
import { useFluencyStore } from '@/src/state/fluencyStore';
import { useTimer } from '@/src/hooks/useTimer';
import { formatTimeWithTenths } from '@/src/utils/calculations';
import { spacing, fontSize, borderRadius } from '@/src/theme';

export default function FluencySessionScreen() {
  const theme = useTheme();
  const router = useRouter();
  const store = useFluencyStore();
  const elapsed = useTimer(store.startTimestamp, store.sessionState === 'running');

  useEffect(() => {
    if (store.sessionState !== 'running') {
      store.startReading();
    }
  }, []);

  useEffect(() => {
    const handler = BackHandler.addEventListener('hardwareBackPress', () => {
      confirmAbandon();
      return true;
    });
    return () => handler.remove();
  }, []);

  function confirmAbandon() {
    Alert.alert(
      'Stop Reading?',
      'Are you sure you want to abandon this reading session?',
      [
        { text: 'Keep Reading', style: 'cancel' },
        {
          text: 'Stop & Review',
          onPress: handleStop,
        },
        {
          text: 'Abandon',
          style: 'destructive',
          onPress: () => {
            store.reset();
            router.back();
          },
        },
      ]
    );
  }

  function handleError() {
    store.addError();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }

  function handleUndo() {
    store.undoLastError();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  }

  function handleStop() {
    store.stopReading();
    router.replace('/fluency/review');
  }

  const errorCount = store.errorEvents.length;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      <View style={styles.container}>
        <View style={styles.topRow}>
          <TouchableOpacity onPress={confirmAbandon} style={styles.backBtn} accessibilityLabel="Back">
            <Text style={[styles.backText, { color: theme.textSecondary }]}>← Back</Text>
          </TouchableOpacity>
          <View style={styles.infoChip}>
            <Text style={[styles.infoText, { color: theme.textSecondary }]} numberOfLines={1}>
              {store.passageTitle} · {store.totalWords} words
            </Text>
          </View>
        </View>

        <View style={styles.timerSection}>
          <Text style={[styles.timer, { color: theme.text }]} accessibilityLabel="Elapsed time">
            {formatTimeWithTenths(elapsed)}
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.errorButton, { backgroundColor: theme.error }]}
          onPress={handleError}
          activeOpacity={0.6}
          accessibilityRole="button"
          accessibilityLabel={`Mark error. Current errors: ${errorCount}`}
        >
          <Text style={[styles.errorButtonText, { color: theme.errorText }]}>ERROR</Text>
        </TouchableOpacity>

        <View style={styles.errorRow}>
          <Text style={[styles.errorCount, { color: theme.text }]}>
            {errorCount} {errorCount === 1 ? 'error' : 'errors'}
          </Text>
          {errorCount > 0 && (
            <TouchableOpacity
              onPress={handleUndo}
              style={[styles.undoButton, { borderColor: theme.border }]}
              accessibilityRole="button"
              accessibilityLabel="Undo last error"
            >
              <Text style={[styles.undoText, { color: theme.textSecondary }]}>Undo</Text>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={[styles.stopButton, { backgroundColor: theme.surface, borderColor: theme.border }]}
          onPress={handleStop}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Stop reading"
        >
          <Text style={[styles.stopText, { color: theme.text }]}>Stop Reading</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { flex: 1, padding: spacing.md, justifyContent: 'space-between' },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backBtn: { padding: spacing.sm },
  backText: { fontSize: fontSize.md, fontWeight: '500' },
  infoChip: { flex: 1, alignItems: 'flex-end', marginLeft: spacing.sm },
  infoText: { fontSize: fontSize.sm },
  timerSection: { alignItems: 'center', paddingVertical: spacing.lg },
  timer: { fontSize: 64, fontWeight: '200', fontVariant: ['tabular-nums'] },
  errorButton: {
    height: 160,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: spacing.md,
  },
  errorButtonText: { fontSize: 36, fontWeight: '800', letterSpacing: 2 },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    gap: spacing.md,
  },
  errorCount: { fontSize: fontSize.xl, fontWeight: '600' },
  undoButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
  undoText: { fontSize: fontSize.sm, fontWeight: '500' },
  stopButton: {
    minHeight: 52,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  stopText: { fontSize: fontSize.lg, fontWeight: '600' },
});

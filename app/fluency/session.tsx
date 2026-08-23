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
  const isRunning = store.sessionState === 'running';
  const elapsed = useTimer(store.startTimestamp, isRunning);

  useEffect(() => {
    const handler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (isRunning) {
        confirmAbandon();
      } else {
        store.reset();
        router.back();
      }
      return true;
    });
    return () => handler.remove();
  }, [isRunning]);

  function confirmAbandon() {
    Alert.alert(
      'Stop Reading?',
      'Are you sure you want to stop this session?',
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

  function handleStart() {
    store.startReading();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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
          <TouchableOpacity
            onPress={isRunning ? confirmAbandon : () => { store.reset(); router.back(); }}
            style={styles.backBtn}
            accessibilityLabel="Back"
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Text style={[styles.backText, { color: theme.primary }]}>{'‹ Back'}</Text>
          </TouchableOpacity>
          <View style={styles.infoChip}>
            <Text style={[styles.infoText, { color: theme.textTertiary }]} numberOfLines={1}>
              {store.passageTitle} · {store.totalWords} words
            </Text>
          </View>
        </View>

        <View style={styles.timerSection}>
          <Text style={[styles.timer, { color: theme.text }]} accessibilityLabel="Elapsed time">
            {formatTimeWithTenths(elapsed)}
          </Text>
          {isRunning && (
            <View style={[styles.liveDot, { backgroundColor: theme.error }]} />
          )}
        </View>

        {isRunning ? (
          <>
            <TouchableOpacity
              style={[styles.errorButton, { backgroundColor: theme.error }]}
              onPress={handleError}
              activeOpacity={0.6}
              accessibilityRole="button"
              accessibilityLabel={`Mark error. Current errors: ${errorCount}`}
            >
              <Text style={[styles.errorButtonText, { color: theme.errorText }]}>Error</Text>
            </TouchableOpacity>

            <View style={styles.errorRow}>
              <Text style={[styles.errorCount, { color: theme.text }]}>
                {errorCount} {errorCount === 1 ? 'error' : 'errors'}
              </Text>
              {errorCount > 0 && (
                <TouchableOpacity
                  onPress={handleUndo}
                  style={[styles.undoButton, { backgroundColor: theme.surface }]}
                  accessibilityRole="button"
                  accessibilityLabel="Undo last error"
                >
                  <Text style={[styles.undoText, { color: theme.textSecondary }]}>Undo</Text>
                </TouchableOpacity>
              )}
            </View>

            <TouchableOpacity
              style={[styles.stopButton, { backgroundColor: theme.surface }]}
              onPress={handleStop}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Stop reading"
            >
              <Text style={[styles.stopText, { color: theme.text }]}>Stop Reading</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <View style={styles.readyMessage}>
              <Text style={[styles.readyTitle, { color: theme.text }]}>Ready</Text>
              <Text style={[styles.readySubtitle, { color: theme.textSecondary }]}>
                Tap Start when the student begins reading aloud
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.startButton, { backgroundColor: theme.primary }]}
              onPress={handleStart}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Start timer"
            >
              <Text style={[styles.startButtonText, { color: theme.primaryText }]}>Start</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { flex: 1, padding: spacing.lg, justifyContent: 'space-between' },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backBtn: { padding: spacing.sm },
  backText: { fontSize: fontSize.md, fontWeight: '500' },
  infoChip: { flex: 1, alignItems: 'flex-end', marginLeft: spacing.sm },
  infoText: { fontSize: fontSize.sm },
  timerSection: { alignItems: 'center', paddingVertical: spacing.lg },
  timer: { fontSize: 64, fontWeight: '200', fontVariant: ['tabular-nums'], letterSpacing: -1 },
  liveDot: { width: 8, height: 8, borderRadius: 4, marginTop: spacing.sm },
  readyMessage: { alignItems: 'center', paddingHorizontal: spacing.xl },
  readyTitle: { fontSize: fontSize.xxxl, fontWeight: '700', marginBottom: spacing.sm },
  readySubtitle: { fontSize: fontSize.md, textAlign: 'center', lineHeight: 22 },
  startButton: {
    height: 160,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  startButtonText: { fontSize: 36, fontWeight: '700', letterSpacing: 1 },
  errorButton: {
    height: 160,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: spacing.md,
  },
  errorButtonText: { fontSize: 36, fontWeight: '700', letterSpacing: 1 },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    gap: spacing.md,
  },
  errorCount: { fontSize: fontSize.xl, fontWeight: '600', fontVariant: ['tabular-nums'] },
  undoButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  undoText: { fontSize: fontSize.sm, fontWeight: '500' },
  stopButton: {
    minHeight: 52,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  stopText: { fontSize: fontSize.lg, fontWeight: '600' },
});

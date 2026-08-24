import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/src/hooks/useTheme';
import { useFluencyStore } from '@/src/state/fluencyStore';
import { NumberInput } from '@/src/components/NumberInput';
import { Button } from '@/src/components/Button';
import { StatBox } from '@/src/components/StatBox';
import {
  calculateWordsCorrect,
  calculateWpmDisplay,
  calculateAccuracy,
  calculateSelfCorrectionRatio,
  calculateRunningRecordAccuracy,
  calculateGradePercentage,
  formatTime,
} from '@/src/utils/calculations';
import { spacing, fontSize, borderRadius } from '@/src/theme';

type Mode = 'fluency' | 'running-record' | 'grader';

export default function ReviewScreen() {
  const theme = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ mode?: string }>();
  const store = useFluencyStore();

  const mode: Mode = (params.mode as Mode) || 'fluency';

  const [totalWords, setTotalWords] = useState(store.getEffectiveTotalWords());
  const [elapsedMs, setElapsedMs] = useState(store.getEffectiveElapsedMs());
  const [errorCount, setErrorCount] = useState(store.getEffectiveErrorCount());
  const [showResults, setShowResults] = useState(false);

  const [rrTotalWords, setRrTotalWords] = useState(100);
  const [rrErrors, setRrErrors] = useState(0);
  const [rrSelfCorrections, setRrSelfCorrections] = useState(0);
  const [rrShowResults, setRrShowResults] = useState(false);

  const [graderTotal, setGraderTotal] = useState(20);
  const [graderIncorrect, setGraderIncorrect] = useState(0);

  const fluencyResults = useMemo(() => {
    if (!showResults) return null;
    const wordsCorrect = calculateWordsCorrect(totalWords, errorCount);
    const wpm = calculateWpmDisplay(wordsCorrect, elapsedMs);
    const accuracy = calculateAccuracy(totalWords, errorCount);
    return { wordsCorrect, wpm, accuracy };
  }, [showResults, totalWords, errorCount, elapsedMs]);

  function handleCalculateFluency() {
    if (totalWords <= 0) {
      Alert.alert('Invalid', 'Total words must be greater than zero.');
      return;
    }
    if (elapsedMs <= 0) {
      Alert.alert('Invalid', 'Reading time must be greater than zero.');
      return;
    }
    if (errorCount > totalWords) {
      Alert.alert('Warning', 'Errors exceed total words. Results may not be meaningful.');
    }
    store.setEditedTotalWords(totalWords);
    store.setEditedElapsedMs(elapsedMs);
    store.setEditedErrorCount(errorCount);
    store.calculate();
    setShowResults(true);
  }

  function handleSaveFluency() {
    router.replace('/fluency/results');
  }

  function handleTryAgain() {
    store.resetForRetry();
    router.replace('/fluency/session');
  }

  function handleSetElapsedMinutes(mins: number) {
    const currentSecs = Math.floor((elapsedMs / 1000) % 60);
    setElapsedMs((mins * 60 + currentSecs) * 1000);
  }

  function handleSetElapsedSeconds(secs: number) {
    const currentMins = Math.floor(elapsedMs / 60000);
    setElapsedMs((currentMins * 60 + secs) * 1000);
  }

  const rrResults = useMemo(() => {
    if (!rrShowResults) return null;
    const accuracy = calculateRunningRecordAccuracy(rrTotalWords, rrErrors);
    const scRatio = calculateSelfCorrectionRatio(rrErrors, rrSelfCorrections);
    return { accuracy, scRatio };
  }, [rrShowResults, rrTotalWords, rrErrors, rrSelfCorrections]);

  const graderResults = useMemo(() => {
    if (graderTotal <= 0) return { correct: 0, percentage: 0 };
    const correct = Math.max(0, graderTotal - graderIncorrect);
    const percentage = calculateGradePercentage(graderTotal, graderIncorrect);
    return { correct, percentage };
  }, [graderTotal, graderIncorrect]);

  if (mode === 'running-record') {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]} edges={['bottom']}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={[styles.title, { color: theme.text }]}>Running Record</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Calculate reading accuracy and self-correction ratio
          </Text>

          <NumberInput label="Total Words" value={rrTotalWords} onChange={setRrTotalWords} min={1} />
          <NumberInput label="Errors" value={rrErrors} onChange={(v) => setRrErrors(Math.min(v, rrTotalWords))} />
          <NumberInput label="Self-Corrections" value={rrSelfCorrections} onChange={setRrSelfCorrections} />

          <Button
            title="Calculate"
            onPress={() => {
              if (rrTotalWords <= 0) {
                Alert.alert('Invalid', 'Total words must be greater than zero.');
                return;
              }
              setRrShowResults(true);
            }}
            style={{ marginTop: spacing.md }}
          />

          {rrResults && (
            <View style={[styles.resultsCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
              <View style={styles.statsRow}>
                <StatBox label="Accuracy" value={`${rrResults.accuracy.toFixed(1)}%`} highlight />
                <View style={{ width: spacing.sm }} />
                <StatBox
                  label="SC Ratio"
                  value={rrResults.scRatio ? rrResults.scRatio.ratio : 'N/A'}
                />
              </View>
              <View style={styles.statsRow}>
                <StatBox label="Words Correct" value={calculateWordsCorrect(rrTotalWords, rrErrors)} />
                <View style={{ width: spacing.sm }} />
                <StatBox label="Errors" value={rrErrors} />
              </View>
              <Text style={[styles.disclaimer, { color: theme.textTertiary }]}>
                Benchmark interpretations vary by educational system and grade level.
              </Text>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (mode === 'grader') {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]} edges={['bottom']}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={[styles.title, { color: theme.text }]}>Quick Grader</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Calculate assignment percentage instantly
          </Text>

          <NumberInput label="Total Questions" value={graderTotal} onChange={(v) => setGraderTotal(Math.max(1, v))} min={1} />
          <NumberInput
            label="Incorrect Answers"
            value={graderIncorrect}
            onChange={(v) => setGraderIncorrect(Math.min(v, graderTotal))}
            max={graderTotal}
          />

          {graderTotal > 0 && (
            <View style={[styles.resultsCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
              <View style={styles.statsRow}>
                <StatBox
                  label="Score"
                  value={`${graderResults.percentage.toFixed(1)}%`}
                  highlight
                />
                <View style={{ width: spacing.sm }} />
                <StatBox
                  label="Correct"
                  value={`${graderResults.correct}/${graderTotal}`}
                />
              </View>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  const elapsedMinutes = Math.floor(elapsedMs / 60000);
  const elapsedSeconds = Math.floor((elapsedMs / 1000) % 60);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={[styles.title, { color: theme.text }]}>Review Reading</Text>
        {store.passageTitle ? (
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            {store.studentName ? `${store.studentName} · ` : ''}{store.passageTitle}
          </Text>
        ) : null}

        <NumberInput label="Total Words" value={totalWords} onChange={(v) => { setTotalWords(v); setShowResults(false); }} min={1} />

        <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>Reading Time</Text>
        <View style={styles.timeRow}>
          <View style={styles.timeInput}>
            <NumberInput label="Minutes" value={elapsedMinutes} onChange={(v) => { handleSetElapsedMinutes(v); setShowResults(false); }} />
          </View>
          <Text style={[styles.timeColon, { color: theme.textTertiary }]}>:</Text>
          <View style={styles.timeInput}>
            <NumberInput label="Seconds" value={elapsedSeconds} onChange={(v) => { handleSetElapsedSeconds(Math.min(59, v)); setShowResults(false); }} max={59} />
          </View>
        </View>

        <NumberInput
          label="Errors"
          value={errorCount}
          onChange={(v) => { setErrorCount(v); setShowResults(false); }}
          max={totalWords}
        />

        {!showResults && (
          <Button
            title="Calculate"
            onPress={handleCalculateFluency}
            style={{ marginTop: spacing.md }}
          />
        )}

        {fluencyResults && (
          <View style={[styles.resultsCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
            <View style={styles.statsRow}>
              <StatBox label="WPM" value={fluencyResults.wpm} highlight />
              <View style={{ width: spacing.sm }} />
              <StatBox label="Accuracy" value={`${fluencyResults.accuracy.toFixed(1)}%`} />
            </View>
            <View style={styles.statsRow}>
              <StatBox label="Correct" value={`${fluencyResults.wordsCorrect}/${totalWords}`} />
              <View style={{ width: spacing.sm }} />
              <StatBox label="Errors" value={errorCount} />
            </View>
            <View style={styles.statsRow}>
              <StatBox label="Time" value={formatTime(elapsedMs)} />
              <View style={{ width: spacing.sm }} />
              <View style={{ flex: 1 }} />
            </View>

            <View style={styles.actionRow}>
              <Button
                title="Save Result"
                onPress={handleSaveFluency}
                style={{ flex: 1, marginRight: spacing.sm }}
              />
              <Button
                title="Try Again"
                variant="secondary"
                onPress={handleTryAgain}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  title: { fontSize: fontSize.xxl, fontWeight: '700', marginBottom: spacing.xs },
  subtitle: { fontSize: fontSize.md, marginBottom: spacing.lg },
  fieldLabel: { fontSize: fontSize.sm, fontWeight: '500', marginBottom: spacing.xs },
  timeRow: { flexDirection: 'row', alignItems: 'flex-start' },
  timeInput: { flex: 1 },
  timeColon: { fontSize: fontSize.xxl, fontWeight: '300', marginHorizontal: spacing.sm, marginTop: 20 },
  resultsCard: {
    borderRadius: borderRadius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.md,
    marginTop: spacing.lg,
  },
  statsRow: { flexDirection: 'row', marginBottom: spacing.sm },
  actionRow: { flexDirection: 'row', marginTop: spacing.md },
  disclaimer: { fontSize: fontSize.xs, textAlign: 'center', marginTop: spacing.sm, fontStyle: 'italic' },
});

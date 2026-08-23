import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ScrollView } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/src/hooks/useTheme';
import { useFluencyStore } from '@/src/state/fluencyStore';
import { spacing, fontSize, borderRadius, minTouchTarget } from '@/src/theme';
import { APP_NAME } from '@/src/constants/app';
import { getAllStudents, getAllPassages } from '@/src/db';
import { Student, Passage } from '@/src/types/models';

export default function HomeScreen() {
  const theme = useTheme();
  const router = useRouter();
  const store = useFluencyStore();

  const [students, setStudents] = useState<Student[]>([]);
  const [passages, setPassages] = useState<Passage[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [selectedPassageId, setSelectedPassageId] = useState<string | null>(null);
  const [wordCountText, setWordCountText] = useState('');
  const [passageNameText, setPassageNameText] = useState('');
  const [showSetup, setShowSetup] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  async function loadData() {
    const [s, p] = await Promise.all([getAllStudents(), getAllPassages()]);
    setStudents(s);
    setPassages(p);
  }

  function handleSelectPassage(passage: Passage) {
    setSelectedPassageId(passage.id);
    setPassageNameText(passage.title);
    setWordCountText(String(passage.wordCount));
  }

  function handleStartReading() {
    const wordCount = parseInt(wordCountText, 10);
    if (!wordCount || wordCount <= 0) {
      Alert.alert('Word Count Required', 'Please enter the total number of words in the passage.');
      return;
    }

    const student = students.find((s) => s.id === selectedStudentId);
    store.setStudent(student?.id ?? null, student?.name ?? '');
    store.setPassage(
      selectedPassageId,
      passageNameText.trim() || 'Untitled Passage',
      wordCount
    );

    router.push('/fluency/session');
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.appName, { color: theme.primary }]}>{APP_NAME}</Text>
        <Text style={[styles.tagline, { color: theme.textSecondary }]}>
          Elementary Education Tools
        </Text>

        <Text style={[styles.sectionTitle, { color: theme.text }]}>Reading</Text>

        <TouchableOpacity
          style={[styles.toolCard, { backgroundColor: theme.primaryLight, borderColor: theme.primary }]}
          onPress={() => setShowSetup(!showSetup)}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Fluency Timer"
        >
          <View style={styles.toolCardContent}>
            <Text style={styles.toolIcon}>⏱️</Text>
            <View style={styles.toolCardText}>
              <Text style={[styles.toolTitle, { color: theme.text }]}>Fluency</Text>
              <Text style={[styles.toolDesc, { color: theme.textSecondary }]}>
                Measure oral reading speed and accuracy
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        {showSetup && (
          <View style={[styles.setupSection, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text style={[styles.setupLabel, { color: theme.textSecondary }]}>Student (optional)</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
              <TouchableOpacity
                style={[
                  styles.chip,
                  {
                    backgroundColor: !selectedStudentId ? theme.primary : theme.surfaceElevated,
                    borderColor: !selectedStudentId ? theme.primary : theme.border,
                  },
                ]}
                onPress={() => setSelectedStudentId(null)}
              >
                <Text style={[styles.chipText, { color: !selectedStudentId ? theme.primaryText : theme.text }]}>
                  None
                </Text>
              </TouchableOpacity>
              {students.map((s) => (
                <TouchableOpacity
                  key={s.id}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: selectedStudentId === s.id ? theme.primary : theme.surfaceElevated,
                      borderColor: selectedStudentId === s.id ? theme.primary : theme.border,
                    },
                  ]}
                  onPress={() => setSelectedStudentId(s.id)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      { color: selectedStudentId === s.id ? theme.primaryText : theme.text },
                    ]}
                  >
                    {s.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={[styles.setupLabel, { color: theme.textSecondary, marginTop: spacing.md }]}>
              Passage (optional)
            </Text>
            {passages.length > 0 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
                <TouchableOpacity
                  style={[
                    styles.chip,
                    {
                      backgroundColor: !selectedPassageId ? theme.primary : theme.surfaceElevated,
                      borderColor: !selectedPassageId ? theme.primary : theme.border,
                    },
                  ]}
                  onPress={() => {
                    setSelectedPassageId(null);
                    setPassageNameText('');
                    setWordCountText('');
                  }}
                >
                  <Text style={[styles.chipText, { color: !selectedPassageId ? theme.primaryText : theme.text }]}>
                    Custom
                  </Text>
                </TouchableOpacity>
                {passages.map((p) => (
                  <TouchableOpacity
                    key={p.id}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: selectedPassageId === p.id ? theme.primary : theme.surfaceElevated,
                        borderColor: selectedPassageId === p.id ? theme.primary : theme.border,
                      },
                    ]}
                    onPress={() => handleSelectPassage(p)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        { color: selectedPassageId === p.id ? theme.primaryText : theme.text },
                      ]}
                    >
                      {p.title} ({p.wordCount})
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}

            {!selectedPassageId && (
              <TextInput
                placeholder="Passage name"
                placeholderTextColor={theme.textTertiary}
                value={passageNameText}
                onChangeText={setPassageNameText}
                style={[
                  styles.input,
                  { color: theme.text, backgroundColor: theme.surfaceElevated, borderColor: theme.border },
                ]}
              />
            )}

            <Text style={[styles.setupLabel, { color: theme.textSecondary, marginTop: spacing.md }]}>
              Total Words *
            </Text>
            <TextInput
              placeholder="e.g. 74"
              placeholderTextColor={theme.textTertiary}
              value={wordCountText}
              onChangeText={setWordCountText}
              keyboardType="number-pad"
              style={[
                styles.input,
                { color: theme.text, backgroundColor: theme.surfaceElevated, borderColor: theme.border },
              ]}
              accessibilityLabel="Total words in passage"
            />

            <TouchableOpacity
              style={[styles.startButton, { backgroundColor: theme.primary }]}
              onPress={handleStartReading}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Start Reading"
            >
              <Text style={[styles.startButtonText, { color: theme.primaryText }]}>
                Start Reading
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity
          style={[styles.toolCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
          onPress={() => router.push('/fluency/review?mode=running-record')}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Running Record"
        >
          <View style={styles.toolCardContent}>
            <Text style={styles.toolIcon}>📋</Text>
            <View style={styles.toolCardText}>
              <Text style={[styles.toolTitle, { color: theme.text }]}>Running Record</Text>
              <Text style={[styles.toolDesc, { color: theme.textSecondary }]}>
                Calculate accuracy and self-correction ratio
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        <Text style={[styles.sectionTitle, { color: theme.text, marginTop: spacing.lg }]}>
          Teacher Tools
        </Text>

        <TouchableOpacity
          style={[styles.toolCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
          onPress={() => router.push('/fluency/review?mode=grader')}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Quick Grader"
        >
          <View style={styles.toolCardContent}>
            <Text style={styles.toolIcon}>✏️</Text>
            <View style={styles.toolCardText}>
              <Text style={[styles.toolTitle, { color: theme.text }]}>Quick Grader</Text>
              <Text style={[styles.toolDesc, { color: theme.textSecondary }]}>
                Fast percentage calculator for any assignment
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: spacing.md, paddingBottom: spacing.xxl },
  appName: { fontSize: fontSize.xxxl, fontWeight: '800', marginTop: spacing.md },
  tagline: { fontSize: fontSize.md, marginBottom: spacing.lg },
  sectionTitle: { fontSize: fontSize.sm, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1, marginBottom: spacing.sm, marginTop: spacing.sm },
  toolCard: { borderRadius: borderRadius.lg, borderWidth: 1, padding: spacing.md, marginBottom: spacing.sm },
  toolCardContent: { flexDirection: 'row', alignItems: 'center' },
  toolIcon: { fontSize: 28, marginRight: spacing.md },
  toolCardText: { flex: 1 },
  toolTitle: { fontSize: fontSize.lg, fontWeight: '600', marginBottom: 2 },
  toolDesc: { fontSize: fontSize.sm },
  setupSection: {
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  setupLabel: { fontSize: fontSize.sm, fontWeight: '500', marginBottom: spacing.xs },
  chipScroll: { marginBottom: spacing.xs },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    marginRight: spacing.xs,
    minHeight: 36,
    justifyContent: 'center',
  },
  chipText: { fontSize: fontSize.sm, fontWeight: '500' },
  input: {
    minHeight: minTouchTarget,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    fontSize: fontSize.md,
    marginTop: spacing.xs,
  },
  startButton: {
    minHeight: minTouchTarget + 4,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
  },
  startButtonText: { fontSize: fontSize.lg, fontWeight: '700' },
});

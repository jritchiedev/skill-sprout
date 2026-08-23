import React, { useState, useCallback, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput, Alert,
  ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/src/hooks/useTheme';
import { useFluencyStore } from '@/src/state/fluencyStore';
import { spacing, fontSize, borderRadius, minTouchTarget, shadow } from '@/src/theme';
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
      Alert.alert('Word Count Required', 'Enter the total number of words in the passage.');
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
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={[styles.appName, { color: theme.text }]}>Skill Sprout</Text>
            <Text style={[styles.tagline, { color: theme.textTertiary }]}>
              Tools for growing readers
            </Text>
          </View>

          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Reading</Text>

          <TouchableOpacity
            style={[
              styles.toolCard,
              shadow.md,
              {
                backgroundColor: showSetup ? theme.primaryLight : theme.card,
              },
            ]}
            onPress={() => setShowSetup(!showSetup)}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Fluency Timer"
          >
            <View style={styles.toolCardContent}>
              <View style={[styles.toolIconWrap, { backgroundColor: theme.primaryLight }]}>
                <Text style={styles.toolIcon}>{'⏱'}</Text>
              </View>
              <View style={styles.toolCardText}>
                <Text style={[styles.toolTitle, { color: theme.text }]}>Fluency Timer</Text>
                <Text style={[styles.toolDesc, { color: theme.textSecondary }]}>
                  Measure oral reading speed and accuracy
                </Text>
              </View>
              <Text style={[styles.chevron, { color: theme.textTertiary }]}>
                {showSetup ? '▾' : '›'}
              </Text>
            </View>
          </TouchableOpacity>

          {showSetup && (
            <View style={[styles.setupSection, { backgroundColor: theme.surface }]}>
              {students.length > 0 && (
                <>
                  <Text style={[styles.setupLabel, { color: theme.textSecondary }]}>Student</Text>
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
                      <Text style={[styles.chipText, { color: !selectedStudentId ? theme.primaryText : theme.textSecondary }]}>
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
                </>
              )}

              {passages.length > 0 && (
                <>
                  <Text style={[styles.setupLabel, { color: theme.textSecondary, marginTop: spacing.md }]}>
                    Passage
                  </Text>
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
                      <Text style={[styles.chipText, { color: !selectedPassageId ? theme.primaryText : theme.textSecondary }]}>
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
                          {p.title}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </>
              )}

              {!selectedPassageId && (
                <>
                  <Text style={[styles.setupLabel, { color: theme.textSecondary, marginTop: spacing.md }]}>
                    Passage Name
                  </Text>
                  <TextInput
                    placeholder="e.g. Chapter 3 — The Storm"
                    placeholderTextColor={theme.textTertiary}
                    value={passageNameText}
                    onChangeText={setPassageNameText}
                    style={[
                      styles.input,
                      { color: theme.text, backgroundColor: theme.surfaceElevated },
                    ]}
                  />
                </>
              )}

              <Text style={[styles.setupLabel, { color: theme.textSecondary, marginTop: spacing.md }]}>
                Total Words
              </Text>
              <TextInput
                placeholder="e.g. 74"
                placeholderTextColor={theme.textTertiary}
                value={wordCountText}
                onChangeText={setWordCountText}
                keyboardType="number-pad"
                style={[
                  styles.input,
                  { color: theme.text, backgroundColor: theme.surfaceElevated },
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
            style={[styles.toolCard, shadow.md, { backgroundColor: theme.card }]}
            onPress={() => router.push('/fluency/review?mode=running-record')}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Running Record"
          >
            <View style={styles.toolCardContent}>
              <View style={[styles.toolIconWrap, { backgroundColor: theme.warningLight }]}>
                <Text style={styles.toolIcon}>{'📋'}</Text>
              </View>
              <View style={styles.toolCardText}>
                <Text style={[styles.toolTitle, { color: theme.text }]}>Running Record</Text>
                <Text style={[styles.toolDesc, { color: theme.textSecondary }]}>
                  Calculate accuracy and self-correction ratio
                </Text>
              </View>
              <Text style={[styles.chevron, { color: theme.textTertiary }]}>{'›'}</Text>
            </View>
          </TouchableOpacity>

          <Text style={[styles.sectionTitle, { color: theme.textSecondary, marginTop: spacing.xl }]}>
            Teacher Tools
          </Text>

          <TouchableOpacity
            style={[styles.toolCard, shadow.md, { backgroundColor: theme.card }]}
            onPress={() => router.push('/fluency/review?mode=grader')}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Quick Grader"
          >
            <View style={styles.toolCardContent}>
              <View style={[styles.toolIconWrap, { backgroundColor: '#F3E8FF' }]}>
                <Text style={styles.toolIcon}>{'✏️'}</Text>
              </View>
              <View style={styles.toolCardText}>
                <Text style={[styles.toolTitle, { color: theme.text }]}>Quick Grader</Text>
                <Text style={[styles.toolDesc, { color: theme.textSecondary }]}>
                  Fast percentage calculator for any assignment
                </Text>
              </View>
              <Text style={[styles.chevron, { color: theme.textTertiary }]}>{'›'}</Text>
            </View>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  header: { marginBottom: spacing.xl, marginTop: spacing.sm },
  appName: { fontSize: fontSize.xxxl, fontWeight: '800', letterSpacing: -0.5 },
  tagline: { fontSize: fontSize.md, marginTop: spacing.xs },
  sectionTitle: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: spacing.sm,
  },
  toolCard: {
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  toolCardContent: { flexDirection: 'row', alignItems: 'center' },
  toolIconWrap: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  toolIcon: { fontSize: 22 },
  toolCardText: { flex: 1 },
  toolTitle: { fontSize: fontSize.md, fontWeight: '600', marginBottom: 2 },
  toolDesc: { fontSize: fontSize.sm, lineHeight: 19 },
  chevron: { fontSize: 18, fontWeight: '300', marginLeft: spacing.sm },
  setupSection: {
    borderRadius: borderRadius.lg,
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
    paddingHorizontal: spacing.md,
    fontSize: fontSize.md,
  },
  startButton: {
    minHeight: minTouchTarget + 4,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.lg,
  },
  startButtonText: { fontSize: fontSize.lg, fontWeight: '700', letterSpacing: 0.3 },
});

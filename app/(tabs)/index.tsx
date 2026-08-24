import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput, Alert,
  ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useTheme } from '@/src/hooks/useTheme';
import { ScreenHeader } from '@/src/components/ScreenHeader';
import { useFluencyStore } from '@/src/state/fluencyStore';
import { spacing, fontSize, borderRadius, typography, minTouchTarget, shadow } from '@/src/theme';
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
    <View style={[styles.safe, { backgroundColor: theme.background }]}>
      <ScreenHeader title="Skill Sprout" subtitle="Tools for growing readers" />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Reading</Text>

          <TouchableOpacity
            style={[
              styles.toolCard,
              shadow.sm,
              {
                backgroundColor: theme.card,
                borderColor: showSetup ? theme.primary : theme.cardBorder,
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
            <View style={[styles.setupSection, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
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

              <View style={styles.setupLabelRow}>
                <Text style={[styles.setupLabel, { color: theme.textSecondary, marginTop: spacing.md, marginBottom: 0 }]}>
                  Passage
                </Text>
                {passages.length > 0 && (
                  <TouchableOpacity
                    onPress={() => router.push('/passages/manage')}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    style={{ marginTop: spacing.md }}
                  >
                    <Text style={[styles.manageLink, { color: theme.primary }]}>Manage</Text>
                  </TouchableOpacity>
                )}
              </View>

              {passages.length > 0 ? (
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
                  <TouchableOpacity
                    style={[
                      styles.chip,
                      { backgroundColor: theme.surfaceElevated, borderColor: theme.border, borderStyle: 'dashed' },
                    ]}
                    onPress={() => router.push('/passages/manage')}
                  >
                    <Text style={[styles.chipText, { color: theme.textTertiary }]}>+ Add</Text>
                  </TouchableOpacity>
                </ScrollView>
              ) : (
                <TouchableOpacity
                  style={[styles.addPassagePrompt, { backgroundColor: theme.surfaceElevated }]}
                  onPress={() => router.push('/passages/manage')}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.addPassageText, { color: theme.textSecondary }]}>
                    Save passages with word counts for quick reuse
                  </Text>
                  <Text style={[styles.addPassageAction, { color: theme.primary }]}>Add Passages</Text>
                </TouchableOpacity>
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
                      { color: theme.text, backgroundColor: theme.surface },
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
                  { color: theme.text, backgroundColor: theme.surface },
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
            style={[styles.toolCard, shadow.sm, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
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

          <Text style={[styles.sectionTitle, { color: theme.textSecondary, marginTop: spacing.lg }]}>
            Teacher Tools
          </Text>

          <TouchableOpacity
            style={[styles.toolCard, shadow.sm, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
            onPress={() => router.push('/fluency/review?mode=grader')}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Quick Grader"
          >
            <View style={styles.toolCardContent}>
              <View style={[styles.toolIconWrap, { backgroundColor: theme.accentLight }]}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl },
  sectionTitle: {
    ...typography.sectionLabel,
    marginBottom: spacing.sm,
  },
  toolCard: {
    borderRadius: borderRadius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  toolCardContent: { flexDirection: 'row', alignItems: 'center' },
  toolIconWrap: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  toolIcon: { fontSize: 20 },
  toolCardText: { flex: 1 },
  toolTitle: { ...typography.cardTitle, marginBottom: 2 },
  toolDesc: typography.body,
  chevron: { fontSize: 18, fontWeight: '300', marginLeft: spacing.sm },
  setupSection: {
    borderRadius: borderRadius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  setupLabel: { fontSize: fontSize.sm, fontWeight: '500', marginBottom: spacing.xs },
  chipScroll: { marginBottom: spacing.xs },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: StyleSheet.hairlineWidth,
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
  startButtonText: { fontSize: fontSize.md, fontWeight: '600', letterSpacing: 0.2 },
  setupLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  manageLink: { fontSize: fontSize.sm, fontWeight: '500' },
  addPassagePrompt: {
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginTop: spacing.xs,
    alignItems: 'center',
  },
  addPassageText: { fontSize: fontSize.sm, textAlign: 'center', marginBottom: spacing.xs },
  addPassageAction: { fontSize: fontSize.sm, fontWeight: '600' },
});

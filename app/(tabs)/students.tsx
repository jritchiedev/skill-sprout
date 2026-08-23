import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/src/hooks/useTheme';
import { getAllStudents, createStudent, deleteStudent, getStudentAttemptCount } from '@/src/db';
import { Student } from '@/src/types/models';
import { EmptyState } from '@/src/components/EmptyState';
import { spacing, fontSize, borderRadius, minTouchTarget, shadow } from '@/src/theme';

export default function StudentsTab() {
  const theme = useTheme();
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [newName, setNewName] = useState('');
  const [adding, setAdding] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadStudents();
    }, [])
  );

  async function loadStudents() {
    setStudents(await getAllStudents());
  }

  async function handleAdd() {
    const trimmed = newName.trim();
    if (!trimmed) return;
    setAdding(true);
    try {
      await createStudent(trimmed);
      setNewName('');
      await loadStudents();
    } finally {
      setAdding(false);
    }
  }

  async function handleDelete(student: Student) {
    const count = await getStudentAttemptCount(student.id);
    const message = count > 0
      ? `"${student.name}" has ${count} reading ${count === 1 ? 'attempt' : 'attempts'}. Deleting will disassociate those records.`
      : `Delete "${student.name}"?`;

    Alert.alert('Delete Student', message, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteStudent(student.id);
          await loadStudents();
        },
      },
    ]);
  }

  function renderStudent({ item }: { item: Student }) {
    return (
      <TouchableOpacity
        style={[styles.studentRow, shadow.sm, { backgroundColor: theme.card }]}
        onPress={() => router.push(`/students/${item.id}`)}
        onLongPress={() => handleDelete(item)}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={item.name}
        accessibilityHint="Tap to view details, hold to delete"
      >
        <View style={[styles.avatar, { backgroundColor: item.avatarColor }]}>
          <Text style={styles.avatarText}>{item.name.charAt(0).toUpperCase()}</Text>
        </View>
        <View style={styles.studentInfo}>
          <Text style={[styles.studentName, { color: theme.text }]}>{item.name}</Text>
        </View>
        <Text style={[styles.chevron, { color: theme.textTertiary }]}>{'›'}</Text>
      </TouchableOpacity>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]} edges={[]}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={[styles.addRow]}>
          <TextInput
            placeholder="Add a student..."
            placeholderTextColor={theme.textTertiary}
            value={newName}
            onChangeText={setNewName}
            onSubmitEditing={handleAdd}
            returnKeyType="done"
            style={[styles.addInput, { color: theme.text, backgroundColor: theme.surface }]}
            accessibilityLabel="New student name"
          />
          <TouchableOpacity
            onPress={handleAdd}
            disabled={adding || !newName.trim()}
            style={[styles.addButton, { backgroundColor: theme.primary, opacity: newName.trim() ? 1 : 0.4 }]}
            accessibilityRole="button"
            accessibilityLabel="Add student"
          >
            <Text style={[styles.addButtonText, { color: theme.primaryText }]}>Add</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={students}
          keyExtractor={(item) => item.id}
          renderItem={renderStudent}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <EmptyState
              icon="👥"
              title="No Students Yet"
              message="Add a student above to start tracking their reading progress."
            />
          }
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  addRow: { flexDirection: 'row', padding: spacing.lg, paddingBottom: spacing.md, gap: spacing.sm },
  addInput: {
    flex: 1,
    minHeight: minTouchTarget,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    fontSize: fontSize.md,
  },
  addButton: {
    minHeight: minTouchTarget,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: { fontSize: fontSize.md, fontWeight: '600' },
  list: { paddingHorizontal: spacing.lg },
  studentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  avatarText: { color: '#FFF', fontSize: fontSize.lg, fontWeight: '700' },
  studentInfo: { flex: 1 },
  studentName: { fontSize: fontSize.md, fontWeight: '500' },
  chevron: { fontSize: 20, fontWeight: '300' },
});

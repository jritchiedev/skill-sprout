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
import { deleteStudentMessage } from '@/src/utils/messages';
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
    const message = deleteStudentMessage(student.name, count);

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
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={item.name}
        accessibilityHint="Tap to view details"
      >
        <View style={[styles.avatar, { backgroundColor: item.avatarColor }]}>
          <Text style={styles.avatarText}>{item.name.charAt(0).toUpperCase()}</Text>
        </View>
        <View style={styles.studentInfo}>
          <Text style={[styles.studentName, { color: theme.text }]}>{item.name}</Text>
        </View>
        <TouchableOpacity
          onPress={() => handleDelete(item)}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          style={styles.deleteBtn}
          accessibilityRole="button"
          accessibilityLabel={`Delete ${item.name}`}
        >
          <Text style={[styles.deleteBtnText, { color: theme.textTertiary }]}>×</Text>
        </TouchableOpacity>
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
  deleteBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.sm,
  },
  deleteBtnText: { fontSize: 22, fontWeight: '300', lineHeight: 24 },
});

import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Alert,
  KeyboardAvoidingView, Platform, Modal,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useTheme } from '@/src/hooks/useTheme';
import { getAllPassages, createPassage, updatePassage, deletePassage } from '@/src/db';
import { Passage } from '@/src/types/models';
import { EmptyState } from '@/src/components/EmptyState';
import { Button } from '@/src/components/Button';
import { spacing, fontSize, borderRadius, minTouchTarget } from '@/src/theme';

export default function ManagePassagesScreen() {
  const theme = useTheme();
  const [passages, setPassages] = useState<Passage[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [titleText, setTitleText] = useState('');
  const [wordCountText, setWordCountText] = useState('');

  useFocusEffect(
    useCallback(() => {
      loadPassages();
    }, [])
  );

  async function loadPassages() {
    setPassages(await getAllPassages());
  }

  function openNew() {
    setEditingId(null);
    setTitleText('');
    setWordCountText('');
    setShowForm(true);
  }

  function openEdit(passage: Passage) {
    setEditingId(passage.id);
    setTitleText(passage.title);
    setWordCountText(String(passage.wordCount));
    setShowForm(true);
  }

  async function handleSave() {
    const title = titleText.trim();
    const wordCount = parseInt(wordCountText, 10);

    if (!title) {
      Alert.alert('Title Required', 'Please enter a passage title.');
      return;
    }
    if (!wordCount || wordCount <= 0) {
      Alert.alert('Word Count Required', 'Please enter a valid word count.');
      return;
    }

    if (editingId) {
      await updatePassage(editingId, title, wordCount);
    } else {
      await createPassage(title, wordCount);
    }

    setShowForm(false);
    await loadPassages();
  }

  async function handleDelete(passage: Passage) {
    Alert.alert('Delete Passage', `Delete "${passage.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const result = await deletePassage(passage.id);
          if (result.blocked) {
            Alert.alert(
              'Cannot Delete',
              'This passage has saved reading attempts. It cannot be deleted while history references it.'
            );
            return;
          }
          await loadPassages();
        },
      },
    ]);
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <FlatList
        data={passages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <EmptyState
            icon="📚"
            title="No Passages"
            message="Add passages to quickly start fluency readings with pre-filled word counts."
          />
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.row, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
            onPress={() => openEdit(item)}
            onLongPress={() => handleDelete(item)}
            activeOpacity={0.7}
          >
            <View>
              <Text style={[styles.rowTitle, { color: theme.text }]}>{item.title}</Text>
              <Text style={[styles.rowWords, { color: theme.textSecondary }]}>
                {item.wordCount} words
              </Text>
            </View>
          </TouchableOpacity>
        )}
        ListFooterComponent={
          <Button title="Add Passage" onPress={openNew} style={{ marginTop: spacing.md }} />
        }
      />

      <Modal visible={showForm} animationType="slide" transparent>
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.modalOverlayFill} />
          <View style={[styles.modalContent, { backgroundColor: theme.background, borderColor: theme.border }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              {editingId ? 'Edit Passage' : 'New Passage'}
            </Text>
            <TextInput
              placeholder="Passage title"
              placeholderTextColor={theme.textTertiary}
              value={titleText}
              onChangeText={setTitleText}
              style={[styles.input, { color: theme.text, backgroundColor: theme.surface, borderColor: theme.border }]}
              autoFocus
            />
            <TextInput
              placeholder="Word count"
              placeholderTextColor={theme.textTertiary}
              value={wordCountText}
              onChangeText={setWordCountText}
              keyboardType="number-pad"
              returnKeyType="done"
              onSubmitEditing={handleSave}
              style={[styles.input, { color: theme.text, backgroundColor: theme.surface, borderColor: theme.border }]}
            />
            <View style={styles.modalActions}>
              <Button
                title="Cancel"
                variant="ghost"
                onPress={() => setShowForm(false)}
                style={{ flex: 1, marginRight: spacing.sm }}
              />
              <Button title="Save" onPress={handleSave} style={{ flex: 1 }} />
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { padding: spacing.md },
  row: {
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    marginBottom: spacing.sm,
  },
  rowTitle: { fontSize: fontSize.md, fontWeight: '600' },
  rowWords: { fontSize: fontSize.sm, marginTop: 2 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalOverlayFill: {
    flex: 1,
  },
  modalContent: {
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    borderWidth: 1,
    borderBottomWidth: 0,
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  modalTitle: { fontSize: fontSize.xl, fontWeight: '700', marginBottom: spacing.lg },
  input: {
    minHeight: minTouchTarget,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    fontSize: fontSize.md,
    marginBottom: spacing.md,
  },
  modalActions: { flexDirection: 'row', marginTop: spacing.sm },
});

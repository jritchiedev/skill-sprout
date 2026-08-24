import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/src/hooks/useTheme';
import { fontSize, spacing } from '@/src/theme';

interface EmptyStateProps {
  icon: string;
  title: string;
  message: string;
}

export function EmptyState({ icon, title, message }: EmptyStateProps) {
  const theme = useTheme();
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={[styles.title, { color: theme.textSecondary }]}>{title}</Text>
      <Text style={[styles.message, { color: theme.textTertiary }]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.xl,
  },
  icon: {
    fontSize: 36,
    marginBottom: spacing.md,
    opacity: 0.5,
  },
  title: {
    fontSize: fontSize.md,
    fontWeight: '600',
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  message: {
    fontSize: fontSize.sm,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 280,
  },
});

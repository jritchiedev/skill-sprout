import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/src/hooks/useTheme';
import { borderRadius, fontSize, spacing } from '@/src/theme';

interface StatBoxProps {
  label: string;
  value: string | number;
  unit?: string;
  highlight?: boolean;
}

export function StatBox({ label, value, unit, highlight }: StatBoxProps) {
  const theme = useTheme();
  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: highlight ? theme.primaryLight : theme.surface,
        },
      ]}
    >
      <Text style={[styles.label, { color: theme.textSecondary }]}>{label}</Text>
      <View style={styles.valueRow}>
        <Text
          style={[
            styles.value,
            { color: highlight ? theme.primary : theme.text },
          ]}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.6}
        >
          {value}
          {unit ? (
            <Text style={[styles.unit, { color: theme.textSecondary }]}> {unit}</Text>
          ) : null}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    flex: 1,
  },
  label: {
    fontSize: fontSize.xs,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  value: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  unit: {
    fontSize: fontSize.sm,
    fontWeight: '500',
    marginLeft: 2,
  },
});

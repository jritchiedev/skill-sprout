import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '@/src/hooks/useTheme';
import { borderRadius, fontSize, spacing, minTouchTarget } from '@/src/theme';

interface NumberInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  showStepper?: boolean;
  accessibilityLabel?: string;
}

export function NumberInput({
  label,
  value,
  onChange,
  min = 0,
  max,
  showStepper = true,
  accessibilityLabel,
}: NumberInputProps) {
  const theme = useTheme();

  const clamp = (v: number) => {
    let result = Math.max(min, v);
    if (max !== undefined) result = Math.min(max, result);
    return result;
  };

  const handleTextChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '');
    if (cleaned === '') {
      onChange(0);
      return;
    }
    onChange(clamp(parseInt(cleaned, 10)));
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: theme.textSecondary }]}>{label}</Text>
      <View style={styles.row}>
        {showStepper && (
          <TouchableOpacity
            onPress={() => onChange(clamp(value - 1))}
            style={[styles.stepper, { backgroundColor: theme.surface }]}
            accessibilityLabel={`Decrease ${label}`}
            accessibilityRole="button"
          >
            <Text style={[styles.stepperText, { color: theme.text }]}>{"−"}</Text>
          </TouchableOpacity>
        )}
        <TextInput
          value={String(value)}
          onChangeText={handleTextChange}
          keyboardType="number-pad"
          style={[
            styles.input,
            {
              color: theme.text,
              backgroundColor: theme.surface,
            },
          ]}
          accessibilityLabel={accessibilityLabel ?? label}
          selectTextOnFocus
        />
        {showStepper && (
          <TouchableOpacity
            onPress={() => onChange(clamp(value + 1))}
            style={[styles.stepper, { backgroundColor: theme.surface }]}
            accessibilityLabel={`Increase ${label}`}
            accessibilityRole="button"
          >
            <Text style={[styles.stepperText, { color: theme.text }]}>+</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: '500',
    marginBottom: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    minHeight: minTouchTarget,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    fontSize: fontSize.lg,
    fontWeight: '600',
    textAlign: 'center',
  },
  stepper: {
    width: minTouchTarget,
    height: minTouchTarget,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperText: {
    fontSize: fontSize.xl,
    fontWeight: '500',
  },
});

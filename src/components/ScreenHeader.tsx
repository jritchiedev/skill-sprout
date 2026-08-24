import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/src/hooks/useTheme';
import { spacing, fontSize, typography } from '@/src/theme';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  /** Optional text button on the trailing edge, e.g. "Manage". */
  action?: { label: string; onPress: () => void };
}

/**
 * The single header idiom for tab screens. The tab navigator's own header is
 * turned off, so this owns the top inset -- otherwise a screen with a title of
 * its own ends up stacked under a native bar saying the same thing.
 */
export function ScreenHeader({ title, subtitle, action }: ScreenHeaderProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.sm }]}>
      <View style={styles.titleBlock}>
        <Text
          style={[styles.title, { color: theme.text }]}
          numberOfLines={1}
          accessibilityRole="header"
        >
          {title}
        </Text>
        {subtitle ? (
          <Text style={[styles.subtitle, { color: theme.textTertiary }]} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {action ? (
        <TouchableOpacity
          onPress={action.onPress}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          accessibilityRole="button"
        >
          <Text style={[styles.action, { color: theme.primary }]}>{action.label}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    gap: spacing.md,
  },
  titleBlock: { flex: 1 },
  title: typography.screenTitle,
  subtitle: { fontSize: fontSize.sm, marginTop: 2 },
  action: { fontSize: fontSize.md, fontWeight: '500' },
});

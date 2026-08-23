import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/src/hooks/useTheme';
import { APP_NAME, APP_VERSION } from '@/src/constants/app';
import { spacing, fontSize, borderRadius, minTouchTarget } from '@/src/theme';

export default function MoreTab() {
  const theme = useTheme();
  const router = useRouter();

  const items = [
    { label: 'Manage Passages', icon: '📚', route: '/passages/manage' as const },
    { label: 'Privacy Policy', icon: '🔒', route: '/privacy' as const },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.content}>
        {items.map((item) => (
          <TouchableOpacity
            key={item.label}
            style={[styles.row, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
            onPress={() => router.push(item.route)}
            activeOpacity={0.7}
            accessibilityRole="button"
          >
            <Text style={styles.rowIcon}>{item.icon}</Text>
            <Text style={[styles.rowLabel, { color: theme.text }]}>{item.label}</Text>
            <Text style={[styles.rowChevron, { color: theme.textTertiary }]}>›</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: theme.textTertiary }]}>
          {APP_NAME} v{APP_VERSION}
        </Text>
        <Text style={[styles.footerText, { color: theme.textTertiary }]}>
          All data stored locally on your device
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.md },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    marginBottom: spacing.sm,
    minHeight: minTouchTarget,
  },
  rowIcon: { fontSize: 22, marginRight: spacing.md },
  rowLabel: { fontSize: fontSize.md, fontWeight: '500', flex: 1 },
  rowChevron: { fontSize: 24, fontWeight: '300' },
  footer: { flex: 1, justifyContent: 'flex-end', alignItems: 'center', paddingBottom: spacing.xxl },
  footerText: { fontSize: fontSize.xs, marginBottom: spacing.xs },
});

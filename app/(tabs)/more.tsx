import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/src/hooks/useTheme';
import { ScreenHeader } from '@/src/components/ScreenHeader';
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
      <ScreenHeader title="More" />
      <View style={styles.content}>
        {items.map((item, index) => (
          <TouchableOpacity
            key={item.label}
            style={[
              styles.row,
              { backgroundColor: theme.card, borderColor: theme.cardBorder },
              index === 0 && styles.rowFirst,
              index === items.length - 1 && styles.rowLast,
              index > 0 && styles.rowDivided,
            ]}
            onPress={() => router.push(item.route)}
            activeOpacity={0.6}
            accessibilityRole="button"
          >
            <Text style={styles.rowIcon}>{item.icon}</Text>
            <Text style={[styles.rowLabel, { color: theme.text }]}>{item.label}</Text>
            <Text style={[styles.rowChevron, { color: theme.textTertiary }]}>{'›'}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.footer}>
        <Text style={[styles.footerAppName, { color: theme.textTertiary }]}>
          🌱 {APP_NAME}
        </Text>
        <Text style={[styles.footerText, { color: theme.textTertiary }]}>
          Version {APP_VERSION}
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
  content: { paddingHorizontal: spacing.lg },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    minHeight: minTouchTarget,
    borderLeftWidth: StyleSheet.hairlineWidth,
    borderRightWidth: StyleSheet.hairlineWidth,
  },
  rowFirst: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopLeftRadius: borderRadius.lg,
    borderTopRightRadius: borderRadius.lg,
  },
  rowLast: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomLeftRadius: borderRadius.lg,
    borderBottomRightRadius: borderRadius.lg,
  },
  rowDivided: { borderTopWidth: StyleSheet.hairlineWidth },
  rowIcon: { fontSize: 18, marginRight: spacing.md },
  rowLabel: { fontSize: fontSize.md, fontWeight: '400', flex: 1 },
  rowChevron: { fontSize: 18, fontWeight: '300' },
  footer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: spacing.xxl,
  },
  footerAppName: { fontSize: fontSize.sm, fontWeight: '600', marginBottom: spacing.xs },
  footerText: { fontSize: fontSize.xs, marginBottom: spacing.xs },
});

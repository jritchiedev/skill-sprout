import React from 'react';
import { ScrollView, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/src/hooks/useTheme';
import { APP_NAME } from '@/src/constants/app';
import { spacing, fontSize } from '@/src/theme';

export default function PrivacyScreen() {
  const theme = useTheme();

  return (
    <ScrollView
      style={{ backgroundColor: theme.background }}
      contentContainerStyle={styles.content}
    >
      <Text style={[styles.heading, { color: theme.text }]}>Privacy Policy</Text>

      <Text style={[styles.body, { color: theme.textSecondary }]}>
        {APP_NAME} is designed with privacy as a priority, especially because it may be used with children.
      </Text>

      <Text style={[styles.subheading, { color: theme.text }]}>Local-First Storage</Text>
      <Text style={[styles.body, { color: theme.textSecondary }]}>
        All data — including student names, passage information, and reading results — is stored
        entirely on your device. No data is transmitted to any external server.
      </Text>

      <Text style={[styles.subheading, { color: theme.text }]}>No Account Required</Text>
      <Text style={[styles.body, { color: theme.textSecondary }]}>
        {APP_NAME} does not require you to create an account, sign in, or provide any personal
        information to use the app.
      </Text>

      <Text style={[styles.subheading, { color: theme.text }]}>No Tracking or Analytics</Text>
      <Text style={[styles.body, { color: theme.textSecondary }]}>
        {APP_NAME} does not include advertising SDKs, third-party analytics, or tracking of any kind.
        We do not collect usage data, location information, or device identifiers.
      </Text>

      <Text style={[styles.subheading, { color: theme.text }]}>Minimal Data Collection</Text>
      <Text style={[styles.body, { color: theme.textSecondary }]}>
        The only information stored is what you explicitly enter: student display names, passage
        titles, word counts, and reading results. No birth dates, school names, addresses, or
        other sensitive personal information is collected.
      </Text>

      <Text style={[styles.subheading, { color: theme.text }]}>Data Deletion</Text>
      <Text style={[styles.body, { color: theme.textSecondary }]}>
        You can delete any student or passage data at any time from within the app. Uninstalling
        the app removes all data permanently.
      </Text>

      <Text style={[styles.subheading, { color: theme.text }]}>Future Updates</Text>
      <Text style={[styles.body, { color: theme.textSecondary }]}>
        If future versions introduce optional cloud sync or other network features, they will
        require explicit opt-in consent. This privacy policy will be updated to reflect any changes.
      </Text>

      <Text style={[styles.disclaimer, { color: theme.textTertiary }]}>
        This privacy statement describes the current behavior of {APP_NAME}. It does not constitute
        a claim of compliance with any specific regulatory framework such as COPPA, FERPA, or GDPR.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.md, paddingBottom: spacing.xxl },
  heading: { fontSize: fontSize.xxl, fontWeight: '700', marginBottom: spacing.md },
  subheading: { fontSize: fontSize.lg, fontWeight: '600', marginTop: spacing.lg, marginBottom: spacing.xs },
  body: { fontSize: fontSize.md, lineHeight: 24 },
  disclaimer: { fontSize: fontSize.sm, fontStyle: 'italic', marginTop: spacing.xl, lineHeight: 20 },
});

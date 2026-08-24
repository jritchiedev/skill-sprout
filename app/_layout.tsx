import React, { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme, ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { getDatabase } from '@/src/db/database';
import { lightTheme, darkTheme, fontSize } from '@/src/theme';

export { ErrorBoundary } from 'expo-router';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? darkTheme : lightTheme;
  const [ready, setReady] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);

  useEffect(() => {
    getDatabase()
      .then(() => setReady(true))
      .catch((error: unknown) => {
        // Without this the splash screen never hides and the app sits on a
        // spinner forever with no explanation.
        setInitError(error instanceof Error ? error.message : String(error));
      })
      .finally(() => SplashScreen.hideAsync());
  }, []);

  if (initError) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <Text style={[styles.errorTitle, { color: theme.text }]}>Couldn't open Skill Sprout</Text>
        <Text style={[styles.errorBody, { color: theme.textSecondary }]}>{initError}</Text>
      </View>
    );
  }

  if (!ready) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="auto" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: theme.background },
          headerTintColor: theme.primary,
          headerTitleStyle: { fontSize: fontSize.md, fontWeight: '600', color: theme.text },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: theme.background },
          headerBackTitle: 'Back',
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="fluency/session"
          options={{ headerShown: false, gestureEnabled: false }}
        />
        <Stack.Screen
          name="fluency/review"
          options={{ title: 'Review' }}
        />
        <Stack.Screen
          name="fluency/results"
          options={{ title: 'Results', headerBackVisible: false, gestureEnabled: false }}
        />
        <Stack.Screen
          name="students/[id]"
          options={{ title: '' }}
        />
        <Stack.Screen
          name="passages/manage"
          options={{ title: 'Passages' }}
        />
        <Stack.Screen
          name="privacy"
          options={{ title: 'Privacy' }}
        />
      </Stack>
    </>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  errorTitle: { fontSize: 17, fontWeight: '600', marginBottom: 8, textAlign: 'center' },
  errorBody: { fontSize: 14, textAlign: 'center' },
});

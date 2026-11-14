import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useSyncExternalStore } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useTheme } from '@/components/ui';
import { APP_FONTS } from '@/lib/fonts';
import { useStore } from '@/lib/store';

SplashScreen.preventAutoHideAsync().catch(() => {});

const subscribeHydration = (cb: () => void) => useStore.persist.onFinishHydration(cb);
const getHydrated = () => useStore.persist.hasHydrated();

function useHydrated() {
  return useSyncExternalStore(subscribeHydration, getHydrated, getHydrated);
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts(APP_FONTS);
  const hydrated = useHydrated();
  const ready = (fontsLoaded || !!fontError) && hydrated;

  useEffect(() => {
    if (ready) SplashScreen.hideAsync().catch(() => {});
  }, [ready]);

  if (!ready) return null;
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemedStack />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

function ThemedStack() {
  const t = useTheme();
  return (
    <>
      <StatusBar style={t.dark ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: t.c.bg }, animation: 'slide_from_right' }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="onboarding" options={{ animation: 'fade' }} />
        <Stack.Screen name="workout" options={{ animation: 'slide_from_bottom', gestureEnabled: false }} />
        <Stack.Screen name="picker" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
        <Stack.Screen name="summary/[id]" options={{ animation: 'fade', gestureEnabled: false }} />
      </Stack>
    </>
  );
}

import { Redirect, Tabs } from 'expo-router';
import { Platform } from 'react-native';

import { Icon } from '@/components/icons';
import { useTheme } from '@/components/ui';
import { useStore } from '@/lib/store';

export default function TabLayout() {
  const t = useTheme();
  const onboarded = useStore((s) => s.onboarded);
  if (!onboarded) return <Redirect href="/onboarding" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: t.dark ? t.c.accent : t.c.accent,
        tabBarInactiveTintColor: t.c.muted,
        tabBarStyle: { backgroundColor: t.c.nav, borderTopColor: t.c.border, ...(Platform.OS === 'web' ? { height: 64, paddingBottom: 8 } : null) },
        tabBarLabelStyle: { fontFamily: t.fonts.semibold, fontSize: 11, lineHeight: 14 },
        sceneStyle: { backgroundColor: t.c.bg },
      }}>
      <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: ({ color }) => <Icon name="home" color={String(color)} size={24} /> }} />
      <Tabs.Screen name="history" options={{ title: 'History', tabBarIcon: ({ color }) => <Icon name="calendar" color={String(color)} size={24} /> }} />
      <Tabs.Screen name="progress" options={{ title: 'Progress', tabBarIcon: ({ color }) => <Icon name="chart" color={String(color)} size={24} /> }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: ({ color }) => <Icon name="user" color={String(color)} size={24} /> }} />
    </Tabs>
  );
}

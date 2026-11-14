import { router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { Icon } from '@/components/icons';
import { Header, Screen, T, useTheme } from '@/components/ui';
import { useStore } from '@/lib/store';
import { THEMES, type AppTheme } from '@/lib/themes';

export default function Themes() {
  const t = useTheme();
  const current = useStore((s) => s.settings.themeId);
  const update = useStore((s) => s.updateSettings);
  return (
    <Screen header={<Header title="Theme" onBack={() => router.back()} />}>
      <T v="small">Pick the look you like. Everything works the same in every theme.</T>
      {THEMES.map((th) => (
        <ThemeCard key={th.id} th={th} selected={th.id === current} onPress={() => update({ themeId: th.id })} borderColor={t.c.border} ring={t.c.accent} />
      ))}
    </Screen>
  );
}

function ThemeCard({ th, selected, onPress, borderColor, ring }: { th: AppTheme; selected: boolean; onPress: () => void; borderColor: string; ring: string }) {
  const r = Math.max(2, Math.round(16 * th.radius));
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityLabel={`${th.name}. ${th.description}`}
      onPress={onPress}
      style={({ pressed }) => ({ borderRadius: r + 3, borderWidth: 3, borderColor: selected ? ring : 'transparent', opacity: pressed ? 0.85 : 1 })}>
      <View style={{ borderRadius: r, overflow: 'hidden', borderWidth: 1, borderColor }}>
        <View style={{ backgroundColor: th.c.band, paddingHorizontal: 16, paddingTop: 14, paddingBottom: 12 }}>
          <Text style={{ fontFamily: th.fonts.display, fontSize: 28, color: th.c.bandText, textTransform: th.upper && th.id !== 'lash' ? 'uppercase' : 'none' }}>{th.name}</Text>
        </View>
        <View style={{ backgroundColor: th.c.bg, padding: 14, gap: 10 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: th.c.surface, borderRadius: Math.max(2, Math.round(12 * th.radius)), padding: 10, borderWidth: th.cardBorder ? 1 : 0, borderColor: th.c.border }}>
            <Text style={{ flex: 1, fontFamily: th.fonts.regular, fontSize: 13, color: th.c.muted }} numberOfLines={2}>
              {th.description}
            </Text>
            <View style={{ height: 34, paddingHorizontal: 12, borderRadius: th.pill ? 999 : Math.max(2, Math.round(10 * th.radius)), backgroundColor: th.c.accent, justifyContent: 'center' }}>
              <Text style={{ fontFamily: th.fonts.bold, fontSize: 12, color: th.c.onAccent }}>{selected ? 'Active' : 'Use'}</Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', gap: 6 }}>
            {[th.c.tint, th.c.accent, th.c.surface2].map((c, i) => (
              <View key={i} style={{ flex: 1, height: 28, borderRadius: Math.max(2, Math.round(8 * th.radius)), backgroundColor: c, alignItems: 'center', justifyContent: 'center' }}>
                {i === 1 && <Icon name="check" size={14} color={th.c.onAccent} strokeWidth={3} />}
              </View>
            ))}
          </View>
        </View>
      </View>
    </Pressable>
  );
}

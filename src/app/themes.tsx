import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { Icon } from '@/components/icons';
import { Appear, Button, Header, Row, Screen, T, useTheme } from '@/components/ui';
import { ICON_PREVIEWS } from '@/data/iconPreviews';
import { appIconSupported } from '@/lib/appIcon';
import { useStore } from '@/lib/store';
import { THEMES, themeFromSpec, type AppTheme } from '@/lib/themes';

export default function Themes() {
  const t = useTheme();
  const current = useStore((s) => s.settings.themeId);
  const customs = useStore((s) => s.customThemes);
  const update = useStore((s) => s.updateSettings);
  return (
    <Screen header={<Header title="Theme" onBack={() => router.back()} />}>
      <T v="small">
        Pick the look you like. Everything works the same in every theme.
        {appIconSupported ? ' The app icon on your home screen changes to match after you leave the app.' : ''}
      </T>

      <Appear>
        <Button label="Create your own theme" icon="plus" kind="outline" onPress={() => router.push('/theme-builder')} />
      </Appear>

      {customs.length > 0 && <T v="label">Your themes</T>}
      {customs.map((sp, i) => (
        <Appear key={sp.id} i={i}>
          <ThemeCard
            th={themeFromSpec(sp)}
            selected={sp.id === current}
            onPress={() => update({ themeId: sp.id })}
            onEdit={() => router.push({ pathname: '/theme-builder', params: { id: sp.id } })}
            ring={t.c.accent}
            border={t.c.border}
          />
        </Appear>
      ))}

      <T v="label">Built in</T>
      {THEMES.map((th, i) => (
        <Appear key={th.id} i={i}>
          <ThemeCard th={th} selected={th.id === current} onPress={() => update({ themeId: th.id })} ring={t.c.accent} border={t.c.border} />
        </Appear>
      ))}
    </Screen>
  );
}

function ThemeCard({
  th,
  selected,
  onPress,
  onEdit,
  ring,
  border,
}: {
  th: AppTheme;
  selected: boolean;
  onPress: () => void;
  onEdit?: () => void;
  ring: string;
  border: string;
}) {
  const r = Math.max(2, Math.round(16 * th.radius));
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityLabel={`${th.name}. ${th.description}`}
      onPress={onPress}
      style={({ pressed }) => ({ borderRadius: r + 3, borderWidth: 3, borderColor: selected ? ring : 'transparent', opacity: pressed ? 0.9 : 1 })}>
      <View style={{ borderRadius: r, overflow: 'hidden', borderWidth: 1, borderColor: border }}>
        <View
          style={{
            backgroundColor: th.c.band,
            paddingHorizontal: 16,
            paddingTop: 14,
            paddingBottom: 12,
            minHeight: th.image ? 90 : undefined,
            justifyContent: 'flex-end',
          }}>
          {th.image ? (
            <>
              <Image source={{ uri: th.image }} style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }} contentFit="cover" />
              <View
                style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: `rgba(0,0,0,${th.imageOverlay ?? 0.4})` }}
              />
            </>
          ) : null}
          <Row style={{ justifyContent: 'space-between' }}>
            <Text
              numberOfLines={1}
              style={{
                flex: 1,
                fontFamily: th.fonts.display,
                fontSize: 28,
                color: th.c.bandText,
                textTransform: th.upper && th.id !== 'lash' ? 'uppercase' : 'none',
              }}>
              {th.name}
            </Text>
            {ICON_PREVIEWS[th.iconId] ? (
              <Image source={ICON_PREVIEWS[th.iconId]} style={{ width: 34, height: 34 }} accessibilityLabel="App icon" />
            ) : null}
          </Row>
        </View>
        <View style={{ backgroundColor: th.c.bg, padding: 14, gap: 10 }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 10,
              backgroundColor: th.c.surface,
              borderRadius: Math.max(2, Math.round(12 * th.radius)),
              padding: 10,
              borderWidth: th.cardBorder ? 1 : 0,
              borderColor: th.c.border,
            }}>
            <Text style={{ flex: 1, fontFamily: th.fonts.regular, fontSize: 13, color: th.c.muted }} numberOfLines={2}>
              {th.description}
            </Text>
            <View
              style={{
                minHeight: 34,
                paddingHorizontal: 12,
                borderRadius: th.pill ? 999 : Math.max(2, Math.round(10 * th.radius)),
                backgroundColor: th.c.accent,
                justifyContent: 'center',
              }}>
              <Text style={{ fontFamily: th.fonts.bold, fontSize: 12, color: th.c.onAccent }}>{selected ? 'Active' : 'Use'}</Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', gap: 6 }}>
            {[th.c.tint, th.c.accent, th.c.surface2].map((c, i) => (
              <View
                key={i}
                style={{
                  flex: 1,
                  height: 28,
                  borderRadius: Math.max(2, Math.round(8 * th.radius)),
                  backgroundColor: c,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                {i === 1 && <Icon name="check" size={14} color={th.c.onAccent} strokeWidth={3} />}
              </View>
            ))}
            {onEdit && (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Edit ${th.name}`}
                onPress={onEdit}
                hitSlop={6}
                style={{
                  height: 28,
                  paddingHorizontal: 12,
                  borderRadius: 14,
                  backgroundColor: th.c.surface,
                  justifyContent: 'center',
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 4,
                }}>
                <Icon name="edit" size={13} color={th.c.text} />
                <Text style={{ color: th.c.text, fontFamily: th.fonts.semibold, fontSize: 12 }}>Edit</Text>
              </Pressable>
            )}
          </View>
        </View>
      </View>
    </Pressable>
  );
}

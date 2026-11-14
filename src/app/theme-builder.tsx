import { File, Paths } from 'expo-file-system';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import { Icon } from '@/components/icons';
import { Appear, Button, Card, Chip, Field, Header, Row, Screen, Segmented, T, rad, useTheme } from '@/components/ui';
import { ICON_PREVIEWS } from '@/data/iconPreviews';
import { appIconSupported } from '@/lib/appIcon';
import { uid } from '@/lib/calc';
import { useStore } from '@/lib/store';
import { HEADING_FONTS, ICON_IDS, contrast, ensureContrast, isHex, normHex, themeFromSpec, type AppTheme } from '@/lib/themes';
import type { CustomThemeSpec } from '@/lib/types';

const PRESETS = {
  dark: { bg: '#111318', surface: '#1B1E25', accent: '#7C9CFF' },
  light: { bg: '#F4F2EE', surface: '#FFFFFF', accent: '#E0552B' },
};
const BG_SWATCHES = ['#0E0F11', '#111318', '#0B1F2A', '#1D1328', '#14231A', '#F4F2EE', '#FFFFFF', '#EEF1F5', '#FBF0E6', '#F3EAF6'];
const SURFACE_SWATCHES = ['#17191C', '#1B1E25', '#12303F', '#2A1D38', '#1E3326', '#FFFFFF', '#F7F7F7', '#FFF8F0', '#E9EEF5', '#FCF4FF'];
const ACCENT_SWATCHES = [
  '#C6F432',
  '#7C9CFF',
  '#2DD4BF',
  '#FF8A3D',
  '#FF2BD6',
  '#FFD23F',
  '#E0552B',
  '#C62414',
  '#3152DB',
  '#1F5C3A',
  '#7B2CBF',
  '#0A0A0A',
];
const CORNERS = [
  { label: 'Square', value: 0.25 },
  { label: 'Soft', value: 1 },
  { label: 'Round', value: 1.4 },
  { label: 'Pill', value: 1.8 },
];

export default function ThemeBuilder() {
  const t = useTheme();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const existing = useStore((s) => s.customThemes.find((x) => x.id === id));
  const save = useStore((s) => s.saveCustomTheme);
  const remove = useStore((s) => s.deleteCustomTheme);
  const update = useStore((s) => s.updateSettings);

  const [spec, setSpec] = useState<CustomThemeSpec>(
    existing ?? {
      id: 'custom-' + uid(),
      name: 'My theme',
      dark: true,
      ...PRESETS.dark,
      headingFont: HEADING_FONTS[0]!.key,
      radius: 1,
      image: null,
      imageOverlay: 0.45,
      iconId: 'night',
    },
  );
  const set = (p: Partial<CustomThemeSpec>) => setSpec((s) => ({ ...s, ...p }));
  const preview = themeFromSpec(spec);

  const accentOnBg = contrast(spec.accent, spec.bg);
  const btnText = contrast(preview.c.onAccent, spec.accent);
  const textOk = contrast(preview.c.text, spec.surface) >= 4.5;

  const pickImage = async () => {
    try {
      const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [16, 9], quality: 0.8 });
      if (res.canceled || !res.assets?.[0]) return;
      let uri = res.assets[0].uri;
      if (Platform.OS !== 'web') {
        // keep our own copy so the picture survives the photo being deleted
        const dest = new File(Paths.document, `theme-${spec.id}-${Date.now()}.jpg`);
        new File(uri).copySync(dest, { overwrite: true });
        uri = dest.uri;
      }
      set({ image: uri });
    } catch (e) {
      Alert.alert('Could not use that picture', String(e));
    }
  };

  const doSave = (use: boolean) => {
    const clean: CustomThemeSpec = { ...spec, name: spec.name.trim() || 'My theme', dark: preview.dark };
    save(clean);
    if (use) update({ themeId: clean.id });
    router.back();
  };

  const fixAccent = () => set({ accent: ensureContrast(spec.accent, spec.bg, 3) });

  return (
    <Screen
      header={<Header title={existing ? 'Edit theme' : 'Create theme'} onBack={() => router.back()} />}
      footer={
        <View style={{ padding: 16, paddingTop: 8, gap: 6, borderTopWidth: 1, borderTopColor: t.c.border }}>
          <Button label="Save and use" onPress={() => doSave(true)} />
          <Row gap={8}>
            <Button label="Save" kind="secondary" small style={{ flex: 1 }} onPress={() => doSave(false)} />
            {existing && (
              <Button
                label="Delete"
                kind="danger"
                small
                style={{ flex: 1 }}
                onPress={() =>
                  Alert.alert(`Delete ${existing.name}?`, undefined, [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Delete',
                      style: 'destructive',
                      onPress: () => {
                        remove(existing.id);
                        router.back();
                      },
                    },
                  ])
                }
              />
            )}
          </Row>
        </View>
      }>
      <Appear>
        <Preview th={preview} />
      </Appear>

      <Field label="Name" value={spec.name} onChangeText={(v) => set({ name: v })} placeholder="My theme" maxLength={24} />

      <View style={{ gap: 8 }}>
        <T v="label">Start from</T>
        <Segmented
          options={[
            { key: 'dark', label: 'Dark' },
            { key: 'light', label: 'Light' },
          ]}
          value={preview.dark ? 'dark' : 'light'}
          onChange={(k) => set({ ...PRESETS[k], dark: k === 'dark' })}
        />
      </View>

      <ColorRow label="Background" value={spec.bg} swatches={BG_SWATCHES} onChange={(v) => set({ bg: v })} />
      <ColorRow label="Cards" value={spec.surface} swatches={SURFACE_SWATCHES} onChange={(v) => set({ surface: v })} />
      <ColorRow label="Accent (buttons, ticks)" value={spec.accent} swatches={ACCENT_SWATCHES} onChange={(v) => set({ accent: v })} />

      <Card style={{ gap: 8 }}>
        <T v="title">Readability check</T>
        <Check ok={textOk} label="Text on cards" />
        <Check ok={btnText >= 4.5} label="Text on buttons" />
        <Check ok={accentOnBg >= 3} label="Accent stands out from the background" />
        {accentOnBg < 3 && <Button label="Fix the accent for me" small kind="secondary" onPress={fixAccent} />}
        <T v="small" style={{ fontSize: 12 }}>
          Text colours are picked automatically so they stay readable on your colours.
        </T>
      </Card>

      <View style={{ gap: 8 }}>
        <T v="label">Heading font</T>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          {HEADING_FONTS.map((f) => {
            const sel = spec.headingFont === f.key;
            return (
              <Pressable
                key={f.key}
                accessibilityRole="radio"
                accessibilityState={{ selected: sel }}
                accessibilityLabel={f.label}
                onPress={() => set({ headingFont: f.key })}
                style={{
                  minWidth: 92,
                  height: 64,
                  paddingHorizontal: 12,
                  borderRadius: rad(t, 12),
                  borderWidth: sel ? 2 : 1,
                  borderColor: sel ? t.c.accent : t.c.border,
                  backgroundColor: t.c.surface,
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 2,
                }}>
                <Text style={{ fontFamily: f.key, fontSize: 22, color: t.c.text, textTransform: f.upper ? 'uppercase' : 'none' }}>Lift</Text>
                <Text style={{ fontFamily: t.fonts.medium, fontSize: 11, color: t.c.muted }}>{f.label}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <View style={{ gap: 8 }}>
        <T v="label">Corners</T>
        <Row gap={8} style={{ flexWrap: 'wrap' }}>
          {CORNERS.map((c) => (
            <Chip key={c.label} label={c.label} selected={Math.abs(spec.radius - c.value) < 0.01} onPress={() => set({ radius: c.value })} />
          ))}
        </Row>
      </View>

      <View style={{ gap: 8 }}>
        <T v="label">Header picture</T>
        <Row gap={8}>
          <Button
            label={spec.image ? 'Change picture' : 'Choose from photos'}
            icon="image"
            kind="secondary"
            small
            style={{ flex: 1 }}
            onPress={pickImage}
          />
          {spec.image && <Button label="Remove" kind="ghost" small onPress={() => set({ image: null })} />}
        </Row>
        {spec.image && (
          <>
            <T v="small">Darken the picture so the text stays readable</T>
            <Row gap={8} style={{ flexWrap: 'wrap' }}>
              {[0.2, 0.35, 0.5, 0.65, 0.8].map((o) => (
                <Chip
                  key={o}
                  label={`${Math.round(o * 100)}%`}
                  selected={Math.abs(spec.imageOverlay - o) < 0.01}
                  onPress={() => set({ imageOverlay: o })}
                />
              ))}
            </Row>
          </>
        )}
      </View>

      <View style={{ gap: 8 }}>
        <T v="label">App icon</T>
        {!appIconSupported && (
          <T v="small" style={{ fontSize: 12 }}>
            The home-screen icon changes in the installed Android app.
          </T>
        )}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          {ICON_IDS.map((ic) => {
            const sel = spec.iconId === ic;
            return (
              <Pressable
                key={ic}
                accessibilityRole="radio"
                accessibilityState={{ selected: sel }}
                accessibilityLabel={`${ic} icon`}
                onPress={() => set({ iconId: ic })}
                style={{ padding: 3, borderRadius: 16, borderWidth: 2.5, borderColor: sel ? t.c.accent : 'transparent' }}>
                <Image source={ICON_PREVIEWS[ic]} style={{ width: 52, height: 52 }} />
              </Pressable>
            );
          })}
        </View>
      </View>
    </Screen>
  );
}

function ColorRow({ label, value, swatches, onChange }: { label: string; value: string; swatches: string[]; onChange: (v: string) => void }) {
  const t = useTheme();
  const [text, setText] = useState(value);
  const [lastValue, setLastValue] = useState(value);
  if (value !== lastValue) {
    setLastValue(value);
    setText(value);
  }
  return (
    <View style={{ gap: 8 }}>
      <T v="label">{label}</T>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, alignItems: 'center' }}>
        {swatches.map((c) => {
          const sel = c.toUpperCase() === value.toUpperCase();
          return (
            <Pressable
              key={c}
              accessibilityRole="radio"
              accessibilityState={{ selected: sel }}
              accessibilityLabel={`Colour ${c}`}
              onPress={() => onChange(c)}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: c,
                borderWidth: sel ? 3 : 1,
                borderColor: sel ? t.c.accent : t.c.border,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              {sel && <Icon name="check" size={16} color={contrast('#FFFFFF', c) > contrast('#111111', c) ? '#FFFFFF' : '#111111'} strokeWidth={3} />}
            </Pressable>
          );
        })}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginLeft: 4 }}>
          <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: value, borderWidth: 1, borderColor: t.c.border }} />
          <TextInput
            accessibilityLabel={`${label} hex colour`}
            value={text}
            onChangeText={(v) => {
              setText(v);
              if (isHex(v)) onChange(normHex(v));
            }}
            autoCapitalize="characters"
            autoCorrect={false}
            maxLength={7}
            style={{
              width: 96,
              height: 40,
              borderRadius: rad(t, 10),
              borderWidth: 1,
              borderColor: isHex(text) ? t.c.border : t.c.danger,
              backgroundColor: t.c.surface,
              color: t.c.text,
              paddingHorizontal: 10,
              fontFamily: t.fonts.medium,
              fontSize: 14,
            }}
          />
        </View>
      </ScrollView>
    </View>
  );
}

function Check({ ok, label }: { ok: boolean; label: string }) {
  const t = useTheme();
  return (
    <Row gap={8}>
      <View
        style={{
          width: 22,
          height: 22,
          borderRadius: 11,
          backgroundColor: ok ? t.c.accent : t.c.danger,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <Icon name={ok ? 'check' : 'close'} size={13} color={ok ? t.c.onAccent : '#FFFFFF'} strokeWidth={3} />
      </View>
      <T v="small" color={t.c.text}>
        {label}: {ok ? 'good' : 'hard to read'}
      </T>
    </Row>
  );
}

/** Mini Home screen drawn with the theme being edited. */
function Preview({ th }: { th: AppTheme }) {
  const r = (n: number) => Math.max(2, Math.round(n * th.radius));
  return (
    <View style={{ borderRadius: r(18), overflow: 'hidden', borderWidth: 1, borderColor: th.c.border, backgroundColor: th.c.bg }}>
      <View style={{ backgroundColor: th.c.band, padding: 16, paddingTop: 14, minHeight: th.image ? 120 : undefined, justifyContent: 'flex-end' }}>
        {th.image ? (
          <>
            <Image source={{ uri: th.image }} style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }} contentFit="cover" />
            <View style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: `rgba(0,0,0,${th.imageOverlay ?? 0.4})` }} />
          </>
        ) : null}
        <Text style={{ fontFamily: th.fonts.semibold, fontSize: 10, letterSpacing: 1.2, color: th.c.bandMuted, textTransform: 'uppercase' }}>
          Saturday, 14 November
        </Text>
        <Text
          style={{ fontFamily: th.fonts.display, fontSize: 28, color: th.c.bandText, textTransform: th.upper ? 'uppercase' : 'none', marginTop: 4 }}>
          Ready to train?
        </Text>
      </View>
      <View style={{ padding: 14, gap: 10 }}>
        <View style={{ backgroundColor: th.c.surface, borderRadius: r(14), padding: 12, gap: 8 }}>
          <Text style={{ fontFamily: th.fonts.semibold, fontSize: 14, color: th.c.text }}>This week</Text>
          <View style={{ flexDirection: 'row', gap: 6 }}>
            {[1, 0, 1, 0, 1, 0, 0].map((d, i) => (
              <View key={i} style={{ flex: 1, height: 22, borderRadius: r(11), backgroundColor: d ? th.c.accent : th.c.surface2 }} />
            ))}
          </View>
          <Text style={{ fontFamily: th.fonts.regular, fontSize: 12, color: th.c.muted }}>3 of 4 sessions · last: Push Day</Text>
        </View>
        <View
          style={{ height: 44, borderRadius: th.pill ? 999 : r(12), backgroundColor: th.c.accent, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontFamily: th.fonts.bold, fontSize: 14, color: th.c.onAccent, textTransform: th.upper ? 'uppercase' : 'none' }}>
            Start empty workout
          </Text>
        </View>
        <View style={{ backgroundColor: th.c.tint, borderRadius: r(10), padding: 10, borderWidth: 1, borderColor: th.c.tintBorder }}>
          <Text style={{ fontFamily: th.fonts.medium, fontSize: 12, color: th.c.tintText }}>Completed set · 80 kg × 8</Text>
        </View>
      </View>
    </View>
  );
}

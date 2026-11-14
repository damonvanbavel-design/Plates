import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, View } from 'react-native';

import { Icon } from '@/components/icons';
import { Button, Card, Chip, Field, Row, Screen, Segmented, T, useTheme } from '@/components/ui';
import { fromDisplay, toDisplay } from '@/lib/calc';
import { shareCsv } from '@/lib/csv';
import { useAllExercises, useStore } from '@/lib/store';
import { getTheme } from '@/lib/themes';
import type { Sex, Unit } from '@/lib/types';

export default function Profile() {
  const t = useTheme();
  const settings = useStore((s) => s.settings);
  const update = useStore((s) => s.updateSettings);
  const workouts = useStore((s) => s.workouts);
  const routines = useStore((s) => s.routines);
  const resetAll = useStore((s) => s.resetAll);
  const customs = useStore((s) => s.customThemes);
  const all = useAllExercises();
  const [bw, setBw] = useState(toDisplay(settings.bodyweightKg, settings.unit));
  const [birthYear, setBirthYear] = useState(settings.birthYear ? String(settings.birthYear) : '');

  const setUnit = (u: Unit) => {
    update({ unit: u });
    setBw(toDisplay(settings.bodyweightKg, u));
  };

  const exportData = async () => {
    if (!workouts.length) {
      Alert.alert('Nothing to export yet', 'Finish a workout first.');
      return;
    }
    try {
      const ok = await shareCsv(workouts, all);
      if (!ok) Alert.alert('Sharing unavailable', 'This device cannot share files.');
    } catch (e) {
      Alert.alert('Export failed', String(e));
    }
  };

  const reset = () =>
    Alert.alert(
      'Delete all data?',
      'This removes every workout, routine and setting from this phone. It cannot be undone. Export first if you want a copy.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete everything', style: 'destructive', onPress: resetAll },
      ],
    );

  const theme = getTheme(settings.themeId, customs);

  return (
    <Screen>
      <T v="h1" style={{ marginTop: 8 }}>
        Profile
      </T>

      <Card onPress={() => router.push('/themes')} accessibilityLabel={`Theme: ${theme.name}. Change theme`}>
        <Row>
          <Icon name="palette" color={t.dark ? t.c.accent : t.c.text} />
          <View style={{ flex: 1, gap: 2 }}>
            <T v="title">Theme</T>
            <T v="small">
              {theme.name} · {15 + customs.length} themes
            </T>
          </View>
          <View style={{ flexDirection: 'row', gap: 4 }}>
            {[theme.c.bg, theme.c.surface, theme.c.accent].map((c, i) => (
              <View key={i} style={{ width: 18, height: 18, borderRadius: 9, backgroundColor: c, borderWidth: 1, borderColor: t.c.border }} />
            ))}
          </View>
          <Icon name="chevronRight" color={t.c.muted} size={18} />
        </Row>
      </Card>

      <View style={{ gap: 10 }}>
        <T v="label">Units</T>
        <Segmented
          options={[
            { key: 'kg', label: 'kg' },
            { key: 'lb', label: 'lb' },
          ]}
          value={settings.unit}
          onChange={setUnit}
        />
      </View>

      <View style={{ gap: 10 }}>
        <T v="label">Default rest timer</T>
        <Row gap={8} style={{ flexWrap: 'wrap' }}>
          {[60, 90, 120, 180, 240].map((s) => (
            <Chip
              key={s}
              label={s < 120 ? `${s}s` : `${s / 60} min`}
              selected={settings.restSeconds === s}
              onPress={() => update({ restSeconds: s })}
            />
          ))}
        </Row>
      </View>

      <View style={{ gap: 10 }}>
        <T v="label">Weekly goal</T>
        <Row gap={8} style={{ flexWrap: 'wrap' }}>
          {[2, 3, 4, 5, 6].map((n) => (
            <Chip key={n} label={`${n} sessions`} selected={settings.weeklyGoal === n} onPress={() => update({ weeklyGoal: n })} />
          ))}
        </Row>
      </View>

      <Card style={{ gap: 12 }}>
        <T v="title">Body details (for Rank)</T>
        <Row gap={12}>
          <View style={{ flex: 1 }}>
            <Field
              label={`Bodyweight (${settings.unit})`}
              value={bw}
              onChangeText={setBw}
              onEndEditing={() => update({ bodyweightKg: bw ? fromDisplay(bw, settings.unit) : null })}
              keyboardType="decimal-pad"
              placeholder="80"
            />
          </View>
          <View style={{ flex: 1 }}>
            <Field
              label="Birth year"
              value={birthYear}
              onChangeText={setBirthYear}
              onEndEditing={() => {
                const y = parseInt(birthYear, 10);
                update({ birthYear: y > 1900 && y < new Date().getFullYear() ? y : null });
              }}
              keyboardType="number-pad"
              placeholder="1995"
            />
          </View>
        </Row>
        <Segmented<Sex>
          options={[
            { key: 'male', label: 'Male' },
            { key: 'female', label: 'Female' },
          ]}
          value={settings.sex ?? 'male'}
          onChange={(s) => update({ sex: s })}
        />
      </Card>

      <View style={{ gap: 10 }}>
        <T v="label">Your data</T>
        <Card>
          <T v="small">
            {workouts.length} workouts and {routines.length} routines, stored only on this phone.
          </T>
        </Card>
        <Button label="Export workouts (CSV)" kind="secondary" icon="share" onPress={exportData} />
        <Button label="Delete all data" kind="danger" icon="trash" onPress={reset} />
      </View>

      <T v="small" center style={{ fontSize: 12, marginTop: 8 }}>
        Plates 1.0
      </T>
    </Screen>
  );
}

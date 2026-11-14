import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';

import { Card, Header, Screen, Segmented, T, rad, useTheme } from '@/components/ui';
import { exerciseName, toDisplay } from '@/lib/calc';
import { LEVELS, LEVEL_MEANING, STANDARDS_SOURCE, thresholds } from '@/lib/standards';
import { useAllExercises, useStore } from '@/lib/store';

export default function Standards() {
  const t = useTheme();
  const { exerciseId } = useLocalSearchParams<{ exerciseId: string }>();
  const settings = useStore((s) => s.settings);
  const all = useAllExercises();
  const [by, setBy] = useState<'bw' | 'age'>('bw');
  const sex = settings.sex ?? 'male';
  const unit = settings.unit;
  const age = settings.birthYear ? new Date().getFullYear() - settings.birthYear : 30;
  const bw = settings.bodyweightKg ?? (sex === 'male' ? 80 : 60);
  const strong = t.dark ? t.c.accent : t.c.text;

  const bwRows = sex === 'male' ? [60, 70, 80, 90, 100, 110, 120] : [45, 50, 60, 70, 80, 90, 100];
  const ageRows = [18, 30, 40, 50, 60, 70];
  const nearest = (rows: number[], v: number) => rows.reduce((a, b) => (Math.abs(b - v) < Math.abs(a - v) ? b : a));
  const rows =
    by === 'bw'
      ? bwRows.map((r) => ({ key: r, label: `${toDisplay(r, unit)} ${unit}`, th: thresholds(exerciseId, sex, r, age) }))
      : ageRows.map((r) => ({ key: r, label: `${r}`, th: thresholds(exerciseId, sex, bw, r) }));
  const you = by === 'bw' ? nearest(bwRows, bw) : nearest(ageRows, age);

  const cell = { flex: 1, textAlign: 'center' as const, fontVariant: ['tabular-nums' as const], fontSize: 14 };

  return (
    <Screen header={<Header title={`${exerciseName(all, exerciseId)} standards`} onBack={() => router.back()} />}>
      <Card style={{ gap: 6 }}>
        <T v="bodyStrong">One standard for this exercise</T>
        <T v="small" style={{ fontSize: 12 }}>
          Machines and bars feel different by brand, so compare your own ranks on the same equipment. Values are estimated 1RM in {unit},{' '}
          {sex === 'male' ? 'men' : 'women'}
          {by === 'bw' ? `, age ${age}` : `, ${toDisplay(bw, unit)} ${unit} bodyweight`}.
        </T>
      </Card>
      <Segmented
        options={[
          { key: 'bw', label: 'By bodyweight' },
          { key: 'age', label: 'By age' },
        ]}
        value={by}
        onChange={setBy}
      />
      <View accessibilityRole="none">
        <View style={{ flexDirection: 'row', paddingHorizontal: 6, paddingBottom: 6 }}>
          <Text style={{ width: 84, color: t.c.muted, fontFamily: t.fonts.semibold, fontSize: 11 }}>{by === 'bw' ? 'BODY' : 'AGE'}</Text>
          {['BEG', 'NOV', 'INT', 'ADV', 'ELITE'].map((h) => (
            <Text key={h} style={[cell, { color: t.c.muted, fontFamily: t.fonts.semibold, fontSize: 11 }]}>
              {h}
            </Text>
          ))}
        </View>
        {rows.map((r) => {
          const mine = r.key === you;
          return (
            <View
              key={r.key}
              accessible
              accessibilityLabel={`${r.label}: ${r.th.map((v, i) => `${LEVELS[i]} ${toDisplay(v, unit)}`).join(', ')}${mine ? ', closest to you' : ''}`}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                height: 44,
                paddingHorizontal: 6,
                borderRadius: rad(t, 10),
                backgroundColor: mine ? t.c.tint : 'transparent',
                borderWidth: mine ? 1 : 0,
                borderColor: t.c.tintBorder,
              }}>
              <Text style={{ width: 84, color: t.c.text, fontFamily: t.fonts.semibold, fontSize: 14 }}>
                {r.label}
                {mine ? <Text style={{ color: strong, fontSize: 11 }}> you</Text> : null}
              </Text>
              {r.th.map((v, i) => (
                <Text key={i} style={[cell, { color: t.c.text, fontFamily: t.fonts.medium }]}>
                  {toDisplay(v, unit)}
                </Text>
              ))}
            </View>
          );
        })}
      </View>
      <Card style={{ gap: 6 }}>
        {LEVELS.map((l, i) => (
          <View key={l} style={{ flexDirection: 'row', gap: 12 }}>
            <Text style={{ width: 96, color: t.c.text, fontFamily: t.fonts.semibold, fontSize: 13 }}>{l}</Text>
            <Text style={{ flex: 1, color: t.c.muted, fontFamily: t.fonts.regular, fontSize: 13 }}>{LEVEL_MEANING[i]}</Text>
          </View>
        ))}
      </Card>
      <T v="small" center style={{ fontSize: 12 }}>
        {STANDARDS_SOURCE.label}
      </T>
    </Screen>
  );
}

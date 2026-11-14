import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { Icon } from '@/components/icons';
import { Button, Card, Chip, Field, Row, Screen, Segmented, T, useTheme } from '@/components/ui';
import { fromDisplay } from '@/lib/calc';
import { STARTER_ROUTINES } from '@/lib/exercises';
import { useStore } from '@/lib/store';
import type { Unit } from '@/lib/types';

export default function Onboarding() {
  const t = useTheme();
  const complete = useStore((s) => s.completeOnboarding);
  const [unit, setUnit] = useState<Unit>('kg');
  const [packs, setPacks] = useState<string[]>(['ppl']);
  const [goal, setGoal] = useState(3);
  const [bw, setBw] = useState('');

  const toggle = (k: string) => setPacks((p) => (p.includes(k) ? p.filter((x) => x !== k) : [...p, k]));

  const finish = () => {
    complete(packs, { unit, weeklyGoal: goal, bodyweightKg: bw ? fromDisplay(bw, unit) : null });
    router.replace('/');
  };

  return (
    <Screen
      edges={['top', 'bottom']}
      footer={
        <View style={{ padding: 20, paddingTop: 8 }}>
          <Button label="Let's lift" onPress={finish} />
        </View>
      }>
      <View style={{ gap: 6, marginTop: 12 }}>
        <T v="display">Welcome to Plates</T>
        <T v="small">Three quick choices and you’re ready for your first session. You can change all of this later in Profile.</T>
      </View>

      <View style={{ gap: 10 }}>
        <T v="label">Units</T>
        <Segmented
          options={[
            { key: 'kg', label: 'Kilograms (kg)' },
            { key: 'lb', label: 'Pounds (lb)' },
          ]}
          value={unit}
          onChange={setUnit}
        />
      </View>

      <View style={{ gap: 10 }}>
        <T v="label">Starter routines</T>
        {STARTER_ROUTINES.map((p) => {
          const sel = packs.includes(p.key);
          return (
            <Card key={p.key} tint={sel} onPress={() => toggle(p.key)} accessibilityLabel={`${p.label}, ${sel ? 'selected' : 'not selected'}`}>
              <Row>
                <View style={{ flex: 1, gap: 2 }}>
                  <T v="title">{p.label}</T>
                  <T v="small" color={sel ? t.c.tintText : undefined}>
                    {p.description}
                  </T>
                </View>
                <View
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 8,
                    backgroundColor: sel ? t.c.accent : 'transparent',
                    borderWidth: sel ? 0 : 1.5,
                    borderColor: t.c.border,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  {sel && <Icon name="check" size={16} color={t.c.onAccent} strokeWidth={3} />}
                </View>
              </Row>
            </Card>
          );
        })}
        <T v="small">Pick none to start from scratch.</T>
      </View>

      <View style={{ gap: 10 }}>
        <T v="label">Sessions per week goal</T>
        <Row gap={8} style={{ flexWrap: 'wrap' }}>
          {[2, 3, 4, 5, 6].map((n) => (
            <Chip key={n} label={`${n} × week`} selected={goal === n} onPress={() => setGoal(n)} />
          ))}
        </Row>
      </View>

      <Field
        label={`Bodyweight (${unit}) – optional, used for Rank`}
        value={bw}
        onChangeText={setBw}
        keyboardType="decimal-pad"
        placeholder="e.g. 80"
      />
    </Screen>
  );
}

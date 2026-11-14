import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';

import { Button, Card, Field, Header, IconButton, Row, Screen, T, rad, useTheme } from '@/components/ui';
import { exerciseName, uid } from '@/lib/calc';
import { pickerBus } from '@/lib/pickerBus';
import { useAllExercises, useStore } from '@/lib/store';
import type { Routine, RoutineItem } from '@/lib/types';

export default function RoutineEditor() {
  const t = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const existing = useStore((s) => s.routines.find((r) => r.id === id));
  const saveRoutine = useStore((s) => s.saveRoutine);
  const deleteRoutine = useStore((s) => s.deleteRoutine);
  const all = useAllExercises();
  const [name, setName] = useState(existing?.name ?? '');
  const [items, setItems] = useState<RoutineItem[]>(existing?.items ?? []);

  useFocusEffect(
    useCallback(() => {
      const picked = pickerBus.routinePicked;
      if (picked?.length) {
        pickerBus.routinePicked = null;
        setItems((cur) => [...cur, ...picked.map((exerciseId) => ({ exerciseId, targetSets: 3, targetReps: 10 }))]);
      }
    }, []),
  );

  const patch = (i: number, p: Partial<RoutineItem>) => setItems((cur) => cur.map((x, j) => (j === i ? { ...x, ...p } : x)));
  const move = (i: number, d: -1 | 1) =>
    setItems((cur) => {
      const j = i + d;
      if (j < 0 || j >= cur.length) return cur;
      const c = [...cur];
      [c[i], c[j]] = [c[j]!, c[i]!];
      return c;
    });

  const save = () => {
    if (!name.trim()) {
      Alert.alert('Name your routine', 'Give it a name like "Push Day".');
      return;
    }
    const r: Routine = { id: existing?.id ?? uid(), name: name.trim(), items };
    saveRoutine(r);
    router.back();
  };

  const remove = () =>
    Alert.alert(`Delete ${existing?.name}?`, 'Past workouts stay in your history.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          deleteRoutine(existing!.id);
          router.back();
        },
      },
    ]);

  return (
    <Screen
      header={<Header title={existing ? 'Edit routine' : 'New routine'} onBack={() => router.back()} />}
      footer={
        <View style={{ padding: 20, paddingTop: 8, gap: 4 }}>
          <Button label="Save routine" onPress={save} />
          {existing && <Button label="Delete routine" kind="ghost" onPress={remove} small />}
        </View>
      }>
      <Field label="Name" value={name} onChangeText={setName} placeholder="e.g. Push Day" />
      <View style={{ gap: 10 }}>
        <T v="label">Exercises</T>
        {items.length === 0 && (
          <Card>
            <T v="small">Add the exercises you usually do. When you start this routine, your last weights fill in automatically.</T>
          </Card>
        )}
        {items.map((it, i) => (
          <Card key={it.exerciseId + i} style={{ gap: 10, paddingVertical: 12 }}>
            <Row>
              <T v="title" style={{ flex: 1 }} numberOfLines={1}>
                {exerciseName(all, it.exerciseId)}
              </T>
              <IconButton icon="chevronUp" label="Move up" size={36} color={t.c.muted} onPress={() => move(i, -1)} />
              <IconButton icon="chevronDown" label="Move down" size={36} color={t.c.muted} onPress={() => move(i, 1)} />
              <IconButton icon="trash" label="Remove" size={36} color={t.c.muted} onPress={() => setItems((c) => c.filter((_, j) => j !== i))} />
            </Row>
            <Row gap={16}>
              <Stepper label="Sets" value={it.targetSets} min={1} max={10} onChange={(v) => patch(i, { targetSets: v })} />
              <Stepper label="Reps" value={it.targetReps} min={1} max={50} onChange={(v) => patch(i, { targetReps: v })} />
            </Row>
          </Card>
        ))}
        <Button label="Add exercises" icon="plus" kind="outline" onPress={() => router.push({ pathname: '/picker', params: { mode: 'routine' } })} />
      </View>
    </Screen>
  );
}

function Stepper({ label, value, onChange, min, max }: { label: string; value: number; onChange: (v: number) => void; min: number; max: number }) {
  const t = useTheme();
  const btn = (txt: string, d: number, a11y: string) => (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={a11y}
      onPress={() => onChange(Math.min(max, Math.max(min, value + d)))}
      style={{ width: 40, height: 40, borderRadius: rad(t, 10), backgroundColor: t.c.surface2, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ color: t.c.text, fontFamily: t.fonts.bold, fontSize: 18 }}>{txt}</Text>
    </Pressable>
  );
  return (
    <Row gap={8} style={{ flex: 1 }}>
      <T v="small" style={{ width: 36 }}>
        {label}
      </T>
      {btn('−', -1, `Fewer ${label.toLowerCase()}`)}
      <T v="num" style={{ minWidth: 28, textAlign: 'center', fontSize: 18 }}>
        {value}
      </T>
      {btn('+', 1, `More ${label.toLowerCase()}`)}
    </Row>
  );
}

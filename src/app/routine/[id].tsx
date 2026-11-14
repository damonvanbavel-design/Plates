import { router, useFocusEffect, useLocalSearchParams, usePreventRemove } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import Animated, { LinearTransition } from 'react-native-reanimated';

import { ExThumb } from '@/components/exthumb';
import { Icon } from '@/components/icons';
import { RestPicker, restLabel } from '@/components/restpicker';
import { Appear, Button, Card, Field, Header, IconButton, Row, Screen, T, rad, useTheme } from '@/components/ui';
import { exerciseName, uid } from '@/lib/calc';
import { pickerBus } from '@/lib/pickerBus';
import { kindOf } from '@/lib/registry';
import { useStore } from '@/lib/store';
import type { Routine, RoutineItem } from '@/lib/types';

export default function RoutineEditor() {
  const t = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const existing = useStore((s) => s.routines.find((r) => r.id === id));
  const saveRoutine = useStore((s) => s.saveRoutine);
  const deleteRoutine = useStore((s) => s.deleteRoutine);
  const defaultRest = useStore((s) => s.settings.restSeconds);
  const [name, setName] = useState(existing?.name ?? '');
  const [items, setItems] = useState<RoutineItem[]>(existing?.items ?? []);
  const [restFor, setRestFor] = useState<number | null>(null);
  const [leaving, setLeaving] = useState(false);

  const dirty = !leaving && (name !== (existing?.name ?? '') || JSON.stringify(items) !== JSON.stringify(existing?.items ?? []));

  usePreventRemove(dirty, ({ repeat }) => {
    Alert.alert('Discard changes?', 'You have unsaved changes to this routine.', [
      { text: 'Keep editing', style: 'cancel' },
      {
        text: 'Discard',
        style: 'destructive',
        onPress: () => {
          setLeaving(true);
          setTimeout(repeat, 0);
        },
      },
    ]);
  });

  useEffect(() => {
    if (leaving && !dirty) router.back();
    // only when we decide to leave after saving/deleting
  }, [leaving]); // eslint-disable-line react-hooks/exhaustive-deps

  useFocusEffect(
    useCallback(() => {
      const picked = pickerBus.routinePicked;
      if (picked?.length) {
        pickerBus.routinePicked = null;
        setItems((cur) => [
          ...cur,
          ...picked.map((exerciseId) => ({ exerciseId, targetSets: 3, targetReps: kindOf(exerciseId) === 'time' ? 30 : 10 })),
        ]);
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
    setLeaving(true);
  };

  const remove = () =>
    Alert.alert(`Delete ${existing?.name}?`, 'Past workouts stay in your history.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          deleteRoutine(existing!.id);
          setLeaving(true);
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
        {items.map((it, i) => {
          const timed = kindOf(it.exerciseId) === 'time';
          return (
            <Animated.View key={it.exerciseId + i} layout={LinearTransition.duration(220)}>
              <Appear i={i}>
                <Card style={{ gap: 10, paddingVertical: 12, paddingRight: 8 }}>
                  <Row gap={10} style={{ alignItems: 'flex-start' }}>
                    <ExThumb exerciseId={it.exerciseId} size={40} />
                    <T v="title" style={{ flex: 1, paddingTop: 2 }} numberOfLines={2}>
                      {exerciseName(null, it.exerciseId)}
                    </T>
                    <IconButton icon="chevronUp" label="Move up" size={36} color={t.c.muted} onPress={() => move(i, -1)} />
                    <IconButton icon="chevronDown" label="Move down" size={36} color={t.c.muted} onPress={() => move(i, 1)} />
                    <IconButton
                      icon="trash"
                      label="Remove"
                      size={36}
                      color={t.c.muted}
                      onPress={() => setItems((c) => c.filter((_, j) => j !== i))}
                    />
                  </Row>
                  <Row gap={12} style={{ flexWrap: 'wrap' }}>
                    <Stepper label="Sets" value={it.targetSets} min={1} max={10} step={1} onChange={(v) => patch(i, { targetSets: v })} />
                    <Stepper
                      label={timed ? 'Secs' : 'Reps'}
                      value={it.targetReps}
                      min={timed ? 5 : 1}
                      max={timed ? 600 : 50}
                      step={timed ? 5 : 1}
                      onChange={(v) => patch(i, { targetReps: v })}
                    />
                  </Row>
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => setRestFor(i)}
                    style={{
                      alignSelf: 'flex-start',
                      minHeight: 36,
                      paddingHorizontal: 12,
                      borderRadius: 18,
                      backgroundColor: t.c.surface2,
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 6,
                    }}>
                    <Icon name="timer" size={15} color={t.c.muted} />
                    <Text style={{ color: t.c.text, fontFamily: t.fonts.medium, fontSize: 13 }}>
                      {restLabel(it.restSec, defaultRest)}
                      {it.restSec === undefined ? ' (default)' : ''}
                    </Text>
                  </Pressable>
                </Card>
              </Appear>
            </Animated.View>
          );
        })}
        <Button label="Add exercises" icon="plus" kind="outline" onPress={() => router.push({ pathname: '/picker', params: { mode: 'routine' } })} />
      </View>
      <RestPicker
        visible={restFor !== null}
        onClose={() => setRestFor(null)}
        value={restFor !== null ? items[restFor]?.restSec : undefined}
        fallback={defaultRest}
        onChange={(v) => restFor !== null && patch(restFor, { restSec: v })}
        title={restFor !== null ? `Rest · ${exerciseName(null, items[restFor]?.exerciseId ?? '')}` : 'Rest'}
      />
    </Screen>
  );
}

function Stepper({
  label,
  value,
  onChange,
  min,
  max,
  step,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
}) {
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
    <Row gap={8}>
      <T v="small" style={{ minWidth: 34 }}>
        {label}
      </T>
      {btn('−', -step, `Fewer ${label.toLowerCase()}`)}
      <T v="num" style={{ minWidth: 34, textAlign: 'center', fontSize: 18 }}>
        {value}
      </T>
      {btn('+', step, `More ${label.toLowerCase()}`)}
    </Row>
  );
}

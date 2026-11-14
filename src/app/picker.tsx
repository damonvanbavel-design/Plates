import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Icon } from '@/components/icons';
import { Button, Card, Chip, Field, IconButton, Row, T, btnRad, rad, useTheme } from '@/components/ui';
import { initials } from '@/lib/calc';
import { EQUIPMENT, MUSCLES } from '@/lib/exercises';
import { pickerBus } from '@/lib/pickerBus';
import { useAllExercises, useStore } from '@/lib/store';
import type { Equipment, Exercise, Muscle } from '@/lib/types';

export default function Picker() {
  const t = useTheme();
  const { mode } = useLocalSearchParams<{ mode?: 'workout' | 'routine' }>();
  const all = useAllExercises();
  const workouts = useStore((s) => s.workouts);
  const active = useStore((s) => s.active);
  const addToActive = useStore((s) => s.addExercisesToActive);
  const addCustom = useStore((s) => s.addCustomExercise);
  const [q, setQ] = useState('');
  const [muscle, setMuscle] = useState<Muscle | 'All'>('All');
  const [picked, setPicked] = useState<string[]>([]);
  const [creating, setCreating] = useState(false);

  const inWorkout = new Set(mode === 'workout' ? active?.exercises.map((e) => e.exerciseId) : []);
  const recentIds = useMemo(() => {
    const ids: string[] = [];
    for (const w of [...workouts].sort((a, b) => b.startedAt - a.startedAt)) for (const we of w.exercises) if (!ids.includes(we.exerciseId)) ids.push(we.exerciseId);
    return ids.slice(0, 6);
  }, [workouts]);

  const filtered = all.filter((x) => (muscle === 'All' || x.muscle === muscle) && x.name.toLowerCase().includes(q.trim().toLowerCase()));
  const showRecent = !q && muscle === 'All' && recentIds.length > 0;
  const list: (Exercise | { header: string })[] = [
    ...(showRecent ? [{ header: 'Recent' }, ...recentIds.map((id) => all.find((x) => x.id === id)).filter(Boolean) as Exercise[]] : []),
    { header: muscle === 'All' ? 'All exercises' : muscle },
    ...filtered.sort((a, b) => a.name.localeCompare(b.name)),
  ];

  const toggle = (id: string) => setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  const confirm = () => {
    if (!picked.length) return;
    if (mode === 'routine') pickerBus.routinePicked = picked;
    else addToActive(picked);
    router.back();
  };

  return (
    <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1, backgroundColor: t.c.bg }}>
      <Row style={{ paddingHorizontal: 8, paddingVertical: 8, justifyContent: 'space-between' }}>
        <IconButton icon="close" label="Close" onPress={() => router.back()} />
        <T v="title" style={{ fontSize: 17 }}>
          Add exercise
        </T>
        <Pressable
          accessibilityRole="button"
          disabled={!picked.length}
          onPress={confirm}
          style={{ height: 40, paddingHorizontal: 16, borderRadius: btnRad(t, 10), backgroundColor: picked.length ? t.c.accent : t.c.surface2, justifyContent: 'center', marginRight: 8 }}>
          <Text style={{ color: picked.length ? t.c.onAccent : t.c.muted, fontFamily: t.fonts.bold, fontSize: 14 }}>Add{picked.length ? ` (${picked.length})` : ''}</Text>
        </Pressable>
      </Row>

      {creating ? (
        <CreateExercise
          onCancel={() => setCreating(false)}
          onCreate={(x) => {
            const ex = addCustom(x);
            setPicked((p) => [...p, ex.id]);
            setCreating(false);
            setQ('');
          }}
        />
      ) : (
        <>
          <View style={{ paddingHorizontal: 16, gap: 12 }}>
            <View style={{ height: 48, borderRadius: rad(t, 12), backgroundColor: t.c.surface, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, borderWidth: t.cardBorder ? 1 : 0, borderColor: t.c.border }}>
              <Icon name="search" size={18} color={t.c.muted} />
              <TextInput
                accessibilityLabel="Search exercises"
                value={q}
                onChangeText={setQ}
                placeholder={`Search ${all.length} exercises`}
                placeholderTextColor={t.c.muted}
                style={{ flex: 1, color: t.c.text, fontFamily: t.fonts.regular, fontSize: 15 }}
                autoCorrect={false}
              />
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              {(['All', ...MUSCLES] as const).map((m) => (
                <Chip key={m} label={m} selected={muscle === m} onPress={() => setMuscle(m)} />
              ))}
            </ScrollView>
          </View>
          <FlatList
            data={list}
            keyExtractor={(item, i) => ('header' in item ? 'h' + item.header + i : item.id + i)}
            contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
            keyboardShouldPersistTaps="handled"
            ListFooterComponent={
              <View style={{ marginTop: 16, gap: 8 }}>
                {filtered.length === 0 && <T v="small" center>No exercises match “{q}”.</T>}
                <Button label={q ? `Create “${q}”` : 'Create custom exercise'} kind="secondary" icon="plus" onPress={() => setCreating(true)} />
              </View>
            }
            renderItem={({ item }) => {
              if ('header' in item)
                return (
                  <T v="label" style={{ marginTop: 14, marginBottom: 4 }}>
                    {item.header}
                  </T>
                );
              const sel = picked.includes(item.id);
              const already = inWorkout.has(item.id);
              return (
                <Pressable
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: sel }}
                  onPress={() => toggle(item.id)}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 60, borderBottomWidth: 1, borderBottomColor: t.c.surface2 }}>
                  <View style={{ width: 40, height: 40, borderRadius: rad(t, 10), backgroundColor: sel ? t.c.tint : t.c.surface2, alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ fontFamily: t.fonts.heading, fontSize: 13, color: sel ? (t.dark ? t.c.accent : t.c.text) : t.c.muted }}>{initials(item.name)}</Text>
                  </View>
                  <View style={{ flex: 1, gap: 2 }}>
                    <T v="bodyStrong">{item.name}</T>
                    <T v="small" style={{ fontSize: 12 }}>
                      {item.muscle} · {item.equipment}
                      {item.custom ? ' · custom' : ''}
                      {already ? ' · in this workout' : ''}
                    </T>
                  </View>
                  <View
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 6,
                      backgroundColor: sel ? t.c.accent : 'transparent',
                      borderWidth: sel ? 0 : 1.5,
                      borderColor: t.c.muted,
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: 6,
                    }}>
                    {sel && <Icon name="check" size={15} color={t.c.onAccent} strokeWidth={3} />}
                  </View>
                </Pressable>
              );
            }}
          />
        </>
      )}
    </SafeAreaView>
  );
}

function CreateExercise({ onCancel, onCreate }: { onCancel: () => void; onCreate: (x: { name: string; muscle: Muscle; equipment: Equipment }) => void }) {
  const [name, setName] = useState('');
  const [muscle, setMuscle] = useState<Muscle>('Chest');
  const [equipment, setEquipment] = useState<Equipment>('Machine');
  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 18 }} keyboardShouldPersistTaps="handled">
      <T v="h2">Custom exercise</T>
      <Field label="Name" value={name} onChangeText={setName} placeholder="e.g. Hammer Strength Incline Press" autoFocus />
      <View style={{ gap: 8 }}>
        <T v="label">Muscle group</T>
        <Row gap={8} style={{ flexWrap: 'wrap' }}>
          {MUSCLES.map((m) => (
            <Chip key={m} label={m} selected={muscle === m} onPress={() => setMuscle(m)} />
          ))}
        </Row>
      </View>
      <View style={{ gap: 8 }}>
        <T v="label">Equipment</T>
        <Row gap={8} style={{ flexWrap: 'wrap' }}>
          {EQUIPMENT.map((m) => (
            <Chip key={m} label={m} selected={equipment === m} onPress={() => setEquipment(m)} />
          ))}
        </Row>
      </View>
      <Card style={{ padding: 0, backgroundColor: 'transparent' }}>
        <Button label="Create and select" disabled={!name.trim()} onPress={() => onCreate({ name: name.trim(), muscle, equipment })} />
      </Card>
      <Button label="Cancel" kind="ghost" onPress={onCancel} />
    </ScrollView>
  );
}

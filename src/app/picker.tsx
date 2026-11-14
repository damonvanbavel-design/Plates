import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ExThumb } from '@/components/exthumb';
import { Icon } from '@/components/icons';
import { Button, Chip, Field, IconButton, Row, Segmented, T, btnRad, rad, useTheme } from '@/components/ui';
import { EQUIPMENT, MUSCLES } from '@/lib/exercises';
import { pickerBus } from '@/lib/pickerBus';
import { useAllExercises, useStore } from '@/lib/store';
import type { Equipment, Exercise, ExerciseKind, Muscle } from '@/lib/types';

type Item = Exercise | { header: string };

export default function Picker() {
  const t = useTheme();
  const { mode } = useLocalSearchParams<{ mode?: 'workout' | 'routine' }>();
  const all = useAllExercises();
  const workouts = useStore((s) => s.workouts);
  const favorites = useStore((s) => s.favorites);
  const toggleFavorite = useStore((s) => s.toggleFavorite);
  const active = useStore((s) => s.active);
  const addToActive = useStore((s) => s.addExercisesToActive);
  const addCustom = useStore((s) => s.addCustomExercise);
  const [q, setQ] = useState('');
  const [muscle, setMuscle] = useState<Muscle | 'All'>('All');
  const [equip, setEquip] = useState<Equipment | 'Any'>('Any');
  const [picked, setPicked] = useState<string[]>([]);
  const [creating, setCreating] = useState(false);

  const inWorkout = useMemo(() => new Set(mode === 'workout' ? active?.exercises.map((e) => e.exerciseId) : []), [mode, active]);
  const recentIds = useMemo(() => {
    const ids: string[] = [];
    for (const w of [...workouts].sort((a, b) => b.startedAt - a.startedAt))
      for (const we of w.exercises) if (!ids.includes(we.exerciseId)) ids.push(we.exerciseId);
    return ids.slice(0, 8);
  }, [workouts]);

  const query = q.trim().toLowerCase();
  const filtered = useMemo(() => {
    const words = query.split(/\s+/).filter(Boolean);
    return all
      .filter((x) => (muscle === 'All' || x.muscle === muscle) && (equip === 'Any' || x.equipment === equip))
      .filter((x) => {
        if (!words.length) return true;
        const hay = `${x.name} ${x.equipment} ${x.muscle} ${(x.primary ?? []).join(' ')}`.toLowerCase();
        return words.every((w) => hay.includes(w));
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [all, muscle, equip, query]);

  const byId = useMemo(() => new Map(all.map((e) => [e.id, e])), [all]);
  const noFilters = !query && muscle === 'All' && equip === 'Any';
  const favs = favorites.map((id) => byId.get(id)).filter(Boolean) as Exercise[];
  const recents = recentIds
    .filter((id) => !favorites.includes(id))
    .map((id) => byId.get(id))
    .filter(Boolean) as Exercise[];
  const list: Item[] = [
    ...(noFilters && favs.length ? [{ header: 'Favourites' }, ...favs] : []),
    ...(noFilters && recents.length ? [{ header: 'Recent' }, ...recents] : []),
    { header: `${noFilters ? 'All exercises' : 'Results'} · ${filtered.length}` },
    ...filtered,
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
          {creating ? 'New exercise' : 'Add exercise'}
        </T>
        <Pressable
          accessibilityRole="button"
          disabled={!picked.length}
          onPress={confirm}
          style={{
            minHeight: 40,
            paddingHorizontal: 16,
            borderRadius: btnRad(t, 10),
            backgroundColor: picked.length ? t.c.accent : t.c.surface2,
            justifyContent: 'center',
            marginRight: 8,
          }}>
          <Text style={{ color: picked.length ? t.c.onAccent : t.c.muted, fontFamily: t.fonts.bold, fontSize: 14 }}>
            Add{picked.length ? ` (${picked.length})` : ''}
          </Text>
        </Pressable>
      </Row>

      {creating ? (
        <CreateExercise
          initialName={q}
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
          <View style={{ paddingHorizontal: 16, gap: 10 }}>
            <View
              style={{
                height: 48,
                borderRadius: rad(t, 12),
                backgroundColor: t.c.surface,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 10,
                paddingHorizontal: 14,
                borderWidth: t.cardBorder ? 1 : 0,
                borderColor: t.c.border,
              }}>
              <Icon name="search" size={18} color={t.c.muted} />
              <TextInput
                accessibilityLabel="Search exercises"
                value={q}
                onChangeText={setQ}
                placeholder={`Search ${all.length} exercises`}
                placeholderTextColor={t.c.muted}
                style={{ flex: 1, color: t.c.text, fontFamily: t.fonts.regular, fontSize: 15 }}
                autoCorrect={false}
                returnKeyType="search"
              />
              {q ? <IconButton icon="close" label="Clear search" size={36} color={t.c.muted} onPress={() => setQ('')} /> : null}
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              {(['All', ...MUSCLES] as const).map((m) => (
                <Chip key={m} label={m} selected={muscle === m} onPress={() => setMuscle(m)} />
              ))}
            </ScrollView>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              {(['Any', ...EQUIPMENT] as const).map((m) => (
                <Chip key={m} label={m === 'Any' ? 'Any equipment' : m} selected={equip === m} onPress={() => setEquip(m)} />
              ))}
            </ScrollView>
          </View>
          <FlatList
            data={list}
            keyExtractor={(item, i) => ('header' in item ? 'h' + item.header : item.id + ':' + i)}
            contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            initialNumToRender={18}
            windowSize={9}
            ListFooterComponent={
              <View style={{ marginTop: 16, gap: 8 }}>
                {filtered.length === 0 && (
                  <T v="small" center>
                    No exercises match{muscle !== 'All' || equip !== 'Any' ? ' with these filters' : ''}. Try fewer words
                    {muscle !== 'All' || equip !== 'Any' ? ' or clear the filters' : ''}.
                  </T>
                )}
                {filtered.length === 0 && (muscle !== 'All' || equip !== 'Any') && (
                  <Button
                    label="Clear filters"
                    kind="outline"
                    small
                    onPress={() => {
                      setMuscle('All');
                      setEquip('Any');
                    }}
                  />
                )}
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
              const fav = favorites.includes(item.id);
              return (
                <Pressable
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: sel }}
                  accessibilityLabel={item.name}
                  onPress={() => toggle(item.id)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 12,
                    minHeight: 64,
                    paddingVertical: 8,
                    borderBottomWidth: 1,
                    borderBottomColor: t.c.surface2,
                  }}>
                  <ExThumb exerciseId={item.id} size={48} selected={sel} />
                  <View style={{ flex: 1, gap: 2 }}>
                    <T v="bodyStrong" numberOfLines={2}>
                      {item.name}
                    </T>
                    <T v="small" style={{ fontSize: 12 }} numberOfLines={1}>
                      {item.muscle} · {item.equipment}
                      {item.custom ? ' · custom' : ''}
                      {inWorkout.has(item.id) ? ' · in workout' : ''}
                    </T>
                  </View>
                  <IconButton
                    icon="info"
                    label={`About ${item.name}`}
                    size={40}
                    color={t.c.muted}
                    onPress={() => router.push(`/exercise/${encodeURIComponent(item.id)}`)}
                  />
                  <IconButton
                    icon={fav ? 'starFilled' : 'star'}
                    label={fav ? `Unfavourite ${item.name}` : `Favourite ${item.name}`}
                    size={40}
                    color={fav ? (t.dark ? t.c.accent : t.c.text) : t.c.muted}
                    onPress={() => toggleFavorite(item.id)}
                  />
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
                      marginRight: 2,
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

function CreateExercise({
  initialName,
  onCancel,
  onCreate,
}: {
  initialName: string;
  onCancel: () => void;
  onCreate: (x: { name: string; muscle: Muscle; equipment: Equipment; kind: ExerciseKind }) => void;
}) {
  const [name, setName] = useState(initialName);
  const [muscle, setMuscle] = useState<Muscle>('Chest');
  const [equipment, setEquipment] = useState<Equipment>('Machine');
  const [kind, setKind] = useState<ExerciseKind>('weight');
  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 18 }} keyboardShouldPersistTaps="handled">
      <Field label="Name" value={name} onChangeText={setName} placeholder="e.g. Hammer Strength Incline Press" autoFocus />
      <View style={{ gap: 8 }}>
        <T v="label">How you log it</T>
        <Segmented<ExerciseKind>
          options={[
            { key: 'weight', label: 'Weight × reps' },
            { key: 'bodyweight', label: 'Bodyweight' },
            { key: 'time', label: 'Time' },
          ]}
          value={kind}
          onChange={setKind}
        />
      </View>
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
      <Button label="Create and select" disabled={!name.trim()} onPress={() => onCreate({ name: name.trim(), muscle, equipment, kind })} />
      <Button label="Cancel" kind="ghost" onPress={onCancel} />
    </ScrollView>
  );
}

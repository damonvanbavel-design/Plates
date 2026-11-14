import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { memo, useEffect, useRef, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Icon } from '@/components/icons';
import { Button, Card, IconButton, Row, T, btnRad, rad, useTheme } from '@/components/ui';
import { bestsFor, est1rm, exerciseName, fmtClock, fromDisplay, previousSets, toDisplay } from '@/lib/calc';
import { useNow } from '@/lib/hooks';
import { useAllExercises, useStore } from '@/lib/store';
import type { SetEntry, Unit } from '@/lib/types';


export default function WorkoutScreen() {
  const t = useTheme();
  const active = useStore((s) => s.active);
  const unit = useStore((s) => s.settings.unit);
  const workouts = useStore((s) => s.workouts);
  const finishWorkout = useStore((s) => s.finishWorkout);
  const discardWorkout = useStore((s) => s.discardWorkout);
  const renameActive = useStore((s) => s.renameActive);
  const all = useAllExercises();
  const now = useNow(1000);
  const finishing = useRef(false);

  useEffect(() => {
    // leave the screen if the workout was discarded (not when we just finished it)
    if (!active && !finishing.current) router.replace('/');
  }, [active]);
  if (!active) return null;

  const doneSets = active.exercises.reduce((n, we) => n + we.sets.filter((s) => s.done).length, 0);
  const pendingWithValues = active.exercises.reduce((n, we) => n + we.sets.filter((s) => !s.done && s.weightKg != null && s.reps != null).length, 0);

  const doFinish = () => {
    finishing.current = true;
    const id = finishWorkout();
    if (id) router.replace(`/summary/${id}`);
  };

  const onFinish = () => {
    if (doneSets === 0) {
      Alert.alert('No sets logged', 'Tick at least one set to save this workout, or discard it.', [
        { text: 'Keep going', style: 'cancel' },
        { text: 'Discard workout', style: 'destructive', onPress: discardWorkout },
      ]);
      return;
    }
    if (pendingWithValues > 0) {
      Alert.alert('Finish workout?', `${pendingWithValues} unticked set${pendingWithValues > 1 ? 's' : ''} won't be saved.`, [
        { text: 'Keep going', style: 'cancel' },
        { text: 'Finish', onPress: doFinish },
      ]);
      return;
    }
    doFinish();
  };

  const onMenu = () =>
    Alert.alert(active.name, undefined, [
      {
        text: 'Rename workout',
        onPress: () => {
          if (Platform.OS === 'ios') Alert.prompt?.('Rename workout', undefined, (v) => v && renameActive(v), 'plain-text', active.name);
          else Alert.alert('Rename', 'Renaming is available on the summary screen.');
        },
      },
      { text: 'Discard workout', style: 'destructive', onPress: () => Alert.alert('Discard this workout?', 'Nothing from this session will be saved.', [{ text: 'Cancel', style: 'cancel' }, { text: 'Discard', style: 'destructive', onPress: discardWorkout }]) },
      { text: 'Cancel', style: 'cancel' },
    ]);

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: t.c.bg }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 8, backgroundColor: t.c.band, borderBottomWidth: 1, borderBottomColor: t.c.band !== t.c.bg ? t.c.band : t.c.border }}>
        <IconButton icon="chevronDown" label="Minimise workout" color={t.c.bandText} onPress={() => router.back()} />
        <Pressable style={{ flex: 1, alignItems: 'center' }} onPress={onMenu} accessibilityRole="button" accessibilityLabel="Workout options">
          <Text numberOfLines={1} style={{ color: t.c.bandText, fontFamily: t.fonts.bold, fontSize: 16, textTransform: t.upper ? 'uppercase' : 'none' }}>
            {active.name}
          </Text>
          <Text style={{ color: t.c.bandMuted, fontFamily: t.fonts.medium, fontSize: 13, fontVariant: ['tabular-nums'] }}>{fmtClock(now - active.startedAt)}</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={onFinish}
          style={{ height: 40, paddingHorizontal: 16, borderRadius: btnRad(t, 10), backgroundColor: t.c.band !== t.c.bg ? t.c.bandBtn : t.c.accent, justifyContent: 'center' }}>
          <Text style={{ color: t.c.band !== t.c.bg ? t.c.bandBtnText : t.c.onAccent, fontFamily: t.fonts.bold, fontSize: 14 }}>Finish</Text>
        </Pressable>
      </View>

      <RestTimer />

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 120 }} keyboardShouldPersistTaps="handled">
          {active.exercises.length === 0 && (
            <Card style={{ alignItems: 'center', gap: 8, paddingVertical: 28 }}>
              <Icon name="dumbbell" size={28} color={t.c.muted} />
              <T v="title">Add your first exercise</T>
              <T v="small" center>
                Your last weights and reps fill in automatically.
              </T>
            </Card>
          )}
          {active.exercises.map((we, i) => (
            <ExerciseCard
              key={we.id}
              weId={we.id}
              exerciseId={we.exerciseId}
              name={exerciseName(all, we.exerciseId)}
              sets={we.sets}
              prev={previousSets(workouts, we.exerciseId)}
              best={bestsFor(workouts, we.exerciseId).bestE1rm}
              unit={unit}
              first={i === 0}
              last={i === active.exercises.length - 1}
            />
          ))}
        </ScrollView>
      </KeyboardAvoidingView>

      <SafeAreaView edges={['bottom']} style={{ position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: t.c.bg, borderTopWidth: 1, borderTopColor: t.c.border }}>
        <View style={{ padding: 12, paddingHorizontal: 16 }}>
          <Button label="Add exercise" icon="plus" kind="outline" onPress={() => router.push({ pathname: '/picker', params: { mode: 'workout' } })} />
        </View>
      </SafeAreaView>
    </SafeAreaView>
  );
}

function RestTimer() {
  const t = useTheme();
  const restEndsAt = useStore((s) => s.active?.restEndsAt ?? null);
  const restTotal = useStore((s) => s.active?.restTotal ?? 90);
  const setRest = useStore((s) => s.setRest);
  const now = useNow(250);
  const buzzed = useRef<number | null>(null);
  const remaining = restEndsAt ? restEndsAt - now : 0;

  useEffect(() => {
    if (restEndsAt && remaining <= 0 && buzzed.current !== restEndsAt) {
      buzzed.current = restEndsAt;
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      setRest(null);
    }
  }, [remaining, restEndsAt, setRest]);

  if (!restEndsAt || remaining <= 0) return null;
  const pct = Math.max(0, Math.min(1, remaining / (restTotal * 1000)));
  const adjust = (s: number) => setRest(Math.max(Date.now() + 1000, restEndsAt + s * 1000), Math.max(5, restTotal + s));
  const strong = t.dark ? t.c.accent : t.c.text;
  return (
    <View
      accessibilityLiveRegion="polite"
      style={{ marginHorizontal: 16, marginTop: 12, backgroundColor: t.c.tint, borderWidth: 1, borderColor: t.c.tintBorder, borderRadius: rad(t, 14), padding: 12, paddingLeft: 16, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
      <View style={{ flex: 1, gap: 8 }}>
        <Row style={{ justifyContent: 'space-between' }}>
          <T v="small" color={t.c.tintText} style={{ fontFamily: t.fonts.medium }}>
            Rest
          </T>
          <Text style={{ fontFamily: t.fonts.heading, fontSize: 22, color: strong, fontVariant: ['tabular-nums'] }}>{fmtClock(remaining + 999)}</Text>
        </Row>
        <View style={{ height: 4, borderRadius: 2, backgroundColor: t.c.tintBorder }}>
          <View style={{ width: `${pct * 100}%`, height: 4, borderRadius: 2, backgroundColor: strong }} />
        </View>
      </View>
      <SmallBtn label="−15" a11y="Subtract 15 seconds" onPress={() => adjust(-15)} />
      <SmallBtn label="+15" a11y="Add 15 seconds" onPress={() => adjust(15)} />
      <SmallBtn label="Skip" a11y="Skip rest" onPress={() => setRest(null)} plain />
    </View>
  );
}

function SmallBtn({ label, onPress, plain, a11y }: { label: string; onPress: () => void; plain?: boolean; a11y: string }) {
  const t = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={a11y}
      onPress={onPress}
      style={{ minWidth: 44, height: 44, paddingHorizontal: 8, borderRadius: btnRad(t, 10), backgroundColor: plain ? 'transparent' : t.c.tintBorder, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ color: plain ? (t.dark ? t.c.accent : t.c.text) : t.c.text, fontFamily: t.fonts.semibold, fontSize: 13 }}>{label}</Text>
    </Pressable>
  );
}

const COLS = { set: 34, kg: 70, reps: 62, done: 46 };

const ExerciseCard = memo(function ExerciseCard({
  weId,
  exerciseId,
  name,
  sets,
  prev,
  best,
  unit,
  first,
  last,
}: {
  weId: string;
  exerciseId: string;
  name: string;
  sets: SetEntry[];
  prev: SetEntry[];
  best: number;
  unit: Unit;
  first: boolean;
  last: boolean;
}) {
  const t = useTheme();
  const addSet = useStore((s) => s.addSet);
  const removeExercise = useStore((s) => s.removeExerciseFromActive);
  const move = useStore((s) => s.moveExerciseInActive);
  const done = sets.filter((s) => s.done).length;

  const menu = () =>
    Alert.alert(name, undefined, [
      ...(!first ? [{ text: 'Move up', onPress: () => move(weId, -1) }] : []),
      ...(!last ? [{ text: 'Move down', onPress: () => move(weId, 1) }] : []),
      { text: 'Remove exercise', style: 'destructive' as const, onPress: () => removeExercise(weId) },
      { text: 'Cancel', style: 'cancel' as const },
    ]);

  // tip: would the next pending set beat the best est. 1RM?
  const nextPending = sets.find((s) => !s.done && s.weightKg != null && s.reps != null);
  const wouldPr = best > 0 && nextPending && est1rm(nextPending.weightKg!, nextPending.reps!) > best + 0.01;

  return (
    <Card style={{ paddingHorizontal: 12, paddingTop: 14, paddingBottom: 10 }}>
      <Row style={{ justifyContent: 'space-between', paddingHorizontal: 4, paddingBottom: 10, alignItems: 'flex-start' }}>
        <View style={{ flex: 1, gap: 2 }}>
          <T v="title" color={t.dark ? t.c.accent : t.c.text} style={{ fontSize: 17 }}>
            {name}
          </T>
          <T v="small" style={{ fontSize: 12 }}>
            {done} of {sets.length} sets{best > 0 ? ` · best est. 1RM ${toDisplay(best, unit)} ${unit}` : ''}
          </T>
        </View>
        <IconButton icon="more" label={`${name} options`} color={t.c.muted} onPress={menu} />
      </Row>
      <View style={{ flexDirection: 'row', paddingHorizontal: 4, paddingBottom: 6, gap: 6 }}>
        <Text style={[hdr(t), { width: COLS.set }]}>SET</Text>
        <Text style={[hdr(t), { flex: 1, textAlign: 'left' }]}>PREVIOUS</Text>
        <Text style={[hdr(t), { width: COLS.kg }]}>{unit.toUpperCase()}</Text>
        <Text style={[hdr(t), { width: COLS.reps }]}>REPS</Text>
        <View style={{ width: COLS.done }} />
      </View>
      {sets.map((s, i) => (
        <SetRow key={s.id} weId={weId} set={s} index={i} prev={prev[i]} unit={unit} exerciseId={exerciseId} />
      ))}
      <Pressable
        accessibilityRole="button"
        onPress={() => addSet(weId)}
        style={({ pressed }) => ({ height: 44, marginTop: 8, borderRadius: rad(t, 10), backgroundColor: t.c.surface2, alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.8 : 1 })}>
        <Text style={{ color: t.c.text, fontFamily: t.fonts.semibold, fontSize: 14 }}>+ Add set</Text>
      </Pressable>
      {wouldPr && (
        <T v="small" style={{ fontSize: 12, marginTop: 8, marginHorizontal: 4 }}>
          {toDisplay(nextPending!.weightKg, unit)} {unit} × {nextPending!.reps} would be a new best (est. 1RM {toDisplay(est1rm(nextPending!.weightKg!, nextPending!.reps!), unit)} {unit})
        </T>
      )}
    </Card>
  );
});

const hdr = (t: ReturnType<typeof useTheme>) => ({ color: t.c.muted, fontFamily: t.fonts.semibold, fontSize: 11, letterSpacing: 0.4, textAlign: 'center' as const });

function SetRow({ weId, set, index, prev, unit }: { weId: string; set: SetEntry; index: number; prev?: SetEntry; unit: Unit; exerciseId: string }) {
  const t = useTheme();
  const updateSet = useStore((s) => s.updateSet);
  const removeSet = useStore((s) => s.removeSet);
  const toggle = useStore((s) => s.toggleSetDone);
  const [w, setW] = useState(toDisplay(set.weightKg, unit));
  const [r, setR] = useState(set.reps == null ? '' : String(set.reps));

  const onToggle = () => {
    if (!set.done && (set.weightKg == null || set.reps == null)) {
      // allow ticking with previous values if fields are empty
      if (prev && set.weightKg == null && set.reps == null) {
        updateSet(weId, set.id, { weightKg: prev.weightKg, reps: prev.reps });
        setW(toDisplay(prev.weightKg, unit));
        setR(String(prev.reps ?? ''));
      } else if (set.reps == null) {
        Alert.alert('Add reps first', 'Enter how many reps you did, then tick the set.');
        return;
      }
    }
    const nowDone = toggle(weId, set.id);
    if (nowDone) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  };

  const onLong = () =>
    Alert.alert(`Set ${index + 1}`, undefined, [
      { text: set.warmup ? 'Mark as working set' : 'Mark as warm-up', onPress: () => updateSet(weId, set.id, { warmup: !set.warmup }) },
      { text: 'Delete set', style: 'destructive', onPress: () => removeSet(weId, set.id) },
      { text: 'Cancel', style: 'cancel' },
    ]);

  const input = (active: boolean) => ({
    height: 40,
    borderRadius: rad(t, 10),
    backgroundColor: set.done ? 'transparent' : t.c.surface2,
    borderWidth: active ? 1.5 : 0,
    borderColor: t.c.accent,
    color: t.c.text,
    textAlign: 'center' as const,
    fontFamily: t.fonts.semibold,
    fontSize: 16,
    padding: 0,
  });

  return (
    <Pressable
      onLongPress={onLong}
      delayLongPress={350}
      accessibilityHint="Long press for set options"
      style={{ flexDirection: 'row', alignItems: 'center', gap: 6, padding: 4, marginTop: 4, borderRadius: rad(t, 10), backgroundColor: set.done ? t.c.tint : 'transparent' }}>
      <Text style={{ width: COLS.set, textAlign: 'center', color: set.warmup ? t.c.muted : t.c.text, fontFamily: t.fonts.semibold, fontSize: 15 }}>{set.warmup ? 'W' : index + 1}</Text>
      <Text style={{ flex: 1, color: t.c.muted, fontFamily: t.fonts.regular, fontSize: 13 }} numberOfLines={1}>
        {prev ? `${toDisplay(prev.weightKg, unit)} × ${prev.reps}` : '–'}
      </Text>
      <TextInput
        accessibilityLabel={`Set ${index + 1} weight in ${unit}`}
        value={w}
        onChangeText={(v) => {
          setW(v);
          updateSet(weId, set.id, { weightKg: fromDisplay(v, unit) });
        }}
        placeholder={prev ? toDisplay(prev.weightKg, unit) : '0'}
        placeholderTextColor={t.c.muted}
        keyboardType="decimal-pad"
        selectTextOnFocus
        editable={!set.done}
        style={[input(false), { width: COLS.kg }]}
      />
      <TextInput
        accessibilityLabel={`Set ${index + 1} reps`}
        value={r}
        onChangeText={(v) => {
          setR(v);
          const n = parseInt(v, 10);
          updateSet(weId, set.id, { reps: Number.isNaN(n) ? null : n });
        }}
        placeholder={prev?.reps != null ? String(prev.reps) : '0'}
        placeholderTextColor={t.c.muted}
        keyboardType="number-pad"
        selectTextOnFocus
        editable={!set.done}
        style={[input(false), { width: COLS.reps }]}
      />
      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked: set.done }}
        accessibilityLabel={`Set ${index + 1} done`}
        onPress={onToggle}
        style={{ width: 44, height: 40, marginLeft: 2, borderRadius: rad(t, 10), backgroundColor: set.done ? t.c.accent : t.c.surface2, alignItems: 'center', justifyContent: 'center' }}>
        <Icon name="check" size={18} color={set.done ? t.c.onAccent : t.c.muted} strokeWidth={3} />
      </Pressable>
    </Pressable>
  );
}

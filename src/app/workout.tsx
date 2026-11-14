import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { memo, useEffect, useRef, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import Animated, { FadeIn, LinearTransition, ZoomIn, useAnimatedStyle, useReducedMotion, useSharedValue, withTiming } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ExThumb } from '@/components/exthumb';
import { Icon } from '@/components/icons';
import { RestPicker, restLabel } from '@/components/restpicker';
import { Sheet, SheetOption } from '@/components/sheet';
import { useToast } from '@/components/toast';
import { Appear, Button, Card, Field, IconButton, Row, T, btnRad, rad, useTheme } from '@/components/ui';
import { bestsFor, est1rm, exerciseName, fmtClock, fmtE1rm, fmtSeconds, fmtSet, fromDisplay, previousSets, toDisplay } from '@/lib/calc';
import { useNow } from '@/lib/hooks';
import { cancelRestDone, scheduleRestDone } from '@/lib/notify';
import { kindOf, setLoad } from '@/lib/registry';
import { useStore } from '@/lib/store';
import type { ExerciseKind, SetEntry, Unit } from '@/lib/types';

export default function WorkoutScreen() {
  const t = useTheme();
  const active = useStore((s) => s.active);
  const unit = useStore((s) => s.settings.unit);
  const defaultRest = useStore((s) => s.settings.restSeconds);
  const workouts = useStore((s) => s.workouts);
  const finishWorkout = useStore((s) => s.finishWorkout);
  const discardWorkout = useStore((s) => s.discardWorkout);
  const renameActive = useStore((s) => s.renameActive);
  const now = useNow(1000);
  const finishing = useRef(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [renaming, setRenaming] = useState<string | null>(null);

  useEffect(() => {
    // leave the screen if the workout was discarded (not when we just finished it)
    if (!active && !finishing.current) router.replace('/');
  }, [active]);
  if (!active) return null;

  const doneSets = active.exercises.reduce((n, we) => n + we.sets.filter((s) => s.done).length, 0);
  const pendingWithValues = active.exercises.reduce(
    (n, we) => n + we.sets.filter((s) => !s.done && (s.reps != null || s.durationSec != null)).length,
    0,
  );

  const doFinish = () => {
    if (finishing.current) return; // guard against double taps
    finishing.current = true;
    cancelRestDone();
    const id = finishWorkout();
    if (id) router.replace(`/summary/${id}`);
  };

  const discard = () =>
    Alert.alert('Discard this workout?', 'Nothing from this session will be saved.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Discard',
        style: 'destructive',
        onPress: () => {
          cancelRestDone();
          discardWorkout();
        },
      },
    ]);

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

  const banded = t.c.band !== t.c.bg;

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: t.c.bg }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 8,
          paddingVertical: 8,
          backgroundColor: t.c.band,
          borderBottomWidth: 1,
          borderBottomColor: banded ? t.c.band : t.c.border,
        }}>
        <IconButton icon="chevronDown" label="Minimise workout" color={t.c.bandText} onPress={() => router.back()} />
        <Pressable
          style={{ flex: 1, alignItems: 'center', paddingHorizontal: 4 }}
          onPress={() => setMenuOpen(true)}
          accessibilityRole="button"
          accessibilityLabel="Workout options">
          <Text
            numberOfLines={1}
            style={{ color: t.c.bandText, fontFamily: t.fonts.bold, fontSize: 16, textTransform: t.upper ? 'uppercase' : 'none' }}>
            {active.name}
          </Text>
          <Text style={{ color: t.c.bandMuted, fontFamily: t.fonts.medium, fontSize: 13, fontVariant: ['tabular-nums'] }}>
            {fmtClock(now - active.startedAt)} · {doneSets} set{doneSets === 1 ? '' : 's'}
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={onFinish}
          style={{
            minHeight: 40,
            paddingHorizontal: 16,
            borderRadius: btnRad(t, 10),
            backgroundColor: banded ? t.c.bandBtn : t.c.accent,
            justifyContent: 'center',
          }}>
          <Text style={{ color: banded ? t.c.bandBtnText : t.c.onAccent, fontFamily: t.fonts.bold, fontSize: 14 }}>Finish</Text>
        </Pressable>
      </View>

      <RestTimer />

      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding" keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 24}>
        <ScrollView
          contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 140 }}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag">
          {active.exercises.length === 0 && (
            <Appear>
              <Card style={{ alignItems: 'center', gap: 8, paddingVertical: 28 }}>
                <Icon name="dumbbell" size={28} color={t.c.muted} />
                <T v="title">Add your first exercise</T>
                <T v="small" center>
                  Your last weights and reps fill in automatically.
                </T>
              </Card>
            </Appear>
          )}
          {active.exercises.map((we, i) => (
            <Animated.View key={we.id} layout={LinearTransition.duration(220)}>
              <Appear i={i}>
                <ExerciseCard
                  weId={we.id}
                  exerciseId={we.exerciseId}
                  name={exerciseName(null, we.exerciseId)}
                  sets={we.sets}
                  restSec={we.restSec}
                  defaultRest={defaultRest}
                  note={we.note}
                  prev={previousSets(workouts, we.exerciseId)}
                  best={bestsFor(workouts, we.exerciseId)}
                  unit={unit}
                  first={i === 0}
                  last={i === active.exercises.length - 1}
                />
              </Appear>
            </Animated.View>
          ))}
        </ScrollView>
      </KeyboardAvoidingView>

      <SafeAreaView
        edges={['bottom']}
        style={{ position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: t.c.bg, borderTopWidth: 1, borderTopColor: t.c.border }}>
        <View style={{ padding: 12, paddingHorizontal: 16 }}>
          <Button label="Add exercise" icon="plus" kind="outline" onPress={() => router.push({ pathname: '/picker', params: { mode: 'workout' } })} />
        </View>
      </SafeAreaView>

      <Sheet visible={menuOpen} onClose={() => setMenuOpen(false)} title={active.name}>
        <SheetOption
          label="Rename workout"
          onPress={() => {
            setMenuOpen(false);
            setRenaming(active.name);
          }}
        />
        <SheetOption
          label="Discard workout"
          detail="Delete this session without saving"
          onPress={() => {
            setMenuOpen(false);
            discard();
          }}
        />
      </Sheet>
      <Sheet visible={renaming !== null} onClose={() => setRenaming(null)} title="Rename workout">
        <Field label="Name" value={renaming ?? ''} onChangeText={setRenaming} autoFocus placeholder="e.g. Push Day" />
        <Button
          label="Save name"
          style={{ marginTop: 12 }}
          disabled={!renaming?.trim()}
          onPress={() => {
            renameActive(renaming!.trim());
            setRenaming(null);
          }}
        />
      </Sheet>
    </SafeAreaView>
  );
}

function RestTimer() {
  const t = useTheme();
  const reduced = useReducedMotion();
  const restEndsAt = useStore((s) => s.active?.restEndsAt ?? null);
  const restTotal = useStore((s) => s.active?.restTotal ?? 90);
  const setRest = useStore((s) => s.setRest);
  const now = useNow(250);
  const buzzed = useRef<number | null>(null);
  const remaining = restEndsAt ? restEndsAt - now : 0;
  const pct = restEndsAt ? Math.max(0, Math.min(1, remaining / (restTotal * 1000))) : 0;
  const progress = useSharedValue(pct);
  useEffect(() => {
    progress.set(reduced ? pct : withTiming(pct, { duration: 250 }));
  }, [pct, reduced, progress]);
  const barStyle = useAnimatedStyle(() => ({ width: `${progress.value * 100}%` }));

  // background notification follows the timer
  useEffect(() => {
    if (restEndsAt && restEndsAt > Date.now()) scheduleRestDone(restEndsAt);
    else cancelRestDone();
  }, [restEndsAt]);

  useEffect(() => {
    if (restEndsAt && remaining <= 0 && buzzed.current !== restEndsAt) {
      buzzed.current = restEndsAt;
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      setRest(null);
    }
  }, [remaining, restEndsAt, setRest]);

  if (!restEndsAt || remaining <= 0) return null;
  const adjust = (s: number) => setRest(Math.max(Date.now() + 1000, restEndsAt + s * 1000), Math.max(5, restTotal + s));
  const strong = t.dark ? t.c.accent : t.c.text;
  return (
    <Animated.View
      entering={reduced ? undefined : FadeIn.duration(200)}
      accessibilityLiveRegion="polite"
      style={{
        marginHorizontal: 16,
        marginTop: 12,
        backgroundColor: t.c.tint,
        borderWidth: 1,
        borderColor: t.c.tintBorder,
        borderRadius: rad(t, 14),
        padding: 12,
        paddingLeft: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
      }}>
      <View style={{ flex: 1, gap: 8 }}>
        <Row style={{ justifyContent: 'space-between' }}>
          <T v="small" color={t.c.tintText} style={{ fontFamily: t.fonts.medium }}>
            Rest
          </T>
          <Text style={{ fontFamily: t.fonts.heading, fontSize: 22, color: strong, fontVariant: ['tabular-nums'] }}>{fmtClock(remaining + 999)}</Text>
        </Row>
        <View style={{ height: 4, borderRadius: 2, backgroundColor: t.c.tintBorder, overflow: 'hidden' }}>
          <Animated.View style={[{ height: 4, borderRadius: 2, backgroundColor: strong }, barStyle]} />
        </View>
      </View>
      <SmallBtn label="−15" a11y="Subtract 15 seconds" onPress={() => adjust(-15)} />
      <SmallBtn label="+15" a11y="Add 15 seconds" onPress={() => adjust(15)} />
      <SmallBtn label="Skip" a11y="Skip rest" onPress={() => setRest(null)} plain />
    </Animated.View>
  );
}

function SmallBtn({ label, onPress, plain, a11y }: { label: string; onPress: () => void; plain?: boolean; a11y: string }) {
  const t = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={a11y}
      onPress={onPress}
      style={{
        minWidth: 44,
        height: 44,
        paddingHorizontal: 8,
        borderRadius: btnRad(t, 10),
        backgroundColor: plain ? 'transparent' : t.c.tintBorder,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <Text
        maxFontSizeMultiplier={1.3}
        style={{ color: plain ? (t.dark ? t.c.accent : t.c.text) : t.c.text, fontFamily: t.fonts.semibold, fontSize: 13 }}>
        {label}
      </Text>
    </Pressable>
  );
}

const COLS = { set: 30, kg: 74, reps: 60, done: 46 };

const ExerciseCard = memo(function ExerciseCard({
  weId,
  exerciseId,
  name,
  sets,
  restSec,
  defaultRest,
  note,
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
  restSec: number | undefined;
  defaultRest: number;
  note?: string;
  prev: SetEntry[];
  best: ReturnType<typeof bestsFor>;
  unit: Unit;
  first: boolean;
  last: boolean;
}) {
  const t = useTheme();
  const addSet = useStore((s) => s.addSet);
  const removeExercise = useStore((s) => s.removeExerciseFromActive);
  const restoreExercise = useStore((s) => s.restoreExercise);
  const move = useStore((s) => s.moveExerciseInActive);
  const setExerciseRest = useStore((s) => s.setExerciseRest);
  const setNote = useStore((s) => s.setExerciseNote);
  const toast = useToast((s) => s.show);
  const [menu, setMenu] = useState(false);
  const [restOpen, setRestOpen] = useState(false);
  const [noteOpen, setNoteOpen] = useState(note !== undefined && note !== '');
  const kind = kindOf(exerciseId);
  const done = sets.filter((s) => s.done).length;

  const remove = () => {
    const r = removeExercise(weId);
    if (r) toast(`Removed ${name}`, () => restoreExercise(r.we, r.index));
  };

  // tip: would the next pending set beat the best est. 1RM?
  const nextPending = sets.find((s) => !s.done && s.reps != null && (kind === 'bodyweight' || s.weightKg != null));
  const nextE1rm = nextPending && kind !== 'time' ? est1rm(setLoad(exerciseId, nextPending), nextPending.reps!) : 0;
  const wouldPr = best.bestE1rm > 0 && nextE1rm > best.bestE1rm + 0.01;
  const bestText =
    kind === 'time'
      ? best.bestDuration
        ? ` · best ${fmtSeconds(best.bestDuration)}`
        : ''
      : best.bestE1rm > 0 && kind === 'weight'
        ? ` · best est. 1RM ${fmtE1rm(best.bestE1rm, unit)}`
        : '';

  return (
    <Card style={{ paddingHorizontal: 12, paddingTop: 12, paddingBottom: 10 }}>
      <Row style={{ paddingHorizontal: 2, paddingBottom: 8, alignItems: 'flex-start' }} gap={10}>
        <Pressable
          onPress={() => router.push(`/exercise/${encodeURIComponent(exerciseId)}`)}
          accessibilityRole="button"
          accessibilityLabel={`About ${name}`}>
          <ExThumb exerciseId={exerciseId} size={44} />
        </Pressable>
        <Pressable style={{ flex: 1, gap: 2 }} onPress={() => router.push(`/exercise/${encodeURIComponent(exerciseId)}`)} accessibilityRole="button">
          <T v="title" color={t.dark ? t.c.accent : t.c.text} style={{ fontSize: 17 }} numberOfLines={2}>
            {name}
          </T>
          <T v="small" style={{ fontSize: 12 }}>
            {done} of {sets.length} sets{bestText}
          </T>
        </Pressable>
        <IconButton icon="more" label={`${name} options`} color={t.c.muted} onPress={() => setMenu(true)} />
      </Row>

      <Row gap={8} style={{ paddingHorizontal: 2, paddingBottom: 8, flexWrap: 'wrap' }}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${restLabel(restSec, defaultRest)}. Change rest time`}
          onPress={() => setRestOpen(true)}
          style={{
            minHeight: 34,
            paddingHorizontal: 12,
            borderRadius: 17,
            backgroundColor: t.c.surface2,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
          }}>
          <Icon name="timer" size={15} color={t.c.muted} />
          <Text style={{ color: t.c.text, fontFamily: t.fonts.medium, fontSize: 13 }}>{restLabel(restSec, defaultRest)}</Text>
        </Pressable>
        {!noteOpen && (
          <Pressable
            accessibilityRole="button"
            onPress={() => setNoteOpen(true)}
            style={{ minHeight: 34, paddingHorizontal: 12, borderRadius: 17, backgroundColor: t.c.surface2, justifyContent: 'center' }}>
            <Text style={{ color: t.c.text, fontFamily: t.fonts.medium, fontSize: 13 }}>+ Note</Text>
          </Pressable>
        )}
      </Row>
      {noteOpen && (
        <TextInput
          accessibilityLabel={`Note for ${name}`}
          value={note ?? ''}
          onChangeText={(v) => setNote(weId, v)}
          placeholder="e.g. seat height 4, grip wider"
          placeholderTextColor={t.c.muted}
          multiline
          style={{
            marginHorizontal: 2,
            marginBottom: 8,
            minHeight: 40,
            borderRadius: rad(t, 10),
            backgroundColor: t.c.surface2,
            color: t.c.text,
            paddingHorizontal: 12,
            paddingVertical: 8,
            fontFamily: t.fonts.regular,
            fontSize: 14,
          }}
        />
      )}

      <View style={{ flexDirection: 'row', paddingHorizontal: 4, paddingBottom: 6, gap: 6 }}>
        <Text style={[hdr(t), { width: COLS.set }]}>SET</Text>
        <Text style={[hdr(t), { flex: 1, textAlign: 'left' }]}>PREVIOUS</Text>
        {kind === 'time' ? (
          <Text style={[hdr(t), { width: COLS.kg + COLS.reps + 6 }]}>SECONDS</Text>
        ) : (
          <>
            <Text style={[hdr(t), { width: COLS.kg }]}>{kind === 'bodyweight' ? `+${unit.toUpperCase()}` : unit.toUpperCase()}</Text>
            <Text style={[hdr(t), { width: COLS.reps }]}>REPS</Text>
          </>
        )}
        <View style={{ width: COLS.done }} />
      </View>
      {sets.map((s, i) => (
        <SetRow key={s.id} weId={weId} set={s} index={i} prev={prev[i]} unit={unit} exerciseId={exerciseId} kind={kind} name={name} />
      ))}
      <Pressable
        accessibilityRole="button"
        onPress={() => addSet(weId)}
        style={({ pressed }) => ({
          minHeight: 44,
          marginTop: 8,
          borderRadius: rad(t, 10),
          backgroundColor: t.c.surface2,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: pressed ? 0.8 : 1,
        })}>
        <Text style={{ color: t.c.text, fontFamily: t.fonts.semibold, fontSize: 14 }}>+ Add set</Text>
      </Pressable>
      {wouldPr && (
        <T v="small" style={{ fontSize: 12, marginTop: 8, marginHorizontal: 4 }}>
          {fmtSet(exerciseId, nextPending!, unit)} would be a new best (est. 1RM {fmtE1rm(nextE1rm, unit)})
        </T>
      )}

      <RestPicker
        visible={restOpen}
        onClose={() => setRestOpen(false)}
        value={restSec}
        fallback={defaultRest}
        onChange={(v) => setExerciseRest(weId, v)}
        title={`Rest · ${name}`}
      />
      <Sheet visible={menu} onClose={() => setMenu(false)} title={name}>
        <SheetOption
          label="How to do it"
          detail="Pictures, steps and your history"
          onPress={() => {
            setMenu(false);
            router.push(`/exercise/${encodeURIComponent(exerciseId)}`);
          }}
        />
        {!first && (
          <SheetOption
            label="Move up"
            onPress={() => {
              move(weId, -1);
              setMenu(false);
            }}
          />
        )}
        {!last && (
          <SheetOption
            label="Move down"
            onPress={() => {
              move(weId, 1);
              setMenu(false);
            }}
          />
        )}
        <SheetOption
          label="Remove exercise"
          onPress={() => {
            setMenu(false);
            remove();
          }}
        />
      </Sheet>
    </Card>
  );
});

const hdr = (t: ReturnType<typeof useTheme>) => ({
  color: t.c.muted,
  fontFamily: t.fonts.semibold,
  fontSize: 11,
  letterSpacing: 0.4,
  textAlign: 'center' as const,
});

function SetRow({
  weId,
  set,
  index,
  prev,
  unit,
  exerciseId,
  kind,
  name,
}: {
  weId: string;
  set: SetEntry;
  index: number;
  prev?: SetEntry;
  unit: Unit;
  exerciseId: string;
  kind: ExerciseKind;
  name: string;
}) {
  const t = useTheme();
  const reduced = useReducedMotion();
  const updateSet = useStore((s) => s.updateSet);
  const removeSet = useStore((s) => s.removeSet);
  const restoreSet = useStore((s) => s.restoreSet);
  const toggle = useStore((s) => s.toggleSetDone);
  const toast = useToast((s) => s.show);
  const [w, setW] = useState(toDisplay(set.weightKg, unit));
  const [r, setR] = useState(set.reps == null ? '' : String(set.reps));
  const [d, setD] = useState(set.durationSec == null ? '' : String(set.durationSec));
  const [focusW, setFocusW] = useState(false);
  const [menu, setMenu] = useState(false);
  const step = unit === 'kg' ? 2.5 : 5;

  const bump = (delta: number) => {
    const cur = fromDisplay(w || '0', unit) ?? 0;
    const shown = Math.max(0, Number(toDisplay(cur, unit)) + delta);
    const v = String(Number(shown.toFixed(2)));
    setW(v);
    updateSet(weId, set.id, { weightKg: fromDisplay(v, unit) });
  };

  const onToggle = () => {
    if (!set.done) {
      if (kind === 'time' && !set.durationSec) {
        if (prev?.durationSec) {
          updateSet(weId, set.id, { durationSec: prev.durationSec });
          setD(String(prev.durationSec));
        } else {
          Alert.alert('Add the time first', 'Enter how many seconds you held it, then tick the set.');
          return;
        }
      } else if (kind !== 'time' && set.reps == null) {
        if (prev?.reps != null) {
          updateSet(weId, set.id, { weightKg: set.weightKg ?? prev.weightKg, reps: prev.reps });
          setW(toDisplay(set.weightKg ?? prev.weightKg, unit));
          setR(String(prev.reps));
        } else {
          Alert.alert('Add reps first', 'Enter how many reps you did, then tick the set.');
          return;
        }
      }
    }
    const nowDone = toggle(weId, set.id);
    if (nowDone) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  };

  const input = {
    height: 42,
    borderRadius: rad(t, 10),
    backgroundColor: set.done ? 'transparent' : t.c.surface2,
    color: t.c.text,
    textAlign: 'center' as const,
    fontFamily: t.fonts.semibold,
    fontSize: 16,
    padding: 0,
  };

  const prevText = prev ? fmtSet(exerciseId, prev, unit) : '–';

  return (
    <View>
      <Pressable
        onLongPress={() => setMenu(true)}
        delayLongPress={350}
        accessibilityHint="Long press for set options"
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
          padding: 4,
          marginTop: 4,
          borderRadius: rad(t, 10),
          backgroundColor: set.done ? t.c.tint : 'transparent',
        }}>
        <Text
          maxFontSizeMultiplier={1.3}
          style={{ width: COLS.set, textAlign: 'center', color: set.warmup ? t.c.muted : t.c.text, fontFamily: t.fonts.semibold, fontSize: 15 }}>
          {set.warmup ? 'W' : index + 1}
        </Text>
        <Text maxFontSizeMultiplier={1.3} style={{ flex: 1, color: t.c.muted, fontFamily: t.fonts.regular, fontSize: 13 }} numberOfLines={1}>
          {prevText}
        </Text>
        {kind === 'time' ? (
          <TextInput
            accessibilityLabel={`Set ${index + 1} seconds`}
            value={d}
            onChangeText={(v) => {
              setD(v);
              const n = parseInt(v, 10);
              updateSet(weId, set.id, { durationSec: Number.isNaN(n) ? null : n });
            }}
            placeholder={prev?.durationSec ? String(prev.durationSec) : '30'}
            placeholderTextColor={t.c.muted}
            keyboardType="number-pad"
            selectTextOnFocus
            editable={!set.done}
            maxFontSizeMultiplier={1.3}
            style={[input, { width: COLS.kg + COLS.reps + 6 }]}
          />
        ) : (
          <>
            <TextInput
              accessibilityLabel={`Set ${index + 1} ${kind === 'bodyweight' ? 'added weight' : 'weight'} in ${unit}`}
              value={w}
              onChangeText={(v) => {
                setW(v);
                updateSet(weId, set.id, { weightKg: fromDisplay(v, unit) ?? (kind === 'bodyweight' ? 0 : null) });
              }}
              onFocus={() => setFocusW(true)}
              onBlur={() => setFocusW(false)}
              placeholder={kind === 'bodyweight' ? '0' : prev ? toDisplay(prev.weightKg, unit) : '0'}
              placeholderTextColor={t.c.muted}
              keyboardType="decimal-pad"
              selectTextOnFocus
              editable={!set.done}
              maxFontSizeMultiplier={1.3}
              style={[input, { width: COLS.kg, borderWidth: focusW ? 1.5 : 0, borderColor: t.c.accent }]}
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
              maxFontSizeMultiplier={1.3}
              style={[input, { width: COLS.reps }]}
            />
          </>
        )}
        <Pressable
          accessibilityRole="checkbox"
          accessibilityState={{ checked: set.done }}
          accessibilityLabel={`Set ${index + 1} done`}
          onPress={onToggle}
          style={{
            width: 44,
            height: 42,
            marginLeft: 2,
            borderRadius: rad(t, 10),
            backgroundColor: set.done ? t.c.accent : t.c.surface2,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          {set.done ? (
            <Animated.View key="on" entering={reduced ? undefined : ZoomIn.springify().damping(12)}>
              <Icon name="check" size={19} color={t.c.onAccent} strokeWidth={3} />
            </Animated.View>
          ) : (
            <Icon name="check" size={18} color={t.c.muted} strokeWidth={3} />
          )}
        </Pressable>
      </Pressable>
      {focusW && !set.done && kind !== 'time' && (
        <Row gap={6} style={{ paddingLeft: COLS.set + 10, paddingTop: 6 }}>
          {[-step * 2, -step, step, step * 2].map((delta) => (
            <Pressable
              key={delta}
              accessibilityRole="button"
              accessibilityLabel={`${delta > 0 ? 'Add' : 'Subtract'} ${Math.abs(delta)} ${unit}`}
              onPress={() => bump(delta)}
              style={{
                minWidth: 56,
                height: 36,
                borderRadius: rad(t, 9),
                backgroundColor: t.c.surface2,
                alignItems: 'center',
                justifyContent: 'center',
                paddingHorizontal: 8,
              }}>
              <Text style={{ color: t.c.text, fontFamily: t.fonts.semibold, fontSize: 13 }}>
                {delta > 0 ? '+' : '−'}
                {Math.abs(delta)}
              </Text>
            </Pressable>
          ))}
        </Row>
      )}
      <Sheet visible={menu} onClose={() => setMenu(false)} title={`${name} · set ${index + 1}`}>
        <SheetOption
          label={set.warmup ? 'Mark as working set' : 'Mark as warm-up'}
          detail="Warm-ups don't count for records or volume"
          onPress={() => {
            updateSet(weId, set.id, { warmup: !set.warmup });
            setMenu(false);
          }}
        />
        <SheetOption
          label="Delete set"
          onPress={() => {
            setMenu(false);
            const res = removeSet(weId, set.id);
            if (res) toast(`Deleted set ${index + 1}`, () => restoreSet(weId, res.set, res.index));
          }}
        />
      </Sheet>
    </View>
  );
}

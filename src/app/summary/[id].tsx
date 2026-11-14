import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { TextInput, View } from 'react-native';

import { Burst, CountUp } from '@/components/celebrate';
import { Icon } from '@/components/icons';
import { Appear, Button, Card, Field, Row, Screen, T, rad, useTheme } from '@/components/ui';
import {
  exerciseName,
  fmtDate,
  fmtE1rm,
  fmtDuration,
  fmtSeconds,
  fmtSet,
  fmtVolume,
  prsInWorkout,
  toDisplay,
  workoutSetCount,
  workoutVolumeKg,
} from '@/lib/calc';
import { setLoad } from '@/lib/registry';
import { useAllExercises, useStore } from '@/lib/store';

export default function Summary() {
  const t = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const workouts = useStore((s) => s.workouts);
  const unit = useStore((s) => s.settings.unit);
  const updateWorkout = useStore((s) => s.updateWorkout);
  const all = useAllExercises();
  const w = workouts.find((x) => x.id === id);
  const [notes, setNotes] = useState(w?.notes ?? '');
  const [name, setName] = useState(w?.name ?? '');

  if (!w) {
    return (
      <Screen>
        <T>Workout not found.</T>
        <Button label="Home" onPress={() => router.replace('/')} />
      </Screen>
    );
  }
  const prs = prsInWorkout(workouts, w);

  const volume = workoutVolumeKg(w);
  const durationMs = (w.endedAt ?? w.startedAt) - w.startedAt;
  const big = { fontFamily: t.fonts.heading, fontSize: 22, color: t.c.text, fontVariant: ['tabular-nums' as const] };

  const save = () => {
    updateWorkout(w.id, { notes: notes.trim() || undefined, name: name.trim() || w.name });
    router.replace('/');
  };

  return (
    <Screen
      edges={['top', 'bottom']}
      footer={
        <View style={{ padding: 20, paddingTop: 8 }}>
          <Button label="Save workout" onPress={save} />
        </View>
      }>
      <View style={{ alignItems: 'center', gap: 10, marginTop: 16 }}>
        {prs.length > 0 && <Burst />}
        <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: t.c.accent, alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="check" size={30} color={t.c.onAccent} strokeWidth={3} />
        </View>
        <T v="h1" center>
          Workout complete
        </T>
        <T v="small" center>
          {fmtDate(w.startedAt, { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
        </T>
      </View>

      <TextInput
        accessibilityLabel="Workout name"
        value={name}
        onChangeText={setName}
        style={{
          textAlign: 'center',
          color: t.c.text,
          fontFamily: t.fonts.semibold,
          fontSize: 17,
          borderBottomWidth: 1,
          borderBottomColor: t.c.border,
          paddingVertical: 8,
          marginHorizontal: 40,
        }}
      />

      <Appear i={1}>
        <Row gap={10}>
          <Card style={{ flex: 1, padding: 14, gap: 4 }}>
            <T v="small">Duration</T>
            <T v="num">{fmtDuration(durationMs)}</T>
          </Card>
          <Card style={{ flex: 1, padding: 14, gap: 4 }}>
            <T v="small">Volume</T>
            <CountUp value={volume} format={(v) => fmtVolume(v, unit)} style={big} />
          </Card>
        </Row>
      </Appear>
      <Appear i={2}>
        <Row gap={10}>
          <Card style={{ flex: 1, padding: 14, gap: 4 }}>
            <T v="small">Sets</T>
            <CountUp value={workoutSetCount(w)} format={(v) => String(Math.round(v))} style={big} />
          </Card>
          <Card tint={prs.length > 0} style={{ flex: 1, padding: 14, gap: 4 }}>
            <T v="small" color={prs.length > 0 ? t.c.tintText : undefined}>
              Personal records
            </T>
            <CountUp
              value={prs.length}
              format={(v) => String(Math.round(v))}
              style={[big, prs.length > 0 && t.dark ? { color: t.c.accent } : null]}
            />
          </Card>
        </Row>
      </Appear>

      {prs.length > 0 && (
        <View style={{ gap: 8 }}>
          <T v="label">New records</T>
          {prs.map((p, i) => (
            <Card key={i} style={{ paddingVertical: 14 }}>
              <Row>
                <Icon name="trophy" color={t.dark ? t.c.accent : t.c.text} />
                <View style={{ flex: 1, gap: 2 }}>
                  <T v="bodyStrong">
                    {exerciseName(all, p.exerciseId)}
                    {p.kind === 'time'
                      ? ` · ${fmtSeconds(p.value)}`
                      : ` · ${fmtSet(p.exerciseId, { id: '', weightKg: p.weightKg, reps: p.reps, done: true }, unit)}`}
                  </T>
                  <T v="small" style={{ fontSize: 12 }}>
                    {p.kind === 'time'
                      ? `Longest hold (was ${fmtSeconds(p.previous)})`
                      : p.kind === 'e1rm'
                        ? `Best est. 1RM: ${fmtE1rm(p.value, unit)} (+${fmtE1rm(Math.max(p.value - p.previous, 0), unit)})`
                        : `Heaviest weight lifted (was ${toDisplay(p.previous, unit)} ${unit})`}
                  </T>
                </View>
              </Row>
            </Card>
          ))}
        </View>
      )}

      <View style={{ gap: 8 }}>
        <T v="label">Exercises</T>
        <Card style={{ gap: 10 }}>
          {w.exercises.map((we) => (
            <Row key={we.id} style={{ justifyContent: 'space-between' }}>
              <T v="body" style={{ flex: 1 }} numberOfLines={1}>
                {exerciseName(all, we.exerciseId)}
              </T>
              <T v="small">
                {we.sets.length} sets · best{' '}
                {fmtSet(
                  we.exerciseId,
                  [...we.sets].sort(
                    (a, b) =>
                      setLoad(we.exerciseId, b) * (b.reps ?? 1) +
                      (b.durationSec ?? 0) -
                      (setLoad(we.exerciseId, a) * (a.reps ?? 1) + (a.durationSec ?? 0)),
                  )[0]!,
                  unit,
                )}
              </T>
            </Row>
          ))}
        </Card>
      </View>

      <Field
        label="Notes"
        value={notes}
        onChangeText={setNotes}
        placeholder="How did it feel? Anything to change next time?"
        multiline
        style={{ height: 96, paddingTop: 12, textAlignVertical: 'top', borderRadius: rad(t, 14) }}
      />
    </Screen>
  );
}

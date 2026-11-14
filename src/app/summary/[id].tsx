import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { TextInput, View } from 'react-native';

import { Icon } from '@/components/icons';
import { Button, Card, Field, Row, Screen, Stat, T, rad, useTheme } from '@/components/ui';
import { exerciseName, fmtDate, fmtDuration, fmtWeight, prsInWorkout, toDisplay, workoutSetCount, workoutVolumeKg } from '@/lib/calc';
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
        style={{ textAlign: 'center', color: t.c.text, fontFamily: t.fonts.semibold, fontSize: 17, borderBottomWidth: 1, borderBottomColor: t.c.border, paddingVertical: 8, marginHorizontal: 40 }}
      />

      <Row gap={10}>
        <Stat label="Duration" value={fmtDuration((w.endedAt ?? w.startedAt) - w.startedAt)} />
        <Stat label="Volume" value={fmtWeight(Math.round(workoutVolumeKg(w)), unit)} />
      </Row>
      <Row gap={10}>
        <Stat label="Sets" value={String(workoutSetCount(w))} />
        <Stat label="Personal records" value={String(prs.length)} tint={prs.length > 0} />
      </Row>

      {prs.length > 0 && (
        <View style={{ gap: 8 }}>
          <T v="label">New records</T>
          {prs.map((p, i) => (
            <Card key={i} style={{ paddingVertical: 14 }}>
              <Row>
                <Icon name="trophy" color={t.dark ? t.c.accent : t.c.text} />
                <View style={{ flex: 1, gap: 2 }}>
                  <T v="bodyStrong">
                    {exerciseName(all, p.exerciseId)} · {toDisplay(p.weightKg, unit)} {unit} × {p.reps}
                  </T>
                  <T v="small" style={{ fontSize: 12 }}>
                    {p.kind === 'e1rm'
                      ? `Best est. 1RM: ${toDisplay(p.value, unit)} ${unit} (+${toDisplay(p.value - p.previous, unit)} ${unit})`
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
                {we.sets.length} × {Math.max(...we.sets.map((s) => s.reps ?? 0))} @ {toDisplay(Math.max(...we.sets.map((s) => s.weightKg ?? 0)), unit)} {unit}
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

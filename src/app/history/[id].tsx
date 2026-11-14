import { router, useLocalSearchParams } from 'expo-router';
import { Alert, View } from 'react-native';

import { Button, Card, Header, Row, Screen, Stat, T, useTheme } from '@/components/ui';
import { useToast } from '@/components/toast';
import { est1rm, exerciseName, fmtDate, fmtDuration, fmtSet, fmtVolume, toDisplay, workoutSetCount, workoutVolumeKg } from '@/lib/calc';
import { kindOf, setLoad } from '@/lib/registry';
import { useAllExercises, useStore } from '@/lib/store';

export default function WorkoutDetail() {
  const t = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const w = useStore((s) => s.workouts.find((x) => x.id === id));
  const unit = useStore((s) => s.settings.unit);
  const deleteWorkout = useStore((s) => s.deleteWorkout);
  const restoreWorkout = useStore((s) => s.restoreWorkout);
  const toast = useToast((s) => s.show);
  const all = useAllExercises();

  if (!w)
    return (
      <Screen header={<Header title="Workout" onBack={() => router.back()} />}>
        <T>This workout was deleted.</T>
      </Screen>
    );

  const remove = () =>
    Alert.alert('Delete this workout?', 'This removes it from your history and progress charts.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          const removed = deleteWorkout(w.id);
          router.back();
          if (removed) toast(`Deleted ${removed.name}`, () => restoreWorkout(removed));
        },
      },
    ]);

  return (
    <Screen header={<Header title={w.name} onBack={() => router.back()} />}>
      <T v="small">{fmtDate(w.startedAt, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</T>
      <Row gap={10}>
        <Stat label="Duration" value={fmtDuration((w.endedAt ?? w.startedAt) - w.startedAt)} />
        <Stat label="Volume" value={fmtVolume(workoutVolumeKg(w), unit)} />
        <Stat label="Sets" value={String(workoutSetCount(w))} />
      </Row>
      {w.notes ? (
        <Card>
          <T v="label" style={{ marginBottom: 6 }}>
            Notes
          </T>
          <T>{w.notes}</T>
        </Card>
      ) : null}
      {w.exercises.map((we) => (
        <Card key={we.id} style={{ gap: 8 }}>
          <T v="title" color={t.dark ? t.c.accent : t.c.text}>
            {exerciseName(all, we.exerciseId)}
          </T>
          {we.sets.map((s, i) => (
            <Row key={s.id} style={{ justifyContent: 'space-between' }}>
              <T v="small" style={{ width: 28 }}>
                {s.warmup ? 'W' : i + 1}
              </T>
              <T v="bodyStrong" style={{ flex: 1 }}>
                {kindOf(we.exerciseId) === 'weight' ? `${toDisplay(s.weightKg, unit)} ${unit} × ${s.reps ?? '–'}` : fmtSet(we.exerciseId, s, unit)}
              </T>
              <T v="small">
                {kindOf(we.exerciseId) !== 'time' && s.reps && setLoad(we.exerciseId, s) > 0
                  ? `est. 1RM ${Math.round(Number(toDisplay(est1rm(setLoad(we.exerciseId, s), s.reps), unit)))}`
                  : ''}
              </T>
            </Row>
          ))}
        </Card>
      ))}
      <View style={{ marginTop: 8 }}>
        <Button label="Delete workout" kind="danger" icon="trash" onPress={remove} />
      </View>
    </Screen>
  );
}

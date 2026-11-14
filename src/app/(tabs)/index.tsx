import { router } from 'expo-router';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';

import { Hero } from '@/components/hero';
import { Icon } from '@/components/icons';
import { Appear, Button, Card, IconButton, Row, T, rad, useTheme } from '@/components/ui';
import {
  DAYS,
  exerciseName,
  fmtClock,
  fmtDuration,
  fmtVolume,
  prsInWorkout,
  relativeDay,
  sameDay,
  startOfWeek,
  workoutSetCount,
  workoutVolumeKg,
} from '@/lib/calc';
import { useNow } from '@/lib/hooks';
import { useAllExercises, useStore } from '@/lib/store';

export default function Home() {
  const t = useTheme();
  const workouts = useStore((s) => s.workouts);
  const routines = useStore((s) => s.routines);
  const active = useStore((s) => s.active);
  const settings = useStore((s) => s.settings);
  const startWorkout = useStore((s) => s.startWorkout);
  const all = useAllExercises();
  const nowMs = useNow(active ? 1000 : 60000);

  const now = new Date(nowMs);
  const weekStart = startOfWeek(now);
  const weekDays = Array.from({ length: 7 }, (_, i) => new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + i));
  const trainedOn = (d: Date) => workouts.some((w) => sameDay(new Date(w.startedAt), d));
  const thisWeek = workouts.filter((w) => w.startedAt >= weekStart.getTime()).length;
  const last = [...workouts].sort((a, b) => b.startedAt - a.startedAt)[0];
  const lastPrs = last ? prsInWorkout(workouts, last).length : 0;

  const start = (routineId?: string) => {
    if (active) {
      router.push('/workout');
      return;
    }
    startWorkout(routineId);
    router.push('/workout');
  };

  const routineSummary = (id: string) => {
    const r = routines.find((x) => x.id === id)!;
    const names = r.items.slice(0, 3).map((i) => exerciseName(all, i.exerciseId).replace(/ \(.*\)/, ''));
    const more = r.items.length > 3 ? ` +${r.items.length - 3}` : '';
    const lastDone = [...workouts].filter((w) => w.routineId === id).sort((a, b) => b.startedAt - a.startedAt)[0];
    return `${names.join(', ')}${more}${lastDone ? ` · ${relativeDay(lastDone.startedAt)}` : ''}`;
  };

  const hour = now.getHours();
  const greeting = active ? 'Back at it?' : hour < 5 ? 'Late session?' : 'Ready to train?';

  return (
    <View style={{ flex: 1, backgroundColor: t.c.bg }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        <Hero
          kicker={now.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })}
          title={greeting}
          right={
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Profile"
              onPress={() => router.push('/profile')}
              style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: t.c.bandBtn, alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="user" size={20} color={t.c.bandBtnText} />
            </Pressable>
          }
        />
        <View style={{ padding: 20, gap: 20 }}>
          {active && (
            <Appear>
              <Card tint onPress={() => router.push('/workout')} accessibilityLabel="Resume workout">
                <Row>
                  <Icon name="timer" color={t.dark ? t.c.accent : t.c.text} />
                  <View style={{ flex: 1 }}>
                    <T v="title">Workout in progress</T>
                    <T v="small" color={t.c.tintText}>
                      {active.name} · {fmtClock(nowMs - active.startedAt)}
                    </T>
                  </View>
                  <T v="bodyStrong" color={t.dark ? t.c.accent : t.c.text}>
                    Resume
                  </T>
                </Row>
              </Card>
            </Appear>
          )}

          <Appear i={1}>
            <Card style={{ gap: 14 }}>
              <Row style={{ justifyContent: 'space-between' }}>
                <T v="title">This week</T>
                <T v="small">
                  <Text style={{ color: t.dark ? t.c.accent : t.c.text, fontFamily: t.fonts.bold }}>{thisWeek}</Text> of {settings.weeklyGoal}{' '}
                  sessions
                </T>
              </Row>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                {weekDays.map((d, i) => {
                  const done = trainedOn(d);
                  const today = sameDay(d, now);
                  return (
                    <View
                      key={i}
                      style={{ alignItems: 'center', gap: 6 }}
                      accessible
                      accessibilityLabel={`${DAYS[i]}${done ? ', trained' : ''}${today ? ', today' : ''}`}>
                      <T v="small" style={{ fontSize: 11 }} color={today ? t.c.text : t.c.muted}>
                        {DAYS[i]![0]}
                      </T>
                      <View
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: rad(t, 17),
                          backgroundColor: done ? t.c.accent : t.c.surface2,
                          borderWidth: today && !done ? 1.5 : 0,
                          borderColor: t.c.muted,
                          borderStyle: 'dashed',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}>
                        {done && <Icon name="check" size={16} color={t.c.onAccent} strokeWidth={3} />}
                      </View>
                    </View>
                  );
                })}
              </View>
            </Card>
          </Appear>

          <Appear i={2}>
            <Button label={active ? 'Resume workout' : 'Start empty workout'} icon={active ? 'play' : 'plus'} onPress={() => start()} />
          </Appear>

          <Appear i={3} style={{ gap: 12 }}>
            <Row style={{ justifyContent: 'space-between' }}>
              <T v="h2">Your routines</T>
              <Pressable accessibilityRole="button" onPress={() => router.push('/routine/new')} hitSlop={10}>
                <T v="bodyStrong" color={t.dark ? t.c.accent : t.c.text}>
                  New routine
                </T>
              </Pressable>
            </Row>
            {routines.length === 0 && (
              <Card>
                <T v="small">No routines yet. Create one to start your usual workout in a single tap.</T>
              </Card>
            )}
            {routines.map((r, ri) => (
              <Appear key={r.id} i={4 + ri}>
                <Card style={{ paddingVertical: 12, paddingRight: 10 }}>
                  <Row>
                    <Pressable
                      style={{ flex: 1, gap: 3 }}
                      onPress={() => router.push(`/routine/${r.id}`)}
                      accessibilityRole="button"
                      accessibilityLabel={`Edit ${r.name}`}>
                      <T v="title">{r.name}</T>
                      <T v="small" numberOfLines={1}>
                        {routineSummary(r.id)}
                      </T>
                    </Pressable>
                    <IconButton
                      icon="play"
                      label={`Start ${r.name}`}
                      color={t.dark ? t.c.accent : t.c.onAccent}
                      bg={t.dark ? t.c.surface2 : t.c.accent}
                      onPress={() => {
                        if (active)
                          Alert.alert('Workout in progress', 'Finish or discard your current workout first.', [
                            { text: 'Resume', onPress: () => router.push('/workout') },
                            { text: 'OK' },
                          ]);
                        else start(r.id);
                      }}
                    />
                  </Row>
                </Card>
              </Appear>
            ))}
          </Appear>

          {last && (
            <Appear i={5 + routines.length} style={{ gap: 12 }}>
              <T v="h2">Last workout</T>
              <Card onPress={() => router.push(`/history/${last.id}`)} accessibilityLabel={`Open ${last.name}`}>
                <Row>
                  <View style={{ flex: 1, gap: 3 }}>
                    <T v="title">{last.name}</T>
                    <T v="small">
                      {relativeDay(last.startedAt)} · {fmtDuration((last.endedAt ?? last.startedAt) - last.startedAt)} ·{' '}
                      {fmtVolume(workoutVolumeKg(last), settings.unit)} · {workoutSetCount(last)} sets
                    </T>
                  </View>
                  {lastPrs > 0 && (
                    <View style={{ backgroundColor: t.c.accent, borderRadius: 6, paddingHorizontal: 7, paddingVertical: 3 }}>
                      <Text style={{ color: t.c.onAccent, fontFamily: t.fonts.bold, fontSize: 11 }}>
                        {lastPrs} PR{lastPrs > 1 ? 's' : ''}
                      </Text>
                    </View>
                  )}
                </Row>
              </Card>
            </Appear>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

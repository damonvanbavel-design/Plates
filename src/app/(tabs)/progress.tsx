import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { LineChart } from '@/components/chart';
import { Icon } from '@/components/icons';
import Animated, { FadeInUp, useReducedMotion } from 'react-native-reanimated';

import { Appear, Button, Card, Chip, Empty, Row, Screen, Segmented, Stat, T, btnRad, useTheme } from '@/components/ui';
import { bestsFor, exerciseName, fmtDate, fmtSeconds, fmtSet, seriesFor, toDisplay, type Metric } from '@/lib/calc';
import { kindOf } from '@/lib/registry';
import { useAllExercises, useStore } from '@/lib/store';

export default function Progress() {
  const t = useTheme();
  const workouts = useStore((s) => s.workouts);
  const unit = useStore((s) => s.settings.unit);
  const rankChecks = useStore((s) => s.rankChecks);
  const all = useAllExercises();

  const done = useMemo(() => {
    const count = new Map<string, number>();
    for (const w of workouts) for (const we of w.exercises) count.set(we.exerciseId, (count.get(we.exerciseId) ?? 0) + 1);
    return [...count.entries()].sort((a, b) => b[1] - a[1]).map(([id]) => id);
  }, [workouts]);

  const [picked, setPicked] = useState<string | null>(null);
  const [metric, setMetric] = useState<Metric>('e1rm');
  const exId = picked && done.includes(picked) ? picked : done[0];
  const reduced = useReducedMotion();
  const kind = exId ? kindOf(exId) : 'weight';
  const m: Metric = kind === 'time' ? 'time' : kind === 'bodyweight' && metric === 'weight' ? 'e1rm' : metric;

  const rankButton = (
    <Pressable
      accessibilityRole="button"
      onPress={() => router.push('/rank')}
      style={{
        height: 40,
        paddingHorizontal: 14,
        borderRadius: btnRad(t, 20),
        borderWidth: 1.5,
        borderColor: t.dark ? t.c.accent : t.c.text,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
      }}>
      <Icon name="rank" size={16} color={t.dark ? t.c.accent : t.c.text} strokeWidth={2.2} />
      <Text style={{ color: t.dark ? t.c.accent : t.c.text, fontFamily: t.fonts.bold, fontSize: 13 }}>Check rank</Text>
    </Pressable>
  );

  if (!exId)
    return (
      <Screen>
        <Row style={{ justifyContent: 'space-between', marginTop: 8 }}>
          <T v="h1">Progress</T>
          {rankButton}
        </Row>
        <Empty icon="chart" title="Nothing to chart yet" text="Log a few workouts and your strength trends and personal records appear here." />
      </Screen>
    );

  const pts = seriesFor(workouts, exId, m);
  const bests = bestsFor(workouts, exId);
  const first = pts[0]?.value ?? 0;
  const lastV = pts[pts.length - 1]?.value ?? 0;
  const change = first > 0 && pts.length > 1 ? Math.round(((lastV - first) / first) * 100) : null;
  const metricLabel = m === 'time' ? 'Longest hold' : m === 'e1rm' ? 'Best est. 1RM' : m === 'weight' ? 'Top weight' : 'Best session volume';
  const fmtV = (v: number) => (m === 'time' ? fmtSeconds(v) : `${toDisplay(Math.round(v), unit)}`);
  const best = pts.length ? Math.max(...pts.map((p) => p.value)) : 0;
  const myRanks = rankChecks.filter((r) => r.exerciseId === exId).sort((a, b) => b.createdAt - a.createdAt);

  return (
    <Screen>
      <Row style={{ justifyContent: 'space-between', marginTop: 8 }}>
        <T v="h1">Progress</T>
        {rankButton}
      </Row>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
        {done.map((id) => (
          <Chip key={id} label={exerciseName(all, id)} selected={id === exId} onPress={() => setPicked(id)} />
        ))}
      </ScrollView>

      {kind !== 'time' && (
        <Segmented
          options={[
            { key: 'e1rm', label: 'Est. 1RM' },
            ...(kind === 'weight' ? [{ key: 'weight' as Metric, label: 'Top weight' }] : []),
            { key: 'volume', label: 'Volume' },
          ]}
          value={m}
          onChange={setMetric}
        />
      )}

      <Card style={{ paddingHorizontal: 12 }}>
        <Row style={{ justifyContent: 'space-between', alignItems: 'flex-end', paddingHorizontal: 4, marginBottom: 10 }}>
          <View style={{ gap: 2 }}>
            <T v="small">{metricLabel}</T>
            <T v="bigNum">
              {fmtV(best)} {m !== 'time' && <Text style={{ fontSize: 15, color: t.c.muted }}>{unit}</Text>}
            </T>
          </View>
          {change !== null && pts.length > 1 && (
            <T v="bodyStrong" color={t.dark ? t.c.accent : t.c.text}>
              {change >= 0 ? '+' : ''}
              {change}% since {fmtDate(pts[0]!.at, { day: 'numeric', month: 'short' })}
            </T>
          )}
        </Row>
        {pts.length < 2 ? (
          <T v="small" style={{ paddingHorizontal: 4, paddingBottom: 8 }}>
            Log this exercise in one more workout to see a trend line.
          </T>
        ) : (
          <Animated.View key={`${exId}-${m}`} entering={reduced ? undefined : FadeInUp.duration(450)}>
            <LineChart
              points={pts.map((p) => ({ at: p.at, value: m === 'time' ? p.value : Number(toDisplay(p.value, unit)) }))}
              format={(v) => (m === 'time' ? fmtSeconds(v) : `${Math.round(v)} ${unit}`)}
            />
          </Animated.View>
        )}
      </Card>

      <Appear i={1}>
        <Row gap={8}>
          {kind === 'time' ? (
            <Stat label="Longest" value={fmtSeconds(bests.bestDuration)} />
          ) : (
            <>
              {kind === 'weight' && (
                <Stat label="Heaviest" value={bests.heaviest ? `${toDisplay(bests.heaviest.weightKg, unit)} × ${bests.heaviest.reps}` : '–'} />
              )}
              <Stat
                label="Best set"
                value={
                  bests.bestE1rmSet
                    ? fmtSet(exId, { id: '', weightKg: bests.bestE1rmSet.weightKg, reps: bests.bestE1rmSet.reps, done: true }, unit)
                    : '–'
                }
              />
            </>
          )}
          <Stat label="Sessions" value={String(bests.sessions)} />
        </Row>
      </Appear>

      {myRanks.length > 0 && (
        <View style={{ gap: 8 }}>
          <T v="label">Rank history</T>
          {myRanks.slice(0, 5).map((r) => (
            <Card key={r.id} style={{ paddingVertical: 12 }}>
              <Row>
                <Icon name="rank" color={t.dark ? t.c.accent : t.c.text} />
                <View style={{ flex: 1 }}>
                  <T v="bodyStrong">
                    {r.level} · top {Math.max(1, 100 - r.percentile)}%
                  </T>
                  <T v="small" style={{ fontSize: 12 }}>
                    {fmtDate(r.createdAt, { day: 'numeric', month: 'short', year: 'numeric' })} · {r.machine} · {toDisplay(r.weightKg, unit)} {unit} ×{' '}
                    {r.reps}
                  </T>
                </View>
              </Row>
            </Card>
          ))}
        </View>
      )}

      <Button label="Check my rank" kind="secondary" icon="rank" onPress={() => router.push({ pathname: '/rank', params: { exerciseId: exId } })} />
    </Screen>
  );
}

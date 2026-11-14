import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { LineChart } from '@/components/chart';
import { Icon } from '@/components/icons';
import { Button, Card, Chip, Empty, Row, Screen, Segmented, Stat, T, btnRad, useTheme } from '@/components/ui';
import { bestsFor, exerciseName, fmtDate, seriesFor, toDisplay, type Metric } from '@/lib/calc';
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

  const rankButton = (
    <Pressable
      accessibilityRole="button"
      onPress={() => router.push('/rank')}
      style={{ height: 40, paddingHorizontal: 14, borderRadius: btnRad(t, 20), borderWidth: 1.5, borderColor: t.dark ? t.c.accent : t.c.text, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
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

  const pts = seriesFor(workouts, exId, metric);
  const bests = bestsFor(workouts, exId);
  const first = pts[0]?.value ?? 0;
  const lastV = pts[pts.length - 1]?.value ?? 0;
  const change = first > 0 && pts.length > 1 ? Math.round(((lastV - first) / first) * 100) : null;
  const metricLabel = metric === 'e1rm' ? 'Best est. 1RM' : metric === 'weight' ? 'Top weight' : 'Best session volume';
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

      <Segmented
        options={[
          { key: 'e1rm', label: 'Est. 1RM' },
          { key: 'weight', label: 'Top weight' },
          { key: 'volume', label: 'Volume' },
        ]}
        value={metric}
        onChange={setMetric}
      />

      <Card style={{ paddingHorizontal: 12 }}>
        <Row style={{ justifyContent: 'space-between', alignItems: 'flex-end', paddingHorizontal: 4, marginBottom: 10 }}>
          <View style={{ gap: 2 }}>
            <T v="small">{metricLabel}</T>
            <T v="bigNum">
              {toDisplay(Math.round(best), unit)} <Text style={{ fontSize: 15, color: t.c.muted }}>{unit}</Text>
            </T>
          </View>
          {change !== null && (
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
          <LineChart points={pts.map((p) => ({ at: p.at, value: Number(toDisplay(p.value, unit)) }))} format={(v) => `${Math.round(v)} ${unit}`} />
        )}
      </Card>

      <Row gap={8}>
        <Stat label="Heaviest" value={bests.heaviest ? `${toDisplay(bests.heaviest.weightKg, unit)} × ${bests.heaviest.reps}` : '–'} />
        <Stat label="Best set" value={bests.bestE1rmSet ? `${toDisplay(bests.bestE1rmSet.weightKg, unit)} × ${bests.bestE1rmSet.reps}` : '–'} />
        <Stat label="Sessions" value={String(bests.sessions)} />
      </Row>

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
                    {fmtDate(r.createdAt, { day: 'numeric', month: 'short', year: 'numeric' })} · {r.machine} · {toDisplay(r.weightKg, unit)} {unit} × {r.reps}
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

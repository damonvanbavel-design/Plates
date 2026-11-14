import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { Appear, Button, Card, Empty, IconButton, Row, Screen, T, rad, useTheme } from '@/components/ui';
import { MONTHS, fmtDuration, fmtVolume, prsInWorkout, sameDay, workoutSetCount, workoutVolumeKg } from '@/lib/calc';
import { useStore } from '@/lib/store';

export default function History() {
  const t = useTheme();
  const workouts = useStore((s) => s.workouts);
  const unit = useStore((s) => s.settings.unit);
  const today = new Date();
  const [month, setMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selected, setSelected] = useState<Date | null>(null);

  const y = month.getFullYear();
  const m = month.getMonth();
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const lead = (new Date(y, m, 1).getDay() + 6) % 7;
  const inMonth = workouts.filter((w) => {
    const d = new Date(w.startedAt);
    return d.getFullYear() === y && d.getMonth() === m;
  });
  const shown = [...(selected ? inMonth.filter((w) => sameDay(new Date(w.startedAt), selected)) : inMonth)].sort((a, b) => b.startedAt - a.startedAt);
  const volume = inMonth.reduce((n, w) => n + workoutVolumeKg(w), 0);

  const cells: (number | null)[] = [...Array(lead).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  const shift = (d: number) => {
    setSelected(null);
    setMonth(new Date(y, m + d, 1));
  };

  return (
    <Screen>
      <T v="h1" style={{ marginTop: 8 }}>
        History
      </T>
      <Card style={{ paddingHorizontal: 10, paddingVertical: 8 }}>
        <Row style={{ justifyContent: 'space-between' }}>
          <IconButton icon="chevronLeft" label="Previous month" onPress={() => shift(-1)} />
          <View style={{ alignItems: 'center' }}>
            <T v="title">
              {MONTHS[m]} {y}
            </T>
            <T v="small" style={{ fontSize: 12 }}>
              {inMonth.length} workout{inMonth.length === 1 ? '' : 's'} · {fmtVolume(volume, unit)}
            </T>
          </View>
          <IconButton icon="chevronRight" label="Next month" onPress={() => shift(1)} />
        </Row>
        <View style={{ flexDirection: 'row', marginTop: 6 }}>
          {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
            <Text key={i} style={{ flex: 1, textAlign: 'center', color: t.c.muted, fontFamily: t.fonts.medium, fontSize: 11, paddingVertical: 4 }}>
              {d}
            </Text>
          ))}
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {cells.map((d, i) => {
            if (d == null) return <View key={i} style={{ width: `${100 / 7}%`, height: 40 }} />;
            const date = new Date(y, m, d);
            const trained = inMonth.some((w) => sameDay(new Date(w.startedAt), date));
            const isToday = sameDay(date, today);
            const isSel = selected && sameDay(selected, date);
            const future = date > today;
            return (
              <Pressable
                key={i}
                accessibilityRole="button"
                accessibilityLabel={`${d} ${MONTHS[m]}${trained ? ', trained' : ''}`}
                accessibilityState={{ selected: !!isSel }}
                onPress={() => setSelected(isSel ? null : date)}
                style={{ width: `${100 / 7}%`, height: 40, alignItems: 'center', justifyContent: 'center' }}>
                <View
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: rad(t, 18),
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: trained ? (isToday || isSel ? t.c.accent : t.c.tint) : 'transparent',
                    borderWidth: isSel || (isToday && !trained) ? 1.5 : 0,
                    borderColor: t.c.accent,
                  }}>
                  <Text
                    style={{
                      color:
                        trained && (isToday || isSel) ? t.c.onAccent : trained ? (t.dark ? t.c.accent : t.c.text) : future ? t.c.muted : t.c.text,
                      fontFamily: trained ? t.fonts.bold : t.fonts.regular,
                      fontSize: 13,
                    }}>
                    {d}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      </Card>

      {selected && (
        <Row style={{ justifyContent: 'space-between' }}>
          <T v="label">{selected.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })}</T>
          <Pressable onPress={() => setSelected(null)} hitSlop={10}>
            <T v="small">Show all</T>
          </Pressable>
        </Row>
      )}

      {workouts.length === 0 ? (
        <Empty
          icon="calendar"
          title="No workouts yet"
          text="Finished workouts show up here, with every set you logged."
          action={<Button label="Start a workout" small onPress={() => router.push('/')} style={{ marginTop: 8 }} />}
        />
      ) : shown.length === 0 ? (
        <T v="small" center>
          No workouts {selected ? 'on this day' : 'this month'}.
        </T>
      ) : (
        shown.map((w, wi) => {
          const d = new Date(w.startedAt);
          const prs = prsInWorkout(workouts, w).length;
          return (
            <Appear key={w.id} i={wi}>
              <Card onPress={() => router.push(`/history/${w.id}`)} accessibilityLabel={`Open ${w.name}`} style={{ paddingVertical: 12 }}>
                <Row gap={14}>
                  <View style={{ width: 44, alignItems: 'center' }}>
                    <T v="label" style={{ fontSize: 11 }}>
                      {d.toLocaleDateString(undefined, { weekday: 'short' })}
                    </T>
                    <T v="num">{d.getDate()}</T>
                  </View>
                  <View style={{ flex: 1, gap: 3 }}>
                    <T v="title">{w.name}</T>
                    <T v="small" style={{ fontSize: 12 }}>
                      {fmtDuration((w.endedAt ?? w.startedAt) - w.startedAt)} · {fmtVolume(workoutVolumeKg(w), unit)} · {workoutSetCount(w)} sets
                    </T>
                  </View>
                  {prs > 0 && (
                    <View style={{ backgroundColor: t.c.accent, borderRadius: 6, paddingHorizontal: 7, paddingVertical: 3 }}>
                      <Text style={{ color: t.c.onAccent, fontFamily: t.fonts.bold, fontSize: 11 }}>
                        {prs} PR{prs > 1 ? 's' : ''}
                      </Text>
                    </View>
                  )}
                </Row>
              </Card>
            </Appear>
          );
        })
      )}
    </Screen>
  );
}

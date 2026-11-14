import { router, useLocalSearchParams } from 'expo-router';
import { Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { LevelBar } from '@/components/chart';
import { Icon } from '@/components/icons';
import { Button, Card, Header, Row, Screen, T, useTheme } from '@/components/ui';
import { exerciseName, toDisplay } from '@/lib/calc';
import { LEVELS, STANDARDS_SOURCE, ageFactor, rank, weightForReps } from '@/lib/standards';
import { useAllExercises, useStore } from '@/lib/store';

export default function RankResult() {
  const t = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const rc = useStore((s) => s.rankChecks.find((r) => r.id === id));
  const unit = useStore((s) => s.settings.unit);
  const all = useAllExercises();
  if (!rc)
    return (
      <Screen header={<Header title="Your rank" onBack={() => router.back()} />}>
        <T>Rank not found.</T>
      </Screen>
    );

  const res = rank(rc.exerciseId, rc.sex, rc.bodyweightKg, rc.age, rc.est1rm);
  const strong = t.dark ? t.c.accent : t.c.text;
  const af = ageFactor(rc.age);
  const kg = (v: number) => `${toDisplay(v, unit)} ${unit}`;

  return (
    <Screen
      header={<Header title="Your rank" onBack={() => router.back()} />}
      footer={
        <View style={{ padding: 20, paddingTop: 8, gap: 4 }}>
          <Button label="See the standards" onPress={() => router.push({ pathname: '/rank/standards', params: { exerciseId: rc.exerciseId } })} />
          <Button label="Done" kind="ghost" small onPress={() => router.dismissTo('/progress')} />
        </View>
      }>
      <View style={{ alignItems: 'center', gap: 8 }}>
        <Svg width={96} height={104} viewBox="0 0 96 104" accessibilityElementsHidden>
          <Path d="M48 3l41 22v54L48 101 7 79V25z" fill={t.c.tint} stroke={strong} strokeWidth={3} />
          <Path d="M30 60l18-26 18 26M36 70h24" fill="none" stroke={strong} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
        <Text
          accessibilityRole="header"
          style={{ fontFamily: t.fonts.heading, fontSize: 34, color: strong, textTransform: t.upper ? 'uppercase' : 'none' }}>
          {res.level}
        </Text>
        <T center>
          Stronger than about <Text style={{ fontFamily: t.fonts.bold }}>{res.percentile}%</Text> of {rc.sex === 'male' ? 'men' : 'women'} at{' '}
          {kg(rc.bodyweightKg)}
        </T>
        <T v="small" center>
          {exerciseName(all, rc.exerciseId)} · {rc.machine}
        </T>
      </View>

      <Card>
        <Row style={{ justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 10 }}>
          <View style={{ gap: 2 }}>
            <T v="small">Estimated 1RM</T>
            <T v="bigNum">
              {toDisplay(rc.est1rm, unit)} <Text style={{ fontSize: 15, color: t.c.muted }}>{unit}</Text>
            </T>
          </View>
          <T v="small">
            from {kg(rc.weightKg)} × {rc.reps}
          </T>
        </Row>
        <LevelBar thresholds={res.thresholds} value={rc.est1rm} activeIndex={res.levelIndex} format={(v) => toDisplay(v, unit)} />
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 2 }}>
          {LEVELS.map((l, i) => (
            <Text
              key={l}
              style={{
                fontSize: 10.5,
                color: i === res.levelIndex ? strong : t.c.muted,
                fontFamily: i === res.levelIndex ? t.fonts.bold : t.fonts.medium,
              }}>
              {l}
            </Text>
          ))}
        </View>
      </Card>

      {res.next ? (
        <Card>
          <Row>
            <Icon name="chart" color={strong} />
            <View style={{ flex: 1, gap: 2 }}>
              <T v="bodyStrong">
                {kg(Math.max(0, res.next.kg - rc.est1rm))} to {res.next.level}
              </T>
              <T v="small" style={{ fontSize: 12 }}>
                {res.next.level} starts at a {kg(res.next.kg)} max, about {kg(weightForReps(res.next.kg, rc.reps))} × {rc.reps}
              </T>
            </View>
          </Row>
        </Card>
      ) : (
        <Card tint>
          <T v="bodyStrong" color={t.c.tintText}>
            Top level reached. Seriously impressive.
          </T>
        </Card>
      )}

      <Row gap={10}>
        <Card style={{ flex: 1, gap: 3, padding: 14 }}>
          <T v="small" style={{ fontSize: 12 }}>
            Age {rc.age}
          </T>
          <T v="bodyStrong">{af === 1 ? 'No age adjustment' : `Standards × ${af.toFixed(2)}`}</T>
        </Card>
        <Card style={{ flex: 1, gap: 3, padding: 14 }}>
          <T v="small" style={{ fontSize: 12 }}>
            Standard used
          </T>
          <T v="bodyStrong">{exerciseName(all, rc.exerciseId)}</T>
        </Card>
      </Row>
      {STANDARDS_SOURCE.placeholder && (
        <T v="small" center style={{ fontSize: 12 }}>
          {STANDARDS_SOURCE.label}
        </T>
      )}
    </Screen>
  );
}

import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withTiming } from 'react-native-reanimated';

import { Icon } from '@/components/icons';
import { useToast } from '@/components/toast';
import { Appear, Button, Card, Header, IconButton, Row, Screen, Stat, T, rad, useTheme } from '@/components/ui';
import { THUMBS } from '@/data/thumbs';
import { bestsFor, fmtDate, fmtSeconds, fmtSet, toDisplay } from '@/lib/calc';
import { exerciseImageUrl } from '@/lib/exercises';
import { getExercise } from '@/lib/registry';
import { useStore } from '@/lib/store';

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export default function ExerciseDetail() {
  const t = useTheme();
  const { id: raw } = useLocalSearchParams<{ id: string }>();
  const id = decodeURIComponent(raw ?? '');
  const ex = getExercise(id);
  const workouts = useStore((s) => s.workouts);
  const unit = useStore((s) => s.settings.unit);
  const favorites = useStore((s) => s.favorites);
  const toggleFavorite = useStore((s) => s.toggleFavorite);
  const active = useStore((s) => s.active);
  const addToActive = useStore((s) => s.addExercisesToActive);
  const toast = useToast((s) => s.show);

  if (!ex)
    return (
      <Screen header={<Header title="Exercise" onBack={() => router.back()} />}>
        <T>Exercise not found.</T>
      </Screen>
    );

  const fav = favorites.includes(ex.id);
  const best = bestsFor(workouts, ex.id);
  const history = [...workouts]
    .sort((a, b) => b.startedAt - a.startedAt)
    .map((w) => ({ w, we: w.exercises.find((x) => x.exerciseId === ex.id) }))
    .filter((x) => x.we)
    .slice(0, 5);
  const inActive = active?.exercises.some((x) => x.exerciseId === ex.id);

  return (
    <Screen
      header={
        <Header
          title={ex.name}
          onBack={() => router.back()}
          right={
            <IconButton
              icon={fav ? 'starFilled' : 'star'}
              label={fav ? 'Remove from favourites' : 'Add to favourites'}
              color={fav ? (t.dark ? t.c.accent : t.c.text) : t.c.muted}
              onPress={() => toggleFavorite(ex.id)}
            />
          }
        />
      }>
      {ex.src ? <Demo src={ex.src} frames={ex.images ?? 0} /> : null}

      <Appear i={1}>
        <Row gap={8} style={{ flexWrap: 'wrap' }}>
          {[
            ex.muscle,
            ex.equipment,
            ex.level ? cap(ex.level) : null,
            ex.kind === 'time' ? 'Timed' : ex.kind === 'bodyweight' && ex.equipment !== 'Bodyweight' ? 'Bodyweight' : null,
          ]
            .filter(Boolean)
            .map((label) => (
              <View
                key={label!}
                style={{ paddingHorizontal: 12, minHeight: 30, justifyContent: 'center', borderRadius: 15, backgroundColor: t.c.surface2 }}>
                <Text style={{ color: t.c.text, fontFamily: t.fonts.medium, fontSize: 13 }}>{label}</Text>
              </View>
            ))}
        </Row>
      </Appear>

      {active && (
        <Appear i={2}>
          <Button
            label={inActive ? 'Already in your workout' : 'Add to current workout'}
            icon={inActive ? 'check' : 'plus'}
            kind={inActive ? 'secondary' : 'primary'}
            disabled={inActive}
            onPress={() => {
              addToActive([ex.id]);
              toast(`Added ${ex.name}`);
              router.back();
            }}
          />
        </Appear>
      )}

      {ex.primary?.length || ex.secondary?.length ? (
        <Appear i={3}>
          <Card style={{ gap: 6 }}>
            <T v="label">Muscles</T>
            {ex.primary?.length ? (
              <T>
                <Text style={{ fontFamily: t.fonts.semibold }}>Main: </Text>
                {ex.primary.map(cap).join(', ')}
              </T>
            ) : null}
            {ex.secondary?.length ? (
              <T v="small">
                <Text style={{ fontFamily: t.fonts.semibold }}>Also: </Text>
                {ex.secondary.map(cap).join(', ')}
              </T>
            ) : null}
          </Card>
        </Appear>
      ) : null}

      {ex.instructions?.length ? (
        <Appear i={4}>
          <Card style={{ gap: 12 }}>
            <T v="label">How to do it</T>
            {ex.instructions.map((step, i) => (
              <Row key={i} gap={12} style={{ alignItems: 'flex-start' }}>
                <View style={{ width: 26, height: 26, borderRadius: 13, backgroundColor: t.c.tint, alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ color: t.dark ? t.c.accent : t.c.text, fontFamily: t.fonts.bold, fontSize: 13 }}>{i + 1}</Text>
                </View>
                <T style={{ flex: 1 }}>{step}</T>
              </Row>
            ))}
          </Card>
        </Appear>
      ) : null}

      <Appear i={5}>
        <View style={{ gap: 10 }}>
          <T v="label">Your history</T>
          {best.sessions === 0 ? (
            <Card>
              <T v="small">You haven’t logged this exercise yet.</T>
            </Card>
          ) : (
            <>
              <Row gap={8}>
                {ex.kind === 'time' ? (
                  <Stat label="Longest" value={fmtSeconds(best.bestDuration)} />
                ) : (
                  <>
                    <Stat label="Best est. 1RM" value={best.bestE1rm ? `${Math.round(Number(toDisplay(best.bestE1rm, unit)))}` : '–'} />
                    <Stat label="Heaviest" value={best.heaviest ? `${toDisplay(best.heaviest.weightKg, unit)}` : '–'} />
                  </>
                )}
                <Stat label="Sessions" value={String(best.sessions)} />
              </Row>
              {history.map(({ w, we }) => (
                <Card
                  key={w.id}
                  onPress={() => router.push(`/history/${w.id}`)}
                  accessibilityLabel={`Open ${w.name}`}
                  style={{ paddingVertical: 12, gap: 4 }}>
                  <T v="bodyStrong">
                    {fmtDate(w.startedAt, { day: 'numeric', month: 'short', year: 'numeric' })} · {w.name}
                  </T>
                  <T v="small">{we!.sets.map((s) => fmtSet(ex.id, s, unit)).join('   ')}</T>
                </Card>
              ))}
            </>
          )}
        </View>
      </Appear>

      {ex.src ? (
        <T v="small" center style={{ fontSize: 11 }}>
          Pictures and steps from free-exercise-db (public domain)
        </T>
      ) : null}
    </Screen>
  );
}

/** Loops between the start and end pictures to show the movement. */
function Demo({ src, frames }: { src: string; frames: number }) {
  const t = useTheme();
  const reduced = useReducedMotion();
  const [playing, setPlaying] = useState(!reduced);
  const [failed, setFailed] = useState(false);
  const fade = useSharedValue(0);
  const topStyle = useAnimatedStyle(() => ({ opacity: fade.value }));

  useEffect(() => {
    if (!playing || frames < 2 || failed) return;
    let on = false;
    const timer = setInterval(() => {
      on = !on;
      fade.set(withTiming(on ? 1 : 0, { duration: 350 }));
    }, 1100);
    return () => clearInterval(timer);
  }, [playing, frames, failed, fade]);

  const thumb = THUMBS[src];
  return (
    <View style={{ borderRadius: rad(t, 18), overflow: 'hidden', backgroundColor: '#FFFFFF', aspectRatio: 1.45 }}>
      <Image
        source={failed ? thumb : { uri: exerciseImageUrl(src, 0) }}
        placeholder={thumb}
        style={{ position: 'absolute', width: '100%', height: '100%' }}
        contentFit="contain"
        cachePolicy="disk"
        onError={() => setFailed(true)}
        accessibilityLabel="Start position"
      />
      {frames > 1 && !failed && (
        <Animated.View style={[{ position: 'absolute', width: '100%', height: '100%' }, topStyle]}>
          <Image
            source={{ uri: exerciseImageUrl(src, 1) }}
            style={{ width: '100%', height: '100%' }}
            contentFit="contain"
            cachePolicy="disk"
            accessibilityLabel="End position"
          />
        </Animated.View>
      )}
      {frames > 1 && !failed && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={playing ? 'Pause demo' : 'Play demo'}
          onPress={() => setPlaying((p) => !p)}
          style={{
            position: 'absolute',
            right: 10,
            bottom: 10,
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: 'rgba(0,0,0,0.55)',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Icon name={playing ? 'pause' : 'play'} size={18} color="#FFFFFF" strokeWidth={2.6} />
        </Pressable>
      )}
      {failed && (
        <View
          style={{
            position: 'absolute',
            left: 10,
            bottom: 10,
            paddingHorizontal: 10,
            paddingVertical: 6,
            borderRadius: 12,
            backgroundColor: 'rgba(0,0,0,0.6)',
            flexDirection: 'row',
            gap: 6,
            alignItems: 'center',
          }}>
          <Icon name="globe" size={14} color="#FFFFFF" />
          <Text style={{ color: '#FFFFFF', fontSize: 12 }}>Connect to the internet for the full demo</Text>
        </View>
      )}
    </View>
  );
}

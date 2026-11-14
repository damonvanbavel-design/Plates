import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import { Icon } from '@/components/icons';
import { Sheet, SheetOption } from '@/components/sheet';
import { Button, Card, Chip, Field, Header, Row, Screen, Segmented, T, rad, useTheme } from '@/components/ui';
import { bestsFor, est1rm, exerciseName, fromDisplay, toDisplay } from '@/lib/calc';
import { RANKABLE_IDS, isRankable, rank } from '@/lib/standards';
import { useAllExercises, useStore } from '@/lib/store';
import type { Sex } from '@/lib/types';

const EQUIPMENT_FOR: Record<string, string[]> = {
  'bench-press': ['Barbell', 'Smith machine', 'Dumbbells', 'Chest press machine'],
  'incline-bench-press': ['Barbell', 'Smith machine', 'Dumbbells', 'Incline press machine'],
  squat: ['Barbell', 'Smith machine', 'Safety squat bar', 'Hack squat machine'],
  'front-squat': ['Barbell', 'Smith machine'],
  deadlift: ['Barbell', 'Trap bar', 'Smith machine'],
  'overhead-press': ['Barbell', 'Smith machine', 'Dumbbells', 'Shoulder press machine'],
  'barbell-row': ['Barbell', 'T-bar', 'Smith machine', 'Row machine'],
  rdl: ['Barbell', 'Dumbbells', 'Smith machine'],
};

export default function RankForm() {
  const t = useTheme();
  const params = useLocalSearchParams<{ exerciseId?: string }>();
  const all = useAllExercises();
  const workouts = useStore((s) => s.workouts);
  const settings = useStore((s) => s.settings);
  const machines = useStore((s) => s.machines);
  const updateSettings = useStore((s) => s.updateSettings);
  const addRankCheck = useStore((s) => s.addRankCheck);
  const unit = settings.unit;

  const unsupported = params.exerciseId && !isRankable(params.exerciseId) ? params.exerciseId : null;
  const initialEx = params.exerciseId && isRankable(params.exerciseId) ? params.exerciseId : RANKABLE_IDS[0]!;
  const [exerciseId, setExerciseId] = useState(initialEx);
  const best = bestsFor(workouts, exerciseId).bestE1rmSet;
  const [machine, setMachine] = useState(machines[0] ?? EQUIPMENT_FOR[initialEx]?.[0] ?? 'Barbell');
  const [equipOpen, setEquipOpen] = useState(false);
  const [otherText, setOtherText] = useState('');
  const [weight, setWeight] = useState(best ? toDisplay(best.weightKg, unit) : '');
  const [reps, setReps] = useState(best ? String(best.reps) : '');
  const [bw, setBw] = useState(toDisplay(settings.bodyweightKg, unit));
  const [age, setAge] = useState(settings.birthYear ? String(new Date().getFullYear() - settings.birthYear) : '');
  const [sex, setSex] = useState<Sex>(settings.sex ?? 'male');

  const pickExercise = (id: string) => {
    setExerciseId(id);
    if (!(EQUIPMENT_FOR[id] ?? []).includes(machine) && !machines.includes(machine)) setMachine(EQUIPMENT_FOR[id]?.[0] ?? 'Barbell');
    const b = bestsFor(workouts, id).bestE1rmSet;
    setWeight(b ? toDisplay(b.weightKg, unit) : '');
    setReps(b ? String(b.reps) : '');
  };

  const submit = () => {
    const w = fromDisplay(weight, unit);
    const r = parseInt(reps, 10);
    const b = fromDisplay(bw, unit);
    const a = parseInt(age, 10);
    const problems: string[] = [];
    if (!machine.trim()) problems.push('the machine or equipment you used');
    if (!w || w <= 0) problems.push('the weight');
    if (!r || r < 1) problems.push('your reps');
    if (!b || b < 30 || b > 250) problems.push(`your bodyweight (${unit})`);
    if (!a || a < 13 || a > 99) problems.push('your age');
    if (problems.length) {
      Alert.alert('Almost there', `Please fill in ${problems.join(', ')}.`);
      return;
    }
    if (r > 12) {
      Alert.alert('Use a heavier set', 'Ranks are only accurate for sets of 1–12 reps. Pick a weight you can do 12 times or fewer.');
      return;
    }
    updateSettings({ bodyweightKg: b, birthYear: new Date().getFullYear() - a, sex });
    const e = est1rm(w!, r);
    const res = rank(exerciseId, sex, b!, a, e);
    const rc = addRankCheck({
      exerciseId,
      machine: machine.trim(),
      weightKg: w!,
      reps: r,
      est1rm: e,
      level: res.level,
      percentile: res.percentile,
      bodyweightKg: b!,
      age: a,
      sex,
    });
    router.push({ pathname: '/rank/result', params: { id: rc.id } });
  };

  const standard = EQUIPMENT_FOR[exerciseId] ?? ['Barbell'];
  const used = machines.filter((m) => !standard.includes(m));

  return (
    <Screen
      header={<Header title="Check your rank" onBack={() => router.back()} />}
      footer={
        <View style={{ padding: 20, paddingTop: 8, gap: 8 }}>
          <T v="small" center style={{ fontSize: 12 }}>
            Use a set you couldn’t do one more rep of. Sets of 1–10 reps are most accurate.
          </T>
          <Button label="See my rank" onPress={submit} />
        </View>
      }>
      <T v="small" style={{ fontSize: 14 }}>
        Enter one hard set. We estimate your one-rep max and compare it with lifters of your sex, bodyweight and age.
      </T>

      {unsupported && (
        <Card tint>
          <T v="small" color={t.c.tintText}>
            Rank isn’t available for {exerciseName(all, unsupported)} yet. Machine and accessory exercises will be added once there’s enough data.
            Pick one of the lifts below.
          </T>
        </Card>
      )}

      <View style={{ gap: 8 }}>
        <T v="label">Exercise</T>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          {RANKABLE_IDS.map((id) => (
            <Chip key={id} label={exerciseName(all, id)} selected={id === exerciseId} onPress={() => pickExercise(id)} />
          ))}
        </ScrollView>
      </View>

      <View style={{ gap: 8 }}>
        <T v="label">Machine or equipment</T>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Equipment: ${machine || 'not chosen'}. Change`}
          onPress={() => setEquipOpen(true)}
          style={{
            minHeight: 52,
            borderRadius: rad(t, 12),
            borderWidth: 1,
            borderColor: t.c.border,
            backgroundColor: t.c.surface,
            paddingHorizontal: 14,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
          <Text style={{ color: machine ? t.c.text : t.c.muted, fontFamily: t.fonts.medium, fontSize: 16, flex: 1 }} numberOfLines={1}>
            {machine || 'Choose equipment'}
          </Text>
          <Icon name="chevronDown" size={18} color={t.c.muted} />
        </Pressable>
        <T v="small" style={{ fontSize: 12 }}>
          Saved with your rank so you can compare like for like next time.
        </T>
      </View>

      <Row gap={12}>
        <BigInput label={`Weight (${unit})`} value={weight} onChange={setWeight} keyboard="decimal-pad" />
        <BigInput label="Reps" value={reps} onChange={setReps} keyboard="number-pad" />
      </Row>

      <Card style={{ gap: 12 }}>
        <T v="title">Your details</T>
        <Row gap={12}>
          <View style={{ flex: 1 }}>
            <Field label={`Bodyweight (${unit})`} value={bw} onChangeText={setBw} keyboardType="decimal-pad" placeholder="80" />
          </View>
          <View style={{ flex: 1 }}>
            <Field label="Age" value={age} onChangeText={setAge} keyboardType="number-pad" placeholder="30" />
          </View>
        </Row>
        <Segmented
          options={[
            { key: 'male', label: 'Male' },
            { key: 'female', label: 'Female' },
          ]}
          value={sex}
          onChange={setSex}
        />
        <T v="small" style={{ fontSize: 12 }}>
          Standards differ by sex, bodyweight and age. Saved to your profile.
        </T>
      </Card>

      <Sheet visible={equipOpen} onClose={() => setEquipOpen(false)} title="Machine or equipment">
        {standard.map((m) => (
          <SheetOption
            key={m}
            label={m}
            selected={machine === m}
            onPress={() => {
              setMachine(m);
              setEquipOpen(false);
            }}
          />
        ))}
        {used.length > 0 && (
          <T v="label" style={{ marginTop: 10, marginBottom: 2 }}>
            Used before
          </T>
        )}
        {used.map((m) => (
          <SheetOption
            key={m}
            label={m}
            selected={machine === m}
            onPress={() => {
              setMachine(m);
              setEquipOpen(false);
            }}
          />
        ))}
        <View style={{ marginTop: 12, gap: 10 }}>
          <Field label="Other (type a brand or model)" value={otherText} onChangeText={setOtherText} placeholder="e.g. Hammer Strength bench" />
          <Button
            label="Use this"
            small
            disabled={!otherText.trim()}
            onPress={() => {
              setMachine(otherText.trim());
              setOtherText('');
              setEquipOpen(false);
            }}
          />
        </View>
      </Sheet>
    </Screen>
  );
}

function BigInput({
  label,
  value,
  onChange,
  keyboard,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  keyboard: 'decimal-pad' | 'number-pad';
}) {
  const t = useTheme();
  return (
    <View style={{ flex: 1, gap: 8 }}>
      <T v="label">{label}</T>
      <TextInput
        accessibilityLabel={label}
        value={value}
        onChangeText={onChange}
        keyboardType={keyboard}
        selectTextOnFocus
        placeholder="0"
        placeholderTextColor={t.c.muted}
        style={{
          height: 58,
          borderRadius: rad(t, 12),
          borderWidth: 1.5,
          borderColor: t.c.accent,
          backgroundColor: t.c.surface,
          color: t.c.text,
          textAlign: 'center',
          fontFamily: t.fonts.heading,
          fontSize: 24,
        }}
      />
    </View>
  );
}

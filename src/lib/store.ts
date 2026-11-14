import Storage from './storage';
import { useMemo } from 'react';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { previousSets, uid } from './calc';
import { BASE_EXERCISES, STARTER_ROUTINES } from './exercises';
import type { ActiveWorkout, Exercise, RankCheck, Routine, SetEntry, Settings, Workout } from './types';

interface State {
  onboarded: boolean;
  customExercises: Exercise[];
  routines: Routine[];
  workouts: Workout[];
  active: ActiveWorkout | null;
  settings: Settings;
  rankChecks: RankCheck[];
  machines: string[];
}

interface Actions {
  completeOnboarding: (starterKeys: string[], settings: Partial<Settings>) => void;
  updateSettings: (s: Partial<Settings>) => void;

  addCustomExercise: (x: Omit<Exercise, 'id' | 'custom'>) => Exercise;

  saveRoutine: (r: Routine) => void;
  deleteRoutine: (id: string) => void;

  startWorkout: (routineId?: string) => void;
  addExercisesToActive: (exerciseIds: string[]) => void;
  removeExerciseFromActive: (weId: string) => void;
  moveExerciseInActive: (weId: string, dir: -1 | 1) => void;
  addSet: (weId: string) => void;
  updateSet: (weId: string, setId: string, patch: Partial<SetEntry>) => void;
  removeSet: (weId: string, setId: string) => void;
  toggleSetDone: (weId: string, setId: string) => boolean;
  setRest: (endsAt: number | null, total?: number) => void;
  renameActive: (name: string) => void;
  finishWorkout: () => string | null;
  discardWorkout: () => void;

  updateWorkout: (id: string, patch: Partial<Workout>) => void;
  deleteWorkout: (id: string) => void;

  addRankCheck: (r: Omit<RankCheck, 'id' | 'createdAt'>) => RankCheck;
  resetAll: () => void;
}

const DEFAULT_SETTINGS: Settings = {
  unit: 'kg',
  restSeconds: 90,
  themeId: 'night',
  weeklyGoal: 3,
  bodyweightKg: null,
  birthYear: null,
  sex: null,
};

const INITIAL: State = {
  onboarded: false,
  customExercises: [],
  routines: [],
  workouts: [],
  active: null,
  settings: DEFAULT_SETTINGS,
  rankChecks: [],
  machines: [],
};

function prefilledSets(workouts: Workout[], exerciseId: string, count: number, reps?: number): SetEntry[] {
  const prev = previousSets(workouts, exerciseId).filter((s) => !s.warmup);
  const n = Math.max(count, 1);
  return Array.from({ length: n }, (_, i) => {
    const p = prev[i] ?? prev[prev.length - 1];
    return { id: uid(), weightKg: p?.weightKg ?? null, reps: p?.reps ?? reps ?? null, done: false };
  });
}

function mapActive(s: State, fn: (a: ActiveWorkout) => ActiveWorkout): Partial<State> {
  return s.active ? { active: fn(s.active) } : {};
}

export const useStore = create<State & Actions>()(
  persist(
    (set, get) => ({
      ...INITIAL,

      completeOnboarding: (starterKeys, settings) => {
        const routines: Routine[] = [];
        for (const key of starterKeys) {
          const pack = STARTER_ROUTINES.find((p) => p.key === key);
          pack?.routines.forEach((r) => routines.push({ ...r, id: uid(), items: r.items.map((i) => ({ ...i })) }));
        }
        set((s) => ({ onboarded: true, routines: [...s.routines, ...routines], settings: { ...s.settings, ...settings } }));
      },
      updateSettings: (patch) => set((s) => ({ settings: { ...s.settings, ...patch } })),

      addCustomExercise: (x) => {
        const ex: Exercise = { ...x, id: 'custom-' + uid(), custom: true };
        set((s) => ({ customExercises: [...s.customExercises, ex] }));
        return ex;
      },

      saveRoutine: (r) =>
        set((s) => ({ routines: s.routines.some((x) => x.id === r.id) ? s.routines.map((x) => (x.id === r.id ? r : x)) : [...s.routines, r] })),
      deleteRoutine: (id) => set((s) => ({ routines: s.routines.filter((r) => r.id !== id) })),

      startWorkout: (routineId) => {
        const s = get();
        if (s.active) return;
        const routine = s.routines.find((r) => r.id === routineId);
        const now = Date.now();
        const active: ActiveWorkout = {
          id: uid(),
          name: routine?.name ?? 'Workout',
          routineId: routine?.id,
          startedAt: now,
          exercises: (routine?.items ?? []).map((it) => ({
            id: uid(),
            exerciseId: it.exerciseId,
            sets: prefilledSets(s.workouts, it.exerciseId, it.targetSets, it.targetReps),
          })),
          restEndsAt: null,
          restTotal: s.settings.restSeconds,
        };
        set({ active });
      },
      addExercisesToActive: (ids) =>
        set((s) =>
          mapActive(s, (a) => ({
            ...a,
            exercises: [...a.exercises, ...ids.map((exerciseId) => ({ id: uid(), exerciseId, sets: prefilledSets(s.workouts, exerciseId, 3) }))],
          })),
        ),
      removeExerciseFromActive: (weId) => set((s) => mapActive(s, (a) => ({ ...a, exercises: a.exercises.filter((x) => x.id !== weId) }))),
      moveExerciseInActive: (weId, dir) =>
        set((s) =>
          mapActive(s, (a) => {
            const i = a.exercises.findIndex((x) => x.id === weId);
            const j = i + dir;
            if (i < 0 || j < 0 || j >= a.exercises.length) return a;
            const ex = [...a.exercises];
            [ex[i], ex[j]] = [ex[j]!, ex[i]!];
            return { ...a, exercises: ex };
          }),
        ),
      addSet: (weId) =>
        set((s) =>
          mapActive(s, (a) => ({
            ...a,
            exercises: a.exercises.map((we) => {
              if (we.id !== weId) return we;
              const last = we.sets[we.sets.length - 1];
              return { ...we, sets: [...we.sets, { id: uid(), weightKg: last?.weightKg ?? null, reps: last?.reps ?? null, done: false }] };
            }),
          })),
        ),
      updateSet: (weId, setId, patch) =>
        set((s) =>
          mapActive(s, (a) => ({
            ...a,
            exercises: a.exercises.map((we) => (we.id !== weId ? we : { ...we, sets: we.sets.map((x) => (x.id === setId ? { ...x, ...patch } : x)) })),
          })),
        ),
      removeSet: (weId, setId) =>
        set((s) =>
          mapActive(s, (a) => ({ ...a, exercises: a.exercises.map((we) => (we.id !== weId ? we : { ...we, sets: we.sets.filter((x) => x.id !== setId) })) })),
        ),
      toggleSetDone: (weId, setId) => {
        const a = get().active;
        const we = a?.exercises.find((x) => x.id === weId);
        const st = we?.sets.find((x) => x.id === setId);
        if (!a || !st) return false;
        const nowDone = !st.done;
        const rest = get().settings.restSeconds;
        set({
          active: {
            ...a,
            restEndsAt: nowDone ? Date.now() + rest * 1000 : a.restEndsAt,
            restTotal: nowDone ? rest : a.restTotal,
            exercises: a.exercises.map((w) => (w.id !== weId ? w : { ...w, sets: w.sets.map((x) => (x.id === setId ? { ...x, done: nowDone } : x)) })),
          },
        });
        return nowDone;
      },
      setRest: (endsAt, total) => set((s) => mapActive(s, (a) => ({ ...a, restEndsAt: endsAt, restTotal: total ?? a.restTotal }))),
      renameActive: (name) => set((s) => mapActive(s, (a) => ({ ...a, name }))),
      finishWorkout: () => {
        const a = get().active;
        if (!a) return null;
        const exercises = a.exercises
          .map((we) => ({ ...we, sets: we.sets.filter((x) => x.done) }))
          .filter((we) => we.sets.length > 0);
        const { restEndsAt: _r, restTotal: _t, ...rest } = a;
        const w: Workout = { ...rest, exercises, endedAt: Date.now() };
        set((s) => ({ active: null, workouts: [...s.workouts, w] }));
        return w.id;
      },
      discardWorkout: () => set({ active: null }),

      updateWorkout: (id, patch) => set((s) => ({ workouts: s.workouts.map((w) => (w.id === id ? { ...w, ...patch } : w)) })),
      deleteWorkout: (id) => set((s) => ({ workouts: s.workouts.filter((w) => w.id !== id) })),

      addRankCheck: (r) => {
        const rc: RankCheck = { ...r, id: uid(), createdAt: Date.now() };
        set((s) => ({
          rankChecks: [...s.rankChecks, rc],
          machines: s.machines.includes(r.machine) ? s.machines : [r.machine, ...s.machines].slice(0, 12),
        }));
        return rc;
      },
      resetAll: () => set({ ...INITIAL }),
    }),
    {
      name: 'plates-v1',
      version: 1,
      storage: createJSONStorage(() => Storage),
    },
  ),
);

export function useAllExercises(): Exercise[] {
  const custom = useStore((s) => s.customExercises);
  return useMemo(() => (custom.length ? [...BASE_EXERCISES, ...custom] : BASE_EXERCISES), [custom]);
}

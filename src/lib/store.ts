import Storage from './storage';
import { useMemo } from 'react';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { previousSets, uid } from './calc';
import { BASE_EXERCISES, STARTER_ROUTINES } from './exercises';
import { ctx, kindOf, registerCustom } from './registry';
import type { ActiveWorkout, CustomThemeSpec, Exercise, RankCheck, Routine, SetEntry, Settings, Workout, WorkoutExercise } from './types';

interface State {
  onboarded: boolean;
  customExercises: Exercise[];
  routines: Routine[];
  workouts: Workout[];
  active: ActiveWorkout | null;
  settings: Settings;
  rankChecks: RankCheck[];
  machines: string[];
  favorites: string[];
  customThemes: CustomThemeSpec[];
}

interface Actions {
  completeOnboarding: (starterKeys: string[], settings: Partial<Settings>) => void;
  updateSettings: (s: Partial<Settings>) => void;

  addCustomExercise: (x: Omit<Exercise, 'id' | 'custom'>) => Exercise;
  toggleFavorite: (exerciseId: string) => void;
  saveCustomTheme: (t: CustomThemeSpec) => void;
  deleteCustomTheme: (id: string) => void;

  saveRoutine: (r: Routine) => void;
  deleteRoutine: (id: string) => void;

  startWorkout: (routineId?: string) => void;
  addExercisesToActive: (exerciseIds: string[]) => void;
  removeExerciseFromActive: (weId: string) => { we: WorkoutExercise; index: number } | null;
  moveExerciseInActive: (weId: string, dir: -1 | 1) => void;
  addSet: (weId: string) => void;
  updateSet: (weId: string, setId: string, patch: Partial<SetEntry>) => void;
  removeSet: (weId: string, setId: string) => { set: SetEntry; index: number } | null;
  restoreSet: (weId: string, set: SetEntry, index: number) => void;
  restoreExercise: (we: WorkoutExercise, index: number) => void;
  setExerciseRest: (weId: string, sec: number | undefined) => void;
  setExerciseNote: (weId: string, note: string) => void;
  toggleSetDone: (weId: string, setId: string) => boolean;
  setRest: (endsAt: number | null, total?: number) => void;
  renameActive: (name: string) => void;
  finishWorkout: () => string | null;
  discardWorkout: () => void;

  updateWorkout: (id: string, patch: Partial<Workout>) => void;
  deleteWorkout: (id: string) => Workout | null;
  restoreWorkout: (w: Workout) => void;

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
  favorites: [],
  customThemes: [],
};

function prefilledSets(workouts: Workout[], exerciseId: string, count: number, reps?: number): SetEntry[] {
  const prev = previousSets(workouts, exerciseId).filter((s) => !s.warmup);
  const kind = kindOf(exerciseId);
  const n = Math.max(count, 1);
  return Array.from({ length: n }, (_, i) => {
    const p = prev[i] ?? prev[prev.length - 1];
    if (kind === 'time') return { id: uid(), weightKg: null, reps: null, durationSec: p?.durationSec ?? reps ?? 30, done: false };
    return { id: uid(), weightKg: p?.weightKg ?? (kind === 'bodyweight' ? 0 : null), reps: p?.reps ?? reps ?? null, done: false };
  });
}

const restFor = (s: State, we: WorkoutExercise | undefined) => (we?.restSec !== undefined ? we.restSec : s.settings.restSeconds);

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
        registerCustom([ex]);
        set((s) => ({ customExercises: [...s.customExercises, ex] }));
        return ex;
      },
      toggleFavorite: (id) => set((s) => ({ favorites: s.favorites.includes(id) ? s.favorites.filter((x) => x !== id) : [id, ...s.favorites] })),
      saveCustomTheme: (t) =>
        set((s) => ({
          customThemes: s.customThemes.some((x) => x.id === t.id) ? s.customThemes.map((x) => (x.id === t.id ? t : x)) : [...s.customThemes, t],
        })),
      deleteCustomTheme: (id) =>
        set((s) => ({
          customThemes: s.customThemes.filter((x) => x.id !== id),
          settings: s.settings.themeId === id ? { ...s.settings, themeId: 'night' } : s.settings,
        })),

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
            restSec: it.restSec,
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
      removeExerciseFromActive: (weId) => {
        const a = get().active;
        const index = a?.exercises.findIndex((x) => x.id === weId) ?? -1;
        if (!a || index < 0) return null;
        const we = a.exercises[index]!;
        set({ active: { ...a, exercises: a.exercises.filter((x) => x.id !== weId) } });
        return { we, index };
      },
      restoreExercise: (we, index) =>
        set((s) =>
          mapActive(s, (a) => {
            const ex = [...a.exercises];
            ex.splice(Math.min(index, ex.length), 0, we);
            return { ...a, exercises: ex };
          }),
        ),
      setExerciseRest: (weId, sec) =>
        set((s) => mapActive(s, (a) => ({ ...a, exercises: a.exercises.map((we) => (we.id === weId ? { ...we, restSec: sec } : we)) }))),
      setExerciseNote: (weId, note) =>
        set((s) => mapActive(s, (a) => ({ ...a, exercises: a.exercises.map((we) => (we.id === weId ? { ...we, note } : we)) }))),
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
              return {
                ...we,
                sets: [
                  ...we.sets,
                  { id: uid(), weightKg: last?.weightKg ?? null, reps: last?.reps ?? null, durationSec: last?.durationSec ?? null, done: false },
                ],
              };
            }),
          })),
        ),
      updateSet: (weId, setId, patch) =>
        set((s) =>
          mapActive(s, (a) => ({
            ...a,
            exercises: a.exercises.map((we) =>
              we.id !== weId ? we : { ...we, sets: we.sets.map((x) => (x.id === setId ? { ...x, ...patch } : x)) },
            ),
          })),
        ),
      removeSet: (weId, setId) => {
        const a = get().active;
        const we = a?.exercises.find((x) => x.id === weId);
        const index = we?.sets.findIndex((x) => x.id === setId) ?? -1;
        if (!a || !we || index < 0) return null;
        const removed = we.sets[index]!;
        set({ active: { ...a, exercises: a.exercises.map((w) => (w.id !== weId ? w : { ...w, sets: w.sets.filter((x) => x.id !== setId) })) } });
        return { set: removed, index };
      },
      restoreSet: (weId, st, index) =>
        set((s) =>
          mapActive(s, (a) => ({
            ...a,
            exercises: a.exercises.map((we) => {
              if (we.id !== weId) return we;
              const sets = [...we.sets];
              sets.splice(Math.min(index, sets.length), 0, st);
              return { ...we, sets };
            }),
          })),
        ),
      toggleSetDone: (weId, setId) => {
        const a = get().active;
        const we = a?.exercises.find((x) => x.id === weId);
        const st = we?.sets.find((x) => x.id === setId);
        if (!a || !st) return false;
        const nowDone = !st.done;
        const rest = restFor(get(), we);
        const startRest = nowDone && rest > 0;
        set({
          active: {
            ...a,
            restEndsAt: startRest ? Date.now() + rest * 1000 : nowDone ? null : a.restEndsAt,
            restTotal: startRest ? rest : a.restTotal,
            exercises: a.exercises.map((w) =>
              w.id !== weId ? w : { ...w, sets: w.sets.map((x) => (x.id === setId ? { ...x, done: nowDone } : x)) },
            ),
          },
        });
        return nowDone;
      },
      setRest: (endsAt, total) => set((s) => mapActive(s, (a) => ({ ...a, restEndsAt: endsAt, restTotal: total ?? a.restTotal }))),
      renameActive: (name) => set((s) => mapActive(s, (a) => ({ ...a, name }))),
      finishWorkout: () => {
        const a = get().active;
        if (!a) return null;
        const exercises = a.exercises.map((we) => ({ ...we, sets: we.sets.filter((x) => x.done) })).filter((we) => we.sets.length > 0);
        const { restEndsAt: _r, restTotal: _t, ...rest } = a;
        const w: Workout = { ...rest, exercises, endedAt: Date.now() };
        set((s) => ({ active: null, workouts: [...s.workouts, w] }));
        return w.id;
      },
      discardWorkout: () => set({ active: null }),

      updateWorkout: (id, patch) => set((s) => ({ workouts: s.workouts.map((w) => (w.id === id ? { ...w, ...patch } : w)) })),
      deleteWorkout: (id) => {
        const w = get().workouts.find((x) => x.id === id) ?? null;
        set((s) => ({ workouts: s.workouts.filter((x) => x.id !== id) }));
        return w;
      },
      restoreWorkout: (w) => set((s) => (s.workouts.some((x) => x.id === w.id) ? {} : { workouts: [...s.workouts, w] })),

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
      version: 2,
      storage: createJSONStorage(() => Storage),
      // v1 → v2: new fields get defaults; older custom exercises become weight exercises
      migrate: (persisted, version) => {
        const p = (persisted ?? {}) as Partial<State>;
        if (version < 2) {
          p.favorites = p.favorites ?? [];
          p.customThemes = p.customThemes ?? [];
          p.customExercises = (p.customExercises ?? []).map((e) => ({ ...e, kind: e.kind ?? 'weight' }));
        }
        return p as State;
      },
      onRehydrateStorage: () => (state) => {
        if (state) {
          registerCustom(state.customExercises);
          ctx.bodyweightKg = state.settings.bodyweightKg;
        }
      },
    },
  ),
);

export function useAllExercises(): Exercise[] {
  const custom = useStore((s) => s.customExercises);
  return useMemo(() => (custom.length ? [...BASE_EXERCISES, ...custom] : BASE_EXERCISES), [custom]);
}

// keep calculation context in sync with the user's bodyweight
useStore.subscribe((s) => {
  ctx.bodyweightKg = s.settings.bodyweightKg;
});

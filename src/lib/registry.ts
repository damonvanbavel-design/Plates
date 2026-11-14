/**
 * Fast exercise lookups shared by calculations and screens, plus a little
 * runtime context (bodyweight) so bodyweight exercises count real load.
 */
import { BASE_EXERCISES } from './exercises';
import type { Exercise, ExerciseKind, SetEntry } from './types';

const map = new Map<string, Exercise>(BASE_EXERCISES.map((e) => [e.id, e]));

export const ctx = { bodyweightKg: null as number | null };

export function registerCustom(list: Exercise[]) {
  for (const e of list) map.set(e.id, e);
}

export const getExercise = (id: string): Exercise | undefined => map.get(id);
export const kindOf = (id: string): ExerciseKind => map.get(id)?.kind ?? 'weight';

/** Load lifted in a set, in kg (bodyweight exercises add your bodyweight). */
export function setLoad(exerciseId: string, s: SetEntry): number {
  const k = kindOf(exerciseId);
  if (k === 'bodyweight') return (ctx.bodyweightKg ?? 0) + (s.weightKg ?? 0);
  return s.weightKg ?? 0;
}

import { getExercise, kindOf, setLoad } from './registry';
import type { Exercise, SetEntry, Unit, Workout } from './types';

export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);

const LB = 2.2046226218;

/** kg -> display unit, rounded to 0.5 for lb and 0.25 for kg, trimmed */
export function toDisplay(kg: number | null | undefined, unit: Unit): string {
  if (kg == null || Number.isNaN(kg)) return '';
  const v = unit === 'kg' ? kg : kg * LB;
  const r = Math.round(v * 4) / 4;
  return String(Number(r.toFixed(2)));
}

export function fromDisplay(text: string, unit: Unit): number | null {
  const n = parseFloat(text.replace(',', '.'));
  if (Number.isNaN(n)) return null;
  return unit === 'kg' ? n : n / LB;
}

export const fmtWeight = (kg: number | null | undefined, unit: Unit) => (kg == null ? '–' : `${toDisplay(kg, unit)} ${unit}`);

/** Whole numbers with thousands separators, for volumes */
export const fmtVolume = (kg: number, unit: Unit) => {
  const v = Math.round(unit === 'kg' ? kg : kg * LB);
  return `${v.toLocaleString()} ${unit}`;
};

/** Epley estimate */
export const est1rm = (weightKg: number, reps: number) => (reps <= 1 ? weightKg : weightKg * (1 + reps / 30));

/** A completed, non-warm-up set with usable numbers (kind-aware when exerciseId is given). */
export function isWorkSet(s: SetEntry, exerciseId?: string) {
  if (!s.done || s.warmup) return false;
  const k = exerciseId ? kindOf(exerciseId) : 'weight';
  if (k === 'time') return (s.durationSec ?? 0) > 0;
  if (k === 'bodyweight') return (s.reps ?? 0) > 0;
  return s.weightKg != null && (s.reps ?? 0) > 0;
}

export function workoutVolumeKg(w: Workout): number {
  let v = 0;
  for (const we of w.exercises) {
    if (kindOf(we.exerciseId) === 'time') continue;
    for (const s of we.sets) if (isWorkSet(s, we.exerciseId)) v += setLoad(we.exerciseId, s) * (s.reps ?? 0);
  }
  return v;
}

export function fmtSeconds(sec: number | null | undefined): string {
  if (!sec) return '–';
  const m = Math.floor(sec / 60);
  const s = Math.round(sec % 60);
  return m ? `${m}:${String(s).padStart(2, '0')}` : `${s}s`;
}

/** Short text for a set: "60 kg × 8", "BW+10 × 8", "45s" */
export function fmtSet(exerciseId: string, s: SetEntry, unit: Unit): string {
  const k = kindOf(exerciseId);
  if (k === 'time') return fmtSeconds(s.durationSec);
  if (k === 'bodyweight') return `${s.weightKg ? `BW+${toDisplay(s.weightKg, unit)}` : 'BW'} × ${s.reps ?? '–'}`;
  return `${toDisplay(s.weightKg, unit)} × ${s.reps ?? '–'}`;
}

/** Estimated 1RM, rounded to a whole number in the display unit */
export const fmtE1rm = (kg: number, unit: Unit) => `${Math.round(Number(toDisplay(kg, unit)))} ${unit}`;

export const workoutSetCount = (w: Workout) => w.exercises.reduce((n, we) => n + we.sets.filter((s) => s.done).length, 0);

export function fmtDuration(ms: number): string {
  const m = Math.max(0, Math.round(ms / 60000));
  if (m < 1) return '<1 min';
  if (m < 60) return `${m} min`;
  return `${Math.floor(m / 60)}h ${String(m % 60).padStart(2, '0')}m`;
}

export function fmtClock(ms: number): string {
  const s = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}` : `${m}:${String(sec).padStart(2, '0')}`;
}

export const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
export const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export function startOfWeek(d: Date): Date {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const day = (x.getDay() + 6) % 7; // Monday = 0
  x.setDate(x.getDate() - day);
  return x;
}

export const sameDay = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

export function fmtDate(ts: number, opts: Intl.DateTimeFormatOptions = { weekday: 'short', day: 'numeric', month: 'short' }) {
  try {
    return new Date(ts).toLocaleDateString(undefined, opts);
  } catch {
    return new Date(ts).toDateString();
  }
}

export function relativeDay(ts: number): string {
  const today = new Date();
  const d = new Date(ts);
  const diff = Math.round(
    (new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime() - new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()) /
      86400000,
  );
  if (diff === 0) return 'today';
  if (diff === 1) return 'yesterday';
  if (diff < 7) return `${diff} days ago`;
  return fmtDate(ts, { day: 'numeric', month: 'short' });
}

/** Most recent completed sets for an exercise, before a given time */
export function previousSets(workouts: Workout[], exerciseId: string, before = Infinity): SetEntry[] {
  const sorted = [...workouts].sort((a, b) => b.startedAt - a.startedAt);
  for (const w of sorted) {
    if (w.startedAt >= before) continue;
    const we = w.exercises.find((x) => x.exerciseId === exerciseId);
    if (we) {
      const done = we.sets.filter((s) => s.done && (s.weightKg != null || s.reps != null || s.durationSec != null));
      if (done.length) return done;
    }
  }
  return [];
}

export interface ExerciseBest {
  bestDuration: number;
  bestE1rm: number;
  bestE1rmSet: { weightKg: number; reps: number; at: number } | null;
  heaviest: { weightKg: number; reps: number; at: number } | null;
  sessions: number;
}

export function bestsFor(workouts: Workout[], exerciseId: string, before = Infinity): ExerciseBest {
  const res: ExerciseBest = { bestDuration: 0, bestE1rm: 0, bestE1rmSet: null, heaviest: null, sessions: 0 };
  const timed = kindOf(exerciseId) === 'time';
  for (const w of workouts) {
    if (w.startedAt >= before) continue;
    const we = w.exercises.find((x) => x.exerciseId === exerciseId);
    if (!we) continue;
    let counted = false;
    for (const s of we.sets) {
      if (!isWorkSet(s, exerciseId)) continue;
      counted = true;
      if (timed) {
        res.bestDuration = Math.max(res.bestDuration, s.durationSec ?? 0);
        continue;
      }
      const load = setLoad(exerciseId, s);
      const e = est1rm(load, s.reps!);
      if (e > res.bestE1rm) {
        res.bestE1rm = e;
        res.bestE1rmSet = { weightKg: s.weightKg ?? 0, reps: s.reps!, at: w.startedAt };
      }
      if (!res.heaviest || (s.weightKg ?? 0) > res.heaviest.weightKg) res.heaviest = { weightKg: s.weightKg ?? 0, reps: s.reps!, at: w.startedAt };
    }
    if (counted) res.sessions++;
  }
  return res;
}

export interface PR {
  exerciseId: string;
  kind: 'e1rm' | 'weight' | 'time';
  weightKg: number;
  reps: number;
  value: number;
  previous: number;
}

/** Personal records set in workout w compared to everything before it */
export function prsInWorkout(workouts: Workout[], w: Workout): PR[] {
  const prs: PR[] = [];
  for (const we of w.exercises) {
    const prior = bestsFor(workouts, we.exerciseId, w.startedAt);
    if (prior.sessions === 0) continue; // first time doing it: not a PR, just a baseline
    let bestE: PR | null = null;
    let bestW: PR | null = null;
    if (kindOf(we.exerciseId) === 'time') {
      const best = Math.max(0, ...we.sets.filter((s) => isWorkSet(s, we.exerciseId)).map((s) => s.durationSec ?? 0));
      if (best > prior.bestDuration)
        prs.push({ exerciseId: we.exerciseId, kind: 'time', weightKg: 0, reps: 0, value: best, previous: prior.bestDuration });
      continue;
    }
    const bw = kindOf(we.exerciseId) === 'bodyweight';
    for (const s of we.sets) {
      if (!isWorkSet(s, we.exerciseId)) continue;
      const e = est1rm(setLoad(we.exerciseId, s), s.reps!);
      if (e > prior.bestE1rm + 0.01 && (!bestE || e > bestE.value))
        bestE = { exerciseId: we.exerciseId, kind: 'e1rm', weightKg: s.weightKg ?? 0, reps: s.reps!, value: e, previous: prior.bestE1rm };
      const ph = prior.heaviest?.weightKg ?? 0;
      const w = s.weightKg ?? 0;
      if (!bw && w > ph + 0.01 && (!bestW || w > bestW.value))
        bestW = { exerciseId: we.exerciseId, kind: 'weight', weightKg: w, reps: s.reps!, value: w, previous: ph };
    }
    if (bestE) prs.push(bestE);
    if (bestW && (!bestE || bestW.weightKg !== bestE.weightKg || bestW.reps !== bestE.reps)) prs.push(bestW);
  }
  return prs;
}

export type Metric = 'e1rm' | 'weight' | 'volume' | 'time';

export function seriesFor(workouts: Workout[], exerciseId: string, metric: Metric): { at: number; value: number }[] {
  const pts: { at: number; value: number }[] = [];
  for (const w of [...workouts].sort((a, b) => a.startedAt - b.startedAt)) {
    const we = w.exercises.find((x) => x.exerciseId === exerciseId);
    if (!we) continue;
    const sets = we.sets.filter((s) => isWorkSet(s, exerciseId));
    if (!sets.length) continue;
    let v = 0;
    if (metric === 'time') v = Math.max(...sets.map((s) => s.durationSec ?? 0));
    else if (metric === 'e1rm') v = Math.max(...sets.map((s) => est1rm(setLoad(exerciseId, s), s.reps!)));
    else if (metric === 'weight') v = Math.max(...sets.map((s) => s.weightKg ?? 0));
    else v = sets.reduce((n, s) => n + setLoad(exerciseId, s) * s.reps!, 0);
    pts.push({ at: w.startedAt, value: v });
  }
  return pts;
}

export function exerciseName(_all: Exercise[] | null, id: string) {
  return getExercise(id)?.name ?? 'Unknown exercise';
}

export function initials(name: string) {
  return name
    .replace(/\(.*?\)/g, '')
    .split(/\s|-/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join('');
}

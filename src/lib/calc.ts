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

export const fmtWeight = (kg: number | null | undefined, unit: Unit) =>
  kg == null ? '–' : `${toDisplay(kg, unit)} ${unit}`;

/** Epley estimate */
export const est1rm = (weightKg: number, reps: number) => (reps <= 1 ? weightKg : weightKg * (1 + reps / 30));

export const isWorkSet = (s: SetEntry) => s.done && !s.warmup && s.weightKg != null && s.reps != null && s.reps > 0;

export function workoutVolumeKg(w: Workout): number {
  let v = 0;
  for (const we of w.exercises) for (const s of we.sets) if (isWorkSet(s)) v += (s.weightKg ?? 0) * (s.reps ?? 0);
  return v;
}

export const workoutSetCount = (w: Workout) =>
  w.exercises.reduce((n, we) => n + we.sets.filter((s) => s.done).length, 0);

export function fmtDuration(ms: number): string {
  const m = Math.max(0, Math.round(ms / 60000));
  if (m < 60) return `${m}m`;
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

export const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

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
  const diff = Math.round((new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime() - new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()) / 86400000);
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
      const done = we.sets.filter((s) => s.done && s.weightKg != null);
      if (done.length) return done;
    }
  }
  return [];
}

export interface ExerciseBest {
  bestE1rm: number;
  bestE1rmSet: { weightKg: number; reps: number; at: number } | null;
  heaviest: { weightKg: number; reps: number; at: number } | null;
  sessions: number;
}

export function bestsFor(workouts: Workout[], exerciseId: string, before = Infinity): ExerciseBest {
  const res: ExerciseBest = { bestE1rm: 0, bestE1rmSet: null, heaviest: null, sessions: 0 };
  for (const w of workouts) {
    if (w.startedAt >= before) continue;
    const we = w.exercises.find((x) => x.exerciseId === exerciseId);
    if (!we) continue;
    let counted = false;
    for (const s of we.sets) {
      if (!isWorkSet(s)) continue;
      counted = true;
      const e = est1rm(s.weightKg!, s.reps!);
      if (e > res.bestE1rm) {
        res.bestE1rm = e;
        res.bestE1rmSet = { weightKg: s.weightKg!, reps: s.reps!, at: w.startedAt };
      }
      if (!res.heaviest || s.weightKg! > res.heaviest.weightKg) res.heaviest = { weightKg: s.weightKg!, reps: s.reps!, at: w.startedAt };
    }
    if (counted) res.sessions++;
  }
  return res;
}

export interface PR {
  exerciseId: string;
  kind: 'e1rm' | 'weight';
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
    for (const s of we.sets) {
      if (!isWorkSet(s)) continue;
      const e = est1rm(s.weightKg!, s.reps!);
      if (e > prior.bestE1rm + 0.01 && (!bestE || e > bestE.value))
        bestE = { exerciseId: we.exerciseId, kind: 'e1rm', weightKg: s.weightKg!, reps: s.reps!, value: e, previous: prior.bestE1rm };
      const ph = prior.heaviest?.weightKg ?? 0;
      if (s.weightKg! > ph + 0.01 && (!bestW || s.weightKg! > bestW.value))
        bestW = { exerciseId: we.exerciseId, kind: 'weight', weightKg: s.weightKg!, reps: s.reps!, value: s.weightKg!, previous: ph };
    }
    if (bestE) prs.push(bestE);
    if (bestW && (!bestE || bestW.weightKg !== bestE.weightKg || bestW.reps !== bestE.reps)) prs.push(bestW);
  }
  return prs;
}

export type Metric = 'e1rm' | 'weight' | 'volume';

export function seriesFor(workouts: Workout[], exerciseId: string, metric: Metric): { at: number; value: number }[] {
  const pts: { at: number; value: number }[] = [];
  for (const w of [...workouts].sort((a, b) => a.startedAt - b.startedAt)) {
    const we = w.exercises.find((x) => x.exerciseId === exerciseId);
    if (!we) continue;
    const sets = we.sets.filter(isWorkSet);
    if (!sets.length) continue;
    let v = 0;
    if (metric === 'e1rm') v = Math.max(...sets.map((s) => est1rm(s.weightKg!, s.reps!)));
    else if (metric === 'weight') v = Math.max(...sets.map((s) => s.weightKg!));
    else v = sets.reduce((n, s) => n + s.weightKg! * s.reps!, 0);
    pts.push({ at: w.startedAt, value: v });
  }
  return pts;
}

export function exerciseName(all: Exercise[], id: string) {
  return all.find((x) => x.id === id)?.name ?? 'Unknown exercise';
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

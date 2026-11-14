/**
 * Rank standards.
 *
 * IMPORTANT: the numbers below are PLACEHOLDERS built from simple bodyweight
 * ratios so the feature works end to end. They are not research data.
 * Before publishing the app, replace `RATIOS` (and `ageFactor`) with a source
 * you are allowed to use, for example FitnessVolt's open strength data
 * (CC BY 4.0, requires a visible "Powered by FitnessVolt" link) or
 * OpenPowerlifting (public domain). Keep `STANDARDS_SOURCE` up to date: it is
 * shown in the app.
 */
import type { Sex } from './types';

export const STANDARDS_SOURCE = {
  placeholder: true,
  label: 'Placeholder standards (bodyweight ratios) – replace before release',
  url: '',
};

export const LEVELS = ['Beginner', 'Novice', 'Intermediate', 'Advanced', 'Elite'] as const;
export type Level = (typeof LEVELS)[number];
/** share of lifters each level beats */
export const LEVEL_PERCENTILES = [5, 20, 50, 80, 95];
export const LEVEL_MEANING = ['stronger than ~5% of lifters', 'stronger than ~20%', 'stronger than ~50%', 'stronger than ~80%', 'stronger than ~95%'];

/** 1RM as a multiple of bodyweight at the reference bodyweight (80 kg men, 60 kg women) */
const RATIOS: Record<string, { male: number[]; female: number[] }> = {
  'bench-press': { male: [0.5, 0.75, 1.0, 1.4, 1.8], female: [0.25, 0.45, 0.65, 0.95, 1.25] },
  'incline-bench-press': { male: [0.4, 0.65, 0.85, 1.2, 1.55], female: [0.2, 0.38, 0.55, 0.8, 1.05] },
  squat: { male: [0.7, 1.0, 1.4, 1.9, 2.4], female: [0.45, 0.75, 1.05, 1.45, 1.85] },
  'front-squat': { male: [0.55, 0.8, 1.15, 1.55, 1.95], female: [0.35, 0.6, 0.85, 1.2, 1.5] },
  deadlift: { male: [0.9, 1.25, 1.7, 2.25, 2.8], female: [0.6, 0.9, 1.25, 1.7, 2.15] },
  'overhead-press': { male: [0.35, 0.5, 0.7, 0.9, 1.15], female: [0.2, 0.32, 0.45, 0.62, 0.8] },
  'barbell-row': { male: [0.45, 0.65, 0.9, 1.2, 1.5], female: [0.28, 0.42, 0.6, 0.82, 1.05] },
  rdl: { male: [0.6, 0.9, 1.25, 1.65, 2.05], female: [0.4, 0.65, 0.9, 1.25, 1.55] },
};

export const RANKABLE_IDS = Object.keys(RATIOS);
export const isRankable = (exerciseId: string) => exerciseId in RATIOS;

const REF_BW: Record<Sex, number> = { male: 80, female: 60 };

/** Placeholder age adjustment: lifters 40+ and under 18 get proportionally lower thresholds. */
export function ageFactor(age: number): number {
  if (age >= 40) return Math.max(0.6, 1 - 0.01 * (age - 40) - (age >= 60 ? 0.005 * (age - 60) : 0));
  if (age < 18) return Math.max(0.7, 1 - 0.03 * (18 - age));
  return 1;
}

/** kg thresholds for each level */
export function thresholds(exerciseId: string, sex: Sex, bodyweightKg: number, age: number): number[] {
  const r = RATIOS[exerciseId];
  if (!r) return [];
  const ref = REF_BW[sex];
  // heavier lifters lift more in absolute terms but less per kg of bodyweight
  const scale = ref * Math.pow(bodyweightKg / ref, 0.67);
  const af = ageFactor(age);
  return r[sex].map((m) => Math.round(m * scale * af));
}

export interface RankResult {
  level: Level | 'Untrained';
  levelIndex: number; // -1 below beginner
  percentile: number;
  thresholds: number[];
  next: { level: Level; kg: number } | null;
}

export function rank(exerciseId: string, sex: Sex, bodyweightKg: number, age: number, e1rm: number): RankResult {
  const t = thresholds(exerciseId, sex, bodyweightKg, age);
  let idx = -1;
  for (let i = 0; i < t.length; i++) if (e1rm >= t[i]!) idx = i;
  let pct: number;
  if (idx === -1) pct = Math.max(1, (e1rm / t[0]!) * LEVEL_PERCENTILES[0]!);
  else if (idx === t.length - 1) pct = Math.min(99, 95 + ((e1rm - t[idx]!) / Math.max(1, t[idx]! * 0.25)) * 4);
  else {
    const f = (e1rm - t[idx]!) / (t[idx + 1]! - t[idx]!);
    pct = LEVEL_PERCENTILES[idx]! + f * (LEVEL_PERCENTILES[idx + 1]! - LEVEL_PERCENTILES[idx]!);
  }
  const nextIdx = idx + 1;
  return {
    level: idx === -1 ? 'Untrained' : LEVELS[idx]!,
    levelIndex: idx,
    percentile: Math.round(pct),
    thresholds: t,
    next: nextIdx < LEVELS.length ? { level: LEVELS[nextIdx]!, kg: t[nextIdx]! } : null,
  };
}

/** Weight needed for a given number of reps to reach a target 1RM (inverse Epley) */
export const weightForReps = (target1rm: number, reps: number) => (reps <= 1 ? target1rm : target1rm / (1 + reps / 30));

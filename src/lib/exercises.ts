import type { Equipment, Exercise, Muscle, Routine } from './types';

import data from '../data/exercises.json';

/** 876 exercises: the app's originals plus free-exercise-db (public domain). */
export const BASE_EXERCISES: Exercise[] = data as Exercise[];

export const MUSCLES: Muscle[] = ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core', 'Full body', 'Cardio', 'Stretching'];
export const EQUIPMENT: Equipment[] = ['Barbell', 'Dumbbell', 'Machine', 'Cable', 'Bodyweight', 'Kettlebell', 'Band', 'EZ bar', 'Ball', 'Other'];

export const exerciseImageUrl = (src: string, frame: 0 | 1) =>
  `https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/${src}/${frame}.jpg`;

export const STARTER_ROUTINES: { key: string; label: string; description: string; routines: Omit<Routine, 'id'>[] }[] = [
  {
    key: 'ppl',
    label: 'Push / Pull / Legs',
    description: '3 routines, great for 3–6 days a week',
    routines: [
      {
        name: 'Push Day',
        items: [
          { exerciseId: 'bench-press', targetSets: 3, targetReps: 8 },
          { exerciseId: 'overhead-press', targetSets: 3, targetReps: 8 },
          { exerciseId: 'incline-db-press', targetSets: 3, targetReps: 10 },
          { exerciseId: 'lateral-raise', targetSets: 3, targetReps: 12 },
          { exerciseId: 'triceps-pushdown', targetSets: 3, targetReps: 12 },
        ],
      },
      {
        name: 'Pull Day',
        items: [
          { exerciseId: 'deadlift', targetSets: 3, targetReps: 5 },
          { exerciseId: 'barbell-row', targetSets: 3, targetReps: 8 },
          { exerciseId: 'pull-up', targetSets: 3, targetReps: 8 },
          { exerciseId: 'face-pull', targetSets: 3, targetReps: 15 },
          { exerciseId: 'db-curl', targetSets: 3, targetReps: 12 },
        ],
      },
      {
        name: 'Leg Day',
        items: [
          { exerciseId: 'squat', targetSets: 3, targetReps: 6 },
          { exerciseId: 'rdl', targetSets: 3, targetReps: 8 },
          { exerciseId: 'leg-press', targetSets: 3, targetReps: 10 },
          { exerciseId: 'leg-curl', targetSets: 3, targetReps: 12 },
          { exerciseId: 'calf-raise', targetSets: 3, targetReps: 15 },
        ],
      },
    ],
  },
  {
    key: 'fullbody',
    label: 'Full body A / B',
    description: '2 routines, ideal for 2–3 days a week',
    routines: [
      {
        name: 'Full Body A',
        items: [
          { exerciseId: 'squat', targetSets: 3, targetReps: 5 },
          { exerciseId: 'bench-press', targetSets: 3, targetReps: 5 },
          { exerciseId: 'barbell-row', targetSets: 3, targetReps: 8 },
          { exerciseId: 'plank', targetSets: 3, targetReps: 45 },
        ],
      },
      {
        name: 'Full Body B',
        items: [
          { exerciseId: 'deadlift', targetSets: 3, targetReps: 5 },
          { exerciseId: 'overhead-press', targetSets: 3, targetReps: 6 },
          { exerciseId: 'lat-pulldown', targetSets: 3, targetReps: 10 },
          { exerciseId: 'walking-lunge', targetSets: 3, targetReps: 10 },
        ],
      },
    ],
  },
  {
    key: 'machines',
    label: 'Machine circuit',
    description: '1 beginner-friendly routine using machines',
    routines: [
      {
        name: 'Machine Circuit',
        items: [
          { exerciseId: 'leg-press', targetSets: 3, targetReps: 12 },
          { exerciseId: 'chest-press-machine', targetSets: 3, targetReps: 12 },
          { exerciseId: 'lat-pulldown', targetSets: 3, targetReps: 12 },
          { exerciseId: 'shoulder-press-machine', targetSets: 3, targetReps: 12 },
          { exerciseId: 'leg-curl', targetSets: 3, targetReps: 12 },
          { exerciseId: 'machine-row', targetSets: 3, targetReps: 12 },
        ],
      },
    ],
  },
];

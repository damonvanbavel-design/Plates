import type { Equipment, Exercise, Muscle, Routine } from './types';

const e = (id: string, name: string, muscle: Muscle, equipment: Equipment): Exercise => ({ id, name, muscle, equipment });

export const BASE_EXERCISES: Exercise[] = [
  // Chest
  e('bench-press', 'Bench Press', 'Chest', 'Barbell'),
  e('incline-bench-press', 'Incline Bench Press', 'Chest', 'Barbell'),
  e('db-bench-press', 'Dumbbell Bench Press', 'Chest', 'Dumbbell'),
  e('incline-db-press', 'Incline Dumbbell Press', 'Chest', 'Dumbbell'),
  e('chest-press-machine', 'Chest Press (Machine)', 'Chest', 'Machine'),
  e('pec-deck', 'Pec Deck', 'Chest', 'Machine'),
  e('cable-fly', 'Cable Fly', 'Chest', 'Cable'),
  e('dip', 'Dip', 'Chest', 'Bodyweight'),
  e('push-up', 'Push-up', 'Chest', 'Bodyweight'),
  // Back
  e('deadlift', 'Deadlift', 'Back', 'Barbell'),
  e('barbell-row', 'Barbell Row', 'Back', 'Barbell'),
  e('db-row', 'One-Arm Dumbbell Row', 'Back', 'Dumbbell'),
  e('pull-up', 'Pull-up', 'Back', 'Bodyweight'),
  e('chin-up', 'Chin-up', 'Back', 'Bodyweight'),
  e('lat-pulldown', 'Lat Pulldown', 'Back', 'Cable'),
  e('seated-row', 'Seated Cable Row', 'Back', 'Cable'),
  e('machine-row', 'Row (Machine)', 'Back', 'Machine'),
  e('face-pull', 'Face Pull', 'Back', 'Cable'),
  // Legs
  e('squat', 'Back Squat', 'Legs', 'Barbell'),
  e('front-squat', 'Front Squat', 'Legs', 'Barbell'),
  e('rdl', 'Romanian Deadlift', 'Legs', 'Barbell'),
  e('leg-press', 'Leg Press', 'Legs', 'Machine'),
  e('hack-squat', 'Hack Squat', 'Legs', 'Machine'),
  e('leg-extension', 'Leg Extension', 'Legs', 'Machine'),
  e('leg-curl', 'Leg Curl', 'Legs', 'Machine'),
  e('bulgarian-split-squat', 'Bulgarian Split Squat', 'Legs', 'Dumbbell'),
  e('walking-lunge', 'Walking Lunge', 'Legs', 'Dumbbell'),
  e('hip-thrust', 'Hip Thrust', 'Legs', 'Barbell'),
  e('calf-raise', 'Standing Calf Raise', 'Legs', 'Machine'),
  // Shoulders
  e('overhead-press', 'Overhead Press', 'Shoulders', 'Barbell'),
  e('db-shoulder-press', 'Dumbbell Shoulder Press', 'Shoulders', 'Dumbbell'),
  e('shoulder-press-machine', 'Shoulder Press (Machine)', 'Shoulders', 'Machine'),
  e('lateral-raise', 'Lateral Raise', 'Shoulders', 'Dumbbell'),
  e('cable-lateral-raise', 'Cable Lateral Raise', 'Shoulders', 'Cable'),
  e('rear-delt-fly', 'Rear Delt Fly', 'Shoulders', 'Dumbbell'),
  // Arms
  e('barbell-curl', 'Barbell Curl', 'Arms', 'Barbell'),
  e('db-curl', 'Dumbbell Curl', 'Arms', 'Dumbbell'),
  e('hammer-curl', 'Hammer Curl', 'Arms', 'Dumbbell'),
  e('cable-curl', 'Cable Curl', 'Arms', 'Cable'),
  e('triceps-pushdown', 'Triceps Pushdown', 'Arms', 'Cable'),
  e('skull-crusher', 'Skull Crusher', 'Arms', 'Barbell'),
  e('overhead-triceps', 'Overhead Triceps Extension', 'Arms', 'Cable'),
  e('close-grip-bench', 'Close-Grip Bench Press', 'Arms', 'Barbell'),
  // Core
  e('plank', 'Plank (seconds as reps)', 'Core', 'Bodyweight'),
  e('hanging-leg-raise', 'Hanging Leg Raise', 'Core', 'Bodyweight'),
  e('cable-crunch', 'Cable Crunch', 'Core', 'Cable'),
  e('ab-wheel', 'Ab Wheel Rollout', 'Core', 'Other'),
  // Full body
  e('power-clean', 'Power Clean', 'Full body', 'Barbell'),
  e('kb-swing', 'Kettlebell Swing', 'Full body', 'Kettlebell'),
];

export const MUSCLES: Muscle[] = ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core', 'Full body'];
export const EQUIPMENT: Equipment[] = ['Barbell', 'Dumbbell', 'Machine', 'Cable', 'Bodyweight', 'Kettlebell', 'Other'];

export const STARTER_ROUTINES: { key: string; label: string; description: string; routines: Omit<Routine, 'id'>[] }[] = [
  {
    key: 'ppl',
    label: 'Push / Pull / Legs',
    description: '3 routines, great for 3–6 days a week',
    routines: [
      { name: 'Push Day', items: [
        { exerciseId: 'bench-press', targetSets: 3, targetReps: 8 },
        { exerciseId: 'overhead-press', targetSets: 3, targetReps: 8 },
        { exerciseId: 'incline-db-press', targetSets: 3, targetReps: 10 },
        { exerciseId: 'lateral-raise', targetSets: 3, targetReps: 12 },
        { exerciseId: 'triceps-pushdown', targetSets: 3, targetReps: 12 },
      ] },
      { name: 'Pull Day', items: [
        { exerciseId: 'deadlift', targetSets: 3, targetReps: 5 },
        { exerciseId: 'barbell-row', targetSets: 3, targetReps: 8 },
        { exerciseId: 'pull-up', targetSets: 3, targetReps: 8 },
        { exerciseId: 'face-pull', targetSets: 3, targetReps: 15 },
        { exerciseId: 'db-curl', targetSets: 3, targetReps: 12 },
      ] },
      { name: 'Leg Day', items: [
        { exerciseId: 'squat', targetSets: 3, targetReps: 6 },
        { exerciseId: 'rdl', targetSets: 3, targetReps: 8 },
        { exerciseId: 'leg-press', targetSets: 3, targetReps: 10 },
        { exerciseId: 'leg-curl', targetSets: 3, targetReps: 12 },
        { exerciseId: 'calf-raise', targetSets: 3, targetReps: 15 },
      ] },
    ],
  },
  {
    key: 'fullbody',
    label: 'Full body A / B',
    description: '2 routines, ideal for 2–3 days a week',
    routines: [
      { name: 'Full Body A', items: [
        { exerciseId: 'squat', targetSets: 3, targetReps: 5 },
        { exerciseId: 'bench-press', targetSets: 3, targetReps: 5 },
        { exerciseId: 'barbell-row', targetSets: 3, targetReps: 8 },
        { exerciseId: 'plank', targetSets: 3, targetReps: 45 },
      ] },
      { name: 'Full Body B', items: [
        { exerciseId: 'deadlift', targetSets: 3, targetReps: 5 },
        { exerciseId: 'overhead-press', targetSets: 3, targetReps: 6 },
        { exerciseId: 'lat-pulldown', targetSets: 3, targetReps: 10 },
        { exerciseId: 'walking-lunge', targetSets: 3, targetReps: 10 },
      ] },
    ],
  },
  {
    key: 'machines',
    label: 'Machine circuit',
    description: '1 beginner-friendly routine using machines',
    routines: [
      { name: 'Machine Circuit', items: [
        { exerciseId: 'leg-press', targetSets: 3, targetReps: 12 },
        { exerciseId: 'chest-press-machine', targetSets: 3, targetReps: 12 },
        { exerciseId: 'lat-pulldown', targetSets: 3, targetReps: 12 },
        { exerciseId: 'shoulder-press-machine', targetSets: 3, targetReps: 12 },
        { exerciseId: 'leg-curl', targetSets: 3, targetReps: 12 },
        { exerciseId: 'machine-row', targetSets: 3, targetReps: 12 },
      ] },
    ],
  },
];

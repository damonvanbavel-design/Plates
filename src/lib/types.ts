export type Muscle = 'Chest' | 'Back' | 'Legs' | 'Shoulders' | 'Arms' | 'Core' | 'Full body';
export type Equipment = 'Barbell' | 'Dumbbell' | 'Machine' | 'Cable' | 'Bodyweight' | 'Kettlebell' | 'Other';

export interface Exercise {
  id: string;
  name: string;
  muscle: Muscle;
  equipment: Equipment;
  custom?: boolean;
}

export interface RoutineItem {
  exerciseId: string;
  targetSets: number;
  targetReps: number;
}

export interface Routine {
  id: string;
  name: string;
  items: RoutineItem[];
}

export interface SetEntry {
  id: string;
  weightKg: number | null;
  reps: number | null;
  done: boolean;
  warmup?: boolean;
}

export interface WorkoutExercise {
  id: string;
  exerciseId: string;
  sets: SetEntry[];
}

export interface Workout {
  id: string;
  name: string;
  routineId?: string;
  startedAt: number;
  endedAt?: number;
  notes?: string;
  exercises: WorkoutExercise[];
}

export interface ActiveWorkout extends Workout {
  restEndsAt: number | null;
  restTotal: number;
}

export type Unit = 'kg' | 'lb';
export type Sex = 'male' | 'female';

export interface Settings {
  unit: Unit;
  restSeconds: number;
  themeId: string;
  weeklyGoal: number;
  bodyweightKg: number | null;
  birthYear: number | null;
  sex: Sex | null;
}

export interface RankCheck {
  id: string;
  exerciseId: string;
  machine: string;
  weightKg: number;
  reps: number;
  est1rm: number;
  level: string;
  percentile: number;
  bodyweightKg: number;
  age: number;
  sex: Sex;
  createdAt: number;
}

export type Muscle = 'Chest' | 'Back' | 'Legs' | 'Shoulders' | 'Arms' | 'Core' | 'Full body' | 'Cardio' | 'Stretching';
export type Equipment = 'Barbell' | 'Dumbbell' | 'Machine' | 'Cable' | 'Bodyweight' | 'Kettlebell' | 'Band' | 'EZ bar' | 'Ball' | 'Other';
/** weight: kg × reps · bodyweight: reps with optional added kg · time: seconds */
export type ExerciseKind = 'weight' | 'bodyweight' | 'time';

export interface Exercise {
  id: string;
  name: string;
  muscle: Muscle;
  equipment: Equipment;
  kind: ExerciseKind;
  custom?: boolean;
  /** free-exercise-db id, used for pictures */
  src?: string;
  primary?: string[];
  secondary?: string[];
  level?: string;
  instructions?: string[];
  images?: number;
}

export interface RoutineItem {
  exerciseId: string;
  targetSets: number;
  targetReps: number;
  /** rest in seconds after each set; undefined = default from settings, 0 = no timer */
  restSec?: number;
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
  /** for timed exercises */
  durationSec?: number | null;
  done: boolean;
  warmup?: boolean;
}

export interface WorkoutExercise {
  id: string;
  exerciseId: string;
  sets: SetEntry[];
  restSec?: number;
  note?: string;
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

/** A theme the user made in the theme builder */
export interface CustomThemeSpec {
  id: string;
  name: string;
  dark: boolean;
  bg: string;
  surface: string;
  accent: string;
  headingFont: string;
  radius: number;
  image?: string | null;
  imageOverlay: number;
  iconId: string;
}

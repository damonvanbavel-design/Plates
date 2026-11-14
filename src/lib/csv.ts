import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

import { exerciseName } from './calc';
import type { Exercise, Workout } from './types';

const q = (v: string | number | undefined | null) => {
  const s = v == null ? '' : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export function workoutsToCsv(workouts: Workout[], all: Exercise[]): string {
  const rows = [['date', 'workout', 'exercise', 'set', 'weight_kg', 'reps', 'warmup', 'notes'].join(',')];
  for (const w of [...workouts].sort((a, b) => a.startedAt - b.startedAt)) {
    const date = new Date(w.startedAt).toISOString();
    for (const we of w.exercises) {
      we.sets.forEach((s, i) => {
        rows.push([q(date), q(w.name), q(exerciseName(all, we.exerciseId)), i + 1, s.weightKg != null ? Number(s.weightKg.toFixed(2)) : '', s.reps ?? '', s.warmup ? 'yes' : '', q(w.notes)].join(','));
      });
    }
  }
  return rows.join('\n');
}

export async function shareCsv(workouts: Workout[], all: Exercise[]) {
  const file = new File(Paths.cache, `plates-export-${new Date().toISOString().slice(0, 10)}.csv`);
  file.create({ overwrite: true });
  file.write(workoutsToCsv(workouts, all));
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(file.uri, { mimeType: 'text/csv', dialogTitle: 'Export workouts', UTI: 'public.comma-separated-values-text' });
    return true;
  }
  return false;
}

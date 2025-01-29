export interface ExerciseDefinition {
  id: string;
  name: string;
  videoURL?: string;
}

export interface Set {
  id?: string;
  setNumber: number;
  reps: number;
  load: number;
  completed?: boolean;
}

export interface ExerciseInstance {
  id?: string;
  exerciseId: string;
  name: string;
  orderBy: number;
  sets: Set[];
  notes?: string;
  clientVideoURL?: string;
}

export interface Workout {
  date: string;
  coachNotes: string;
  exercises: ExerciseInstance[];
  notes?: Record<number, string>;
  videoURL?: string;
  title?: string;
}

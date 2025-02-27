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
  coachNotes?: string; // Add this line
}

export interface Workout {
  id: string
  coachNotes: string;
  exercises: ExerciseInstance[];
  notes?: Record<number, string>;
  videoURL?: string;
  title?: string;
  completed?: boolean;
  completedAt?: Date;
  dueDate?: Date; // Add this line
}
export interface Post {
  id: string
  coachNotes: string;
  exercises: ExerciseInstance[];
  notes?: Record<number, string>;
  videoURL?: string;
  title?: string;
  completed?: boolean;
  completedAt?: Date;
  dueDate?: Date; // Add this line
}
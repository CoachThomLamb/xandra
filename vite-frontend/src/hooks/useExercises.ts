import { useState } from 'react';
import { Set, ExerciseInstance } from '../types/workout';

export const useExercises = () => {
  const [exercises, setExercises] = useState<ExerciseInstance[]>([
    { id: '', name: '', exerciseId: '', clientVideoURL: '', sets: [{ setNumber: 1, reps: 0, load: 0 }], orderBy: 0 }
  ]);

  const updateSet = (exerciseIndex: number, setIndex: number, field: keyof Set, value: number) => {
    const updatedExercises = exercises.map((exercise, i) =>
      i === exerciseIndex
        ? {
            ...exercise,
            sets: exercise.sets.map((set, j) =>
              j === setIndex ? { ...set, [field]: value } : set
            ),
          }
        : exercise
    );
    setExercises(updatedExercises);
  };

  const onExerciseChange = (index: number, field: keyof ExerciseInstance, value: string) => {
    const updatedExercises = [...exercises];
    updatedExercises[index][field] = value;
    setExercises(updatedExercises);
  };

  const addExercise = () => {
    setExercises([...exercises, { 
      name: '', 
      exerciseId: '', 
      id: '', 
      sets: [{ setNumber: 1, reps: 0, load: 0 }], 
      orderBy: exercises.length 
    }]);
  };
 

  const addSet = (exerciseIndex: number) => {
    const updatedExercises = exercises.map((exercise, i) =>
      i === exerciseIndex
        ? { 
            ...exercise, 
            sets: [...exercise.sets, { 
              setNumber: exercise.sets.length + 1, 
              reps: 0, 
              load: 0 
            }] 
          }
        : exercise
    );
    setExercises(updatedExercises);
  };

  return {
    exercises,
    setExercises,
    updateSet,
    onExerciseChange,
    addExercise,
    addSet
  };
};
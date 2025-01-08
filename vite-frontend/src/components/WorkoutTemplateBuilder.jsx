import React, { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';

const WorkoutTemplateBuilder = () => {
  const [title, setTitle] = useState('');
  const [exercises, setExercises] = useState([{ name: 'Squats', sets: [{ setNumber: 1, reps: '10', load: '225' }] }]);

  const addExercise = () => {
    setExercises([...exercises, { name: '', sets: [{ setNumber: 1, reps: '', load: '' }] }]);
  };

  const updateExercise = (index, field, value) => {
    const updatedExercises = exercises.map((exercise, i) =>
      i === index ? { ...exercise, [field]: value } : exercise
    );
    setExercises(updatedExercises);
  };

  const addSet = (exerciseIndex) => {
    const updatedExercises = exercises.map((exercise, i) =>
      i === exerciseIndex
        ? { ...exercise, sets: [...exercise.sets, { setNumber: exercise.sets.length + 1, reps: '', load: '' }] }
        : exercise
    );
    setExercises(updatedExercises);
  };

  const updateSet = (exerciseIndex, setIndex, field, value) => {
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

  const saveWorkoutTemplate = async () => {
    try {
      const workoutTemplateRef = await addDoc(collection(db, 'workout-templates'), { title });
      for (const exercise of exercises) {
        const exerciseRef = await addDoc(collection(workoutTemplateRef, 'exercises'), { name: exercise.name });
        for (const set of exercise.sets) {
          await addDoc(collection(exerciseRef, 'sets'), set);
        }
      }
      console.log('Workout template saved to Firebase');
    } catch (error) {
      console.error('Error saving workout template to Firebase:', error);
    }
  };

  return (
    <div>
      <h1>Workout Template Builder</h1>
      <div>
        <label>Title:</label>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>
      {exercises.map((exercise, i) => (
        <div key={i}>
          <label>Exercise Name:</label>
          <input
            type="text"
            value={exercise.name}
            onChange={(e) => updateExercise(i, 'name', e.target.value)}
          />
          {exercise.sets.map((set, j) => (
            <div key={j}>
              <label>Set {set.setNumber}:</label>
              <input
                type="text"
                placeholder="Reps"
                value={set.reps}
                onChange={(e) => updateSet(i, j, 'reps', e.target.value)}
              />
              <input
                type="text"
                placeholder="Load"
                value={set.load}
                onChange={(e) => updateSet(i, j, 'load', e.target.value)}
              />
            </div>
          ))}
          <button onClick={() => addSet(i)}>Add Set</button>
        </div>
      ))}
      <button onClick={addExercise}>Add Exercise</button>
      <button onClick={saveWorkoutTemplate}>Save Workout Template</button>
    </div>
  );
};

export default WorkoutTemplateBuilder;

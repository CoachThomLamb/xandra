import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';

const ExerciseTracker = () => {
  const [exercises, setExercises] = useState([]);
  const [newExercise, setNewExercise] = useState({ name: '' });
  const [workouts, setWorkouts] = useState([]);
  const [currentWorkout, setCurrentWorkout] = useState({ title: '', exercises: [] });

  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'exercises'));
        const exercisesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setExercises(exercisesData);
      } catch (error) {
        console.error('Error fetching exercises:', error);
      }
    };

    fetchExercises();
  }, []);

  const addExercise = async () => {
    try {
      const docRef = await addDoc(collection(db, 'exercises'), newExercise);
      setExercises([...exercises, { id: docRef.id, ...newExercise }]);
      setNewExercise({ name: '' });
      console.log('Exercise added to Firebase');
    } catch (error) {
      console.error('Error adding exercise:', error);
    }
  };

  const updateNewExercise = (field, value) => {
    setNewExercise({ ...newExercise, [field]: value });
  };

  const startWorkout = () => {
    setCurrentWorkout({ title: 'New Workout', exercises: [] });
  };

  const addExerciseToWorkout = (exercise) => {
    setCurrentWorkout({ ...currentWorkout, exercises: [...currentWorkout.exercises, { ...exercise, sets: [] }] });
  };

  const addSetToExerciseInWorkout = (exerciseIndex) => {
    const updatedExercises = currentWorkout.exercises.map((exercise, index) =>
      index === exerciseIndex
        ? { ...exercise, sets: [...exercise.sets, { setNumber: exercise.sets.length + 1, reps: '', load: '' }] }
        : exercise
    );
    setCurrentWorkout({ ...currentWorkout, exercises: updatedExercises });
  };

  const updateSetInWorkout = (exerciseIndex, setIndex, field, value) => {
    const updatedExercises = currentWorkout.exercises.map((exercise, index) =>
      index === exerciseIndex
        ? {
            ...exercise,
            sets: exercise.sets.map((set, sIndex) =>
              sIndex === setIndex ? { ...set, [field]: value } : set
            ),
          }
        : exercise
    );
    setCurrentWorkout({ ...currentWorkout, exercises: updatedExercises });
  };

  const completeWorkout = async () => {
    try {
      await addDoc(collection(db, 'workouts'), currentWorkout);
      setWorkouts([...workouts, currentWorkout]);
      setCurrentWorkout({ title: '', exercises: [] });
      console.log('Workout completed and saved to Firebase');
    } catch (error) {
      console.error('Error completing workout:', error);
    }
  };

  return (
    <div>
      <h1>Exercise Tracker</h1>
      <div>
        <h2>Add New Exercise</h2>
        <label>Exercise Name:</label>
        <input
          type="text"
          value={newExercise.name}
          onChange={(e) => updateNewExercise('name', e.target.value)}
        />
        <button onClick={addExercise}>Add Exercise</button>
      </div>
      <div>
        <h2>Current Workout</h2>
        <button onClick={startWorkout}>Start New Workout</button>
        {currentWorkout.exercises.map((exercise, index) => (
          <div key={index}>
            <h3>{exercise.name}</h3>
            {exercise.sets.map((set, setIndex) => (
              <div key={setIndex}>
                <label>Set {set.setNumber} Reps:</label>
                <input
                  type="number"
                  value={set.reps}
                  onChange={(e) => updateSetInWorkout(index, setIndex, 'reps', e.target.value)}
                />
                <label>Load:</label>
                <input
                  type="number"
                  value={set.load}
                  onChange={(e) => updateSetInWorkout(index, setIndex, 'load', e.target.value)}
                />
              </div>
            ))}
            <button onClick={() => addSetToExerciseInWorkout(index)}>Add Set</button>
          </div>
        ))}
        <button onClick={completeWorkout}>Complete Workout</button>
      </div>
      <div>
        <h2>Available Exercises</h2>
        {exercises.map((exercise) => (
          <div key={exercise.id}>
            <h3>{exercise.name}</h3>
            <button onClick={() => addExerciseToWorkout(exercise)}>Add to Workout</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExerciseTracker;

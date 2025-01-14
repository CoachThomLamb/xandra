import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';

const ExerciseList = () => {
  const [exercises, setExercises] = useState([]);
  const [newExercise, setNewExercise] = useState({ name: '' });
  const [exerciseNames, setExerciseNames] = useState([]);

  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'exercises'));
        const exercisesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setExercises(exercisesData);
        const names = exercisesData.map(exercise => exercise.name);
        setExerciseNames(names);
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

  return (
    <div>
      <h1>Exercise List</h1>
      <div>
        <h2>Add New Exercise</h2>
        <label>Exercise Name:</label>
        <input
          type="text"
          list="exercise-names"
          value={newExercise.name}
          onChange={(e) => updateNewExercise('name', e.target.value)}
        />
        <datalist id="exercise-names">
          {exerciseNames.map((name, index) => (
            <option key={index} value={name} />
          ))}
        </datalist>
        <button onClick={addExercise}>Add Exercise</button>
      </div>
      <div>
        <h2>Available Exercises</h2>
        {exercises.map((exercise) => (
          <div key={exercise.id}>
            <h3>{exercise.name}</h3>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExerciseList;

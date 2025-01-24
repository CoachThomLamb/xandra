import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import ExerciseList from './ExerciseList';
import { Link } from 'react-router-dom';
import './WorkoutTemplateBuilder.css';


const WorkoutTemplateBuilder = () => {
  const [title, setTitle] = useState('');
  const [coachNotes, setCoachNotes] = useState('');
  const [exercises, setExercises] = useState([{ name: '', id: '', sets: [{ setNumber: 1, reps: '', load: '' }], orderBy: 0 }]);
  const [templates, setTemplates] = useState([]);
  const [exerciseNames, setExerciseNames] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [exerciseMap, setExerciseMap] = useState({});

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'workout-templates'));
        const templatesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setTemplates(templatesData);
      } catch (error) {
        console.error('Error fetching workout templates:', error);
      }
    };

    fetchTemplates();
    fetchExerciseNames();
  }, []);

  const fetchExerciseNames = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'exercises'));
      const names = querySnapshot.docs.map(doc => ({ id: doc.id, name: doc.data().name }));
      setExerciseNames(names);
      const map = {};
      names.forEach(exercise => {
        map[exercise.name] = exercise.id;
      });
      setExerciseMap(map);
    } catch (error) {
      console.error('Error fetching exercise names:', error);
    }
  };

  const addExercise = () => {
    setExercises([...exercises, { name: '', id: '', sets: [{ setNumber: 1, reps: '', load: '' }], orderBy: exercises.length }]);
  };

  const updateExercise = (index, field, value) => {
    setExercises((prevExercises) => {
      const updatedExercises = [...prevExercises];
      updatedExercises[index] = {
        ...updatedExercises[index],
        [field]: value,
        id: field === 'name' ? exerciseMap[value] : updatedExercises[index].id,
      };
      return updatedExercises;
    });
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
      const workoutTemplateRef = await addDoc(collection(db, 'workout-templates'), { title, coachNotes });
      for (const exercise of exercises) {
        const exerciseRef = await addDoc(collection(workoutTemplateRef, 'exercises'), { name: exercise.name, id: exercise.id, orderBy: exercise.orderBy });
        for (const set of exercise.sets) {
          await addDoc(collection(exerciseRef, 'sets'), set);
        }
      }
      setSuccessMessage('Workout template saved successfully!');
      setTimeout(() => setSuccessMessage(''), 3000); // Clear message after 3 seconds
      console.log('Workout template saved to Firebase');
    } catch (error) {
      console.error('Error saving workout template to Firebase:', error);
    }
  };

  return (
    <div style={{ overflowY: 'scroll', overflowX: 'hidden', maxHeight: 'calc(100vh - 200px)', width: '100%' }}>
      <h1>Workout Template Builder</h1>
      {successMessage && <p>{successMessage}</p>}
      <div>
        <label>Title:</label>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>
      <div>
        <label>Coach Notes:</label>
        <textarea value={coachNotes} onChange={(e) => setCoachNotes(e.target.value)} style={{ width: '95%',  }} />
      </div>
      {exercises.map((exercise, i) => (
        <div key={i}>
          <label>Exercise Name:</label>
          <input
            type="text"
            list={`exercise-names-${i}`}
            value={exercise.name}
            onChange={(e) => updateExercise(i, 'name', e.target.value)}
            onFocus={() => fetchExerciseNames()}
          />
          <datalist id={`exercise-names-${i}`}>
            {exerciseNames.map((exercise, index) => (
              <option key={index} value={exercise.name} />
            ))}
          </datalist>
          {exercise.name} - {exercise.videoURL && (
            <a href={exercise.videoURL} target="_blank" rel="noreferrer">Preview</a>
          )}
          {exercise.sets.map((set, j) => (
            <div key={j}>
              <label>Set {set.setNumber} Reps:</label>
              <input
                type="text"
                value={set.reps}
                onChange={(e) => updateSet(i, j, 'reps', e.target.value)}
              />
              <label>Load:</label>
              <input
                type="text"
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
      <Link to="/exercise-management" style={{ margin: '10px' }}>
        <button>Manage Exercises</button>
      </Link>
      <ExerciseList />
    </div>
  );
};

export default WorkoutTemplateBuilder;

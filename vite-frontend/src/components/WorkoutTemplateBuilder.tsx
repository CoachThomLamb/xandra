import React, { useState, useEffect, ChangeEvent } from 'react';
import { collection, addDoc, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import ExerciseList from './ExerciseList';
import { Link } from 'react-router-dom';
import './WorkoutTemplateBuilder.css';
import { Set, ExerciseDefinition, Workout, ExerciseInstance } from '../types/workout';


const WorkoutTemplateBuilder: React.FC = () => {
  const [title, setTitle] = useState<string>('');
  const [coachNotes, setCoachNotes] = useState<string>('');
  const [exercises, setExercises] = useState<ExerciseInstance[]>([
    { id: '', name: '',exerciseId: '',  clientVideoURL: '', sets: [{ setNumber: 1, reps: 0, load: 0 }], orderBy: 0 }
  ]);
  const [templates, setTemplates] = useState<Workout[]>([]);
  const [exerciseNames, setExerciseNames] = useState<{ id: string; name: string; }[]>([]);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [exerciseMap, setExerciseMap] = useState<Record<string, string>>({});
  const [filteredNames, setFilteredNames] = useState<{ id: string; name: string; }[]>([]);

  // ...existing code...

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

  const handleExerciseNameInput = (index: number, typed: string) => {
    const updated = [...exercises];
    updated[index].name = typed;
    updated[index].id = '';
    
    const found = filteredNames.find(
      (ex) => ex.name.toLowerCase() === typed.toLowerCase()
    );
    updated[index].id = found ? found.id : '';
    setExercises(updated);

    const filtered = exerciseNames.filter((ex) =>
      ex.name.toLowerCase().includes(typed.toLowerCase())
    );
    setFilteredNames(filtered);
  };

  const saveWorkoutTemplate = async () => {
    try {
      const workoutTemplateRef = await addDoc(collection(db, 'workout-templates'), { 
        title, 
        coachNotes 
      } as WorkoutTemplate);

      for (const exercise of exercises) {
        const exerciseRef = await addDoc(collection(workoutTemplateRef, 'exercises'), {
          name: exercise.name,
          id: exercise.id,
          orderBy: exercise.orderBy,
          sets: exercise.sets
        });
      }
      setSuccessMessage('Workout template saved successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error saving workout template to Firebase:', error);
    }
  };

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

  useEffect(() => {
    setFilteredNames(exerciseNames);
  }, [exerciseNames]);

  const fetchExerciseNames = async () => {
    const exerciseCollection = collection(db, 'exercises');
    const exerciseSnapshot = await getDocs(exerciseCollection);
    const names = exerciseSnapshot.docs.map(doc => ({ id: doc.id, name: doc.data().name }));
    setExerciseNames(names);
    const map: Record<string, string> = {};
    names.forEach(exercise => {
      map[exercise.name] = exercise.id;
    });
    setExerciseMap(map);
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

  const updateExercise = async (index: number, field: keyof ExerciseInstance, value: string) => {
    const updatedExercises = [...exercises];
    updatedExercises[index][field] = value;
    if (field === 'id') {
      const exerciseDoc = await getDoc(doc(db, 'exercises', value));
      if (exerciseDoc.exists()) {
        updatedExercises[index].name = exerciseDoc.data().name;
        updatedExercises[index].exerciseId = value;
      }
    }
    setExercises(updatedExercises);
  };

  const handleExerciseSelect = async (index: number, selectedId: string) => {
    await updateExercise(index, 'id', selectedId);
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

  // ...existing code...

  return (
    <div style={{ overflowY: 'scroll', overflowX: 'hidden', maxHeight: 'calc(100vh - 200px)', width: '100%' }}>
      <h1>Workout Template Builder</h1>
      {successMessage && <p>{successMessage}</p>}
      <div>
        <label>Title:</label>
        <input type="text" value={title} onChange={(e: ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)} />
      </div>
      <div>
        <label>Coach Notes:</label>
        <textarea value={coachNotes} onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setCoachNotes(e.target.value)} style={{ width: '95%' }} />
      </div>
      {exercises.map((exercise, i) => (
        <div key={i} style={{ marginBottom: '20px' }}>
          <table style={{ borderCollapse: 'collapse', width: '100%', marginTop: '10px' }}>
            <tbody>
              <tr>
                <td colSpan={3} style={{ border: '1px solid black', padding: '8px', backgroundColor: '#f5f5f5' }}>
                  <label>Exercise Name: </label>
                  <input
                    type="text"
                    list={`exercise-names-${i}`}
                    value={exercise.name}
                    onChange={(e) => handleExerciseNameInput(i, e.target.value)}
                    style={{ width: '60%', marginLeft: '10px' }}
                  />
                  <datalist id={`exercise-names-${i}`}>
                    {filteredNames.map((item, idx) => (
                      <option key={idx} value={item.name} />
                    ))}
                  </datalist>
                </td>
              </tr>
              <tr>
                <th style={{ border: '1px solid black', padding: '8px' }}>Set</th>
                <th style={{ border: '1px solid black', padding: '8px' }}>Reps</th>
                <th style={{ border: '1px solid black', padding: '8px' }}>Load</th>
              </tr>
              {exercise.sets.map((set, j) => (
                <tr key={j}>
                  <td style={{ border: '1px solid black', padding: '8px', textAlign: 'center' }}>
                    {set.setNumber}
                  </td>
                  <td style={{ border: '1px solid black', padding: '8px' }}>
                    <input
                      type="number"
                      value={set.reps || ''}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => updateSet(i, j, 'reps', Number(e.target.value))}
                      style={{ width: '50px' }}
                    />
                  </td>
                  <td style={{ border: '1px solid black', padding: '8px' }}>
                    <input
                      type="number"
                      value={set.load || ''}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => updateSet(i, j, 'load', Number(e.target.value))}
                      style={{ width: '50px' }}
                    />
                  </td>
                </tr>
              ))}
              <tr>
                <td colSpan={3} style={{ border: '1px solid black', padding: '8px', textAlign: 'center' }}>
                  <button onClick={() => addSet(i)}>Add Set</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      ))}
      <div style={{ marginTop: '20px' }}>
        <button onClick={addExercise} style={{ marginRight: '10px' }}>Add Exercise</button>
        <button onClick={saveWorkoutTemplate} style={{ marginRight: '10px' }}>Save Workout Template</button>
        <Link to="/exercise-management" style={{ display: 'inline-block' }}>
          <button>Manage Exercises</button>
        </Link>
      </div>
      <ExerciseList />
    </div>
  );
};

export default WorkoutTemplateBuilder;

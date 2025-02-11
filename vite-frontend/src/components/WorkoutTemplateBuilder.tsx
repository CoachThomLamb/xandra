import React, { useState, useEffect, ChangeEvent } from 'react';
import { collection, addDoc, getDocs, doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import ExerciseList from './ExerciseList';
import TemplateExerciseRow from './TemplateExerciseRow';
import { Link } from 'react-router-dom';
import './WorkoutTemplateBuilder.css';
import { Workout } from '../types/workout';
import { useExercises } from '../hooks/useExercises';

const WorkoutTemplateBuilder: React.FC = () => {
  const [title, setTitle] = useState<string>('');
  const [coachNotes, setCoachNotes] = useState<string>('');
  const [templates, setTemplates] = useState<Workout[]>([]);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [currentTemplateId, setCurrentTemplateId] = useState<string | null>(null);

  const {
    exercises,
    setExercises,
    updateSet,
    onExerciseChange,
    addExercise,
    addSet
  } = useExercises();

  const saveWorkoutTemplate = async () => {
    try {
      let workoutTemplateRef;
      
      if (currentTemplateId) {
        workoutTemplateRef = doc(db, 'workout-templates', currentTemplateId);
        
        // Delete all existing exercises and their sets
        const exercisesCollection = collection(workoutTemplateRef, 'exercises');
        const exercisesSnapshot = await getDocs(exercisesCollection);
        
        for (const exerciseDoc of exercisesSnapshot.docs) {
          // Delete all sets for this exercise
          const setsCollection = collection(exerciseDoc.ref, 'sets');
          const setsSnapshot = await getDocs(setsCollection);
          for (const setDoc of setsSnapshot.docs) {
            await deleteDoc(setDoc.ref);
          }
          // Delete the exercise
          await deleteDoc(exerciseDoc.ref);
        }

        // Update the template
        await updateDoc(workoutTemplateRef, { 
          title, 
          coachNotes 
        });
      } else {
        workoutTemplateRef = await addDoc(collection(db, 'workout-templates'), { 
          title, 
          coachNotes 
        });
      }

      // Save exercises and their sets as subcollections
      for (const exercise of exercises) {
        if (!exercise.name) continue; // Skip empty exercises
        
        const exerciseRef = await addDoc(collection(workoutTemplateRef, 'exercises'), {
          name: exercise.name,
          id: exercise.id,
          orderBy: exercise.orderBy,
          coachNotes: exercise.coachNotes || ''
        });

        // Save sets as a subcollection of the exercise
        for (const set of exercise.sets) {
          await addDoc(collection(exerciseRef, 'sets'), {
            setNumber: set.setNumber,
            reps: set.reps,
            load: set.load
          });
        }
      }

      setSuccessMessage(currentTemplateId ? 'Template updated successfully!' : 'Template created successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error saving workout template:', error);
    }
  };

  const loadTemplate = async (templateId: string) => {
    try {
      const templateRef = doc(db, 'workout-templates', templateId);
      const templateDoc = await getDoc(templateRef);
      
      if (templateDoc.exists()) {
        const templateData = templateDoc.data() as Workout;
        setTitle(templateData.title || '');
        setCoachNotes(templateData.coachNotes || '');
        setCurrentTemplateId(templateId);

        // Load exercises and sets exactly like in UserWorkoutDetail
        const exercisesCollection = collection(templateRef, 'exercises');
        const exercisesSnapshot = await getDocs(exercisesCollection);
        let exercisesData = await Promise.all(
          exercisesSnapshot.docs.map(async (exerciseDoc) => {
            const setsCollection = collection(exerciseDoc.ref, 'sets');
            const setsSnapshot = await getDocs(setsCollection);
            const setsData = setsSnapshot.docs.map((setDoc) => ({ 
              id: setDoc.id, 
              ...setDoc.data() as Set 
            }));
            setsData.sort((a, b) => a.setNumber - b.setNumber);

            const exerciseData = exerciseDoc.data();
            return { 
              id: exerciseDoc.id, 
              name: exerciseData.name,
              exerciseId: exerciseData.exerciseId,
              orderBy: exerciseData.orderBy,
              coachNotes: exerciseData.coachNotes || '',
              sets: setsData
            };
          })
        );

        exercisesData.sort((a, b) => a.orderBy - b.orderBy);
        setExercises(exercisesData);
      }
    } catch (error) {
      console.error('Error loading template:', error);
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
  }, []);

  return (
    <div style={{ overflowY: 'scroll', overflowX: 'hidden', maxHeight: 'calc(100vh - 200px)', width: '100%' }}>
      <h1>Workout Template Builder</h1>
      {successMessage && <p>{successMessage}</p>}
      
      <div style={{ marginBottom: '20px' }}>
        <label>Load Existing Template: </label>
        <select 
          value={currentTemplateId || ''} 
          onChange={(e) => e.target.value && loadTemplate(e.target.value)}
          style={{ marginLeft: '10px' }}
        >
          <option value="">Select a template</option>
          {templates.map((template) => (
            <option key={template.id} value={template.id}>
              {template.title}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label>Title:</label>
        <input type="text" value={title} onChange={(e: ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)} />
      </div>
      <div>
        <label>Coach Notes:</label>
        <textarea value={coachNotes} onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setCoachNotes(e.target.value)} style={{ width: '95%' }} />
      </div>
      {exercises.map((exercise, i) => (
        <TemplateExerciseRow
          key={i}
          exercise={exercise}
          index={i}
          onExerciseChange={onExerciseChange}
          updateSet={updateSet}
          addSet={addSet}
          setExercises={setExercises}
        />
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

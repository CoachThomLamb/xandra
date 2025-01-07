import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { auth, db } from '../firebaseConfig';
import { doc, setDoc, collection, addDoc } from 'firebase/firestore';

function WorkoutDetail() {
  const { index } = useParams();
  const [workouts, setWorkouts] = useState(JSON.parse(localStorage.getItem('workouts')) || []);
  const workout = workouts[index] || {
    title: '',
    exercises: [],
    date: new Date().toISOString(), // Include timestamp
  };

  const [title, setTitle] = useState(workout.title);
  const [exercises, setExercises] = useState(Array.isArray(workout.exercises) ? workout.exercises : []);
  const [date, setDate] = useState(workout.date);

  useEffect(() => {
    if (!workouts[index]) {
      const newWorkout = { title, exercises, date };
      const updatedWorkouts = [...workouts, newWorkout];
      setWorkouts(updatedWorkouts);
      localStorage.setItem('workouts', JSON.stringify(updatedWorkouts));
    }
  }, []);

  const saveWorkoutToFirebase = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const workoutRef = collection(db, 'users', user.uid, 'workouts');
        await addDoc(workoutRef, { title, exercises, date });
        console.log('Workout saved to Firebase');
      } else {
        console.log('No user is signed in');
      }
    } catch (error) {
      console.error('Error saving workout to Firebase:', error);
    }
  };

  const updateWorkout = () => {
    const updatedWorkout = { ...workout, title, exercises, date };
    const updatedWorkouts = [...workouts];
    updatedWorkouts[index] = updatedWorkout;
    setWorkouts(updatedWorkouts);
    localStorage.setItem('workouts', JSON.stringify(updatedWorkouts));
    saveWorkoutToFirebase();
  };

  const addExerciseSet = () => {
    setExercises([...exercises, { name: '', weight: '', reps: '', rest: '', notes: '', completed: false }]);
  };

  const updateExerciseSet = (i, field, value) => {
    const updatedExercises = exercises.map((exercise, index) =>
      index === i ? { ...exercise, [field]: value } : exercise
    );
    setExercises(updatedExercises);
  };

  return (
    <div>
      <h1>Edit Workout</h1>
      <div>
        <label>Title:</label>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>
      <div>
        <label>Date:</label>
        <input type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} />
      </div>
      <div className="exercise-container" style={{ overflowX: 'auto' }}>
        <label>Exercises:</label>
        {exercises.map((exercise, i) => (
          <div key={i} className="exercise-row" style={{ display: 'flex', flexWrap: 'wrap' }}>
            <div className="exercise-row-group">
              <input
                type="text"
                placeholder="Exercise Name"
                value={exercise.name}
                onChange={(e) => updateExerciseSet(i, 'name', e.target.value)}
                className="exercise-input"
              />
              <input
                type="text"
                placeholder="Weight"
                value={exercise.weight}
                onChange={(e) => updateExerciseSet(i, 'weight', e.target.value)}
                className="exercise-input-weightx=x-"
                maxLength={5}
              />
              <input
                type="text"
                placeholder="Reps"
                value={exercise.reps}
                onChange={(e) => updateExerciseSet(i, 'reps', e.target.value)}
                className="exercise-input-reps"
                maxLength={5}
              />
            </div>
            <input
              type="text"
              placeholder="Notes"
              value={exercise.notes}
              onChange={(e) => updateExerciseSet(i, 'notes', e.target.value)}
              className="exercise-notes"
            />
            <label className="exercise-checkbox-label">
              Completed:
              <input
                type="checkbox"
                checked={exercise.completed}
                onChange={(e) => updateExerciseSet(i, 'completed', e.target.checked)}
                className="exercise-checkbox"
              />
            </label>
          </div>
        ))}
        <button onClick={addExerciseSet}>Add Exercise Set</button>
      </div>
      <button onClick={updateWorkout}>Save</button>
      <Link to="/">Back to Workouts</Link>
      <button onClick={() => window.history.back()}>Return to Workouts</button>
    </div>
  );
}

export default WorkoutDetail;

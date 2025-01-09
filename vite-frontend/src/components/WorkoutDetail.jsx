import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { auth, db } from '../firebaseConfig';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';

function WorkoutDetail() {
  const { index } = useParams();
  const [workouts, setWorkouts] = useState([]);
  const [title, setTitle] = useState('');
  const [exercises, setExercises] = useState([]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    const fetchWorkouts = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const q = query(collection(db, 'users', user.uid, 'workouts'));
          const querySnapshot = await getDocs(q);
          const workoutsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setWorkouts(workoutsData);

          if (index && workoutsData[index]) {
            const workout = workoutsData[index];
            setTitle(workout.title);
            setExercises(workout.exercises);
            setDate(workout.date);
          }
        } else {
          console.log('No user is signed in');
        }
      } catch (error) {
        console.error('Error fetching workouts:', error);
      }
    };

    fetchWorkouts();
  }, [index]);

  const saveWorkoutToFirebase = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        // Clean the exercises data before saving
        const cleanExercises = exercises.map(exercise => ({
          name: exercise.name || '',
          weight: exercise.weight || '',
          reps: exercise.reps || '',
          rest: exercise.rest || '',
          notes: exercise.notes || '',
          completed: Boolean(exercise.completed)
        }));

        const workoutData = {
          title: title || 'Untitled Workout',
          exercises: cleanExercises,
          date: date || new Date().toISOString().split('T')[0]
        };

        const workoutRef = collection(db, 'users', user.uid, 'workouts');
        await addDoc(workoutRef, workoutData);
        console.log('Workout saved to Firebase');
      } else {
        console.log('No user is signed in');
      }
    } catch (error) {
      console.error('Error saving workout to Firebase:', error);
    }
  };

  const updateWorkout = async () => {
    const updatedWorkout = { title, exercises, date };
    const updatedWorkouts = [...workouts];
    if (index) {
      updatedWorkouts[index] = updatedWorkout;
    } else {
      updatedWorkouts.push(updatedWorkout);
    }
    setWorkouts(updatedWorkouts);
    localStorage.setItem('workouts', JSON.stringify(updatedWorkouts));

    // Save the workout to Firebase
    await saveWorkoutToFirebase();
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
                className="exercise-input-weight"
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

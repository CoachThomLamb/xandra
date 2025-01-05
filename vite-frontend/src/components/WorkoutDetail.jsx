import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

function WorkoutDetail() {
  const { index } = useParams();
  const [workouts, setWorkouts] = useState(JSON.parse(localStorage.getItem('workouts')) || []);
  const workout = workouts[index] || {
    title: '',
    exercises: [],
    date: new Date().toISOString().split('T')[0],
    clientId: ''
  };

  const [title, setTitle] = useState(workout.title);
  const [exercises, setExercises] = useState(Array.isArray(workout.exercises) ? workout.exercises : []);
  const [date, setDate] = useState(workout.date);
  const [clientId, setClientId] = useState(workout.clientId);

  useEffect(() => {
    if (!workouts[index]) {
      const newWorkout = { title, exercises, date, clientId };
      const updatedWorkouts = [...workouts, newWorkout];
      setWorkouts(updatedWorkouts);
      localStorage.setItem('workouts', JSON.stringify(updatedWorkouts));
    }
  }, []);

  const updateWorkout = () => {
    const updatedWorkout = { ...workout, title, exercises, date, clientId };
    const updatedWorkouts = [...workouts];
    updatedWorkouts[index] = updatedWorkout;
    setWorkouts(updatedWorkouts);
    localStorage.setItem('workouts', JSON.stringify(updatedWorkouts));
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
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </div>
      <div>
        <label>Client ID:</label>
        <input type="text" value={clientId} onChange={(e) => setClientId(e.target.value)} />
      </div>
      <div className="exercise-container" style={{ overflowX: 'auto' }}>
        <label>Exercises:</label>
        {exercises.map((exercise, i) => (
          <div key={i} className="exercise-row" style={{ display: 'flex', flexWrap: 'wrap' }}>
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
              className="exercise-input"
            />
            <input
              type="text"
              placeholder="Reps"
              value={exercise.reps}
              onChange={(e) => updateExerciseSet(i, 'reps', e.target.value)}
              className="exercise-input"
            />
            <input
              type="text"
              placeholder="Rest Interval"
              value={exercise.rest}
              onChange={(e) => updateExerciseSet(i, 'rest', e.target.value)}
              className="exercise-input"
            />
            <input
              type="text"
              placeholder="Notes"
              value={exercise.notes}
              onChange={(e) => updateExerciseSet(i, 'notes', e.target.value)}
              className="exercise-input"
            />
            <label>
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

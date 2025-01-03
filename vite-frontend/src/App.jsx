import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, useNavigate } from 'react-router-dom';
import './App.css';
import WorkoutDetail from './components/WorkoutDetail';

function Workouts() {
  const [workouts, setWorkouts] = useState([]);
  const [title, setTitle] = useState('');
  const [exercises, setExercises] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const storedWorkouts = JSON.parse(localStorage.getItem('workouts')) || [];
    const parsedWorkouts = storedWorkouts.map(workout => ({
      ...workout,
      exercises: Array.isArray(workout.exercises) ? workout.exercises : []
    }));
    setWorkouts(parsedWorkouts);
  }, []);

  const addWorkout = () => {
    const newWorkout = {
      title: 'New Workout',
      exercises: [],
      date: new Date().toISOString().split('T')[0],
      clientId: null
    };
    const updatedWorkouts = [...workouts, newWorkout];
    setWorkouts(updatedWorkouts);
    localStorage.setItem('workouts', JSON.stringify(updatedWorkouts));
    navigate(`/workout/${updatedWorkouts.length - 1}`);
  };

  return (
    <div>
      <h1>Workout Tracker</h1>
      
      <div className="workout-list">
        {workouts.map((workout, index) => (
          <div key={index} className="workout-item">
            <h2>{workout.title} <small>({workout.date})</small></h2>
            <p>{workout.exercises.map(ex => ex.name).join(', ')}</p>
            <Link to={`/workout/${index}`}>View Details</Link>
          </div>
        ))}
      </div>

      <button onClick={addWorkout}>Create New Workout</button>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Workouts />} />
        <Route path="/workout/:index" element={<WorkoutDetail />} />
      </Routes>
    </Router>
  );
}

export default App;

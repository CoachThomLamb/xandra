import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, useNavigate, useParams } from 'react-router-dom';
import './App.css';

function Workouts() {
  const [workouts, setWorkouts] = useState([]);
  const [title, setTitle] = useState('');
  const [exercises, setExercises] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const storedWorkouts = JSON.parse(localStorage.getItem('workouts')) || [];
    setWorkouts(storedWorkouts);
  }, []);

  const addWorkout = () => {
    const newWorkout = {
      title: 'New Workout',
      exercises: '',
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
            <p>{workout.exercises}</p>
            <Link to={`/workout/${index}`}>View Details</Link>
          </div>
        ))}
      </div>

      <button onClick={addWorkout}>Create New Workout</button>
    </div>
  );
}

function WorkoutDetail() {
  const { index } = useParams();
  const [workouts, setWorkouts] = useState(JSON.parse(localStorage.getItem('workouts')) || []);
  const workout = workouts[index];
  const [title, setTitle] = useState(workout.title);
  const [exercises, setExercises] = useState(workout.exercises);
  const [date, setDate] = useState(workout.date);
  const [clientId, setClientId] = useState(workout.clientId);

  const updateWorkout = () => {
    const updatedWorkout = { ...workout, title, exercises, date, clientId };
    const updatedWorkouts = [...workouts];
    updatedWorkouts[index] = updatedWorkout;
    setWorkouts(updatedWorkouts);
    localStorage.setItem('workouts', JSON.stringify(updatedWorkouts));
  };

  if (!workout) {
    return <div>Workout not found</div>;
  }

  return (
    <div>
      <h1>Edit Workout</h1>
      <div>
        <label>Title:</label>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>
      <div>
        <label>Exercises:</label>
        <input type="text" value={exercises} onChange={(e) => setExercises(e.target.value)} />
      </div>
      <div>
        <label>Date:</label>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </div>
      <div>
        <label>Client ID:</label>
        <input type="text" value={clientId} onChange={(e) => setClientId(e.target.value)} />
      </div>
      <button onClick={updateWorkout}>Save</button>
      <Link to="/">Back to Workouts</Link>
      <button onClick={() => window.history.back()}>Return to Workouts</button>
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

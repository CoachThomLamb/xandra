import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, useNavigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";
import './App.css';
import WorkoutDetail from './components/WorkoutDetail';
import { auth } from './firebaseConfig';

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
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error signing in: ", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  return (
    <Router>
      <div>
        {user ? (
          <div>
            <button onClick={handleLogout}>Logout</button>
            <Routes>
              <Route path="/" element={<Workouts />} />
              <Route path="/workout/:index" element={<WorkoutDetail />} />
            </Routes>
          </div>
        ) : (
          <div>
            <button onClick={handleLogin}>Login with Google</button>
          </div>
        )}
      </div>
    </Router>
  );
}

export default App;

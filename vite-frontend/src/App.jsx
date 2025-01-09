import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, useNavigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";
import { collection, getDocs } from 'firebase/firestore';
import './App.css';
import WorkoutDetail from './components/WorkoutDetail';
import AdminDashboard from './components/AdminDashboard';
import UserWorkouts from './components/UserWorkouts';
import UserWorkoutDetail from './components/UserWorkoutDetail';
import { auth, db, getUserRole } from './firebaseConfig';
import WorkoutTemplateBuilder from './components/WorkoutTemplateBuilder';

function Workouts() {
  const [workouts, setWorkouts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchWorkouts = async () => {
      const user = auth.currentUser;
      if (user) {
        const workoutsCollection = collection(db, 'users', user.uid, 'workouts');
        const workoutSnapshot = await getDocs(workoutsCollection);
        const workoutList = workoutSnapshot.docs.map(doc => doc.data());
        setWorkouts(workoutList);
      } else {
        const storedWorkouts = JSON.parse(localStorage.getItem('workouts')) || [];
        const parsedWorkouts = storedWorkouts.map(workout => ({
          ...workout,
          exercises: Array.isArray(workout.exercises) ? workout.exercises : []
        }));
        setWorkouts(parsedWorkouts);
      }
    };

    fetchWorkouts();
  }, []);

  const addWorkout = () => {
    const newWorkout = {
      title: 'New Workout',
      exercises: [],
      date: new Date().toISOString().split('T')[0],
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
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        const role = await getUserRole(user.uid);
        setIsAdmin(role === 'admin');
      } else {
        setUser(null);
        setIsAdmin(false);
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
            {isAdmin && <Link to="/admin">Admin Dashboard</Link>}
            <Routes>
              <Route path="/" element={<Workouts />} />
              <Route path="/workout/:index" element={<WorkoutDetail />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/user-workouts/:userId" element={<UserWorkouts />} />
              <Route path="/user-workouts/:userId/workouts/:workoutId" element={<UserWorkoutDetail />} />
              <Route path="/workout-template-builder" element={<WorkoutTemplateBuilder />} />
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

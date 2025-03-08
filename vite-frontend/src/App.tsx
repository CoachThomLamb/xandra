import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signInWithRedirect, signOut, User } from "firebase/auth";
import { collection, getDocs } from 'firebase/firestore';
import './App.css';
import WorkoutDetail from './components/WorkoutDetail';
import AdminDashboard from './components/AdminDashboard';
import UserWorkouts from './components/UserWorkouts';
import UserWorkoutDetail from './components/UserWorkoutDetail';
import { auth, db, getUserRole } from './firebaseConfig';
import WorkoutTemplateBuilder from './components/WorkoutTemplateBuilder';
import ExerciseList from './components/ExerciseList';
import LandingPage from './components/LandingPage';
import UserFood from './components/UserFood';
import ExerciseManagement from './components/ExerciseManagement';



function App() {
  const [user, setUser] = useState<User | null>(null);
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

  const handleLoginWithPopup = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error signing in with popup:", error);
    }
  };


  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
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
              <Route path="/" element={<UserWorkouts />} />
              <Route path="/workout/:index" element={<WorkoutDetail />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/user-workouts/:userId" element={<UserWorkouts />} />
              <Route path="/user-workouts/:userId/workouts/:workoutId" element={<UserWorkoutDetail />} />
              <Route path="/workout-template-builder" element={<WorkoutTemplateBuilder />} />
              <Route path="/admin/user/:userId" element={<UserWorkouts />} />
              <Route path="/exercise-list" element={<ExerciseList />} />
              <Route path="/user-food/:userId" element={<UserFood />} />
              <Route path="/exercise-management" element={<ExerciseManagement />} />
            </Routes>
          </div>
        ) : (
          <div>
            <button onClick={handleLoginWithPopup}>Login with Popup</button>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/landing" element={<LandingPage />} />
            </Routes>
          </div>
        )}
      </div>
    </Router>
  );
}

export default App;

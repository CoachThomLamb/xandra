import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link} from 'react-router-dom';
import { getAuth, onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signInWithRedirect, signOut, User } from "firebase/auth";
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
import PostsCollection from './components/PostsCollection';
import PostDetail from './components/PostDetail';
import UserPosts from './components/UserPosts';
import WiloVision from './components/articles/WiloVision';



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
  const handleLoginWithRedirect = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithRedirect(auth, provider);
    } catch (error) {
      console.error("Error signing in with redirect:", error);
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
            <div style={{ marginBottom: '20px', paddingLeft: '20px' }}>
              <button onClick={handleLogout}>Logout</button>
              <Link to="/view-posts" style={{ marginLeft: '10px' }}>View Posts</Link>
              {isAdmin && <Link to="/admin" style={{ marginLeft: '10px' }}>Admin Dashboard</Link>}
            </div>
            <Routes>
              <Route path="/" element={<UserWorkouts />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/view-posts" element={<UserPosts />} />  
              <Route path="/view-posts/:userId" element={<PostsCollection />} />
              <Route path="/user-workouts/:userId" element={<UserWorkouts />} />
              <Route path="/user-workouts/:userId/workouts/:workoutId" element={<UserWorkoutDetail />} />
              <Route path="/user-posts/:userId/posts/:postId" element={<PostDetail />} />
              <Route path="/workout-template-builder" element={<WorkoutTemplateBuilder />} />
              <Route path="/exercise-list" element={<ExerciseList />} />
              <Route path="/user-food/:userId" element={<UserFood />} />
              <Route path="/exercise-management" element={<ExerciseManagement />} />
            </Routes>
          </div>
        ) : (
          <div>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/landing" element={<LandingPage />} />
              <Route path="/wilovision" element={<WiloVision />} />
            </Routes>
            <button onClick={handleLoginWithPopup}>SignUp</button>
            <button onClick={handleLoginWithRedirect}>Login</button>
            <button onClick={() => window.open('about:blank', '_blank', 'width=400,height=400')}>
              Test Popup
            </button>

          </div>
        )}
      </div>
    </Router>
  );
}

export default App;

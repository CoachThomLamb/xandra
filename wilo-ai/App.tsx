import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { getAuth, onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut, User } from "firebase/auth";
import { collection, getDocs } from 'firebase/firestore';
import { Workout, ExerciseDefinition, ExerciseInstance, Set } from './types/types'
// import WorkoutDetail from './components/WorkoutDetail';
// import AdminDashboard from './components/AdminDashboard';
// import UserWorkouts from './components/UserWorkouts';
// import UserWorkoutDetail from './components/UserWorkoutDetail';
// import { auth, db, getUserRole } from './firebaseConfig';
// import WorkoutTemplateBuilder from './components/WorkoutTemplateBuilder';
// import ExerciseList from './components/ExerciseList';
// import LandingPage from './components/LandingPage';
// import UserFood from './components/UserFood';
// import ExerciseManagement from './components/ExerciseManagement';

const Stack = createStackNavigator();

function LandingPage() {
  return (
    <div>
      <h1>Welcome to the Workout Tracker</h1>
      {/* <button onClick={handleLoginWithPopup}>Login with Google</button> */}
    </div>
  );
}

function Workouts() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);

  useEffect(() => {
    const fetchWorkouts = async () => {
      const user = auth.currentUser;
      if (user) {
        const workoutsCollection = collection(db, 'users', user.uid, 'workouts');
        const workoutSnapshot = await getDocs(workoutsCollection);
        const workoutList = workoutSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            title: data.title || 'Untitled Workout',
            exercises: Array.isArray(data.exercises) ? data.exercises : [],
            date: data.date || new Date().toISOString().split('T')[0],
          };
        });
        setWorkouts(workoutList);
      } else {
        const storedWorkouts = JSON.parse(localStorage.getItem('workouts') || '[]');
        const parsedWorkouts = storedWorkouts.map((workout: Workout) => ({
          title: workout.title || 'Untitled Workout',
          exercises: Array.isArray(workout.exercises) ? workout.exercises : [],
          date: workout.date || new Date().toISOString().split('T')[0],
        }));
        setWorkouts(parsedWorkouts);
      }
    };

    fetchWorkouts();
  }, []);

  const addWorkout = () => {
    const newWorkout: Workout = {
      title: 'New Workout',
      exercises: [],
      date: new Date().toISOString().split('T')[0],
    };
    const updatedWorkouts = [...workouts, newWorkout];
    setWorkouts(updatedWorkouts);
    localStorage.setItem('workouts', JSON.stringify(updatedWorkouts));
  };

  return (
    <div style={{ overflowY: 'auto', maxHeight: '100vh' }}>
      <h1>Workout Tracker</h1>
      
      <div className="workout-list">
        {workouts.map((workout, index) => (
          <div key={index} className="workout-item">
            <h2>{workout.title} <small>({workout.date})</small></h2>
            <Link to={`/workout/${index}`}>View Details</Link>
          </div>
        ))}
      </div>

      <button onClick={addWorkout}>Create New Workout</button>
    </div>
  );
}

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
    <NavigationContainer>
      <Stack.Navigator>
        {user ? (
          <>
            <Stack.Screen name="UserWorkouts" component={UserWorkouts} />
            <Stack.Screen name="UserWorkoutDetail" component={UserWorkoutDetail} />
            <Stack.Screen name="ExerciseList" component={ExerciseList} />
            <Stack.Screen name="ExerciseManagement" component={ExerciseManagement} />
          </>
        ) : (
          <>
            <Stack.Screen name="LandingPage" component={LandingPage} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;

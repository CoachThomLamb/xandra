import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { collection, getDocs, addDoc, doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';

const UserWorkouts = () => {
  const { userId: paramUserId } = useParams();
  const navigate = useNavigate();
  const [userId, setUserId] = useState(paramUserId || auth.currentUser?.uid);
  const [workouts, setWorkouts] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!paramUserId && auth.currentUser) {
      setUserId(auth.currentUser.uid);
    }
  }, [paramUserId]);

  useEffect(() => {
    const fetchWorkouts = async () => {
      try {
        const workoutsCollection = collection(db, 'users', userId, 'workouts');
        const workoutSnapshot = await getDocs(workoutsCollection);
        const workoutList = workoutSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setWorkouts(workoutList);
      } catch (error) {
        console.error('Error fetching workouts:', error);
        setError('Error fetching workouts. Please try again later.');
      }
    };

    if (userId) {
      fetchWorkouts();
    }
  }, [userId]);

  const currentWorkouts = workouts.filter(workout => !workout.completed);
  const pastWorkouts = workouts.filter(workout => workout.completed);

  return (
    <div>
      <h1>User Workouts</h1>
      {error && <p>{error}</p>}

      <h2>Current Workouts</h2>
      <ul>
        {currentWorkouts.map(workout => (
          <li key={workout.id}>
            <Link to={`/user-workouts/${userId}/workouts/${workout.id}`}>
              {workout.title} - {workout.date}
            </Link>
          </li>
        ))}
      </ul>

      <h2>Past Workouts</h2>
      <ul>
        {pastWorkouts.map(workout => (
          <li key={workout.id}>
            <Link to={`/user-workouts/${userId}/workouts/${workout.id}`}>
              {workout.title} - {workout.date}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserWorkouts;

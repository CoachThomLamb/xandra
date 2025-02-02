import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';
import { Workout } from '../types/workout'; // Import Workout interface

const UserWorkouts: React.FC = () => {
  const { userId: paramUserId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | undefined>(paramUserId || auth.currentUser?.uid);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [clientName, setClientName] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!paramUserId && auth.currentUser) {
      setUserId(auth.currentUser.uid);
    }
  }, [paramUserId]);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', userId!));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setClientName(`${userData.firstName} ${userData.lastName}`);
        }
      } catch (error) {
        console.error('Error fetching user details:', error);
      }
    };

    const fetchWorkouts = async () => {
      try {
        const workoutsCollection = collection(db, 'users', userId!, 'workouts');
        const workoutSnapshot = await getDocs(workoutsCollection);
        const workoutList = workoutSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Workout[];
        setWorkouts(workoutList);
      } catch (error) {
        console.error('Error fetching workouts:', error);
        setError('Error fetching workouts. Please try again later.');
      }
    };

    if (userId) {
      fetchUserDetails();
      fetchWorkouts();
    }
  }, [userId]);

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const currentWorkouts = workouts.filter(workout => !workout.completed);
  const pastWorkouts = workouts.filter(workout => workout.completed);

  return (
    <div>
      <h1>{clientName}'s Workouts</h1>
      {error && <p>{error}</p>}

      <Link to={`/user-food/${userId}`}>Go to Food</Link>

      <h2>Current Workouts</h2>
      <ul>
        {currentWorkouts.map(workout => (
          <li key={workout.id}>
            <Link to={`/user-workouts/${userId}/workouts/${workout.id}`}>
              {workout.title} - {workout.dueDate ? formatDate(workout.dueDate) : 'No due date'}
            </Link>
          </li>
        ))}
      </ul>

      <h2>Past Workouts</h2>
      <ul>
        {pastWorkouts.map(workout => (
          <li key={workout.id}>
            <Link to={`/user-workouts/${userId}/workouts/${workout.id}`}>
              {workout.title} - {workout.completedAt ? formatDate(workout.completedAt) : 'No completion date'}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserWorkouts;

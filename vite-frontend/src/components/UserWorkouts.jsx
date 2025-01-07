import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';

const UserWorkouts = () => {
  const { userId } = useParams();
  const [workouts, setWorkouts] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWorkouts = async () => {
      try {
        const q = query(collection(db, 'users', userId, 'workouts'));
        const querySnapshot = await getDocs(q);
        const workoutsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setWorkouts(workoutsData);
      } catch (error) {
        console.error('Error fetching workouts:', error);
        setError('Error fetching workouts. Please try again later.');
      }
    };

    fetchWorkouts();
  }, [userId]);

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      <h1>Workouts for User: {userId}</h1>
      <div className="workout-list">
        {workouts.length > 0 ? (
          workouts.map((workout, index) => (
            <Link key={workout.id} to={`/workout/${index}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="workout-card" style={{ backgroundColor: 'grey', padding: '10px', margin: '10px auto', borderRadius: '8px', maxWidth: '600px' }}>
                <h2>{workout.title} <small>({workout.date})</small></h2>
                <p>{workout.exercises.map(ex => ex.name).join(', ')}</p>
              </div>
            </Link>
          ))
        ) : (
          <p>No workouts found for this user.</p>
        )}
      </div>
    </div>
  );
};

export default UserWorkouts;

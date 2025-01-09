import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { collection, query, getDocs } from 'firebase/firestore';
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
    <div style={{ height: '100vh', overflow: 'hidden' }}>
      <h1>Workouts for User: {userId}</h1>
      <div className="exercise-container">
        {workouts.length > 0 ? (
          workouts.map((workout) => (
            <Link
              key={workout.id}
              to={`/user-workouts/${userId}/workouts/${workout.id}`}
              style={{
                textDecoration: 'none',
                color: 'inherit',
                width: '100%',
                maxWidth: '600px',
                display: 'block'
              }}
            >
              <div
                className="exercise-row"
                style={{
                  backgroundColor: 'grey',
                  padding: '10px',
                  borderRadius: '8px',
                  width: '100%',
                  boxSizing: 'border-box'
                }}
              >
                <h2>
                  {workout.title} <small>({workout.date})</small>
                </h2>
                <p>{(workout.exercises || []).map((ex) => ex.name).join(', ')}</p>
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

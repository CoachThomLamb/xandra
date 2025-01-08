import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';

const UserWorkoutDetail = () => {
  const { userId, workoutId } = useParams();
  const [workout, setWorkout] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWorkout = async () => {
      try {
        const workoutDoc = await getDoc(doc(db, 'users', userId, 'workouts', workoutId));
        if (workoutDoc.exists()) {
          setWorkout({ id: workoutDoc.id, ...workoutDoc.data() });
        } else {
          setError('Workout not found');
        }
      } catch (error) {
        console.error('Error fetching workout:', error);
        setError('Error fetching workout. Please try again later.');
      }
    };

    fetchWorkout();
  }, [userId, workoutId]);

  if (error) {
    return <div>{error}</div>;
  }

  if (!workout) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>{workout.title}</h1>
      <p>Date: {workout.date}</p>
      <h2>Exercises</h2>
      <table style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid black', padding: '8px' }}>Name</th>
            <th style={{ border: '1px solid black', padding: '8px' }}>Weight</th>
            <th style={{ border: '1px solid black', padding: '8px' }}>Reps</th>
            <th style={{ border: '1px solid black', padding: '8px' }}>Rest</th>
            <th style={{ border: '1px solid black', padding: '8px' }}>Notes</th>
            <th style={{ border: '1px solid black', padding: '8px' }}>Completed</th>
          </tr>
        </thead>
        <tbody>
          {workout.exercises.map((exercise, index) => (
            <tr key={index}>
              <td style={{ border: '1px solid black', padding: '8px' }}>{exercise.name}</td>
              <td style={{ border: '1px solid black', padding: '8px' }}>{exercise.weight}</td>
              <td style={{ border: '1px solid black', padding: '8px' }}>{exercise.reps}</td>
              <td style={{ border: '1px solid black', padding: '8px' }}>{exercise.rest}</td>
              <td style={{ border: '1px solid black', padding: '8px' }}>{exercise.notes}</td>
              <td style={{ border: '1px solid black', padding: '8px' }}>{exercise.completed ? 'Yes' : 'No'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserWorkoutDetail;

import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';

const UserWorkoutDetail = () => {
  const { userId, workoutId } = useParams();
  const [workout, setWorkout] = useState(null);
  const [error, setError] = useState(null);
  const [completedSets, setCompletedSets] = useState({});

  const handleCompleteSet = (exerciseIndex, setIndex) => {
    setCompletedSets((prev) => ({
      ...prev,
      [`${exerciseIndex}-${setIndex}`]: !prev[`${exerciseIndex}-${setIndex}`],
    }));
  };

  useEffect(() => {
    const fetchWorkout = async () => {
      try {
        const workoutDocRef = doc(db, 'users', userId, 'workouts', workoutId);
        const workoutDoc = await getDoc(workoutDocRef);
        if (workoutDoc.exists()) {
          const workoutData = workoutDoc.data();

          const exercisesCollection = collection(workoutDocRef, 'exercises');
          const exercisesSnapshot = await getDocs(exercisesCollection);
          let exercisesData = await Promise.all(
            exercisesSnapshot.docs.map(async (exerciseDoc) => {
              const setsCollection = collection(exerciseDoc.ref, 'sets');
              const setsSnapshot = await getDocs(setsCollection);
              const setsData = setsSnapshot.docs.map((setDoc) => setDoc.data());
              setsData.sort((a, b) => a.setNumber - b.setNumber); // Order sets by set number
              return { ...exerciseDoc.data(), sets: setsData };
            })
          );

          exercisesData.sort((a, b) => a.orderBy - b.orderBy); // Order exercises by orderBy field

          setWorkout({ ...workoutData, exercises: exercisesData });
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
            <th style={{ border: '1px solid black', padding: '8px' }}>Exercise</th>
            <th style={{ border: '1px solid black', padding: '8px' }}>Set</th>
            <th style={{ border: '1px solid black', padding: '8px' }}>Reps</th>
            <th style={{ border: '1px solid black', padding: '8px' }}>Load</th>
            <th style={{ border: '1px solid black', padding: '8px' }}>Completed</th>
          </tr>
        </thead>
        <tbody>
          {(workout.exercises || []).map((exercise, exerciseIndex) =>
            exercise.sets.map((set, setIndex) => (
              <tr key={`${exerciseIndex}-${setIndex}`}>
                <td style={{ border: '1px solid black', padding: '8px' }}>{exercise.name}</td>
                <td style={{ border: '1px solid black', padding: '8px' }}>{set.setNumber}</td>
                <td style={{ border: '1px solid black', padding: '8px' }}>{set.reps}</td>
                <td style={{ border: '1px solid black', padding: '8px' }}>{set.load}</td>
                <td style={{ border: '1px solid black', padding: '8px' }}>
                  <button onClick={() => handleCompleteSet(exerciseIndex, setIndex)}>
                    {completedSets[`${exerciseIndex}-${setIndex}`] ? 'Undo' : 'Complete'}
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default UserWorkoutDetail;

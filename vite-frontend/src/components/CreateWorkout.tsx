import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { Workout, ExerciseInstance } from '../types/workout';

const CreateWorkout: React.FC = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [exercises, setExercises] = useState<ExerciseInstance[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    try {
      setLoading(true);
      const newWorkout: Workout = {
        title,
        exercises: [], // Clear exercises array as they will be stored in a separate collection
        assignedDate: new Date().toISOString(),
        status: 'new'
      };

      const workoutsCollection = collection(db, 'users', 'userId', 'workouts');
      const newWorkoutRef = await addDoc(workoutsCollection, newWorkout); // Use addDoc to get the DocumentReference

      const exercisesCollection = collection(newWorkoutRef, 'exercises');
      await Promise.all(
        exercises.map(exercise => addDoc(exercisesCollection, exercise))
      );

      navigate(`/user-workouts`);
    } catch (error) {
      console.error('Error creating workout:', error);
      setError(error instanceof Error ? error.message : 'Failed to create workout');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-workout-container">
      <h1>Create New Workout</h1>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Workout Title"
      />
      {/* Add UI for adding exercises */}
      <button onClick={handleSave} disabled={loading}>
        {loading ? 'Saving...' : 'Save Workout'}
      </button>
      {error && <div className="error">{error}</div>}
    </div>
  );
};

export default CreateWorkout;

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, setDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { Workout, ExerciseInstance, Set } from '../types/workout';

const FeedbackWorkout: React.FC = () => {
  const { userId, workoutId } = useParams<{ userId: string; workoutId: string }>();
  const navigate = useNavigate();
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [exercises, setExercises] = useState<ExerciseInstance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getExerciseVideoURL = async (exerciseId: string): Promise<string> => {
    try {
      const exerciseDoc = await getDoc(doc(db, 'exercises', exerciseId));
      if (exerciseDoc.exists()) {
        return exerciseDoc.data().videoURL || '';
      }
      return '';
    } catch (error) {
      console.error('Error fetching exercise video URL:', error);
      return '';
    }
  };

  useEffect(() => {
    const fetchWorkout = async () => {
      try {
        if (!userId || !workoutId) {
          throw new Error('Missing user ID or workout ID');
        }

        const workoutDocRef = doc(db, 'users', userId, 'workouts', workoutId);
        const workoutDoc = await getDoc(workoutDocRef);
        
        if (!workoutDoc.exists()) {
          throw new Error('Workout not found');
        }

        const workoutData = workoutDoc.data() as Workout;

        const exercisesCollection = collection(workoutDocRef, 'exercises');
        const exercisesSnapshot = await getDocs(exercisesCollection);
        let exercisesData = await Promise.all(
          exercisesSnapshot.docs.map(async (exerciseDoc) => {
            const setsCollection = collection(exerciseDoc.ref, 'sets');
            const setsSnapshot = await getDocs(setsCollection);
            const setsData = setsSnapshot.docs.map((setDoc) => ({ 
              id: setDoc.id, 
              ...setDoc.data() as Set 
            }));
            setsData.sort((a, b) => a.setNumber - b.setNumber);

            const exerciseData = exerciseDoc.data();
            const name = exerciseData.name || '';
            const orderBy = exerciseData.orderBy;
            const exerciseId = exerciseData.exerciseId;
            const videoURL = await getExerciseVideoURL(exerciseData.exerciseId);
            const clientVideoURL = exerciseData.clientVideoURL || '';
            const coachNotes = exerciseData.coachNotes || '';

            return { 
              id: exerciseDoc.id, 
              name, 
              videoURL, 
              exerciseId, 
              orderBy, 
              sets: setsData,
              clientVideoURL,
              coachNotes
            };
          })
        );

        exercisesData.sort((a, b) => a.orderBy - b.orderBy);
        
        setWorkout({ ...workoutData, exercises: exercisesData });
        setExercises(exercisesData);
      } catch (error) {
        console.error('Error fetching workout:', error);
        setError(error instanceof Error ? error.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };
    fetchWorkout();
  }, [userId, workoutId]);

  const handleCoachNotesChange = (exerciseId: string, notes: string) => {
    setExercises(prevExercises =>
      prevExercises.map(exercise =>
        exercise.id === exerciseId ? { ...exercise, coachNotes: notes } : exercise
      )
    );
  };

  const handleSave = async () => {
    try {
      if (!workout || !userId) {
        throw new Error('Missing workout data or user ID');
      }

      const newWorkout: Workout = {
        ...workout,
        exercises: exercises,
        assignedDate: new Date().toISOString(),
      };
      
      const workoutsCollection = collection(db, 'users', userId, 'workouts');
      await setDoc(doc(workoutsCollection), newWorkout);
      navigate(`/user-workouts/${userId}`);
    } catch (error) {
      console.error('Error saving feedback:', error);
      setError(error instanceof Error ? error.message : 'Failed to save feedback');
    }
  };

  if (error) {
    return (
      <div className="error-container" style={{ padding: '20px', color: 'red' }}>
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => navigate(`/user-workouts/${userId}`)}>
          Back to Workouts
        </button>
      </div>
    );
  }

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Provide Feedback - {workout?.title}</h1>
      {exercises.map((exercise) => (
        <div key={exercise.id} className="exercise-feedback">
          <h3>{exercise.name}</h3>
          <div className="sets-display">
            {exercise.sets.map((set, index) => (
              <div key={index}>
                Set {set.setNumber}: {set.reps} reps @ {set.load}
              </div>
            ))}
          </div>
          <textarea
            value={exercise.coachNotes || ''}
            onChange={(e) => handleCoachNotesChange(exercise.id!, e.target.value)}
            placeholder="Add feedback for this exercise..."
            rows={4}
          />
        </div>
      ))}
      <button onClick={handleSave}>Save Feedback & Create New Workout</button>
    </div>
  );
};

export default FeedbackWorkout;

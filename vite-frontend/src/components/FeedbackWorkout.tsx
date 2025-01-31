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
      <div className="error-container">
        <h2>Error</h2>
        <p>{error}</p>
        <button className="button" onClick={() => navigate(`/user-workouts/${userId}`)}>
          Back to Workouts
        </button>
      </div>
    );
  }

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="workout-detail-container" style={{ 
      height: 'calc(100vh - 264px)', // Assuming 64px header/nav
      overflowY: 'auto',
      padding: '20px', 
      paddingBottom: '100px' // Increased padding to account for fixed button
    }}>
      <h1 className="workout-title">Provide Feedback - {workout?.title}</h1>
      
      <div className="exercises-container">
        {exercises.map((exercise) => (
          <div key={exercise.id} className="exercise-card">
            <h2 className="exercise-name">{exercise.name}</h2>
            
            <div className="exercise-content">
              <div className="video-section">
                {exercise.clientVideoURL ? (
                  <div className="video-container">
                    <h3>Client Submitted Video</h3>
                    <div className="video-wrapper">
                      <iframe
                        src={exercise.clientVideoURL}
                        title="Client Video"
                        allowFullScreen
                      />
                    </div>
                  </div>
                ) : (
                  <div className="video-container">
                    <p>No video submitted by client</p>
                  </div>
                )}
              </div>

              <div className="exercise-details">
                <div className="sets-section">
                  <h3>Sets</h3>
                  <div className="sets-container">
                    {exercise.sets.map((set, index) => (
                      <div key={index} className="set-item">
                        Set {set.setNumber}: {set.reps} reps @ {set.load}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="feedback-section">
                  <h3>Coach Feedback</h3>
                  <textarea
                    className="feedback-textarea"
                    value={exercise.coachNotes || ''}
                    onChange={(e) => handleCoachNotesChange(exercise.id!, e.target.value)}
                    placeholder="Add feedback for this exercise..."
                    rows={4}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="button-container" style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        padding: '20px',
        background: 'white',
        boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.1)',
        display: 'flex',
        justifyContent: 'center',
        zIndex: 1000
      }}>
        <button className="button primary" onClick={handleSave}>
          Save Feedback & Create New Workout
        </button>
      </div>
    </div>
  );
};

export default FeedbackWorkout;

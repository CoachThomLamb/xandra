import React, { useEffect, useState, ChangeEvent } from 'react';
import { useParams, Link } from 'react-router-dom';
import { collection, getDocs, doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

interface Set {
  id?: string;
  setNumber: number;
  reps: number;
  load: number;
  completed: boolean;
}

interface Exercise {
  id?: string;
  name: string;
  orderBy: number;
  exerciseId: string;
  videoURL: string;
  sets: Set[];
}

interface Workout {
  date: string;
  coachNotes: string;
  exercises: Exercise[];
  notes: Record<number, string>;
  videoURL: string;
}

const UserWorkoutDetail: React.FC = () => {
  const { userId, workoutId } = useParams<{ userId: string; workoutId: string }>();
  
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [clientName, setClientName] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<number, string>>({});
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoURL, setVideoURL] = useState<string>('');

  const handleInputChange = (exerciseIndex: number, setIndex: number, field: keyof Set, value: any) => {
    setWorkout((prevWorkout) => {
      if (!prevWorkout) return null;
      const updatedExercises = [...prevWorkout.exercises];
      (updatedExercises[exerciseIndex].sets[setIndex][field] as any) = value;
      return { ...prevWorkout, exercises: updatedExercises };
    });
    saveWorkout();
  };

  const handleNotesChange = (exerciseIndex: number, value: string) => {
    setNotes((prev) => ({
      ...prev,
      [exerciseIndex]: value,
    }));
    saveWorkout();
  };

  const handleVideoUpload = async () => {
    if (!videoFile) return;

    const storage = getStorage();
    const storageRef = ref(storage, `videos/${userId}/${workoutId}/${videoFile.name}`);
    await uploadBytes(storageRef, videoFile);
    const url = await getDownloadURL(storageRef);
    setVideoURL(url);

    if (!userId || !workoutId) {
      throw new Error('User ID or Workout ID is missing');
    }
  
    const workoutDocRef = doc(db, 'users', userId, 'workouts', workoutId);
    await updateDoc(workoutDocRef, { videoURL: url });
    console.log('Video uploaded and URL saved to Firestore');
  };

  const completeWorkout = async () => {
    try {
      const workoutDocRef = doc(db, 'users', userId, 'workouts', workoutId);
      await updateDoc(workoutDocRef, { completed: true, notes });
      await saveWorkout();
      alert('Workout completed successfully!');
    } catch (error) {
      console.error('Error completing workout:', error);
      alert('Error completing workout. Please try again later.');
    }
  };

  const saveWorkout = async () => {
    try {
      const workoutDocRef = doc(db, 'users', userId, 'workouts', workoutId);
      await updateDoc(workoutDocRef, { notes });

      // Save exercises and sets
      for (const [exerciseIndex, exercise] of workout!.exercises.entries()) {
        const exerciseDocRef = doc(collection(db, 'users', userId, 'workouts', workoutId, 'exercises'), exercise.id || undefined);
        await setDoc(exerciseDocRef, { name: exercise.name, orderBy: exercise.orderBy, exerciseId: exercise.exerciseId });

        for (const [setIndex, set] of exercise.sets.entries()) {
          const setDocRef = doc(collection(exerciseDocRef, 'sets'), set.id || undefined);
          await setDoc(setDocRef, {
            setNumber: set.setNumber,
            reps: set.reps,
            load: set.load,
            completed: set.completed || false,
          });
        }
      }

      console.log('Workout saved successfully!');
    } catch (error) {
      console.error('Error saving workout:', error);
    }
  };

  const getExerciseVideoURL = async (exerciseId: string): Promise<string> => {
    try {
      const exerciseDoc = await getDoc(doc(db, 'exercises', exerciseId));
      if (exerciseDoc.exists()) {
        return exerciseDoc.data().videoURL || '';
      } else {
        console.error('Exercise not found');
        return '';
      }
    } catch (error) {
      console.error('Error fetching exercise video URL:', error);
      return '';
    }
  };

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setClientName(`${userData.firstName} ${userData.lastName}`);
        }
      } catch (error) {
        console.error('Error fetching user details:', error);
      }
    };

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
              const setsData = setsSnapshot.docs.map((setDoc) => ({ id: setDoc.id, ...setDoc.data() }));
              setsData.sort((a, b) => a.setNumber - b.setNumber); // Order sets by set number
              const exerciseData = exerciseDoc.data();
              const name = exerciseData.name || '';
              const orderBy = exerciseData.orderBy;
              console.log("exerciseData", exerciseData);
              const exerciseId = exerciseData.exerciseId;
              const videoURL = await getExerciseVideoURL(exerciseData.exerciseId);
              return { id: exerciseDoc.id, name, videoURL, exerciseId,  orderBy,  sets: setsData };
            })
          );

          exercisesData.sort((a, b) => {
            return a.orderBy - b.orderBy;
          })

          setWorkout({ ...workoutData, exercises: exercisesData });
          setNotes(workoutData.notes || {});
          setVideoURL(workoutData.videoURL || '');
        } else {
          setError('Workout not found');
        }
      } catch (error) {
        console.error('Error fetching workout:', error);
        setError('Error fetching workout. Please try again later.');
      }
    };

    fetchUserDetails();
    fetchWorkout();
  }, [userId, workoutId]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        saveWorkout();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [workout, notes]);

  if (error) {
    return <div>{error}</div>;
  }

  if (!workout) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ overflowY: 'auto', overflowX: 'hidden', maxHeight: '100vh', maxWidth: '100vw', padding: '10px', boxSizing: 'border-box' , paddingBottom: '180px'}}>
      <h1>{clientName}'s Workout</h1>
      <p>Date: {workout.date}</p>
      <h2>Coach Notes</h2>
      <p>{workout.coachNotes}</p>
      <h2>Exercises</h2>
      <div>
        <table style={{ borderCollapse: 'collapse', width: '100%' }}>
          <tbody>
            {(workout.exercises || []).map((exercise, exerciseIndex) => (
              <React.Fragment key={exerciseIndex}>
                <tr>
                  <td colSpan="5" style={{ border: '1px solid black', padding: '8px', textAlign: 'center', fontWeight: 'bold' }}>
                    {exercise.name}
                    {exercise.videoURL != null && exercise.videoURL.trim() !== '' && (
                      <a
                        href={exercise.videoURL}
                        target="_blank"
                        rel="noreferrer"
                        style={{ marginLeft: '10px' }}
                      >
                        View Video
                      </a>
                    )}
                  </td>
                </tr>
                <tr>
                  <th style={{ border: '1px solid black', padding: '8px' }}>Set</th>
                  <th style={{ border: '1px solid black', padding: '8px' }}>Reps</th>
                  <th style={{ border: '1px solid black', padding: '8px' }}>Load</th>
                  <th style={{ border: '1px solid black', padding: '8px' }}>Sets</th>
                  <th style={{ border: '1px solid black', padding: '4px' }}></th>
                </tr>
                {exercise.sets.map((set, setIndex) => (
                  <React.Fragment key={`${exerciseIndex}-${setIndex}`}>
                    <tr>
                      <td style={{ border: '1px solid black', padding: '8px' }}>{set.setNumber}</td>
                      <td style={{ border: '1px solid black', padding: '8px' }}>
                        <input
                          type="number"
                          value={set.reps || ''}
                          onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange(exerciseIndex, setIndex, 'reps', e.target.value)}
                          style={{ width: '50px' }}
                        />
                      </td>
                      <td style={{ border: '1px solid black', padding: '8px' }}>
                        <input
                          type="number"
                          value={set.load || ''}
                          onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange(exerciseIndex, setIndex, 'load', e.target.value)}
                          style={{ width: '50px' }}
                        />
                      </td>
                      <td style={{ border: '1px solid black', padding: '8px' }}>
                        <input
                          type="number"
                          value={set.sets || ''}
                          onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange(exerciseIndex, setIndex, 'sets', e.target.value)}
                          style={{ width: '50px' }}
                        />
                      </td>
                      <td style={{ border: '1px solid black', padding: '4px', textAlign: 'center', width: '25px' }}>
                        <span
                          onClick={() => handleInputChange(exerciseIndex, setIndex, 'completed',!set.completed)}
                          style={{
                            cursor: 'pointer',
                            color: set.completed ? 'green' : 'black',
                          }}
                        >
                          {set.completed ? '✔️' : '⬜'}
                        </span>
                      </td>
                    </tr>
                    {setIndex === exercise.sets.length - 1 && (
                      <tr>
                        <td colSpan="5" style={{ border: '1px solid black', padding: '8px' }}>
                          <label>Notes:</label>
                          <textarea
                            value={notes[exerciseIndex] || ''}
                            onChange={(e: ChangeEvent<HTMLTextAreaElement>) => handleNotesChange(exerciseIndex, e.target.value)}
                            style={{ width: '95%' }}
                          />
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
      <div>
        <h2>Upload Workout Video</h2>
        <input type="file" accept="video/*" onChange={(e: ChangeEvent<HTMLInputElement>) => setVideoFile(e.target.files ? e.target.files[0] : null)} />
        <button onClick={handleVideoUpload}>Upload Video</button>
        {videoURL && (
          <div>
            <h3>Uploaded Video</h3>
            <video src={videoURL} controls width="100%" />
          </div>
        )}
      </div>
      <button onClick={completeWorkout} style={{ marginTop: '20px' }}>Complete Workout</button>
      <Link to={`/user-workouts/${userId}`} style={{ marginTop: '20px', marginLeft: '10px', display: 'inline-block' }}>
        <button>Back to Workouts</button>
      </Link>
    </div>
  );
};

export default UserWorkoutDetail;

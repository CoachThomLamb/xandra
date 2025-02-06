import React, { useEffect, useState, ChangeEvent } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { collection, getDocs, doc, getDoc, updateDoc, setDoc, addDoc, writeBatch, deleteDoc } from 'firebase/firestore';
import { auth,  db } from '../firebaseConfig';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { ExerciseDefinition, Set, ExerciseInstance, Workout } from '../types/workout';
import ExerciseTable from './ExerciseTable';

const UserWorkoutDetail: React.FC = () => {
  const { userId, workoutId } = useParams<{ userId: string; workoutId: string }>();
  const navigate = useNavigate();
  
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [clientName, setClientName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<number, string>>({});
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoURL, setVideoURL] = useState('');
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  type SetField = 'reps' | 'load' | 'completed';
  type SetValue = number | boolean;

  const handleInputChange = (exerciseIndex: number, setIndex: number, field: SetField, value: SetValue) => {
    setWorkout((prevWorkout) => {
      if (!prevWorkout) return null;
      const updatedExercises = [...prevWorkout.exercises];
      const set = updatedExercises[exerciseIndex].sets[setIndex];
      if (field === 'reps' || field === 'load') {
        set[field] = value as number;
      } else if (field === 'completed') {
        set[field] = value as boolean;
      }
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

    const workoutDocRef = doc(db, 'users', userId, 'workouts', workoutId);
    await updateDoc(workoutDocRef, { videoURL: url });
    console.log('Video uploaded and URL saved to Firestore');
  };

  const handleExerciseVideoUpload = async (exerciseIndex: number, file: File) => {
    if (!file) return;

    const storage = getStorage();
    const storageRef = ref(storage, `videos/${userId}/${workoutId}/exercises/${exerciseIndex}/${file.name}`);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);

    setWorkout((prevWorkout) => {
      if (!prevWorkout) return null;
      const updatedExercises = [...prevWorkout.exercises];
      updatedExercises[exerciseIndex].clientVideoURL = url;
      return { ...prevWorkout, exercises: updatedExercises };
    });

    // Save to Firestore
    const exerciseDocRef = doc(collection(db, 'users', userId, 'workouts', workoutId, 'exercises'), workout!.exercises[exerciseIndex].id);
    await updateDoc(exerciseDocRef, { clientVideoURL: url });
  };

  const completeWorkout = async () => {
    try {
      const workoutDocRef = doc(db, 'users', userId, 'workouts', workoutId);
      const completedAt = new Date().toISOString();
      await updateDoc(workoutDocRef, { completed: true, notes, completedAt: completedAt });
      await saveWorkout();
      alert('Workout completed successfully!');
    } catch (error) {
      console.error('Error completing workout:', error);
      alert('Error completing workout. Please try again later.');
    }
  };

  const saveWorkout = async (newDueDate?: string) => {
    try {
      const workoutDocRef = doc(db, 'users', userId, 'workouts', workoutId);
      await updateDoc(workoutDocRef, { notes, dueDate: newDueDate || dueDate });

      // Save exercises and sets
      const batch = writeBatch(db); // Use batch to optimize Firestore writes
      for (const [exerciseIndex, exercise] of workout!.exercises.entries()) {
        const exerciseDocRef = doc(collection(db, 'users', userId, 'workouts', workoutId, 'exercises'), exercise.id || undefined);
        batch.set(exerciseDocRef, {
          name: exercise.name,
          orderBy: exercise.orderBy,
          exerciseId: exercise.exerciseId,
          clientVideoURL: exercise.clientVideoURL,
          coachNotes: exercise.coachNotes
        });

        for (const [setIndex, set] of exercise.sets.entries()) {
          const setDocRef = doc(collection(exerciseDocRef, 'sets'), set.id || undefined);
          batch.set(setDocRef, {
            setNumber: set.setNumber,
            reps: set.reps,
            load: set.load,
            completed: set.completed || false,
          });
        }
      }

      await batch.commit(); // Commit the batch
      console.log('Workout saved successfully!');
    } catch (error) {
      console.error('Error saving workout:', error);
    }
  };

  const copyWorkout = async (originalWorkoutId: string, userId: string) => {
    try {
      // Get the original workout document
      const originalWorkoutDocRef = doc(db, 'users', userId, 'workouts', originalWorkoutId);
      const originalWorkoutDoc = await getDoc(originalWorkoutDocRef);

      if (!originalWorkoutDoc.exists()) {
        throw new Error('Original workout not found');
      }

      const originalWorkoutData = originalWorkoutDoc.data();

      // Create a new workout document with the same information but a new ID
      const newWorkoutDocRef = await addDoc(collection(db, 'users', userId, 'workouts'), {
        ...originalWorkoutData,
        title: `Copied from ${originalWorkoutData.title}`,
        completed: false,
        completedAt: null,
        parentWorkoutId: originalWorkoutId,
        createdAt: new Date().toISOString()
      });

      // Copy exercises and sets
      const batch = writeBatch(db); // Use batch to optimize Firestore writes
      const exercisesSnapshot = await getDocs(collection(originalWorkoutDocRef, 'exercises'));
      for (const exerciseDoc of exercisesSnapshot.docs) {
        const exerciseData = exerciseDoc.data();
        const newExerciseDocRef = doc(collection(newWorkoutDocRef, 'exercises'));
        batch.set(newExerciseDocRef, exerciseData);

        const setsSnapshot = await getDocs(collection(exerciseDoc.ref, 'sets'));
        for (const setDoc of setsSnapshot.docs) {
          const setData = setDoc.data();
          const newSetDocRef = doc(collection(newExerciseDocRef, 'sets'));
          batch.set(newSetDocRef, setData);
        }
      }

      await batch.commit(); // Commit the batch
      console.log('Workout copied successfully!');

      // Redirect to the copied workout
      navigate(`/user-workouts/${userId}/workouts/${newWorkoutDocRef.id}`);
      // navigate(`/user-workouts/${userId}`);
    } catch (error) {
      console.error('Error copying workout:', error);
    }
  };

  const deleteWorkout = async () => {
    try {
      const workoutDocRef = doc(db, 'users', userId, 'workouts', workoutId);
      await deleteDoc(workoutDocRef);
      alert('Workout deleted successfully!');
      navigate(`/user-workouts/${userId}`);
    } catch (error) {
      console.error('Error deleting workout:', error);
      alert('Error deleting workout. Please try again later.');
    }
  };
  const fetchWorkout = async () => {
    try {
      const workoutDocRef = doc(db, 'users', userId, 'workouts', workoutId);
      const workoutDoc = await getDoc(workoutDocRef);
      if (workoutDoc.exists()) {
        const workoutData = workoutDoc.data() as Workout;

        const exercisesCollection = collection(workoutDocRef, 'exercises');
        const exercisesSnapshot = await getDocs(exercisesCollection);
        let exercisesData = await Promise.all(
          exercisesSnapshot.docs.map(async (exerciseDoc) => {
            const setsCollection = collection(exerciseDoc.ref, 'sets');
            const setsSnapshot = await getDocs(setsCollection);
            const setsData = setsSnapshot.docs.map((setDoc) => ({ id: setDoc.id, ...setDoc.data() as Set }));
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
              coachNotes,
            };
          })
        );

        exercisesData.sort((a, b) => {
          return a.orderBy - b.orderBy;
        })

        setWorkout({ ...workoutData, exercises: exercisesData });
        setNotes(workoutData.notes || {});
        setVideoURL(workoutData.videoURL || '');
        setDueDate(workoutData.dueDate || null);
      } else {
        setError('Workout not found');
      }
    } catch (error) {
      console.error('Error fetching workout:', error);
      setError('Error fetching workout. Please try again later.');
    }
  };

  const getExerciseVideoURL = async (exerciseId: string): Promise<string> => {
    console.log("exerciseId", exerciseId);
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

  const deleteSet = async (exerciseId: string, setId: string) => {
    try {
      const setDocRef = doc(db, 'users', userId, 'workouts', workoutId, 'exercises', exerciseId, 'sets', setId);
      await deleteDoc(setDocRef);
      console.log('Set deleted successfully!');
      fetchWorkout(); // Reload the workout to show the changes
    } catch (error) {
      console.error('Error deleting set:', error);
      alert('Error deleting set. Please try again later.');
    }
  };

  const handleDueDateChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newDueDate = e.target.value;
    setDueDate(newDueDate);
    setWorkout((prevWorkout) => {
      if (!prevWorkout) return null;
      return { ...prevWorkout, dueDate: newDueDate };
    });
    saveWorkout(newDueDate);
  };

  const addSet = async (exerciseId: string) => {
    try {
      const newSet = {
        setNumber: workout!.exercises.find(ex => ex.id === exerciseId)!.sets.length + 1,
        reps: 0,
        load: 0,
        completed: false,
      };
      const setDocRef = await addDoc(collection(db, 'users', userId, 'workouts', workoutId, 'exercises', exerciseId, 'sets'), newSet);
      console.log('Set added successfully!', setDocRef.id);
      fetchWorkout(); // Reload the workout to show the changes
    } catch (error) {
      console.error('Error adding set:', error);
      alert('Error adding set. Please try again later.');
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
    const checkAdminPrivileges = async () => {
      try {
        const user = auth.currentUser;
        console.log('user:', user);
        if (user) {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            console.log('userData:', userData.role);
            setIsAdmin(userData.role === 'admin' || false);
          }
        }
      } catch (error) {
        console.error('Error checking admin privileges:', error);
      }
    };

    checkAdminPrivileges();
    

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

  const removeExercise = async (exerciseId: string) => {
    try {
      const workoutDocRef = doc(db, 'users', userId!, 'workouts', workoutId);
      const exerciseDocRef = doc(workoutDocRef, 'exercises', exerciseId);
      await deleteDoc(exerciseDocRef);

      setWorkout((prevWorkout) => {
        if (!prevWorkout) return null;
        const updatedExercises = prevWorkout.exercises.filter((exercise) => exercise.id !== exerciseId);
        return { ...prevWorkout, exercises: updatedExercises };
      });

      alert('Exercise removed successfully!');
    } catch (error) {
      console.error('Error removing exercise:', error);
      alert('Error removing exercise. Please try again later.');
    }
  };

  if (error) {
    return <div>{error}</div>;
  }

  if (!workout) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ overflowY: 'auto', overflowX: 'hidden', maxHeight: '100vh', maxWidth: '100vw', padding: '10px', boxSizing: 'border-box' , paddingBottom: '180px'}}>
      <h1>{clientName}'s Workout</h1>
      <h2>Workout Name</h2>
      <h2>{workout.title}</h2>
      {workout.completedAt && (
        <p>Completed At: {new Date(workout.completedAt).toLocaleDateString()}</p>
      )}
      <p>Due Date: {isAdmin ? (
        <input 
          type="date" 
          value={dueDate || ''} 
          onChange={handleDueDateChange} 
        />
      ) : (
        dueDate
      )}</p>
      <h2>Coach Notes</h2>
      <p>{workout.coachNotes}</p>
      <h2>Exercises</h2>
      <ExerciseTable
        exercises={workout.exercises}
        isAdmin={isAdmin}
        notes={notes}
        handleInputChange={handleInputChange}
        handleNotesChange={handleNotesChange}
        handleExerciseVideoUpload={handleExerciseVideoUpload}
        deleteSet={deleteSet}
        addSet={addSet}
        removeExercise={removeExercise}
      />
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
      <button 
        onClick={completeWorkout} 
        style={{ 
          marginTop: '20px', 
          backgroundColor: workout.completed ? 'lightgreen' : 'black', 
          color: workout.completed ? 'black' : 'white',
          border: workout.completed ? '2px solid green' : 'initial' 
        }}
      >
        {workout.completed ? 'Workout completed' : 'Complete workout' }
      </button>
      <Link to={`/user-workouts/${userId}`} style={{ marginTop: '20px', marginLeft: '10px', display: 'inline-block' }}>
        <button>Back to Workouts</button>
      </Link>
      {isAdmin && (
        <div>
          <h2>Admin Actions</h2>
          <button onClick={deleteWorkout} style={{ marginTop: '20px', marginLeft: '10px', display: 'inline-block' }}>Delete Workout</button>
          <button onClick={() => copyWorkout(workoutId, userId)} style={{ marginTop: '20px' }}>Copy Workout</button>
        </div>
      )}
    </div>
  );
};

export default UserWorkoutDetail;

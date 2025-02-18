import React, { useEffect, useState, ChangeEvent } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { doc, getDoc, deleteDoc, addDoc, collection, writeBatch } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';
import ExerciseTable from './ExerciseTable';
import { useWorkoutDetail } from '../hooks/useWorkoutDetail';

const UserWorkoutDetail: React.FC = () => {
  const { userId = '', workoutId = '' } = useParams();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  
  const {
    workout,
    setWorkout,
    clientName,
    error,
    notes,
    videoFile,
    videoURL,
    dueDate,
    setVideoFile,
    handleInputChange,
    handleNotesChange,
    handleVideoUpload,
    handleExerciseVideoUpload,
    completeWorkout,
    saveWorkout,
    setDueDate,
    fetchWorkout
  } = useWorkoutDetail(userId, workoutId);
  // console.log('dueDate:', dueDate);

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

  const copyWorkout = async (originalWorkoutId: string, userId: string) => {
    try {
      const originalWorkoutDocRef = doc(db, 'users', userId, 'workouts', originalWorkoutId);
      const originalWorkoutDoc = await getDoc(originalWorkoutDocRef);

      if (!originalWorkoutDoc.exists()) {
        throw new Error('Original workout not found');
      }

      const originalWorkoutData = originalWorkoutDoc.data();

      const newWorkoutDocRef = await addDoc(collection(db, 'users', userId, 'workouts'), {
        ...originalWorkoutData,
        title: `Copied from ${originalWorkoutData.title}`,
        completed: false,
        completedAt: null,
        parentWorkoutId: originalWorkoutId,
        createdAt: new Date().toISOString()
      });

      const batch = writeBatch(db);
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

      await batch.commit();
      console.log('Workout copied successfully!');

      navigate(`/user-workouts/${userId}/workouts/${newWorkoutDocRef.id}`);
    } catch (error) {
      console.error('Error copying workout:', error);
    }
  };

  const deleteSet = async (exerciseId: string, setId: string) => {
    try {
      const setDocRef = doc(db, 'users', userId, 'workouts', workoutId, 'exercises', exerciseId, 'sets', setId);
      await deleteDoc(setDocRef);
      console.log('Set deleted successfully!');
      fetchWorkout();
    } catch (error) {
      console.error('Error deleting set:', error);
      alert('Error deleting set. Please try again later.');
    }
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
      fetchWorkout();
    } catch (error) {
      console.error('Error adding set:', error);
      alert('Error adding set. Please try again later.');
    }
  };

  const formatDate = (date: string | null): string => {
    if (!date) return '';
    const d = new Date(date);
    // Add timezone offset to get correct local date
    const timezoneOffset = d.getTimezoneOffset() * 60000;
    const localDate = new Date(d.getTime() + timezoneOffset);
    return localDate.toISOString().split('T')[0]; // This ensures yyyy-mm-dd format
  };

  const handleDueDateChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newDueDate = e.target.value;
    console.log('newDueDate:', newDueDate);
    setDueDate(newDueDate);
    saveWorkout(newDueDate);
  };

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

  useEffect(() => {
    const checkAdminPrivileges = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setIsAdmin(userData.role === 'admin' || false);
          }
        }
      } catch (error) {
        console.error('Error checking admin privileges:', error);
      }
    };

    checkAdminPrivileges();
  }, []);

  if (error) return <div>{error}</div>;
  if (!workout) return <div>Loading...</div>;

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
          value={formatDate(dueDate)} 
          onChange={handleDueDateChange} 
        />
      ) : (
        formatDate(dueDate)
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

import { useState, useEffect } from 'react';
import { collection, getDocs,addDoc, doc, getDoc, updateDoc, writeBatch, setDoc, collectionGroup } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { Set, ExerciseInstance, Workout } from '../types/workout';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

interface WorkoutPost extends Omit<Workout, 'exercises'> {
  exercises: Array<{
    id: string;
    name: string;
    exerciseId: string;
    clientVideoURL?: string;
    coachNotes?: string;
    orderBy: number;
    sets: Array<{
      id: string;
      reps: number;
      load: number;
      completed: boolean;
      setNumber: number;
    }>;
  }>;
}

export const useWorkoutDetail = (userId: string, workoutId: string) => {
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [clientName, setClientName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<number, string>>({});
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoURL, setVideoURL] = useState('');
  const [dueDate, setDueDate] = useState<Date | null>(null);

  const handleInputChange = (exerciseIndex: number, setIndex: number, field: 'reps' | 'load' | 'completed', value: number | boolean) => {
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

    if (workout && workout.exercises[exerciseIndex]) {
      const exerciseDocRef = doc(collection(db, 'users', userId, 'workouts', workoutId, 'exercises'), workout.exercises[exerciseIndex].id);
      await updateDoc(exerciseDocRef, { clientVideoURL: url });
    }
  };

  const completeWorkout = async () => {
    try {
      const workoutDocRef = doc(db, 'users', userId, 'workouts', workoutId);
      const completedAt = new Date().toISOString();
      
      // Update original workout
      await updateDoc(workoutDocRef, { 
        completed: true, 
        notes, 
        completedAt 
      });

      if (workout && workout.exercises) {
        // Create workout post
        const workoutPostDocRef = doc(db, 'users', userId, 'workout-posts', workoutId);
        const batch = writeBatch(db);

        // Prepare workout post data
        const workoutPostData: WorkoutPost = {
          ...workout,
          notes,
          completedAt,
          exercises: workout.exercises.map(ex => ({
            id: ex.id,
            name: ex.name,
            exerciseId: ex.exerciseId,
            clientVideoURL: ex.clientVideoURL,
            coachNotes: ex.coachNotes,
            orderBy: ex.orderBy,
            sets: ex.sets.map(set => ({
              id: set.id,
              reps: set.reps,
              load: set.load,
              completed: set.completed || false,
              setNumber: set.setNumber
            }))
          }))
        };

        // Set the workout post document
        batch.set(workoutPostDocRef, workoutPostData);

        await batch.commit();

        setWorkout({
          ...workout,
          completed: true,
          completedAt
        });
      }
    } catch (error) {
      console.error('Error completing workout:', error);
      throw new Error('Failed to complete workout');
    }
  };

  const saveWorkout = async (newDueDate?: string) => {
    try {
      const workoutDocRef = doc(db, 'users', userId, 'workouts', workoutId);
      const updateData: any = { notes };
      
      if (newDueDate !== undefined) {
        updateData.dueDate = newDueDate;
      }
      console.log('updateData:', updateData);
      
      await updateDoc(workoutDocRef, updateData);

      // Save exercises and sets
      
    } catch (error) {
      console.error('Error saving workout:', error);
      throw new Error('Failed to save workout');
    }
    try {
      if (workout && workout.exercises) {
        const workoutDocRef = doc(db, 'users', userId, 'workouts', workoutId);
        const batch = writeBatch(db);
        for (const exercise of workout.exercises) {
          if (exercise && exercise.sets) {
            const exerciseDocRef = doc(collection(workoutDocRef, 'exercises'), exercise.id);
            for (const set of exercise.sets) {
              if (set && set.id) {
                const setDocRef = doc(collection(exerciseDocRef, 'sets'), set.id);
           
                batch.update(setDocRef, {
                  reps: set.reps,
                  load: set.load,
                  completed: set?.completed || false
                });
              }
            }
          }
        }
        await batch.commit();
      }
    } catch (error) {
      console.error('Error saving exercises:', error);
      throw new Error('Failed to save exercises');
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
              coachNotes,
            };
          })
        );

        exercisesData.sort((a, b) => a.orderBy - b.orderBy);
        setWorkout({ ...workoutData, exercises: exercisesData });
        setNotes(workoutData.notes || {});
        setVideoURL(workoutData.videoURL || '');
        setDueDate(workoutData.dueDate || null);
      }
    } catch (error) {
      console.error('Error fetching workout:', error);
      setError('Error loading workout');
    }
  };

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

  return {
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
  };
};

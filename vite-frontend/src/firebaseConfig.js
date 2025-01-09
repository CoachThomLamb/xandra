import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, collection, getDocs, doc, getDoc, addDoc, serverTimestamp } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyD3s06D0y79sZkeKXArZU7tgcSvbgx4lqI",
    authDomain: "xandra-3b0ae.firebaseapp.com",
    projectId: "xandra-3b0ae",
    storageBucket: "xandra-3b0ae.firebasestorage.app",
    messagingSenderId: "794662040922",
    appId: "1:794662040922:web:b84406dbbdc8aba7d96f63",
    measurementId: "G-NFWW9NCZHH"
};
  

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const getUserRole = async (userId) => {
  const userDoc = await getDoc(doc(db, 'users', userId));
  if (userDoc.exists()) {
    return userDoc.data().role;
  } else {
    throw new Error('User not found');
  }
};

const assignWorkoutTemplateToUser = async (templateId, userId) => {
  try {
    const templateDoc = await getDoc(doc(db, 'workout-templates', templateId));
    if (templateDoc.exists()) {
      const templateData = templateDoc.data();
      const userWorkoutsRef = collection(db, 'users', userId, 'workouts');
      const newWorkoutRef = await addDoc(userWorkoutsRef, { title: templateData.title, date: new Date().toISOString().split('T')[0] });

      const exercisesSnapshot = await getDocs(collection(templateDoc.ref, 'exercises'));
      exercisesSnapshot.forEach(async (exerciseDoc) => {
        const exerciseData = exerciseDoc.data();
        const newExerciseRef = await addDoc(collection(newWorkoutRef, 'exercises'), { name: exerciseData.name });

        const setsSnapshot = await getDocs(collection(exerciseDoc.ref, 'sets'));
        setsSnapshot.forEach(async (setDoc) => {
          const setData = setDoc.data();
          await addDoc(collection(newExerciseRef, 'sets'), setData);
        });
      });

      console.log('Workout template assigned to user');
    } else {
      console.error('Workout template not found');
    }
  } catch (error) {
    console.error('Error assigning workout template to user:', error);
  }
};

// Function to get standard exercises
export const getStandardExercises = async () => {
  const exercisesRef = collection(db, 'standard_exercises');
  const snapshot = await getDocs(exercisesRef);
  return snapshot.docs.map(doc => doc.data().name);
};

// Function to add a standard exercise
export const addStandardExercise = async (name) => {
  const exercisesRef = collection(db, 'standard_exercises');
  await addDoc(exercisesRef, {
    name,
    createdAt: serverTimestamp()
  });
};

export { auth, db, getUserRole, assignWorkoutTemplateToUser };

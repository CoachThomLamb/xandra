import { initializeApp } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence, User } from "firebase/auth";
import { 
  getFirestore, 
  collection, 
  getDocs, 
  doc, 
  getDoc, 
  addDoc, 
  serverTimestamp, 
  

  
} from 'firebase/firestore';

// ...existing firebase config...
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

// Enable offline persistence for authentication
setPersistence(auth, browserLocalPersistence);


const getUserRole = async (userId: string): Promise<string> => {
  const userDoc = await getDoc(doc(db, 'users', userId));
  if (userDoc.exists()) {
    return userDoc.data().role;
  } else {
    throw new Error('User not found');
  }
};



export { auth, db, getUserRole };

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

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

export { auth };

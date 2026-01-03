
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyB8_Qg6z6BhXX2cjdZm0ux6bO-0bATbObE",
  authDomain: "to-do-14502.firebaseapp.com",
  projectId: "to-do-14502",
  storageBucket: "to-do-14502.firebasestorage.app",
  messagingSenderId: "750508288684",
  appId: "1:750508288684:web:36c3089a1e2838dc588d09",
  measurementId: "G-7TNYJG6X7K"
};

// Initialize Firebase
const app = !firebase.apps.length ? firebase.initializeApp(firebaseConfig) : firebase.app();

export const auth = firebase.auth();
export const db = firebase.firestore();

// Verification log
console.log("Firebase: Initialized for project:", firebaseConfig.projectId);

// Set persistence to LOCAL
auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL).catch((error) => {
  console.error("Firebase Auth: Persistence failed", error);
});

export default firebase;

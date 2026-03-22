import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAYhH8equ46px676yPmHgkUaBd9q3Nyzeo",
  authDomain: "pecadosplacenterospdm.firebaseapp.com",
  projectId: "pecadosplacenterospdm",
  storageBucket: "pecadosplacenterospdm.firebasestorage.app",
  messagingSenderId: "809002572310",
  appId: "1:809002572310:web:14956bfde9f51c0474f337"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyAYhH8equ46px676yPmHgkUaBd9q3Nyzeo",
  authDomain: "pecadosplacenterospdm.firebaseapp.com",
  projectId: "pecadosplacenterospdm",
  storageBucket: "pecadosplacenterospdm.firebasestorage.app",
  messagingSenderId: "809002572310",
  appId: "1:809002572310:web:14956bfde9f51c0474f337"
};

const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});

export const db = getFirestore(app);

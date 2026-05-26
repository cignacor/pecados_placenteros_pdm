import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';


const firebaseConfig = {
  apiKey: 'AIzaSyAYhH8equ46px676yPmHgkUaBd9q3Nyzeo',         // clave pública de la API
  authDomain: 'pecadosplacenterospdm.firebaseapp.com',        // dominio de autenticación
  projectId: 'pecadosplacenterospdm',                         // ID del proyecto
  storageBucket: 'pecadosplacenterospdm.firebasestorage.app', // bucket de Storage
  messagingSenderId: '809002572310',                          // ID para Cloud Messaging
  appId: '1:809002572310:web:14956bfde9f51c0474f337',         // ID de la app web
};


const app = initializeApp(firebaseConfig);


export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});

// Instancia de Firestore — colecciones: "users", "products"
export const db = getFirestore(app);

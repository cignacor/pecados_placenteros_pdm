import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../../api/firebaseConfig';

// Registro: crea usuario en Auth y su perfil en Firestore
export const registerWithEmail = async (name, email, password) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  // Guardar datos extra en colección "users"
  await setDoc(doc(db, 'users', user.uid), {
    name,
    email,
    role: 'customer', // 'customer' | 'admin'
    createdAt: new Date().toISOString(),
  });

  return user;
};

// Login
export const signInWithEmail = async (email, password) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
};

// Obtener perfil del usuario desde Firestore
export const getUserProfile = async (uid) => {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? snap.data() : null;
};

// Cerrar sesión
export const logout = async () => {
  await signOut(auth);
};

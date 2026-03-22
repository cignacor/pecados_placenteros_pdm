import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../api/firebaseConfig';

// Inicia sesión con correo y contraseña
export const signInWithEmail = async (email, password) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
};

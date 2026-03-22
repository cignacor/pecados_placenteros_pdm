import { collection, getDocs } from 'firebase/firestore';
import { db } from '../api/firebaseConfig';

// Obtiene el listado de productos del menú desde Firestore
export const fetchMenu = async () => {
  const snapshot = await getDocs(collection(db, 'products'));
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

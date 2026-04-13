import { collection, getDocs } from 'firebase/firestore';
import { db } from '../api/firebaseConfig';

// Obtiene todos los productos agrupados por categoría
export const fetchMenu = async () => {
  const snapshot = await getDocs(collection(db, 'products'));
  const products = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

  // Agrupar por categoría
  return products.reduce((acc, product) => {
    const cat = product.category;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(product);
    return acc;
  }, {});
};

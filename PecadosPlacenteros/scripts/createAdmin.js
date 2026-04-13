const { initializeApp } = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword } = require('firebase/auth');
const { getFirestore, doc, setDoc } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyAYhH8equ46px676yPmHgkUaBd9q3Nyzeo",
  authDomain: "pecadosplacenterospdm.firebaseapp.com",
  projectId: "pecadosplacenterospdm",
  storageBucket: "pecadosplacenterospdm.firebasestorage.app",
  messagingSenderId: "809002572310",
  appId: "1:809002572310:web:14956bfde9f51c0474f337"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Cambia estos datos a los que quieras usar
const ADMIN_EMAIL = 'admin@pecadosplacenteros.com';
const ADMIN_PASSWORD = 'Admin123!';
const ADMIN_NAME = 'Administrador';

async function createAdmin() {
  const userCredential = await createUserWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD);
  const user = userCredential.user;

  await setDoc(doc(db, 'users', user.uid), {
    name: ADMIN_NAME,
    email: ADMIN_EMAIL,
    role: 'admin',
    createdAt: new Date().toISOString(),
  });

  console.log(`✓ Admin creado: ${ADMIN_EMAIL}`);
  process.exit(0);
}

createAdmin().catch(console.error);

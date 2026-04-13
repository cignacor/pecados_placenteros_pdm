const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyAYhH8equ46px676yPmHgkUaBd9q3Nyzeo",
  authDomain: "pecadosplacenterospdm.firebaseapp.com",
  projectId: "pecadosplacenterospdm",
  storageBucket: "pecadosplacenterospdm.firebasestorage.app",
  messagingSenderId: "809002572310",
  appId: "1:809002572310:web:14956bfde9f51c0474f337"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const products = [
  {
    name: 'Lujuria de Wagyu',
    price: '18.50€',
    description: 'Carne de Wagyu A5, emulsión de trufa negra, cebolla caramelizada al Oporto y queso Gruyére fundido sobre brioche artesanal.',
    category: 'BURGERS',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600',
    featured: true,
    featuredLabel: 'LO MÁS DESEADO',
  },
  {
    name: 'Pecado Picante',
    price: '15.90€',
    description: 'Doble ternera madurada, jalapeños encurtidos, salsa Sriracha cremosa y queso pepper jack.',
    category: 'BURGERS',
    image: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=400',
    featured: false,
    featuredLabel: '',
  },
  {
    name: 'Patatas Tentación',
    price: '8.50€',
    description: 'Corte fino, sal de trufa blanca, parmesano de 24 meses y alioli de ajo negro.',
    category: 'ENTRANTES',
    image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400',
    featured: false,
    featuredLabel: '',
  },
  {
    name: 'Muerte por Chocolate',
    price: '9.20€',
    description: 'Coulant de chocolate belga 70%, corazón fundente y coulis de frambuesas silvestres.',
    category: 'POSTRES',
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600',
    featured: true,
    featuredLabel: '',
  },
  {
    name: 'Cóctel Pecador Original',
    price: '12.00€',
    description: 'Ginebra, frutos rojos y nómesis de vainilla.',
    category: 'BEBIDAS',
    image: '',
    featured: false,
    featuredLabel: '',
  },
  {
    name: 'Cerveza Artesana Premium',
    price: '6.50€',
    description: 'Local, estilo IPA.',
    category: 'BEBIDAS',
    image: '',
    featured: false,
    featuredLabel: '',
  },
];

async function seed() {
  for (const product of products) {
    await addDoc(collection(db, 'products'), product);
    console.log(`✓ ${product.name} agregado`);
  }
  console.log('¡Listo! Todos los productos fueron cargados.');
  process.exit(0);
}

seed().catch(console.error);

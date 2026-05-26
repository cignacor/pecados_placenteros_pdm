/**
 * Pruebas unitarias — productService y lógica de menú
 *
 * Se mockea Firebase para no requerir conexión real.
 * Se prueba la agrupación por categoría y los casos borde.
 */

// ─── Mocks de módulos (deben ir antes de cualquier import/require) ────────────

jest.mock('firebase/app', () => ({
  initializeApp: jest.fn(() => ({})),
}));

jest.mock('firebase/auth', () => ({
  initializeAuth: jest.fn(() => ({})),
  getReactNativePersistence: jest.fn(),
}));

jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(() => ({})),
  collection: jest.fn(),
  getDocs: jest.fn(),
}));

jest.mock('@react-native-async-storage/async-storage', () => ({}));

// ─── Imports después de los mocks ────────────────────────────────────────────

const { getDocs } = require('firebase/firestore');
const { fetchMenu } = require('../src/features/products/services/productService');

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const mockProducts = [
  { id: '1', name: 'La Perdición',      price: '18500 COP', category: 'BURGERS',   featured: true  },
  { id: '2', name: 'Gusto Infernal',    price: '32900 COP', category: 'BURGERS',   featured: false },
  { id: '3', name: 'Nachos del Diablo', price: '12000 COP', category: 'ENTRANTES', featured: false },
  { id: '4', name: 'Dulce Castigo',     price: '9500 COP',  category: 'POSTRES',   featured: false },
  { id: '5', name: 'Agua Bendita',      price: '4000 COP',  category: 'BEBIDAS',   featured: false },
];

// ─── Réplica de la lógica pura de agrupación ─────────────────────────────────

function groupByCategory(products) {
  return products.reduce((acc, product) => {
    const cat = product.category;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(product);
    return acc;
  }, {});
}

// ─── groupByCategory ──────────────────────────────────────────────────────────

describe('groupByCategory', () => {
  test('[+] agrupa correctamente productos por categoría', () => {
    const result = groupByCategory(mockProducts);
    expect(Object.keys(result)).toEqual(
      expect.arrayContaining(['BURGERS', 'ENTRANTES', 'POSTRES', 'BEBIDAS'])
    );
    expect(result['BURGERS']).toHaveLength(2);
    expect(result['ENTRANTES']).toHaveLength(1);
    expect(result['POSTRES']).toHaveLength(1);
    expect(result['BEBIDAS']).toHaveLength(1);
  });

  test('[+] devuelve objeto vacío para lista vacía', () => {
    expect(groupByCategory([])).toEqual({});
  });

  test('[+] un solo producto queda en su categoría', () => {
    const result = groupByCategory([mockProducts[0]]);
    expect(result['BURGERS']).toHaveLength(1);
    expect(result['BURGERS'][0].name).toBe('La Perdición');
  });

  test('[-] productos sin categoría se agrupan bajo "undefined"', () => {
    const sinCategoria = [{ id: '99', name: 'Misterio', price: '0 COP' }];
    const result = groupByCategory(sinCategoria);
    expect(result['undefined']).toHaveLength(1);
  });

  test('[+] preserva todos los campos del producto', () => {
    const result = groupByCategory(mockProducts);
    const burger = result['BURGERS'][0];
    expect(burger).toHaveProperty('id');
    expect(burger).toHaveProperty('name');
    expect(burger).toHaveProperty('price');
    expect(burger).toHaveProperty('featured');
  });
});

// ─── fetchMenu con mock de Firebase ──────────────────────────────────────────

describe('fetchMenu (con Firebase mockeado)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('[+] retorna productos agrupados por categoría', async () => {
    getDocs.mockResolvedValue({
      docs: mockProducts.map((p) => ({
        id: p.id,
        data: () => ({
          name: p.name,
          price: p.price,
          category: p.category,
          featured: p.featured,
        }),
      })),
    });

    const result = await fetchMenu();

    expect(result).toHaveProperty('BURGERS');
    expect(result['BURGERS']).toHaveLength(2);
    expect(result).toHaveProperty('ENTRANTES');
    expect(result).toHaveProperty('POSTRES');
    expect(result).toHaveProperty('BEBIDAS');
  });

  test('[+] retorna objeto vacío si no hay productos en Firestore', async () => {
    getDocs.mockResolvedValue({ docs: [] });

    const result = await fetchMenu();

    expect(result).toEqual({});
  });

  test('[-] lanza error si Firestore falla', async () => {
    getDocs.mockRejectedValue(new Error('Firestore no disponible'));

    await expect(fetchMenu()).rejects.toThrow('Firestore no disponible');
  });
});

// ─── Reglas de negocio: productos destacados ──────────────────────────────────

describe('Reglas de negocio — productos destacados', () => {
  test('[+] filtra correctamente los productos destacados', () => {
    const featured = mockProducts.filter((p) => p.featured);
    expect(featured).toHaveLength(1);
    expect(featured[0].name).toBe('La Perdición');
  });

  test('[+] un producto sin campo featured no aparece como destacado', () => {
    const sinFeatured = { id: '10', name: 'Nuevo', price: '5000 COP', category: 'BEBIDAS' };
    expect(sinFeatured.featured).toBeUndefined();
    expect(Boolean(sinFeatured.featured)).toBe(false);
  });

  test('[+] las 4 categorías del menú están definidas', () => {
    const CATEGORIAS = ['BURGERS', 'ENTRANTES', 'POSTRES', 'BEBIDAS'];
    const result = groupByCategory(mockProducts);
    CATEGORIAS.forEach((cat) => {
      expect(result).toHaveProperty(cat);
    });
  });
});

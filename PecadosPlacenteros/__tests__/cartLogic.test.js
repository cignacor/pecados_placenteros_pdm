/**
 * Pruebas unitarias — Lógica del carrito (CartContext)
 *
 * Se prueban las funciones puras de negocio extraídas del contexto:
 * addItem, removeItem, updateQuantity, clearCart, total, count.
 *
 * No se monta ningún componente React; se replica la lógica directamente
 * para mantener las pruebas rápidas y sin dependencias nativas.
 */

// ─── Réplica de la lógica pura del CartContext ────────────────────────────────

function addItem(items, product) {
  const existing = items.find((i) => i.id === product.id);
  if (existing) {
    return items.map((i) =>
      i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
    );
  }
  return [...items, { ...product, quantity: 1 }];
}

function removeItem(items, id) {
  return items.filter((i) => i.id !== id);
}

function updateQuantity(items, id, quantity) {
  if (quantity <= 0) return removeItem(items, id);
  return items.map((i) => (i.id === id ? { ...i, quantity } : i));
}

function clearCart() {
  return [];
}

function calcTotal(items) {
  return items.reduce((sum, i) => {
    const price = parseFloat(i.price?.replace(/[^0-9.]/g, '')) || 0;
    return sum + price * i.quantity;
  }, 0);
}

function calcCount(items) {
  return items.reduce((sum, i) => sum + i.quantity, 0);
}

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const burger = { id: 'b1', name: 'La Perdición', price: '18500 COP', category: 'BURGERS' };
const postre = { id: 'p1', name: 'Dulce Castigo', price: '9500 COP', category: 'POSTRES' };

// ─── addItem ──────────────────────────────────────────────────────────────────

describe('addItem', () => {
  test('[+] agrega un producto nuevo con quantity 1', () => {
    const result = addItem([], burger);
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ id: 'b1', quantity: 1 });
  });

  test('[+] incrementa quantity si el producto ya existe', () => {
    const cart = addItem([], burger);
    const result = addItem(cart, burger);
    expect(result).toHaveLength(1);
    expect(result[0].quantity).toBe(2);
  });

  test('[+] agrega un segundo producto distinto sin afectar el primero', () => {
    const cart = addItem([], burger);
    const result = addItem(cart, postre);
    expect(result).toHaveLength(2);
    expect(result.find((i) => i.id === 'b1').quantity).toBe(1);
    expect(result.find((i) => i.id === 'p1').quantity).toBe(1);
  });

  test('[-] no modifica el array original (inmutabilidad)', () => {
    const original = [];
    addItem(original, burger);
    expect(original).toHaveLength(0);
  });
});

// ─── removeItem ───────────────────────────────────────────────────────────────

describe('removeItem', () => {
  test('[+] elimina el producto con el id indicado', () => {
    const cart = [{ ...burger, quantity: 2 }, { ...postre, quantity: 1 }];
    const result = removeItem(cart, 'b1');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('p1');
  });

  test('[+] devuelve el mismo array si el id no existe', () => {
    const cart = [{ ...burger, quantity: 1 }];
    const result = removeItem(cart, 'inexistente');
    expect(result).toHaveLength(1);
  });

  test('[-] no elimina nada de un carrito vacío', () => {
    const result = removeItem([], 'b1');
    expect(result).toHaveLength(0);
  });
});

// ─── updateQuantity ───────────────────────────────────────────────────────────

describe('updateQuantity', () => {
  test('[+] actualiza la cantidad de un producto existente', () => {
    const cart = [{ ...burger, quantity: 1 }];
    const result = updateQuantity(cart, 'b1', 5);
    expect(result[0].quantity).toBe(5);
  });

  test('[+] elimina el producto si la cantidad es 0', () => {
    const cart = [{ ...burger, quantity: 3 }];
    const result = updateQuantity(cart, 'b1', 0);
    expect(result).toHaveLength(0);
  });

  test('[-] elimina el producto si la cantidad es negativa', () => {
    const cart = [{ ...burger, quantity: 3 }];
    const result = updateQuantity(cart, 'b1', -1);
    expect(result).toHaveLength(0);
  });

  test('[-] no modifica otros productos al actualizar uno', () => {
    const cart = [{ ...burger, quantity: 1 }, { ...postre, quantity: 2 }];
    const result = updateQuantity(cart, 'b1', 4);
    expect(result.find((i) => i.id === 'p1').quantity).toBe(2);
  });
});

// ─── clearCart ────────────────────────────────────────────────────────────────

describe('clearCart', () => {
  test('[+] vacía el carrito con productos', () => {
    expect(clearCart()).toEqual([]);
  });

  test('[+] vaciar un carrito ya vacío devuelve array vacío', () => {
    expect(clearCart()).toHaveLength(0);
  });
});

// ─── calcTotal ────────────────────────────────────────────────────────────────

describe('calcTotal', () => {
  test('[+] calcula el total correctamente con múltiples productos', () => {
    const cart = [
      { ...burger, quantity: 2 }, // 18500 × 2 = 37000
      { ...postre, quantity: 1 }, // 9500  × 1 = 9500
    ];
    expect(calcTotal(cart)).toBe(46500);
  });

  test('[+] devuelve 0 para carrito vacío', () => {
    expect(calcTotal([])).toBe(0);
  });

  test('[+] ignora precio malformado y lo trata como 0', () => {
    const cart = [{ id: 'x1', name: 'Test', price: 'GRATIS', quantity: 3 }];
    expect(calcTotal(cart)).toBe(0);
  });

  test('[-] precio undefined no rompe el cálculo', () => {
    const cart = [{ id: 'x2', name: 'Sin precio', quantity: 2 }];
    expect(calcTotal(cart)).toBe(0);
  });
});

// ─── calcCount ────────────────────────────────────────────────────────────────

describe('calcCount', () => {
  test('[+] suma las cantidades de todos los productos', () => {
    const cart = [
      { ...burger, quantity: 3 },
      { ...postre, quantity: 2 },
    ];
    expect(calcCount(cart)).toBe(5);
  });

  test('[+] devuelve 0 para carrito vacío', () => {
    expect(calcCount([])).toBe(0);
  });
});

/**
 * Pruebas unitarias — Validaciones de autenticación y reglas de negocio
 *
 * Se prueban las validaciones de registro/login y las reglas de negocio
 * de roles de usuario sin conectarse a Firebase (lógica pura).
 */

// ─── Validaciones de registro (réplica de RegisterScreen) ────────────────────

function validateRegister(name, email, password, confirmPassword) {
  const errors = [];

  if (!name || name.trim().length < 2) {
    errors.push('El nombre debe tener al menos 2 caracteres.');
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    errors.push('El correo electrónico no es válido.');
  }

  if (!password || password.length < 6) {
    errors.push('La contraseña debe tener al menos 6 caracteres.');
  }

  if (password !== confirmPassword) {
    errors.push('Las contraseñas no coinciden.');
  }

  return errors;
}

// ─── Validaciones de login ────────────────────────────────────────────────────

function validateLogin(email, password) {
  const errors = [];

  if (!email || !email.includes('@')) {
    errors.push('Ingresa un correo válido.');
  }

  if (!password || password.length === 0) {
    errors.push('La contraseña es requerida.');
  }

  return errors;
}

// ─── Reglas de negocio de roles ───────────────────────────────────────────────

function canAccessAdmin(role) {
  return role === 'admin';
}

function getDefaultRole() {
  return 'customer';
}

function buildUserProfile(name, email) {
  return {
    name,
    email,
    role: getDefaultRole(),
    createdAt: expect.any(String), // se valida en test con mock
  };
}

// ─── Validaciones de tarjeta (réplica de CheckoutModal / PerfilScreen) ────────

function validateCard(numTarjeta, titular, vencimiento, cvc) {
  const errors = [];
  const limpio = numTarjeta.replace(/\D/g, '');

  if (limpio.length !== 16) {
    errors.push('El número de tarjeta debe tener 16 dígitos.');
  }

  if (!titular || !titular.trim()) {
    errors.push('El nombre del titular es requerido.');
  }

  if (!/^\d{2}\/\d{2}$/.test(vencimiento)) {
    errors.push('El vencimiento debe tener el formato MM/AA.');
  }

  if (!cvc || cvc.length < 3) {
    errors.push('El CVC debe tener 3 o 4 dígitos.');
  }

  return errors;
}

// ─── validateRegister ─────────────────────────────────────────────────────────

describe('validateRegister', () => {
  test('[+] datos válidos no generan errores', () => {
    const errors = validateRegister('Ana García', 'ana@mail.com', 'secret123', 'secret123');
    expect(errors).toHaveLength(0);
  });

  test('[-] nombre vacío genera error', () => {
    const errors = validateRegister('', 'ana@mail.com', 'secret123', 'secret123');
    expect(errors).toContain('El nombre debe tener al menos 2 caracteres.');
  });

  test('[-] nombre de 1 carácter genera error', () => {
    const errors = validateRegister('A', 'ana@mail.com', 'secret123', 'secret123');
    expect(errors).toContain('El nombre debe tener al menos 2 caracteres.');
  });

  test('[-] email sin @ genera error', () => {
    const errors = validateRegister('Ana', 'correo-invalido', 'secret123', 'secret123');
    expect(errors).toContain('El correo electrónico no es válido.');
  });

  test('[-] email vacío genera error', () => {
    const errors = validateRegister('Ana', '', 'secret123', 'secret123');
    expect(errors).toContain('El correo electrónico no es válido.');
  });

  test('[-] contraseña menor a 6 caracteres genera error', () => {
    const errors = validateRegister('Ana', 'ana@mail.com', '123', '123');
    expect(errors).toContain('La contraseña debe tener al menos 6 caracteres.');
  });

  test('[-] contraseñas que no coinciden generan error', () => {
    const errors = validateRegister('Ana', 'ana@mail.com', 'secret123', 'diferente');
    expect(errors).toContain('Las contraseñas no coinciden.');
  });

  test('[-] múltiples campos inválidos generan múltiples errores', () => {
    const errors = validateRegister('', 'no-email', '123', 'abc');
    expect(errors.length).toBeGreaterThanOrEqual(3);
  });
});

// ─── validateLogin ────────────────────────────────────────────────────────────

describe('validateLogin', () => {
  test('[+] credenciales válidas no generan errores', () => {
    const errors = validateLogin('ana@mail.com', 'secret123');
    expect(errors).toHaveLength(0);
  });

  test('[-] email sin @ genera error', () => {
    const errors = validateLogin('correo-invalido', 'secret123');
    expect(errors).toContain('Ingresa un correo válido.');
  });

  test('[-] contraseña vacía genera error', () => {
    const errors = validateLogin('ana@mail.com', '');
    expect(errors).toContain('La contraseña es requerida.');
  });

  test('[-] ambos campos vacíos generan dos errores', () => {
    const errors = validateLogin('', '');
    expect(errors).toHaveLength(2);
  });
});

// ─── Reglas de negocio: roles ─────────────────────────────────────────────────

describe('Reglas de negocio — roles de usuario', () => {
  test('[+] rol "admin" puede acceder al panel de administración', () => {
    expect(canAccessAdmin('admin')).toBe(true);
  });

  test('[-] rol "customer" no puede acceder al panel de administración', () => {
    expect(canAccessAdmin('customer')).toBe(false);
  });

  test('[-] rol vacío no puede acceder al panel de administración', () => {
    expect(canAccessAdmin('')).toBe(false);
  });

  test('[-] rol undefined no puede acceder al panel de administración', () => {
    expect(canAccessAdmin(undefined)).toBe(false);
  });

  test('[+] el rol por defecto al registrarse es "customer"', () => {
    expect(getDefaultRole()).toBe('customer');
  });
});

// ─── validateCard ─────────────────────────────────────────────────────────────

describe('validateCard', () => {
  test('[+] tarjeta válida no genera errores', () => {
    const errors = validateCard('1234-5678-9012-3456', 'ANA GARCIA', '12/27', '123');
    expect(errors).toHaveLength(0);
  });

  test('[+] acepta CVC de 4 dígitos', () => {
    const errors = validateCard('1234567890123456', 'ANA GARCIA', '12/27', '1234');
    expect(errors).toHaveLength(0);
  });

  test('[-] número con menos de 16 dígitos genera error', () => {
    const errors = validateCard('1234-5678', 'ANA GARCIA', '12/27', '123');
    expect(errors).toContain('El número de tarjeta debe tener 16 dígitos.');
  });

  test('[-] titular vacío genera error', () => {
    const errors = validateCard('1234567890123456', '', '12/27', '123');
    expect(errors).toContain('El nombre del titular es requerido.');
  });

  test('[-] vencimiento con formato incorrecto genera error', () => {
    const errors = validateCard('1234567890123456', 'ANA GARCIA', '1227', '123');
    expect(errors).toContain('El vencimiento debe tener el formato MM/AA.');
  });

  test('[-] CVC de 2 dígitos genera error', () => {
    const errors = validateCard('1234567890123456', 'ANA GARCIA', '12/27', '12');
    expect(errors).toContain('El CVC debe tener 3 o 4 dígitos.');
  });

  test('[-] todos los campos inválidos generan múltiples errores', () => {
    const errors = validateCard('123', '', 'ABCD', '1');
    expect(errors.length).toBe(4);
  });
});

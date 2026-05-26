/**
 * Pruebas unitarias — Validaciones de reservas (ReservarScreen)
 *
 * Se prueban las reglas de negocio de disponibilidad de mesas,
 * solapamiento de horarios y validaciones de formulario.
 */

// ─── Réplica de helpers de ReservarScreen ────────────────────────────────────

function horaAMinutos(hora) {
  const [h, m] = hora.split(':').map(Number);
  const hNorm = h < 4 ? h + 24 : h;
  return hNorm * 60 + m;
}

function seSolapa(horaEntradaReserva, horaSalidaReserva, horaConsulta) {
  const entrada  = horaAMinutos(horaEntradaReserva);
  const salida   = horaAMinutos(horaSalidaReserva);
  const consulta = horaAMinutos(horaConsulta);
  return consulta >= entrada && consulta < salida;
}

function horasDisponiblesSalida(horaEntrada) {
  const orden = ['18:00','19:00','20:00','21:00','22:00','23:00','00:00','01:00','02:00','03:00'];
  if (!horaEntrada) return [];
  const idx = orden.indexOf(horaEntrada);
  if (idx === -1) return orden.slice(1, 4);
  const fin = Math.min(idx + 4, orden.length);
  return orden.slice(idx + 1, fin);
}

function esMiercoles(anio, mes, dia) {
  return new Date(anio, mes, dia).getDay() === 3;
}

function validateReserva(mesaSeleccionada, comensales) {
  if (!mesaSeleccionada) return 'Selecciona una mesa antes de confirmar.';
  if (comensales > mesaSeleccionada.asientos) {
    return `La mesa ${mesaSeleccionada.id} tiene capacidad para ${mesaSeleccionada.asientos} personas.`;
  }
  return null;
}

// ─── seSolapa ─────────────────────────────────────────────────────────────────

describe('seSolapa — solapamiento de horarios', () => {
  test('[+] detecta solapamiento cuando la consulta cae dentro del rango', () => {
    expect(seSolapa('19:00', '21:00', '20:00')).toBe(true);
  });

  test('[+] detecta solapamiento en el límite de entrada exacto', () => {
    expect(seSolapa('19:00', '21:00', '19:00')).toBe(true);
  });

  test('[-] no hay solapamiento cuando la consulta es igual a la hora de salida', () => {
    expect(seSolapa('19:00', '21:00', '21:00')).toBe(false);
  });

  test('[-] no hay solapamiento cuando la consulta es antes del rango', () => {
    expect(seSolapa('20:00', '22:00', '19:00')).toBe(false);
  });

  test('[-] no hay solapamiento cuando la consulta es después del rango', () => {
    expect(seSolapa('19:00', '21:00', '22:00')).toBe(false);
  });

  test('[+] maneja correctamente horarios que cruzan medianoche (23:00 → 01:00)', () => {
    expect(seSolapa('23:00', '01:00', '00:00')).toBe(true);
  });

  test('[-] no solapa antes de medianoche si el rango empieza después', () => {
    expect(seSolapa('23:00', '01:00', '22:00')).toBe(false);
  });
});

// ─── horasDisponiblesSalida ───────────────────────────────────────────────────

describe('horasDisponiblesSalida', () => {
  test('[+] retorna hasta 3 opciones de salida para hora de entrada 19:00', () => {
    const opciones = horasDisponiblesSalida('19:00');
    expect(opciones).toEqual(['20:00', '21:00', '22:00']);
  });

  test('[+] retorna opciones correctas para entrada 22:00', () => {
    const opciones = horasDisponiblesSalida('22:00');
    expect(opciones).toEqual(['23:00', '00:00', '01:00']);
  });

  test('[+] retorna opciones correctas para entrada 01:00 (última hora)', () => {
    const opciones = horasDisponiblesSalida('01:00');
    expect(opciones).toEqual(['02:00', '03:00']);
  });

  test('[-] retorna array vacío si no se pasa hora de entrada', () => {
    expect(horasDisponiblesSalida(null)).toEqual([]);
    expect(horasDisponiblesSalida('')).toEqual([]);
  });

  test('[-] hora de entrada no reconocida retorna opciones por defecto', () => {
    const opciones = horasDisponiblesSalida('15:00');
    expect(opciones.length).toBeGreaterThan(0);
  });
});

// ─── esMiercoles ─────────────────────────────────────────────────────────────

describe('esMiercoles — días cerrados', () => {
  test('[+] identifica correctamente un miércoles', () => {
    // 28 de mayo de 2025 es miércoles
    expect(esMiercoles(2025, 4, 28)).toBe(true);
  });

  test('[-] un lunes no es miércoles', () => {
    // 26 de mayo de 2025 es lunes
    expect(esMiercoles(2025, 4, 26)).toBe(false);
  });

  test('[-] un domingo no es miércoles', () => {
    expect(esMiercoles(2025, 4, 25)).toBe(false);
  });
});

// ─── validateReserva ─────────────────────────────────────────────────────────

describe('validateReserva — reglas de negocio', () => {
  const mesa4 = { id: 'T-06', asientos: 4 };
  const mesa2 = { id: 'T-01', asientos: 2 };

  test('[+] reserva válida no retorna error', () => {
    expect(validateReserva(mesa4, 3)).toBeNull();
  });

  test('[+] comensales igual a la capacidad máxima es válido', () => {
    expect(validateReserva(mesa4, 4)).toBeNull();
  });

  test('[-] sin mesa seleccionada retorna mensaje de error', () => {
    expect(validateReserva(null, 2)).toBe('Selecciona una mesa antes de confirmar.');
  });

  test('[-] comensales mayor a la capacidad retorna error de capacidad', () => {
    const error = validateReserva(mesa2, 5);
    expect(error).toContain('T-01');
    expect(error).toContain('2 personas');
  });

  test('[-] 1 comensal en mesa de 2 es válido', () => {
    expect(validateReserva(mesa2, 1)).toBeNull();
  });
});

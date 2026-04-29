import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { collection, addDoc } from 'firebase/firestore';
import { auth, db } from '../../../api/firebaseConfig';

// ─── Constantes ────────────────────────────────────────────────────────────────
const DIAS = ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB'];
const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];
const HORAS = ['18:00', '19:00', '20:00', '21:00', '22:00', '23:00', '00:00', '01:00'];

// ─── Layout del restaurante ────────────────────────────────────────────────────
// Cada zona agrupa mesas con su posición visual en el plano
const ZONAS = [
  {
    id: 'ventana',
    label: 'Zona Ventana',
    tipo: 'fila',
    mesas: [
      { id: 'T-01', asientos: 2 },
      { id: 'T-02', asientos: 2 },
      { id: 'T-03', asientos: 2 },
      { id: 'T-04', asientos: 2 },
      { id: 'T-05', asientos: 2 },
    ],
  },
  {
    id: 'salon',
    label: 'Salón Principal',
    tipo: 'grid',
    // columnas: [izquierda, centro, derecha]
    columnas: [
      // Columna izquierda — 3 mesas redondas de 4
      [
        { id: 'T-06', asientos: 4 },
        { id: 'T-07', asientos: 4 },
        { id: 'T-08', asientos: 4 },
      ],
      // Columna centro — 2 mesas redondas de 4
      [
        { id: 'T-09', asientos: 4 },
        { id: 'T-10', asientos: 4 },
        null, // espacio vacío
      ],
      // Columna derecha — booths rectangulares de 6
      [
        { id: 'T-15', asientos: 6, tipo: 'booth' },
        { id: 'T-16', asientos: 6, tipo: 'booth' },
        { id: 'T-17', asientos: 6, tipo: 'booth' },
        { id: 'T-18', asientos: 6, tipo: 'booth' },
      ],
    ],
  },
  {
    id: 'fondo',
    label: 'Zona Fondo',
    tipo: 'fila',
    mesas: [
      { id: 'T-11', asientos: 2 },
      { id: 'T-12', asientos: 2 },
      { id: 'T-13', asientos: 2 },
      { id: 'T-14', asientos: 2 },
    ],
  },
];

// Lista plana de todas las mesas (para validación de comensales)
const TODAS_LAS_MESAS = ZONAS.flatMap(z =>
  z.tipo === 'fila'
    ? z.mesas
    : z.columnas.flat().filter(Boolean)
);

// ─── Helpers ───────────────────────────────────────────────────────────────────
function diasEnMes(anio, mes) {
  return new Date(anio, mes + 1, 0).getDate();
}
function primerDiaSemana(anio, mes) {
  return new Date(anio, mes, 1).getDay();
}
function formatearFecha(fecha) {
  return `${DIAS[fecha.getDay()]} ${fecha.getDate()} ${MESES[fecha.getMonth()]}`;
}

// ─── Componente Mesa Circular ──────────────────────────────────────────────────
function MesaCirculo({ mesa, seleccionada, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.mesaCirculo, seleccionada && styles.mesaSeleccionada]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <Text style={[styles.mesaId, seleccionada && styles.mesaIdSel]}>{mesa.id}</Text>
      <Text style={[styles.mesaAsientos, seleccionada && styles.mesaAsientosSel]}>
        {mesa.asientos} asientos
      </Text>
    </TouchableOpacity>
  );
}

// ─── Componente Mesa Booth (rectangular) ──────────────────────────────────────
function MesaBooth({ mesa, seleccionada, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.mesaBooth, seleccionada && styles.mesaSeleccionada]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <Text style={[styles.mesaId, seleccionada && styles.mesaIdSel]}>{mesa.id}</Text>
      <Text style={[styles.mesaAsientos, seleccionada && styles.mesaAsientosSel]}>
        {mesa.asientos} asientos
      </Text>
    </TouchableOpacity>
  );
}

// ─── Componente principal ──────────────────────────────────────────────────────
export default function ReservarScreen() {
  const hoy = new Date();

  const [anio, setAnio] = useState(hoy.getFullYear());
  const [mes, setMes] = useState(hoy.getMonth());
  const [diaSeleccionado, setDiaSeleccionado] = useState(hoy.getDate());
  const [horaSeleccionada, setHoraSeleccionada] = useState('19:00');
  const [mesaSeleccionada, setMesaSeleccionada] = useState(null);
  const [comensales, setComensales] = useState(2);
  const [cargando, setCargando] = useState(false);

  // Grilla del calendario
  const celdas = useMemo(() => {
    const total = diasEnMes(anio, mes);
    const inicio = primerDiaSemana(anio, mes);
    const grid = [];
    for (let i = 0; i < inicio; i++) grid.push(null);
    for (let d = 1; d <= total; d++) grid.push(d);
    return grid;
  }, [anio, mes]);

  const fechaSeleccionada = new Date(anio, mes, diaSeleccionado);

  const esPasado = (dia) => {
    const f = new Date(anio, mes, dia);
    f.setHours(0, 0, 0, 0);
    const h = new Date();
    h.setHours(0, 0, 0, 0);
    return f < h;
  };

  // Miércoles = día 3 de la semana (0=Dom)
  const esMiercoles = (dia) => new Date(anio, mes, dia).getDay() === 3;
  const diaDeshabilitado = (dia) => esPasado(dia) || esMiercoles(dia);

  const mesAnterior = () => {
    if (mes === 0) { setMes(11); setAnio(a => a - 1); }
    else setMes(m => m - 1);
    setDiaSeleccionado(1);
  };
  const mesSiguiente = () => {
    if (mes === 11) { setMes(0); setAnio(a => a + 1); }
    else setMes(m => m + 1);
    setDiaSeleccionado(1);
  };

  const toggleMesa = (mesa) => {
    setMesaSeleccionada(prev => {
      if (prev?.id === mesa.id) return null;
      // Al cambiar de mesa, ajustar comensales si supera la nueva capacidad
      setComensales(c => Math.min(c, mesa.asientos));
      return mesa;
    });
  };

  // Confirmar reserva
  const confirmarReserva = async () => {
    if (!mesaSeleccionada) {
      Alert.alert('Mesa requerida', 'Por favor selecciona una mesa antes de confirmar.');
      return;
    }
    if (comensales > mesaSeleccionada.asientos) {
      Alert.alert(
        'Capacidad excedida',
        `La mesa ${mesaSeleccionada.id} tiene capacidad para ${mesaSeleccionada.asientos} personas.`
      );
      return;
    }
    const usuario = auth.currentUser;
    if (!usuario) {
      Alert.alert('Sesión requerida', 'Debes iniciar sesión para hacer una reserva.');
      return;
    }

    setCargando(true);
    try {
      await addDoc(collection(db, 'reservas'), {
        uid: usuario.uid,
        email: usuario.email,
        fecha: `${anio}-${String(mes + 1).padStart(2, '0')}-${String(diaSeleccionado).padStart(2, '0')}`,
        hora: horaSeleccionada,
        mesa: mesaSeleccionada.id,
        asientos: mesaSeleccionada.asientos,
        comensales,
        creadoEn: new Date().toISOString(),
      });
      Alert.alert(
        '¡Reserva confirmada! ✦',
        `Mesa ${mesaSeleccionada.id} · ${formatearFecha(fechaSeleccionada)} · ${horaSeleccionada} · ${comensales} personas`,
        [{ text: 'Perfecto', onPress: () => setMesaSeleccionada(null) }]
      );
    } catch (e) {
      Alert.alert('Error', 'No se pudo guardar la reserva. Inténtalo de nuevo.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.contenido}>

      {/* ── PASO 1: Calendario ── */}
      <Text style={styles.paso}>PASO 1 DE 3</Text>
      <Text style={styles.titulo}>Elige Tu Momento</Text>

      <View style={styles.tarjeta}>
        <View style={styles.cabeceraCalendario}>
          <TouchableOpacity onPress={mesAnterior} style={styles.btnNav}>
            <Text style={styles.navFlecha}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.mesAnio}>{MESES[mes]} {anio}</Text>
          <TouchableOpacity onPress={mesSiguiente} style={styles.btnNav}>
            <Text style={styles.navFlecha}>›</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.filaDias}>
          {DIAS.map(d => (
            <Text key={d} style={styles.diaSemana}>{d}</Text>
          ))}
        </View>

        <View style={styles.grilla}>
          {celdas.map((dia, i) => {
            if (!dia) return <View key={`v-${i}`} style={styles.celda} />;
            const pasado = esPasado(dia);
            const miercoles = esMiercoles(dia);
            const deshabilitado = pasado || miercoles;
            const seleccionado = dia === diaSeleccionado;
            return (
              <TouchableOpacity
                key={dia}
                style={[
                  styles.celda,
                  seleccionado && styles.celdaSeleccionada,
                  deshabilitado && styles.celdaPasada,
                  miercoles && !seleccionado && styles.celdaMiercoles,
                ]}
                onPress={() => !deshabilitado && setDiaSeleccionado(dia)}
                disabled={deshabilitado}
              >
                <Text style={[
                  styles.numeroDia,
                  seleccionado && styles.numeroDiaSeleccionado,
                  deshabilitado && styles.numeroDiaPasado,
                ]}>
                  {dia}
                </Text>
                {miercoles && <Text style={styles.cerradoLabel}>cerrado</Text>}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* ── PASO 2: Hora ── */}
      <Text style={styles.subtitulo}>La Hora del Deseo</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horasScroll}>
        {HORAS.map(h => (
          <TouchableOpacity
            key={h}
            style={[styles.chipHora, horaSeleccionada === h && styles.chipHoraActivo]}
            onPress={() => setHoraSeleccionada(h)}
          >
            <Text style={[styles.textoHora, horaSeleccionada === h && styles.textoHoraActivo]}>{h}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* ── PASO 3: Mesa ── */}
      <Text style={styles.subtitulo}>Elige Tu Templo</Text>

      <View style={styles.tarjeta}>

        {/* ── Zona Ventana — 5 mesas de 2 en fila ── */}
        <Text style={styles.zonaLabel}>— Zona Ventana —</Text>
        <View style={styles.filaVentana}>
          {ZONAS[0].mesas.map(mesa => (
            <MesaCirculo
              key={mesa.id}
              mesa={mesa}
              seleccionada={mesaSeleccionada?.id === mesa.id}
              onPress={() => toggleMesa(mesa)}
            />
          ))}
        </View>

        <View style={styles.separador} />

        {/* ── Salón Principal — grid 3 columnas ── */}
        <Text style={styles.zonaLabel}>— Salón Principal —</Text>
        <View style={styles.salonGrid}>

          {/* Columna izquierda: 3 mesas redondas de 4 */}
          <View style={styles.columnaGrid}>
            {ZONAS[1].columnas[0].map(mesa => (
              <MesaCirculo
                key={mesa.id}
                mesa={mesa}
                seleccionada={mesaSeleccionada?.id === mesa.id}
                onPress={() => toggleMesa(mesa)}
              />
            ))}
          </View>

          {/* Columna centro: 2 mesas redondas de 4 + espacio */}
          <View style={styles.columnaGrid}>
            {ZONAS[1].columnas[1].map((mesa, i) =>
              mesa
                ? <MesaCirculo
                    key={mesa.id}
                    mesa={mesa}
                    seleccionada={mesaSeleccionada?.id === mesa.id}
                    onPress={() => toggleMesa(mesa)}
                  />
                : <View key={`esp-${i}`} style={styles.espacioMesa} />
            )}
          </View>

          {/* Columna derecha: 4 booths rectangulares de 6 */}
          <View style={styles.columnaGrid}>
            {ZONAS[1].columnas[2].map(mesa => (
              <MesaBooth
                key={mesa.id}
                mesa={mesa}
                seleccionada={mesaSeleccionada?.id === mesa.id}
                onPress={() => toggleMesa(mesa)}
              />
            ))}
          </View>
        </View>

        <View style={styles.separador} />

        {/* ── Zona Fondo — 4 mesas de 2 en 2 filas ── */}
        <Text style={styles.zonaLabel}>— Zona Fondo —</Text>
        <View style={styles.filaFondo}>
          {ZONAS[2].mesas.map(mesa => (
            <MesaCirculo
              key={mesa.id}
              mesa={mesa}
              seleccionada={mesaSeleccionada?.id === mesa.id}
              onPress={() => toggleMesa(mesa)}
            />
          ))}
        </View>

        {/* Leyenda */}
        <View style={styles.leyenda}>
          <View style={styles.leyendaItem}>
            <View style={[styles.puntito, { backgroundColor: '#3d2a1a' }]} />
            <Text style={styles.textoLeyenda}>DISPONIBLE</Text>
          </View>
          <View style={styles.leyendaItem}>
            <View style={[styles.puntito, { backgroundColor: '#cc0000' }]} />
            <Text style={styles.textoLeyenda}>SELECCIONADA</Text>
          </View>
        </View>
      </View>

      {/* ── Comensales ── */}
      {!mesaSeleccionada ? (
        <View style={styles.avisoMesa}>
          <Text style={styles.avisoMesaIcono}>⚠</Text>
          <Text style={styles.avisoMesaTexto}>Selecciona una mesa para elegir el número de personas</Text>
        </View>
      ) : (
        <View style={styles.filaComensales}>
          <View>
            <Text style={styles.labelComensales}>Número de personas</Text>
            <Text style={styles.capacidadHint}>Máx. {mesaSeleccionada.asientos} en mesa {mesaSeleccionada.id}</Text>
          </View>
          <View style={styles.controlComensales}>
            <TouchableOpacity
              style={styles.btnComensales}
              onPress={() => setComensales(c => Math.max(1, c - 1))}
            >
              <Text style={styles.textoControl}>−</Text>
            </TouchableOpacity>
            <Text style={styles.numComensales}>{comensales}</Text>
            <TouchableOpacity
              style={[
                styles.btnComensales,
                comensales >= mesaSeleccionada.asientos && styles.btnComensalesDeshabilitado,
              ]}
              onPress={() => setComensales(c => Math.min(mesaSeleccionada.asientos, c + 1))}
              disabled={comensales >= mesaSeleccionada.asientos}
            >
              <Text style={[
                styles.textoControl,
                comensales >= mesaSeleccionada.asientos && styles.textoControlDeshabilitado,
              ]}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* ── Resumen ── */}
      {mesaSeleccionada && (
        <View style={styles.resumen}>
          <View>
            <Text style={styles.labelResumen}>TU RESERVA</Text>
            <Text style={styles.valorResumen}>
              {formatearFecha(fechaSeleccionada)}, {horaSeleccionada}
            </Text>
            <Text style={styles.valorResumen}>Mesa {mesaSeleccionada.id}</Text>
          </View>
          <View style={styles.resumenDerecha}>
            <Text style={styles.labelResumen}>PERSONAS</Text>
            <Text style={styles.valorResumen}>{comensales} / {mesaSeleccionada.asientos}</Text>
            <Text style={styles.capacidadLabel}>capacidad</Text>
          </View>
        </View>
      )}

      {/* ── Botón confirmar ── */}
      <TouchableOpacity
        style={[styles.btnConfirmar, cargando && styles.btnDeshabilitado]}
        onPress={confirmarReserva}
        disabled={cargando}
      >
        {cargando
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.textoConfirmar}>CONFIRMAR RESERVA ✦</Text>
        }
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

// ─── Estilos ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: '#1a0000' },
  contenido: { padding: 20, paddingTop: 16 },

  // Encabezados
  paso: { color: '#cc0000', fontSize: 11, letterSpacing: 2, fontWeight: '600', marginBottom: 4 },
  titulo: { color: '#fff', fontSize: 26, fontFamily: 'PlayfairDisplay_700Bold', marginBottom: 16 },
  subtitulo: { color: '#fff', fontSize: 20, fontFamily: 'PlayfairDisplay_700Bold', marginTop: 24, marginBottom: 12 },

  // Tarjeta contenedor
  tarjeta: { backgroundColor: '#2a0a0a', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#3d0000' },

  // Calendario
  cabeceraCalendario: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  btnNav: { padding: 8 },
  navFlecha: { color: '#cc0000', fontSize: 22, fontWeight: 'bold' },
  mesAnio: { color: '#fff', fontSize: 16, fontFamily: 'PlayfairDisplay_700Bold' },
  filaDias: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 8 },
  diaSemana: { color: '#888', fontSize: 11, fontWeight: '600', width: 36, textAlign: 'center' },
  grilla: { flexDirection: 'row', flexWrap: 'wrap' },
  celda: { width: '14.28%', aspectRatio: 1, alignItems: 'center', justifyContent: 'center' },
  celdaSeleccionada: { backgroundColor: '#cc0000', borderRadius: 50 },
  celdaPasada: { opacity: 0.3 },
  celdaMiercoles: { opacity: 0.35 },
  numeroDia: { color: '#ddd', fontSize: 14 },
  numeroDiaSeleccionado: { color: '#fff', fontWeight: 'bold' },
  numeroDiaPasado: { color: '#555' },
  cerradoLabel: { color: '#cc0000', fontSize: 6, letterSpacing: 0.5, marginTop: -2 },

  // Horas
  horasScroll: { marginBottom: 4 },
  chipHora: {
    borderWidth: 1, borderColor: '#3d0000', borderRadius: 10,
    paddingHorizontal: 20, paddingVertical: 12, marginRight: 10,
    backgroundColor: '#2a0a0a',
  },
  chipHoraActivo: { backgroundColor: '#cc0000', borderColor: '#cc0000' },
  textoHora: { color: '#aaa', fontSize: 15, fontWeight: '600' },
  textoHoraActivo: { color: '#fff' },

  // Zonas del mapa
  zonaLabel: {
    color: '#666', fontSize: 10, letterSpacing: 2, textAlign: 'center',
    marginBottom: 12, marginTop: 4,
  },
  separador: { height: 1, backgroundColor: '#3d0000', marginVertical: 16 },

  // Zona Ventana — fila de 5
  filaVentana: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  // Salón — grid 3 columnas
  salonGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  columnaGrid: {
    flex: 1,
    alignItems: 'center',
    gap: 12,
  },
  espacioMesa: { width: 72, height: 72 },

  // Zona Fondo — 4 mesas en fila
  filaFondo: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },

  // Mesa circular (estilo original)
  mesaCirculo: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: '#3d2a1a', borderWidth: 2, borderColor: '#5a4a3a',
    alignItems: 'center', justifyContent: 'center',
  },

  // Mesa booth (rectangular)
  mesaBooth: {
    width: 72, height: 52, borderRadius: 8,
    backgroundColor: '#3d2a1a', borderWidth: 2, borderColor: '#5a4a3a',
    alignItems: 'center', justifyContent: 'center',
  },

  // Estado seleccionada (compartido)
  mesaSeleccionada: { backgroundColor: '#cc0000', borderColor: '#ff4444' },
  mesaId: { color: '#ccc', fontSize: 11, fontWeight: 'bold' },
  mesaIdSel: { color: '#fff' },
  mesaAsientos: { color: '#777', fontSize: 9, marginTop: 1 },
  mesaAsientosSel: { color: '#ffcccc' },

  // Leyenda
  leyenda: { flexDirection: 'row', justifyContent: 'center', gap: 24, marginTop: 16 },
  leyendaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  puntito: { width: 10, height: 10, borderRadius: 5 },
  textoLeyenda: { color: '#888', fontSize: 11, letterSpacing: 1 },

  // Comensales
  avisoMesa: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    marginTop: 20, backgroundColor: '#2a0a0a', borderRadius: 12,
    padding: 16, borderWidth: 1, borderColor: '#3d0000',
  },
  avisoMesaIcono: { color: '#cc0000', fontSize: 16 },
  avisoMesaTexto: { color: '#888', fontSize: 13, flex: 1 },
  filaComensales: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginTop: 20, backgroundColor: '#2a0a0a', borderRadius: 12,
    padding: 16, borderWidth: 1, borderColor: '#3d0000',
  },
  labelComensales: { color: '#ccc', fontSize: 14 },
  capacidadHint: { color: '#666', fontSize: 11, marginTop: 3 },
  controlComensales: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  btnComensales: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#3d0000', alignItems: 'center', justifyContent: 'center',
  },
  btnComensalesDeshabilitado: { backgroundColor: '#1a0a0a', opacity: 0.4 },
  textoControl: { color: '#cc0000', fontSize: 20, fontWeight: 'bold', lineHeight: 22 },
  textoControlDeshabilitado: { color: '#555' },
  numComensales: { color: '#fff', fontSize: 18, fontWeight: 'bold', minWidth: 24, textAlign: 'center' },

  // Resumen
  resumen: {
    flexDirection: 'row', justifyContent: 'space-between',
    backgroundColor: '#2a0a0a', borderRadius: 12, padding: 16,
    marginTop: 16, borderWidth: 1, borderColor: '#cc0000',
  },
  resumenDerecha: { alignItems: 'flex-end' },
  labelResumen: { color: '#888', fontSize: 10, letterSpacing: 1.5, marginBottom: 4 },
  valorResumen: { color: '#fff', fontSize: 13, fontWeight: '600' },
  capacidadLabel: { color: '#666', fontSize: 10, marginTop: 2 },

  // Botón confirmar
  btnConfirmar: {
    backgroundColor: '#cc0000', borderRadius: 14, paddingVertical: 18,
    alignItems: 'center', marginTop: 20,
    shadowColor: '#cc0000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5, shadowRadius: 8,
    elevation: 6,
  },
  btnDeshabilitado: { opacity: 0.6 },
  textoConfirmar: { color: '#fff', fontSize: 15, fontWeight: 'bold', letterSpacing: 2 },
});

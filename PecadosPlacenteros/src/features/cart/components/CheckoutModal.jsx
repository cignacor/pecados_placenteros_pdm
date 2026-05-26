import { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, StyleSheet, Modal, TouchableOpacity,
  TextInput, ScrollView, TouchableWithoutFeedback, Alert,
  ActivityIndicator,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { auth, db } from '../../../api/firebaseConfig';

// ─── Búsqueda de direcciones por texto (Nominatim) ───────────────────────────
async function buscarDirecciones(texto) {
  try {
    const encoded = encodeURIComponent(texto);
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encoded}&limit=5&addressdetails=1`;
    const res = await fetch(url, { headers: { 'Accept-Language': 'es' } });
    const data = await res.json();
    return data.map(r => ({
      label: r.display_name,
      lat: parseFloat(r.lat),
      lon: parseFloat(r.lon),
    }));
  } catch {
    return [];
  }
}
async function coordsADireccion(lat, lon) {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`;
    const res = await fetch(url, { headers: { 'Accept-Language': 'es' } });
    const data = await res.json();
    return data.display_name || `${lat.toFixed(5)}, ${lon.toFixed(5)}`;
  } catch {
    return `${lat.toFixed(5)}, ${lon.toFixed(5)}`;
  }
}

// ─── Formateo tarjeta ─────────────────────────────────────────────────────────
const formatearNumTarjeta = (texto) => {
  const soloDigitos = texto.replace(/\D/g, '').slice(0, 16);
  return (soloDigitos.match(/.{1,4}/g) || []).join('-');
};
const formatearVencimiento = (texto) => {
  const d = texto.replace(/\D/g, '').slice(0, 4);
  return d.length <= 2 ? d : d.slice(0, 2) + '/' + d.slice(2);
};

// ─── Componente principal ─────────────────────────────────────────────────────
export default function CheckoutModal({ visible, onClose, total, onConfirm }) {
  const usuario = auth.currentUser;

  const [address, setAddress] = useState('');
  const [datosExtra, setDatosExtra] = useState('');
  const [markerCoord, setMarkerCoord] = useState(null);
  const [geocodificando, setGeocodificando] = useState(false);
  const [region, setRegion] = useState({
    latitude: 6.2442, longitude: -75.5812,
    latitudeDelta: 0.05, longitudeDelta: 0.05,
  });

  // Autocompletado
  const [sugerencias, setSugerencias] = useState([]);
  const [buscando, setBuscando] = useState(false);
  const debounceRef = useRef(null);

  // Pago
  const [metodoPago, setMetodoPago] = useState('card'); // 'card' | 'cash'
  const [tarjetas, setTarjetas] = useState([]);
  const [tarjetaSeleccionada, setTarjetaSeleccionada] = useState(null);
  const [cargandoTarjetas, setCargandoTarjetas] = useState(false);

  // Nueva tarjeta
  const [mostrarFormTarjeta, setMostrarFormTarjeta] = useState(false);
  const [numTarjeta, setNumTarjeta] = useState('');
  const [titular, setTitular] = useState('');
  const [vencimiento, setVencimiento] = useState('');
  const [cvc, setCvc] = useState('');
  const [guardandoTarjeta, setGuardandoTarjeta] = useState(false);

  // ── Cargar tarjetas del usuario ──
  const cargarTarjetas = useCallback(async () => {
    if (!usuario) return;
    setCargandoTarjetas(true);
    try {
      const q = query(collection(db, 'tarjetas'), where('uid', '==', usuario.uid));
      const snap = await getDocs(q);
      const lista = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setTarjetas(lista);
      if (lista.length > 0 && !tarjetaSeleccionada) {
        setTarjetaSeleccionada(lista[0]);
      }
    } catch {
      // silencioso
    } finally {
      setCargandoTarjetas(false);
    }
  }, [usuario, tarjetaSeleccionada]);

  useEffect(() => {
    if (visible) cargarTarjetas();
  }, [visible, cargarTarjetas]);

  // ── Toque en el mapa → geocodificar ──
  const handleMapPress = async (e) => {
    const coord = e.nativeEvent.coordinate;
    setMarkerCoord(coord);
    setSugerencias([]);
    setGeocodificando(true);
    const dir = await coordsADireccion(coord.latitude, coord.longitude);
    setAddress(dir);
    setGeocodificando(false);
  };

  // ── Cambio en el campo de dirección → buscar con debounce ──
  const handleAddressChange = (texto) => {
    setAddress(texto);
    setSugerencias([]);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (texto.trim().length < 4) { setBuscando(false); return; }
    setBuscando(true);
    debounceRef.current = setTimeout(async () => {
      const resultados = await buscarDirecciones(texto);
      setSugerencias(resultados);
      setBuscando(false);
    }, 600);
  };

  // ── Seleccionar sugerencia ──
  const seleccionarSugerencia = (sug) => {
    setAddress(sug.label);
    setSugerencias([]);
    const coord = { latitude: sug.lat, longitude: sug.lon };
    setMarkerCoord(coord);
    setRegion({ ...coord, latitudeDelta: 0.01, longitudeDelta: 0.01 });
  };

  // ── Guardar nueva tarjeta ──
  const guardarNuevaTarjeta = async () => {
    const limpio = numTarjeta.replace(/\D/g, '');
    if (limpio.length !== 16) {
      Alert.alert('Número inválido', 'El número de tarjeta debe tener 16 dígitos.');
      return;
    }
    if (!titular.trim()) {
      Alert.alert('Campo requerido', 'Ingresa el nombre del titular.');
      return;
    }
    if (!/^\d{2}\/\d{2}$/.test(vencimiento)) {
      Alert.alert('Formato inválido', 'El vencimiento debe ser MM/AA.');
      return;
    }
    if (cvc.length < 3) {
      Alert.alert('CVC inválido', 'El CVC debe tener 3 o 4 dígitos.');
      return;
    }
    setGuardandoTarjeta(true);
    try {
      const ultimos4 = limpio.slice(-4);
      const ref = await addDoc(collection(db, 'tarjetas'), {
        uid: usuario.uid,
        ultimos4,
        titular: titular.trim(),
        vencimiento,
        creadoEn: new Date().toISOString(),
      });
      const nueva = { id: ref.id, ultimos4, titular: titular.trim(), vencimiento };
      setTarjetas(prev => [...prev, nueva]);
      setTarjetaSeleccionada(nueva);
      setMostrarFormTarjeta(false);
      setNumTarjeta(''); setTitular(''); setVencimiento(''); setCvc('');
    } catch {
      Alert.alert('Error', 'No se pudo guardar la tarjeta.');
    } finally {
      setGuardandoTarjeta(false);
    }
  };

  // ── Confirmar pedido ──
  const handleConfirm = () => {
    if (!address && !markerCoord) {
      Alert.alert('Dirección requerida', 'Escribe una dirección o marca tu ubicación en el mapa.');
      return;
    }
    if (metodoPago === 'card' && !tarjetaSeleccionada) {
      Alert.alert('Tarjeta requerida', 'Selecciona una tarjeta o elige pago en efectivo.');
      return;
    }
    onConfirm({
      address,
      datosExtra,
      markerCoord,
      paymentMethod: metodoPago,
      tarjeta: metodoPago === 'card' ? tarjetaSeleccionada : null,
    });
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay} />
      </TouchableWithoutFeedback>

      <View style={styles.sheet}>
        <View style={styles.handle} />

        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>Confirmar Pedido</Text>

            {/* ── Dirección ── */}
            <Text style={styles.sectionLabel}>📍 Dirección de entrega</Text>
            <TextInput
              style={styles.input}
              placeholder="Escribe tu dirección..."
              placeholderTextColor="#555"
              value={address}
              onChangeText={handleAddressChange}
            />

            {/* Sugerencias de autocompletado */}
            {buscando && (
              <View style={styles.sugerenciasContainer}>
                <ActivityIndicator size="small" color="#cc0000" style={{ padding: 10 }} />
              </View>
            )}
            {!buscando && sugerencias.length > 0 && (
              <View style={styles.sugerenciasContainer}>
                {sugerencias.map((s, i) => (
                  <TouchableOpacity
                    key={i}
                    style={[styles.sugerenciaItem, i < sugerencias.length - 1 && styles.sugerenciaItemBorder]}
                    onPress={() => seleccionarSugerencia(s)}
                  >
                    <Text style={styles.sugerenciaIcono}>📍</Text>
                    <Text style={styles.sugerenciaTexto} numberOfLines={2}>{s.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <Text style={styles.hint}>O toca el mapa para marcar tu ubicación</Text>
            <MapView
              style={styles.map}
              region={region}
              onRegionChangeComplete={setRegion}
              onPress={handleMapPress}
            >
              {markerCoord && <Marker coordinate={markerCoord} pinColor="#cc0000" />}
            </MapView>

            {geocodificando && (
              <View style={styles.geocodificandoRow}>
                <ActivityIndicator size="small" color="#cc0000" />
                <Text style={styles.geocodificandoTexto}>Obteniendo dirección...</Text>
              </View>
            )}

            <TextInput
              style={[styles.input, { marginTop: 8, marginBottom: 16 }]}
              placeholder="Datos extra: puerta gris, apartamento 20..."
              placeholderTextColor="#555"
              value={datosExtra}
              onChangeText={setDatosExtra}
            />

            {/* ── Método de pago ── */}
            <Text style={styles.sectionLabel}>💳 Método de pago</Text>
            <View style={styles.paymentRow}>
              <TouchableOpacity
                style={[styles.paymentOption, metodoPago === 'card' && styles.paymentActive]}
                onPress={() => setMetodoPago('card')}
              >
                <Text style={styles.paymentIcon}>💳</Text>
                <Text style={[styles.paymentLabel, metodoPago === 'card' && styles.paymentLabelActive]}>
                  Tarjeta
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.paymentOption, metodoPago === 'cash' && styles.paymentActive]}
                onPress={() => setMetodoPago('cash')}
              >
                <Text style={styles.paymentIcon}>💵</Text>
                <Text style={[styles.paymentLabel, metodoPago === 'cash' && styles.paymentLabelActive]}>
                  Efectivo
                </Text>
              </TouchableOpacity>
            </View>

            {/* ── Selector de tarjeta ── */}
            {metodoPago === 'card' && (
              <View style={styles.tarjetasContainer}>
                {cargandoTarjetas ? (
                  <ActivityIndicator color="#cc0000" style={{ marginVertical: 12 }} />
                ) : (
                  <>
                    {tarjetas.length === 0 && !mostrarFormTarjeta && (
                      <Text style={styles.sinTarjetas}>No tienes tarjetas guardadas</Text>
                    )}

                    {/* Lista de tarjetas */}
                    {tarjetas.map(t => (
                      <TouchableOpacity
                        key={t.id}
                        style={[
                          styles.tarjetaOpcion,
                          tarjetaSeleccionada?.id === t.id && styles.tarjetaOpcionActiva,
                        ]}
                        onPress={() => { setTarjetaSeleccionada(t); setMostrarFormTarjeta(false); }}
                      >
                        <View style={styles.tarjetaRadio}>
                          {tarjetaSeleccionada?.id === t.id && <View style={styles.tarjetaRadioInner} />}
                        </View>
                        <Text style={styles.tarjetaIcono}>💳</Text>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.tarjetaNumero}>•••• •••• •••• {t.ultimos4}</Text>
                          <Text style={styles.tarjetaTitular}>{t.titular} · {t.vencimiento}</Text>
                        </View>
                      </TouchableOpacity>
                    ))}

                    {/* Formulario nueva tarjeta */}
                    {mostrarFormTarjeta ? (
                      <View style={styles.formNuevaTarjeta}>
                        <Text style={styles.formTitulo}>Nueva tarjeta</Text>

                        <Text style={styles.inputLabel}>Número de tarjeta</Text>
                        <TextInput
                          style={[styles.input, styles.inputTarjeta]}
                          value={numTarjeta}
                          onChangeText={t => setNumTarjeta(formatearNumTarjeta(t))}
                          placeholder="xxxx-xxxx-xxxx-xxxx"
                          placeholderTextColor="#555"
                          keyboardType="numeric"
                          maxLength={19}
                        />

                        <Text style={styles.inputLabel}>Titular</Text>
                        <TextInput
                          style={styles.input}
                          value={titular}
                          onChangeText={setTitular}
                          placeholder="Como aparece en la tarjeta"
                          placeholderTextColor="#555"
                          autoCapitalize="characters"
                        />

                        <View style={styles.filaDosCampos}>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.inputLabel}>Vencimiento</Text>
                            <TextInput
                              style={styles.input}
                              value={vencimiento}
                              onChangeText={t => setVencimiento(formatearVencimiento(t))}
                              placeholder="MM/AA"
                              placeholderTextColor="#555"
                              keyboardType="numeric"
                              maxLength={5}
                            />
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.inputLabel}>CVC</Text>
                            <TextInput
                              style={styles.input}
                              value={cvc}
                              onChangeText={t => setCvc(t.replace(/\D/g, '').slice(0, 4))}
                              placeholder="•••"
                              placeholderTextColor="#555"
                              keyboardType="numeric"
                              maxLength={4}
                              secureTextEntry
                            />
                          </View>
                        </View>

                        <View style={styles.filaBotones}>
                          <TouchableOpacity
                            style={styles.btnCancelar}
                            onPress={() => { setMostrarFormTarjeta(false); setNumTarjeta(''); setTitular(''); setVencimiento(''); setCvc(''); }}
                          >
                            <Text style={styles.btnCancelarTexto}>Cancelar</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.btnGuardar}
                            onPress={guardarNuevaTarjeta}
                            disabled={guardandoTarjeta}
                          >
                            {guardandoTarjeta
                              ? <ActivityIndicator color="#fff" size="small" />
                              : <Text style={styles.btnGuardarTexto}>Guardar</Text>
                            }
                          </TouchableOpacity>
                        </View>
                      </View>
                    ) : (
                      <TouchableOpacity
                        style={styles.btnAgregarTarjeta}
                        onPress={() => setMostrarFormTarjeta(true)}
                      >
                        <Text style={styles.btnAgregarTarjetaTexto}>+ Agregar nueva tarjeta</Text>
                      </TouchableOpacity>
                    )}
                  </>
                )}
              </View>
            )}

            {/* ── Total y confirmar ── */}
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total a pagar</Text>
              <Text style={styles.totalValue}>${total} COP</Text>
            </View>

            <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
              <Text style={styles.confirmText}>Confirmar Pedido ✦</Text>
            </TouchableOpacity>

            <View style={{ height: 30 }} />
          </ScrollView>
        </View>
    </Modal>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' },
  sheet: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#1a0000', borderTopLeftRadius: 24,
    borderTopRightRadius: 24, maxHeight: '92%',
    paddingHorizontal: 20, paddingTop: 12,
  },
  handle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: '#3a1010', alignSelf: 'center', marginBottom: 16,
  },
  title: { color: '#fff', fontSize: 20, fontFamily: 'PlayfairDisplay_700Bold', marginBottom: 20 },
  sectionLabel: { color: '#ccc', fontSize: 13, fontWeight: '700', marginBottom: 10, marginTop: 4 },

  // Dirección
  input: {
    backgroundColor: '#2a0a0a', borderRadius: 10, padding: 14,
    color: '#fff', fontSize: 14, borderWidth: 1, borderColor: '#3a1010', marginBottom: 0,
  },
  hint: { color: '#555', fontSize: 12, marginBottom: 8, marginTop: 10 },
  map: { width: '100%', height: 200, borderRadius: 12, marginBottom: 8 },
  geocodificandoRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  geocodificandoTexto: { color: '#cc0000', fontSize: 12 },

  // Sugerencias
  sugerenciasContainer: {
    backgroundColor: '#2a0a0a', borderWidth: 1, borderColor: '#cc0000',
    borderRadius: 10, marginTop: 4, marginBottom: 10, overflow: 'hidden',
  },
  sugerenciaItem: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    paddingHorizontal: 14, paddingVertical: 12,
  },
  sugerenciaItemBorder: { borderBottomWidth: 1, borderBottomColor: '#3a1010' },
  sugerenciaIcono: { fontSize: 14, marginTop: 1 },
  sugerenciaTexto: { flex: 1, color: '#ddd', fontSize: 13, lineHeight: 18 },

  // Métodos de pago
  paymentRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  paymentOption: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 14, borderRadius: 10,
    backgroundColor: '#2a0a0a', borderWidth: 1, borderColor: '#3a1010',
  },
  paymentActive: { borderColor: '#cc0000', backgroundColor: '#3a0a0a' },
  paymentIcon: { fontSize: 20 },
  paymentLabel: { color: '#888', fontSize: 14, fontWeight: '700' },
  paymentLabelActive: { color: '#fff' },

  // Tarjetas
  tarjetasContainer: {
    backgroundColor: '#2a0a0a', borderRadius: 12,
    padding: 12, marginBottom: 16,
    borderWidth: 1, borderColor: '#3a1010',
  },
  sinTarjetas: { color: '#555', fontSize: 13, textAlign: 'center', paddingVertical: 8 },
  tarjetaOpcion: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#3a1010',
  },
  tarjetaOpcionActiva: { backgroundColor: '#3a0a0a', borderRadius: 8, paddingHorizontal: 8 },
  tarjetaRadio: {
    width: 18, height: 18, borderRadius: 9,
    borderWidth: 2, borderColor: '#cc0000',
    alignItems: 'center', justifyContent: 'center',
  },
  tarjetaRadioInner: { width: 9, height: 9, borderRadius: 5, backgroundColor: '#cc0000' },
  tarjetaIcono: { fontSize: 22 },
  tarjetaNumero: { color: '#fff', fontSize: 13, fontWeight: '600' },
  tarjetaTitular: { color: '#888', fontSize: 11, marginTop: 2 },
  btnAgregarTarjeta: {
    marginTop: 10, borderWidth: 1, borderColor: '#cc0000',
    borderRadius: 8, paddingVertical: 10, alignItems: 'center',
  },
  btnAgregarTarjetaTexto: { color: '#cc0000', fontSize: 13, fontWeight: '600' },

  // Formulario nueva tarjeta
  formNuevaTarjeta: { marginTop: 10 },
  formTitulo: { color: '#fff', fontSize: 14, fontWeight: '700', marginBottom: 4 },
  inputLabel: { color: '#888', fontSize: 11, marginTop: 10, marginBottom: 4 },
  inputTarjeta: { fontSize: 16, letterSpacing: 1.5, fontWeight: '600' },
  filaDosCampos: { flexDirection: 'row', gap: 10 },
  filaBotones: { flexDirection: 'row', gap: 10, marginTop: 14 },
  btnCancelar: {
    flex: 1, borderWidth: 1, borderColor: '#555',
    borderRadius: 8, paddingVertical: 11, alignItems: 'center',
  },
  btnCancelarTexto: { color: '#aaa', fontSize: 13 },
  btnGuardar: {
    flex: 1, backgroundColor: '#cc0000',
    borderRadius: 8, paddingVertical: 11, alignItems: 'center',
  },
  btnGuardarTexto: { color: '#fff', fontSize: 13, fontWeight: '600' },

  // Total
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16, marginTop: 8 },
  totalLabel: { color: '#aaa', fontSize: 16 },
  totalValue: { color: '#fff', fontSize: 20, fontWeight: '700' },
  confirmButton: {
    backgroundColor: '#cc0000', borderRadius: 10,
    paddingVertical: 16, alignItems: 'center',
  },
  confirmText: { color: '#fff', fontSize: 16, fontWeight: '700', letterSpacing: 1 },
});

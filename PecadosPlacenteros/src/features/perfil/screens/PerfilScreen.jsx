import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ImageBackground, TextInput, Alert, ActivityIndicator, Modal,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  doc, getDoc, updateDoc, collection, addDoc, getDocs, query, where, deleteDoc,
} from 'firebase/firestore';
import {
  updatePassword, reauthenticateWithCredential, EmailAuthProvider,
} from 'firebase/auth';
import { auth, db } from '../../../api/firebaseConfig';
import { logout } from '../../auth/services/authService';
// ─── Helpers ──────────────────────────────────────────────────────────────────
const campo = (label, value) => (
  <View style={styles.campoFila} key={label}>
    <Text style={styles.campoLabel}>{label}</Text>
    <Text style={styles.campoValor}>{value || <Text style={styles.campoVacio}>Sin registrar</Text>}</Text>
  </View>
);

// ─── Componente sección colapsable ────────────────────────────────────────────
function Seccion({ icono, titulo, children, abierta, onToggle }) {
  return (
    <View style={styles.seccionCard}>
      <TouchableOpacity style={styles.seccionHeader} onPress={onToggle} activeOpacity={0.7}>
        <Text style={styles.seccionIcono}>{icono}</Text>
        <Text style={styles.seccionTitulo}>{titulo}</Text>
        <Text style={styles.chevron}>{abierta ? '∨' : '›'}</Text>
      </TouchableOpacity>
      {abierta && <View style={styles.seccionCuerpo}>{children}</View>}
    </View>
  );
}

// ─── Pantalla principal ────────────────────────────────────────────────────────
export default function PerfilScreen() {
  const router = useRouter();
  const usuario = auth.currentUser;

  const [perfil, setPerfil] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [seccionAbierta, setSeccionAbierta] = useState(null);

  // Estados edición datos personales
  const [editando, setEditando] = useState(false);
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [documento, setDocumento] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [guardando, setGuardando] = useState(false);

  // Estados cambio contraseña
  const [modalPassword, setModalPassword] = useState(false);
  const [passActual, setPassActual] = useState('');
  const [passNueva, setPassNueva] = useState('');
  const [passConfirm, setPassConfirm] = useState('');
  const [cambiandoPass, setCambiandoPass] = useState(false);
  const [verPassActual, setVerPassActual] = useState(false);
  const [verPassNueva, setVerPassNueva] = useState(false);
  const [verPassConfirm, setVerPassConfirm] = useState(false);

  // Estados métodos de pago
  const [tarjetas, setTarjetas] = useState([]);
  const [modalTarjeta, setModalTarjeta] = useState(false);

  // Estados pedidos
  const [pedidos, setPedidos] = useState([]);
  const [cargandoPedidos, setCargandoPedidos] = useState(false);

  // Estados reservas
  const [reservas, setReservas] = useState([]);
  const [cargandoReservas, setCargandoReservas] = useState(false);

  // Estados tarjeta (formulario)
  const [numTarjeta, setNumTarjeta] = useState('');
  const [titular, setTitular] = useState('');
  const [vencimiento, setVencimiento] = useState('');
  const [cvc, setCvc] = useState('');
  const [guardandoTarjeta, setGuardandoTarjeta] = useState(false);

  // ── Formateo número de tarjeta: xxxx-xxxx-xxxx-xxxx (máx 16 dígitos) ──
  const formatearNumTarjeta = (texto) => {
    const soloDigitos = texto.replace(/\D/g, '').slice(0, 16);
    const grupos = soloDigitos.match(/.{1,4}/g) || [];
    return grupos.join('-');
  };

  // ── Formateo vencimiento: MM/AA ──
  const formatearVencimiento = (texto) => {
    const soloDigitos = texto.replace(/\D/g, '').slice(0, 4);
    if (soloDigitos.length <= 2) return soloDigitos;
    return soloDigitos.slice(0, 2) + '/' + soloDigitos.slice(2);
  };

  // ── Cargar perfil ──
  const cargarPerfil = useCallback(async () => {
    if (!usuario) return;
    setCargando(true);
    try {
      const snap = await getDoc(doc(db, 'users', usuario.uid));
      if (snap.exists()) {
        const data = snap.data();
        setPerfil(data);
        setNombre(data.name || '');
        setTelefono(data.telefono || '');
        setDocumento(data.documento || '');
        setFechaNacimiento(data.fechaNacimiento || '');
      }
    } catch (e) {
      Alert.alert('Error', 'No se pudo cargar el perfil.');
    } finally {
      setCargando(false);
    }
  }, [usuario]);

  // ── Cargar tarjetas ──
  const cargarTarjetas = useCallback(async () => {
    if (!usuario) return;
    try {
      const q = query(collection(db, 'tarjetas'), where('uid', '==', usuario.uid));
      const snap = await getDocs(q);
      setTarjetas(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) {
      // silencioso
    }
  }, [usuario]);

  // ── Cargar pedidos ──
  const cargarPedidos = useCallback(async () => {
    if (!usuario) return;
    setCargandoPedidos(true);
    try {
      const q = query(collection(db, 'pedidos'), where('uid', '==', usuario.uid));
      const snap = await getDocs(q);
      const lista = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .sort((a, b) => new Date(b.creadoEn) - new Date(a.creadoEn));
      setPedidos(lista);
    } catch (e) {
      // silencioso
    } finally {
      setCargandoPedidos(false);
    }
  }, [usuario]);

  // ── Cargar reservas ──
  const cargarReservas = useCallback(async () => {
    if (!usuario) return;
    setCargandoReservas(true);
    try {
      const q = query(collection(db, 'reservas'), where('uid', '==', usuario.uid));
      const snap = await getDocs(q);
      const lista = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .sort((a, b) => new Date(b.creadoEn) - new Date(a.creadoEn));
      setReservas(lista);
    } catch {
      // silencioso
    } finally {
      setCargandoReservas(false);
    }
  }, [usuario]);

  useEffect(() => {
    cargarPerfil();
    cargarTarjetas();
  }, [cargarPerfil, cargarTarjetas]);
  const toggleSeccion = (id) => setSeccionAbierta(prev => prev === id ? null : id);

  // ── Guardar datos personales ──
  const guardarDatos = async () => {
    if (!nombre.trim()) {
      Alert.alert('Campo requerido', 'El nombre no puede estar vacío.');
      return;
    }
    setGuardando(true);
    try {
      await updateDoc(doc(db, 'users', usuario.uid), {
        name: nombre.trim(),
        telefono: telefono.trim(),
        documento: documento.trim(),
        fechaNacimiento: fechaNacimiento.trim(),
      });
      setPerfil(prev => ({ ...prev, name: nombre.trim(), telefono, documento, fechaNacimiento }));
      setEditando(false);
      Alert.alert('¡Listo!', 'Datos actualizados correctamente.');
    } catch (e) {
      Alert.alert('Error', 'No se pudieron guardar los cambios.');
    } finally {
      setGuardando(false);
    }
  };

  // ── Cambiar contraseña ──
  const cambiarPassword = async () => {
    if (!passNueva || passNueva.length < 6) {
      Alert.alert('Contraseña inválida', 'La nueva contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (passNueva !== passConfirm) {
      Alert.alert('No coinciden', 'Las contraseñas nuevas no coinciden.');
      return;
    }
    setCambiandoPass(true);
    try {
      const credencial = EmailAuthProvider.credential(usuario.email, passActual);
      await reauthenticateWithCredential(usuario, credencial);
      await updatePassword(usuario, passNueva);
      setModalPassword(false);
      setPassActual(''); setPassNueva(''); setPassConfirm('');
      Alert.alert('¡Listo!', 'Contraseña actualizada correctamente.');
    } catch (e) {
      if (e.code === 'auth/wrong-password' || e.code === 'auth/invalid-credential') {
        Alert.alert('Contraseña incorrecta', 'La contraseña actual no es correcta.');
      } else {
        Alert.alert('Error', 'No se pudo cambiar la contraseña. Inténtalo de nuevo.');
      }
    } finally {
      setCambiandoPass(false);
    }
  };

  // ── Guardar tarjeta ──
  const guardarTarjeta = async () => {
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
      Alert.alert('Formato inválido', 'El vencimiento debe tener el formato MM/AA.');
      return;
    }
    if (cvc.length < 3) {
      Alert.alert('CVC inválido', 'El CVC debe tener 3 o 4 dígitos.');
      return;
    }
    setGuardandoTarjeta(true);
    try {
      const ultimos4 = limpio.slice(-4);
      await addDoc(collection(db, 'tarjetas'), {
        uid: usuario.uid,
        ultimos4,
        titular: titular.trim(),
        vencimiento,
        creadoEn: new Date().toISOString(),
      });
      setModalTarjeta(false);
      setNumTarjeta(''); setTitular(''); setVencimiento(''); setCvc('');
      await cargarTarjetas();
      Alert.alert('¡Listo!', 'Tarjeta guardada correctamente.');
    } catch (e) {
      Alert.alert('Error', 'No se pudo guardar la tarjeta.');
    } finally {
      setGuardandoTarjeta(false);
    }
  };

  // ── Eliminar tarjeta ──
  const eliminarTarjeta = (id) => {
    Alert.alert('Eliminar tarjeta', '¿Estás segura de que deseas eliminar esta tarjeta?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar', style: 'destructive',
        onPress: async () => {
          await deleteDoc(doc(db, 'tarjetas', id));
          await cargarTarjetas();
        },
      },
    ]);
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  if (cargando) {
    return (
      <View style={styles.centrado}>
        <ActivityIndicator color="#cc0000" size="large" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

      {/* ── Header ── */}
      <ImageBackground
        source={require('../../../../assets/images/background.jpg')}
        style={styles.headerBg}
        imageStyle={{ opacity: 0.4 }}
      >
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>👤</Text>
          </View>
        </View>
        <Text style={styles.name}>{perfil?.name || 'Mi Perfil'}</Text>
        <Text style={styles.subtitle}>SOCIO GOLD • MIEMBRO DESDE {perfil?.createdAt?.slice(0, 4) || '2024'}</Text>
      </ImageBackground>

      <View style={styles.content}>

        <Text style={styles.grupoLabel}>GESTIÓN DE CUENTA</Text>

        {/* ── Datos personales ── */}
        <Seccion
          icono="👤"
          titulo="Datos personales"
          abierta={seccionAbierta === 'datos'}
          onToggle={() => toggleSeccion('datos')}
        >
          {!editando ? (
            <>
              {campo('Nombre', perfil?.name)}
              {campo('Teléfono', perfil?.telefono)}
              {campo('Documento', perfil?.documento)}
              {campo('Fecha de nacimiento', perfil?.fechaNacimiento)}
              <TouchableOpacity style={styles.btnEditar} onPress={() => setEditando(true)}>
                <Text style={styles.btnEditarTexto}>Editar datos</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.inputLabel}>Nombre completo *</Text>
              <TextInput
                style={styles.input}
                value={nombre}
                onChangeText={setNombre}
                placeholder="Tu nombre"
                placeholderTextColor="#555"
              />
              <Text style={styles.inputLabel}>Teléfono celular</Text>
              <TextInput
                style={styles.input}
                value={telefono}
                onChangeText={setTelefono}
                placeholder="Ej: 3001234567"
                placeholderTextColor="#555"
                keyboardType="phone-pad"
              />
              <Text style={styles.inputLabel}>Documento de identidad</Text>
              <TextInput
                style={styles.input}
                value={documento}
                onChangeText={setDocumento}
                placeholder="Número de documento"
                placeholderTextColor="#555"
                keyboardType="numeric"
              />
              <Text style={styles.inputLabel}>Fecha de nacimiento</Text>
              <TextInput
                style={styles.input}
                value={fechaNacimiento}
                onChangeText={setFechaNacimiento}
                placeholder="DD/MM/AAAA"
                placeholderTextColor="#555"
              />
              <View style={styles.filaBotones}>
                <TouchableOpacity style={styles.btnCancelar} onPress={() => setEditando(false)}>
                  <Text style={styles.btnCancelarTexto}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.btnGuardar} onPress={guardarDatos} disabled={guardando}>
                  {guardando
                    ? <ActivityIndicator color="#fff" size="small" />
                    : <Text style={styles.btnGuardarTexto}>Guardar</Text>
                  }
                </TouchableOpacity>
              </View>
            </>
          )}
        </Seccion>

        {/* ── Seguridad ── */}
        <Seccion
          icono="🔒"
          titulo="Seguridad"
          abierta={seccionAbierta === 'seguridad'}
          onToggle={() => toggleSeccion('seguridad')}
        >
          {campo('Correo electrónico', usuario?.email)}
          <View style={styles.campoFila}>
            <Text style={styles.campoLabel}>Contraseña</Text>
            <Text style={styles.campoValor}>••••••••</Text>
          </View>
          <TouchableOpacity style={styles.btnEditar} onPress={() => setModalPassword(true)}>
            <Text style={styles.btnEditarTexto}>Cambiar contraseña</Text>
          </TouchableOpacity>
        </Seccion>

        <Text style={[styles.grupoLabel, { marginTop: 20 }]}>ACTIVIDAD Y RECOMPENSAS</Text>

        {/* ── Cupones ── */}
        <Seccion
          icono="🎟️"
          titulo="Cupones"
          abierta={seccionAbierta === 'cupones'}
          onToggle={() => toggleSeccion('cupones')}
        >
          <View style={styles.mensajeVacio}>
            <Text style={styles.mensajeVacioIcono}>🎟️</Text>
            <Text style={styles.mensajeVacioTexto}>No hay cupones disponibles por ahora</Text>
            <Text style={styles.mensajeVacioSub}>Pronto tendremos promociones exclusivas para ti</Text>
          </View>
        </Seccion>

        {/* ── Mis pedidos ── */}
        <Seccion
          icono="🧾"
          titulo="Mis pedidos"
          abierta={seccionAbierta === 'pedidos'}
          onToggle={() => {
            toggleSeccion('pedidos');
            if (seccionAbierta !== 'pedidos') cargarPedidos();
          }}
        >
          {cargandoPedidos ? (
            <ActivityIndicator color="#cc0000" style={{ marginVertical: 16 }} />
          ) : pedidos.length === 0 ? (
            <View style={styles.mensajeVacio}>
              <Text style={styles.mensajeVacioIcono}>🧾</Text>
              <Text style={styles.mensajeVacioTexto}>Aún no tienes pedidos</Text>
            </View>
          ) : (
            pedidos.map(p => (
              <View key={p.id} style={styles.pedidoItem}>
                <View style={styles.pedidoEncabezado}>
                  <Text style={styles.pedidoFecha}>
                    {new Date(p.creadoEn).toLocaleDateString('es-CO', {
                      day: '2-digit', month: 'short', year: 'numeric',
                    })}
                  </Text>
                  <View style={[
                    styles.estadoBadge,
                    p.estado === 'entregado' && styles.estadoEntregado,
                    p.estado === 'cancelado' && styles.estadoCancelado,
                  ]}>
                    <Text style={styles.estadoTexto}>{p.estado?.toUpperCase()}</Text>
                  </View>
                </View>
                <Text style={styles.pedidoItems} numberOfLines={2}>
                  {p.items?.map(i => `${i.quantity}× ${i.name}`).join(', ')}
                </Text>
                <Text style={styles.pedidoTotal}>
                  Total: ${Number(p.total).toLocaleString('es-CO')} COP
                  {p.metodoPago === 'cash' ? '  · Efectivo' : `  · •••• ${p.tarjeta?.ultimos4 || '****'}`}
                </Text>
                {p.direccion ? (
                  <Text style={styles.pedidoDireccion} numberOfLines={1}>📍 {p.direccion}</Text>
                ) : null}
              </View>
            ))
          )}
        </Seccion>

        {/* ── Mis reservas ── */}
        <Seccion
          icono="📅"
          titulo="Mis reservas"
          abierta={seccionAbierta === 'reservas'}
          onToggle={() => {
            toggleSeccion('reservas');
            if (seccionAbierta !== 'reservas') cargarReservas();
          }}
        >
          {cargandoReservas ? (
            <ActivityIndicator color="#cc0000" style={{ marginVertical: 16 }} />
          ) : reservas.length === 0 ? (
            <View style={styles.mensajeVacio}>
              <Text style={styles.mensajeVacioIcono}>📅</Text>
              <Text style={styles.mensajeVacioTexto}>Aún no tienes reservas</Text>
            </View>
          ) : (
            reservas.map(r => (
              <View key={r.id} style={styles.pedidoItem}>
                <View style={styles.pedidoEncabezado}>
                  <Text style={styles.pedidoFecha}>{r.fecha}</Text>
                  <View style={[
                    styles.estadoBadge,
                    r.estado === 'confirmado' && styles.estadoConfirmado,
                    r.estado === 'cancelado' && styles.estadoCancelado,
                  ]}>
                    <Text style={styles.estadoTexto}>
                      {(r.estado || 'en espera').toUpperCase()}
                    </Text>
                  </View>
                </View>
                <Text style={styles.pedidoItems}>
                  Mesa {r.mesa} · {r.hora} – {r.horaSalida || ''}
                </Text>
                <Text style={styles.pedidoTotal}>
                  {r.comensales} persona{r.comensales !== 1 ? 's' : ''} · {r.asientos} asientos
                </Text>
              </View>
            ))
          )}
        </Seccion>

        <Text style={[styles.grupoLabel, { marginTop: 20 }]}>CONFIGURACIÓN DE APP</Text>

        {/* ── Métodos de pago ── */}
        <Seccion
          icono="💳"
          titulo="Métodos de pago"
          abierta={seccionAbierta === 'pago'}
          onToggle={() => toggleSeccion('pago')}
        >
          {tarjetas.length === 0 ? (
            <Text style={styles.sinTarjetas}>No tienes tarjetas guardadas</Text>
          ) : (
            tarjetas.map(t => (
              <View key={t.id} style={styles.tarjetaItem}>
                <View style={styles.tarjetaInfo}>
                  <Text style={styles.tarjetaIcono}>💳</Text>
                  <View>
                    <Text style={styles.tarjetaNumero}>•••• •••• •••• {t.ultimos4}</Text>
                    <Text style={styles.tarjetaTitular}>{t.titular} · {t.vencimiento}</Text>
                  </View>
                </View>
                <TouchableOpacity onPress={() => eliminarTarjeta(t.id)}>
                  <Text style={styles.eliminarTarjeta}>✕</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
          <TouchableOpacity style={styles.btnAgregarTarjeta} onPress={() => setModalTarjeta(true)}>
            <Text style={styles.btnAgregarTarjetaTexto}>+ Agregar tarjeta</Text>
          </TouchableOpacity>
        </Seccion>

        {/* ── Cerrar sesión ── */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutIcon}>↪️</Text>
          <Text style={styles.logoutText}>Cerrar sesión</Text>
        </TouchableOpacity>

        <Text style={styles.version}>Pecados Placenteros v1.0.0</Text>
        <View style={{ height: 40 }} />
      </View>

      {/* ── Modal cambio de contraseña ── */}
      <Modal visible={modalPassword} transparent animationType="slide">
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <TouchableOpacity
            style={styles.modalDismiss}
            activeOpacity={1}
            onPress={() => { setModalPassword(false); setPassActual(''); setPassNueva(''); setPassConfirm(''); }}
          />
          <View style={styles.modalCard}>
            <Text style={styles.modalTitulo}>Cambiar contraseña</Text>

            <Text style={styles.inputLabel}>Contraseña actual</Text>
            <View style={styles.inputConOjo}>
              <TextInput
                style={styles.inputOjo}
                value={passActual}
                onChangeText={setPassActual}
                secureTextEntry={!verPassActual}
                placeholder="Tu contraseña actual"
                placeholderTextColor="#555"
              />
              <TouchableOpacity onPress={() => setVerPassActual(v => !v)} style={styles.ojoBtn}>
                <Text style={styles.ojoIcono}>{verPassActual ? '🙈' : '👁️'}</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Nueva contraseña</Text>
            <View style={styles.inputConOjo}>
              <TextInput
                style={styles.inputOjo}
                value={passNueva}
                onChangeText={setPassNueva}
                secureTextEntry={!verPassNueva}
                placeholder="Mínimo 6 caracteres"
                placeholderTextColor="#555"
              />
              <TouchableOpacity onPress={() => setVerPassNueva(v => !v)} style={styles.ojoBtn}>
                <Text style={styles.ojoIcono}>{verPassNueva ? '🙈' : '👁️'}</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Confirmar nueva contraseña</Text>
            <View style={styles.inputConOjo}>
              <TextInput
                style={styles.inputOjo}
                value={passConfirm}
                onChangeText={setPassConfirm}
                secureTextEntry={!verPassConfirm}
                placeholder="Repite la nueva contraseña"
                placeholderTextColor="#555"
              />
              <TouchableOpacity onPress={() => setVerPassConfirm(v => !v)} style={styles.ojoBtn}>
                <Text style={styles.ojoIcono}>{verPassConfirm ? '🙈' : '👁️'}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.filaBotones}>
              <TouchableOpacity
                style={styles.btnCancelar}
                onPress={() => { setModalPassword(false); setPassActual(''); setPassNueva(''); setPassConfirm(''); }}
              >
                <Text style={styles.btnCancelarTexto}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnGuardar} onPress={cambiarPassword} disabled={cambiandoPass}>
                {cambiandoPass
                  ? <ActivityIndicator color="#fff" size="small" />
                  : <Text style={styles.btnGuardarTexto}>Confirmar</Text>
                }
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ── Modal agregar tarjeta ── */}
      <Modal visible={modalTarjeta} transparent animationType="slide">
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <TouchableOpacity
            style={styles.modalDismiss}
            activeOpacity={1}
            onPress={() => { setModalTarjeta(false); setNumTarjeta(''); setTitular(''); setVencimiento(''); setCvc(''); }}
          />
          <View style={styles.modalCard}>
            <Text style={styles.modalTitulo}>Nueva tarjeta</Text>

            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

              <Text style={styles.inputLabel}>Número de tarjeta</Text>
              <TextInput
                style={[styles.input, styles.inputTarjeta]}
                value={numTarjeta}
                onChangeText={(t) => setNumTarjeta(formatearNumTarjeta(t))}
                placeholder="xxxx-xxxx-xxxx-xxxx"
                placeholderTextColor="#555"
                keyboardType="numeric"
                maxLength={19}
              />

              <Text style={styles.inputLabel}>Nombre del titular</Text>
              <TextInput
                style={styles.input}
                value={titular}
                onChangeText={setTitular}
                placeholder="Como aparece en la tarjeta"
                placeholderTextColor="#555"
                autoCapitalize="characters"
              />

              <View style={styles.filaDosCampos}>
                <View style={styles.campoPequeno}>
                  <Text style={styles.inputLabel}>Vencimiento</Text>
                  <TextInput
                    style={styles.input}
                    value={vencimiento}
                    onChangeText={(t) => setVencimiento(formatearVencimiento(t))}
                    placeholder="MM/AA"
                    placeholderTextColor="#555"
                    keyboardType="numeric"
                    maxLength={5}
                  />
                </View>
                <View style={styles.campoPequeno}>
                  <Text style={styles.inputLabel}>CVC</Text>
                  <TextInput
                    style={styles.input}
                    value={cvc}
                    onChangeText={(t) => setCvc(t.replace(/\D/g, '').slice(0, 4))}
                    placeholder="•••"
                    placeholderTextColor="#555"
                    keyboardType="numeric"
                    maxLength={4}
                    secureTextEntry
                  />
                </View>
              </View>

              <Text style={styles.avisoTarjeta}>
                ⚠ Solo guardamos los últimos 4 dígitos. Nunca almacenamos el número completo ni el CVC.
              </Text>

              <View style={styles.filaBotones}>
                <TouchableOpacity
                  style={styles.btnCancelar}
                  onPress={() => { setModalTarjeta(false); setNumTarjeta(''); setTitular(''); setVencimiento(''); setCvc(''); }}
                >
                  <Text style={styles.btnCancelarTexto}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.btnGuardar} onPress={guardarTarjeta} disabled={guardandoTarjeta}>
                  {guardandoTarjeta
                    ? <ActivityIndicator color="#fff" size="small" />
                    : <Text style={styles.btnGuardarTexto}>Guardar</Text>
                  }
                </TouchableOpacity>
              </View>

              <View style={{ height: 20 }} />
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

    </ScrollView>
  );
}

// ─── Estilos ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a0000' },
  centrado: { flex: 1, backgroundColor: '#1b0101ff', alignItems: 'center', justifyContent: 'center' },

  // Header
  headerBg: {
    height: 220, alignItems: 'center', justifyContent: 'flex-end',
    paddingBottom: 20, backgroundColor: '#2a0a0a',
  },
  avatarContainer: { marginBottom: 12 },
  avatar: {
    width: 90, height: 90, borderRadius: 45,
    backgroundColor: '#3a1010', borderWidth: 3, borderColor: '#cc0000',
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: 40 },
  name: { color: '#fff', fontSize: 22, fontFamily: 'PlayfairDisplay_700Bold' },
  subtitle: { color: '#cc0000', fontSize: 11, letterSpacing: 1, marginTop: 4 },

  content: { paddingHorizontal: 16, paddingTop: 24 },

  grupoLabel: {
    color: '#666', fontSize: 11, letterSpacing: 2,
    fontWeight: '600', marginBottom: 10,
  },

  // Sección colapsable
  seccionCard: {
    backgroundColor: '#2a0a0a', borderRadius: 12,
    marginBottom: 10, overflow: 'hidden',
    borderWidth: 1, borderColor: '#3d0000',
  },
  seccionHeader: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 16,
  },
  seccionIcono: { fontSize: 18, marginRight: 14 },
  seccionTitulo: { flex: 1, color: '#fff', fontSize: 15 },
  chevron: { color: '#666', fontSize: 20 },
  seccionCuerpo: { paddingHorizontal: 16, paddingBottom: 16, borderTopWidth: 1, borderTopColor: '#3d0000' },

  // Campos de solo lectura
  campoFila: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: '#3d0000',
  },
  campoLabel: { color: '#888', fontSize: 13 },
  campoValor: { color: '#fff', fontSize: 13, fontWeight: '600', maxWidth: '60%', textAlign: 'right' },
  campoVacio: { color: '#555', fontStyle: 'italic', fontWeight: '400' },

  // Inputs
  inputLabel: { color: '#888', fontSize: 12, marginTop: 12, marginBottom: 4 },
  input: {
    backgroundColor: '#1a0000', borderWidth: 1, borderColor: '#3d0000',
    borderRadius: 8, paddingHorizontal: 14, paddingVertical: 10,
    color: '#fff', fontSize: 14,
  },
  inputConOjo: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#1a0000', borderWidth: 1, borderColor: '#3d0000',
    borderRadius: 8, marginBottom: 0,
  },
  inputOjo: {
    flex: 1, paddingHorizontal: 14, paddingVertical: 10,
    color: '#fff', fontSize: 14,
  },
  ojoBtn: { paddingHorizontal: 12, paddingVertical: 10 },
  ojoIcono: { fontSize: 16 },

  // Botones dentro de sección
  filaBotones: { flexDirection: 'row', gap: 10, marginTop: 16 },
  btnEditar: {
    marginTop: 14, borderWidth: 1, borderColor: '#cc0000',
    borderRadius: 8, paddingVertical: 10, alignItems: 'center',
  },
  btnEditarTexto: { color: '#cc0000', fontSize: 14, fontWeight: '600' },
  btnCancelar: {
    flex: 1, borderWidth: 1, borderColor: '#555',
    borderRadius: 8, paddingVertical: 12, alignItems: 'center',
  },
  btnCancelarTexto: { color: '#aaa', fontSize: 14 },
  btnGuardar: {
    flex: 1, backgroundColor: '#cc0000',
    borderRadius: 8, paddingVertical: 12, alignItems: 'center',
  },
  btnGuardarTexto: { color: '#fff', fontSize: 14, fontWeight: '600' },

  // Cupones vacíos
  mensajeVacio: { alignItems: 'center', paddingVertical: 20 },
  mensajeVacioIcono: { fontSize: 36, marginBottom: 10 },
  mensajeVacioTexto: { color: '#ccc', fontSize: 14, fontWeight: '600', textAlign: 'center' },
  mensajeVacioSub: { color: '#555', fontSize: 12, marginTop: 6, textAlign: 'center' },

  // Pedidos
  pedidoItem: {
    paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#3d0000',
  },
  pedidoEncabezado: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  pedidoFecha: { color: '#aaa', fontSize: 12 },
  estadoBadge: {
    backgroundColor: '#cc0000', borderRadius: 6,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  estadoEntregado: { backgroundColor: '#1a6b1a' },
  estadoCancelado: { backgroundColor: '#555' },
  estadoReservado: { backgroundColor: '#1a4a6b' },
  estadoConfirmado: { backgroundColor: '#1a6b1a' },
  estadoTexto: { color: '#fff', fontSize: 10, fontWeight: '700', letterSpacing: 1 },
  pedidoItems: { color: '#ddd', fontSize: 13, marginBottom: 4 },
  pedidoTotal: { color: '#cc0000', fontSize: 13, fontWeight: '600', marginBottom: 2 },
  pedidoDireccion: { color: '#666', fontSize: 11 },

  // Tarjetas
  sinTarjetas: { color: '#555', fontSize: 13, textAlign: 'center', paddingVertical: 12 },
  tarjetaItem: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#3d0000',
  },
  tarjetaInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  tarjetaIcono: { fontSize: 24 },
  tarjetaNumero: { color: '#fff', fontSize: 14, fontWeight: '600' },
  tarjetaTitular: { color: '#888', fontSize: 12, marginTop: 2 },
  eliminarTarjeta: { color: '#cc0000', fontSize: 18, paddingHorizontal: 8 },
  btnAgregarTarjeta: {
    marginTop: 14, borderWidth: 1, borderColor: '#cc0000',
    borderRadius: 8, paddingVertical: 10, alignItems: 'center',
  },
  btnAgregarTarjetaTexto: { color: '#cc0000', fontSize: 14, fontWeight: '600' },
  avisoTarjeta: { color: '#666', fontSize: 11, marginTop: 10, lineHeight: 16 },

  // Modal
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'flex-end',
  },
  modalDismiss: { flex: 1 },
  modalCard: {
    backgroundColor: '#2a0a0a', borderTopLeftRadius: 20, borderTopRightRadius: 20,
    padding: 24, borderTopWidth: 1, borderColor: '#3d0000',
    maxHeight: '90%',
  },
  modalTitulo: {
    color: '#fff', fontSize: 20, fontFamily: 'PlayfairDisplay_700Bold',
    marginBottom: 16, textAlign: 'center',
  },
  inputTarjeta: { fontSize: 18, letterSpacing: 2, fontWeight: '600' },
  filaDosCampos: { flexDirection: 'row', gap: 12, marginTop: 0 },
  campoPequeno: { flex: 1 },

  // Logout
  logoutButton: {
    backgroundColor: '#cc0000', borderRadius: 10,
    paddingVertical: 16, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center',
    gap: 10, marginTop: 24, marginBottom: 16,
  },
  logoutIcon: { fontSize: 18 },
  logoutText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  version: { color: '#444', fontSize: 12, textAlign: 'center' },
});

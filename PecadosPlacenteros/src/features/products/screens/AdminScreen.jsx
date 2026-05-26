import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  TouchableOpacity, Switch, ActivityIndicator, Alert, Image,
} from 'react-native';
import {
  collection, addDoc, getDocs, deleteDoc, doc, updateDoc, query, where,
} from 'firebase/firestore';
import { db } from '../../../api/firebaseConfig';
import { logout } from '../../auth/services/authService';
import { useRouter } from 'expo-router';

const categories = ['BURGERS', 'ENTRANTES', 'POSTRES', 'BEBIDAS'];

const CAT_ICONS = {
  BURGERS: '🍔',
  ENTRANTES: '🥗',
  POSTRES: '🍰',
  BEBIDAS: '🥤',
};

const emptyForm = {
  name: '',
  price: '',
  description: '',
  category: 'BURGERS',
  image: '',
  featured: false,
  featuredLabel: '',
};

export default function AdminScreen() {
  const [activeTab, setActiveTab] = useState('productos');
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Reservas
  const [reservas, setReservas] = useState([]);
  const [loadingReservas, setLoadingReservas] = useState(false);
  const [procesando, setProcesando] = useState(null); // id de la reserva en proceso

  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  const loadProducts = async () => {
    setLoading(true);
    const snapshot = await getDocs(collection(db, 'products'));
    setProducts(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    setLoading(false);
  };

  const loadReservas = useCallback(async () => {
    setLoadingReservas(true);
    try {
      const q = query(
        collection(db, 'reservas'),
        where('estado', '==', 'en espera'),
      );
      const snap = await getDocs(q);
      const lista = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .sort((a, b) => (a.fecha > b.fecha ? 1 : a.fecha < b.fecha ? -1 : 0));
      setReservas(lista);
    } catch {
      Alert.alert('Error', 'No se pudieron cargar las reservas.');
    } finally {
      setLoadingReservas(false);
    }
  }, []);

  const handleConfirmarReserva = (reserva) => {
    Alert.alert(
      'Confirmar reserva',
      `¿Confirmar la reserva de ${reserva.email}?\nMesa ${reserva.mesa} · ${reserva.fecha} · ${reserva.hora}`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: async () => {
            setProcesando(reserva.id);
            try {
              await updateDoc(doc(db, 'reservas', reserva.id), { estado: 'confirmado' });
              setReservas((prev) => prev.filter((r) => r.id !== reserva.id));
            } catch {
              Alert.alert('Error', 'No se pudo confirmar la reserva.');
            } finally {
              setProcesando(null);
            }
          },
        },
      ],
    );
  };

  const handleCancelarReserva = (reserva) => {
    Alert.alert(
      'Cancelar reserva',
      `¿Cancelar la reserva de ${reserva.email}?\nMesa ${reserva.mesa} · ${reserva.fecha} · ${reserva.hora}`,
      [
        { text: 'Volver', style: 'cancel' },
        {
          text: 'Cancelar reserva',
          style: 'destructive',
          onPress: async () => {
            setProcesando(reserva.id);
            try {
              await updateDoc(doc(db, 'reservas', reserva.id), { estado: 'cancelado' });
              setReservas((prev) => prev.filter((r) => r.id !== reserva.id));
            } catch {
              Alert.alert('Error', 'No se pudo cancelar la reserva.');
            } finally {
              setProcesando(null);
            }
          },
        },
      ],
    );
  };

  useEffect(() => { loadProducts(); }, []);

  useEffect(() => {
    if (activeTab === 'reservas') loadReservas();
  }, [activeTab, loadReservas]);

  const handleSave = async () => {
    if (!form.name || !form.price || !form.description) {
      Alert.alert('Campos requeridos', 'Nombre, precio y descripción son obligatorios.');
      return;
    }
    setSaving(true);
    if (editingId) {
      await updateDoc(doc(db, 'products', editingId), form);
      setEditingId(null);
      Alert.alert('¡Listo!', 'Producto actualizado.');
    } else {
      await addDoc(collection(db, 'products'), form);
      Alert.alert('¡Listo!', 'Producto agregado al menú.');
    }
    setForm(emptyForm);
    await loadProducts();
    setSaving(false);
  };

  const handleEdit = (product) => {
    const { id, ...data } = product;
    setForm(data);
    setEditingId(id);
  };

  const handleCancel = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleDelete = (id, name) => {
    Alert.alert('Eliminar', `¿Eliminar "${name}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar', style: 'destructive',
        onPress: async () => {
          await deleteDoc(doc(db, 'products', id));
          await loadProducts();
        },
      },
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#1a0000' }}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Panel de Administrador</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <Text style={styles.logoutIcon}>🚪</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'productos' && styles.tabActive]}
          onPress={() => setActiveTab('productos')}
        >
          <Text style={[styles.tabText, activeTab === 'productos' && styles.tabTextActive]}>
            🍔 Productos
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'reservas' && styles.tabActive]}
          onPress={() => setActiveTab('reservas')}
        >
          <Text style={[styles.tabText, activeTab === 'reservas' && styles.tabTextActive]}>
            📅 Reservas
          </Text>
        </TouchableOpacity>
      </View>

      {/* ── TAB: PRODUCTOS ── */}
      {activeTab === 'productos' && (
        <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">

          {/* Formulario */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{editingId ? 'Editar Producto' : 'Agregar Producto'}</Text>

            <Text style={styles.label}>Nombre *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: Lujuria de Wagyu"
              placeholderTextColor="#555"
              value={form.name}
              onChangeText={(v) => setForm({ ...form, name: v })}
            />

            <Text style={styles.label}>Precio *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: 18500 COP"
              placeholderTextColor="#555"
              value={form.price}
              onChangeText={(v) => setForm({ ...form, price: v })}
            />

            <Text style={styles.label}>Descripción *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Descripción del producto..."
              placeholderTextColor="#555"
              multiline
              numberOfLines={3}
              value={form.description}
              onChangeText={(v) => setForm({ ...form, description: v })}
            />

            <Text style={styles.label}>URL de Imagen</Text>
            <TextInput
              style={styles.input}
              placeholder="https://..."
              placeholderTextColor="#555"
              value={form.image}
              onChangeText={(v) => setForm({ ...form, image: v })}
            />

            <Text style={styles.label}>Categoría</Text>
            <View style={styles.categoryRow}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.catChip, form.category === cat && styles.catChipActive]}
                  onPress={() => setForm({ ...form, category: cat })}
                >
                  <Text style={[styles.catChipText, form.category === cat && styles.catChipTextActive]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.switchRow}>
              <Text style={styles.label}>Destacado</Text>
              <Switch
                value={form.featured}
                onValueChange={(v) => setForm({ ...form, featured: v })}
                trackColor={{ false: '#3a1010', true: '#cc0000' }}
                thumbColor="#fff"
              />
            </View>

            {form.featured && (
              <>
                <Text style={styles.label}>Etiqueta destacado</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ej: LO MÁS DESEADO"
                  placeholderTextColor="#555"
                  value={form.featuredLabel}
                  onChangeText={(v) => setForm({ ...form, featuredLabel: v })}
                />
              </>
            )}

            <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={saving}>
              {saving
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.saveButtonText}>{editingId ? 'Actualizar Producto' : 'Guardar Producto'}</Text>
              }
            </TouchableOpacity>
            {editingId && (
              <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                <Text style={styles.cancelButtonText}>Cancelar edición</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Lista de productos agrupada por categoría */}
          {loading ? (
            <ActivityIndicator color="#cc0000" style={{ marginTop: 20 }} />
          ) : (
            categories.map((cat) => {
              const catProducts = products.filter((p) => p.category === cat);
              if (catProducts.length === 0) return null;
              return (
                <View key={cat} style={styles.catSection}>
                  <View style={styles.catHeader}>
                    <Text style={styles.catHeaderIcon}>{CAT_ICONS[cat]}</Text>
                    <Text style={styles.catHeaderText}>{cat}</Text>
                    <View style={styles.catCount}>
                      <Text style={styles.catCountText}>{catProducts.length}</Text>
                    </View>
                  </View>
                  {catProducts.map((p) => (
                    <View key={p.id} style={styles.productRow}>
                      {/* Imagen miniatura */}
                      {p.image ? (
                        <Image
                          source={{ uri: p.image }}
                          style={styles.productThumb}
                          resizeMode="cover"
                        />
                      ) : (
                        <View style={[styles.productThumb, styles.productThumbEmpty]}>
                          <Text style={{ fontSize: 18 }}>{CAT_ICONS[cat]}</Text>
                        </View>
                      )}
                      {/* Info */}
                      <View style={styles.productInfo}>
                        <View style={styles.productNameRow}>
                          <Text style={styles.productName} numberOfLines={1}>{p.name}</Text>
                          {p.featured && (
                            <View style={styles.featuredBadge}>
                              <Text style={styles.featuredBadgeText}>★</Text>
                            </View>
                          )}
                        </View>
                        <Text style={styles.productPrice}>{p.price}</Text>
                        {p.description ? (
                          <Text style={styles.productDesc} numberOfLines={1}>{p.description}</Text>
                        ) : null}
                      </View>
                      {/* Acciones */}
                      <TouchableOpacity style={styles.editBtn} onPress={() => handleEdit(p)}>
                        <Text style={styles.editBtnText}>✏️</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(p.id, p.name)}>
                        <Text style={styles.deleteBtnText}>🗑️</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              );
            })
          )}

          <View style={{ height: 80 }} />
        </ScrollView>
      )}

      {/* ── TAB: RESERVAS ── */}
      {activeTab === 'reservas' && (
        <ScrollView style={styles.container}>
          <View style={styles.reservasHeader}>
            <Text style={styles.sectionTitle}>Reservas en Espera</Text>
            <TouchableOpacity onPress={loadReservas} style={styles.refreshBtn}>
              <Text style={styles.refreshBtnText}>↻ Actualizar</Text>
            </TouchableOpacity>
          </View>

          {loadingReservas ? (
            <ActivityIndicator color="#cc0000" style={{ marginTop: 40 }} />
          ) : reservas.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📅</Text>
              <Text style={styles.emptyText}>No hay reservas en espera</Text>
              <Text style={styles.emptySub}>Todas las reservas han sido gestionadas</Text>
            </View>
          ) : (
            reservas.map((r) => (
              <View key={r.id} style={styles.reservaCard}>
                {/* Info principal */}
                <View style={styles.reservaTop}>
                  <View style={styles.reservaBadge}>
                    <Text style={styles.reservaBadgeText}>EN ESPERA</Text>
                  </View>
                  <Text style={styles.reservaFecha}>{r.fecha}</Text>
                </View>

                <View style={styles.reservaBody}>
                  <View style={styles.reservaFila}>
                    <Text style={styles.reservaIcono}>📧</Text>
                    <Text style={styles.reservaValor} numberOfLines={1}>{r.email}</Text>
                  </View>
                  <View style={styles.reservaFila}>
                    <Text style={styles.reservaIcono}>🪑</Text>
                    <Text style={styles.reservaValor}>
                      Mesa {r.mesa} · {r.hora} – {r.horaSalida || ''}
                    </Text>
                  </View>
                  <View style={styles.reservaFila}>
                    <Text style={styles.reservaIcono}>👥</Text>
                    <Text style={styles.reservaValor}>
                      {r.comensales} persona{r.comensales !== 1 ? 's' : ''} · {r.asientos} asientos
                    </Text>
                  </View>
                </View>

                {/* Acciones */}
                {procesando === r.id ? (
                  <ActivityIndicator color="#cc0000" style={{ marginTop: 12 }} />
                ) : (
                  <View style={styles.reservaAcciones}>
                    <TouchableOpacity
                      style={styles.btnCancelarReserva}
                      onPress={() => handleCancelarReserva(r)}
                    >
                      <Text style={styles.btnCancelarReservaText}>✕ Cancelar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.btnConfirmarReserva}
                      onPress={() => handleConfirmarReserva(r)}
                    >
                      <Text style={styles.btnConfirmarReservaText}>✓ Confirmar</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))
          )}

          <View style={{ height: 80 }} />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a0000', paddingHorizontal: 16 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingTop: 50, paddingBottom: 12, backgroundColor: '#1a0000',
  },
  title: { color: '#fff', fontSize: 22, fontFamily: 'PlayfairDisplay_700Bold' },
  logoutBtn: { padding: 8 },
  logoutIcon: { fontSize: 22 },

  // Tabs
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#2a0a0a',
    borderBottomWidth: 1,
    borderBottomColor: '#3d0000',
  },
  tab: {
    flex: 1, paddingVertical: 12, alignItems: 'center',
    borderBottomWidth: 2, borderBottomColor: 'transparent',
  },
  tabActive: { borderBottomColor: '#cc0000' },
  tabText: { color: '#666', fontSize: 13, fontFamily: 'PlayfairDisplay_700Bold' },
  tabTextActive: { color: '#cc0000' },

  card: { backgroundColor: '#2a0a0a', borderRadius: 12, padding: 16, marginBottom: 24 },
  cardTitle: { color: '#cc0000', fontSize: 16, fontFamily: 'PlayfairDisplay_700Bold', marginBottom: 16 },

  label: { color: '#ccc', fontSize: 12, fontFamily: 'PlayfairDisplay_400Regular', marginBottom: 6 },
  input: {
    backgroundColor: '#1a0000', borderRadius: 8, padding: 12,
    color: '#fff', fontSize: 14, marginBottom: 14,
    borderWidth: 1, borderColor: '#3a1010',
  },
  textArea: { height: 80, textAlignVertical: 'top' },

  categoryRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  catChip: {
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 20, borderWidth: 1, borderColor: '#3a1010',
  },
  catChipActive: { backgroundColor: '#cc0000', borderColor: '#cc0000' },
  catChipText: { color: '#666', fontSize: 11, fontFamily: 'PlayfairDisplay_700Bold' },
  catChipTextActive: { color: '#fff' },

  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },

  saveButton: {
    backgroundColor: '#cc0000', borderRadius: 8,
    paddingVertical: 14, alignItems: 'center', marginTop: 4,
  },
  saveButtonText: { color: '#fff', fontFamily: 'PlayfairDisplay_700Bold', fontSize: 15 },

  sectionTitle: { color: '#fff', fontSize: 18, fontFamily: 'PlayfairDisplay_700Bold', marginBottom: 12, marginTop: 8 },

  // Lista agrupada por categoría
  catSection: {
    marginBottom: 20,
  },
  catHeader: {
    flexDirection: 'row', alignItems: 'center',
    gap: 8, marginBottom: 8, marginTop: 4,
    paddingBottom: 8,
    borderBottomWidth: 1, borderBottomColor: '#3d0000',
  },
  catHeaderIcon: { fontSize: 16 },
  catHeaderText: {
    flex: 1, color: '#cc0000', fontSize: 13,
    fontFamily: 'PlayfairDisplay_700Bold', letterSpacing: 2,
  },
  catCount: {
    backgroundColor: '#3d0000', borderRadius: 10,
    paddingHorizontal: 8, paddingVertical: 2,
  },
  catCountText: { color: '#cc0000', fontSize: 11, fontFamily: 'PlayfairDisplay_700Bold' },

  productRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#2a0a0a', borderRadius: 10,
    marginBottom: 6, overflow: 'hidden',
  },
  productThumb: {
    width: 64, height: 64,
  },
  productThumbEmpty: {
    backgroundColor: '#3a1010',
    alignItems: 'center', justifyContent: 'center',
  },
  productInfo: { flex: 1, paddingHorizontal: 10, paddingVertical: 8 },
  productNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 },
  productName: { color: '#fff', fontSize: 13, fontFamily: 'PlayfairDisplay_700Bold', flex: 1 },
  featuredBadge: {
    backgroundColor: '#cc0000', borderRadius: 4,
    paddingHorizontal: 5, paddingVertical: 1,
  },
  featuredBadgeText: { color: '#fff', fontSize: 9, fontWeight: 'bold' },
  productPrice: { color: '#cc0000', fontSize: 12, fontFamily: 'PlayfairDisplay_700Bold', marginBottom: 2 },
  productDesc: { color: '#666', fontSize: 11 },
  productMeta: { color: '#888', fontSize: 12, fontFamily: 'PlayfairDisplay_400Regular', marginTop: 2 },
  deleteBtn: { padding: 8 },
  deleteBtnText: { fontSize: 18 },
  editBtn: { padding: 8 },
  editBtnText: { fontSize: 18 },
  cancelButton: {
    borderWidth: 1, borderColor: '#cc0000', borderRadius: 8,
    paddingVertical: 12, alignItems: 'center', marginTop: 8,
  },
  cancelButtonText: { color: '#cc0000', fontFamily: 'PlayfairDisplay_700Bold', fontSize: 14 },

  // Reservas
  reservasHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginTop: 8, marginBottom: 4,
  },
  refreshBtn: {
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 8, borderWidth: 1, borderColor: '#3d0000',
  },
  refreshBtnText: { color: '#cc0000', fontSize: 12, fontFamily: 'PlayfairDisplay_700Bold' },

  emptyState: { alignItems: 'center', marginTop: 60, paddingHorizontal: 32 },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyText: { color: '#fff', fontSize: 16, fontFamily: 'PlayfairDisplay_700Bold', textAlign: 'center' },
  emptySub: { color: '#666', fontSize: 13, marginTop: 8, textAlign: 'center' },

  reservaCard: {
    backgroundColor: '#2a0a0a', borderRadius: 12,
    padding: 16, marginBottom: 12,
    borderWidth: 1, borderColor: '#3d0000',
  },
  reservaTop: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 12,
  },
  reservaBadge: {
    backgroundColor: '#3d1a00', borderRadius: 6,
    paddingHorizontal: 10, paddingVertical: 4,
    borderWidth: 1, borderColor: '#cc6600',
  },
  reservaBadgeText: { color: '#cc6600', fontSize: 10, fontFamily: 'PlayfairDisplay_700Bold', letterSpacing: 1 },
  reservaFecha: { color: '#aaa', fontSize: 13, fontFamily: 'PlayfairDisplay_700Bold' },

  reservaBody: { gap: 6, marginBottom: 14 },
  reservaFila: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  reservaIcono: { fontSize: 14, width: 20 },
  reservaValor: { color: '#ddd', fontSize: 13, flex: 1 },

  reservaAcciones: { flexDirection: 'row', gap: 10 },
  btnCancelarReserva: {
    flex: 1, paddingVertical: 10, borderRadius: 8,
    borderWidth: 1, borderColor: '#555', alignItems: 'center',
  },
  btnCancelarReservaText: { color: '#aaa', fontSize: 13, fontFamily: 'PlayfairDisplay_700Bold' },
  btnConfirmarReserva: {
    flex: 1, paddingVertical: 10, borderRadius: 8,
    backgroundColor: '#cc0000', alignItems: 'center',
  },
  btnConfirmarReservaText: { color: '#fff', fontSize: 13, fontFamily: 'PlayfairDisplay_700Bold' },
});

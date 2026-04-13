import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  TouchableOpacity, Switch, ActivityIndicator, Alert,
} from 'react-native';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../api/firebaseConfig';
import { logout } from '../services/authService';
import { useRouter } from 'expo-router';

const categories = ['BURGERS', 'ENTRANTES', 'POSTRES', 'BEBIDAS'];

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
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
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

  useEffect(() => { loadProducts(); }, []);

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
          placeholder="Ej: 18.50€"
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

      {/* Lista de productos */}
      <Text style={styles.sectionTitle}>Productos en el Menú</Text>

      {loading
        ? <ActivityIndicator color="#cc0000" style={{ marginTop: 20 }} />
        : products.map((p) => (
          <View key={p.id} style={styles.productRow}>
            <View style={styles.productInfo}>
              <Text style={styles.productName}>{p.name}</Text>
              <Text style={styles.productMeta}>{p.category} · {p.price}</Text>
            </View>
            <TouchableOpacity style={styles.editBtn} onPress={() => handleEdit(p)}>
              <Text style={styles.editBtnText}>✏️</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(p.id, p.name)}>
              <Text style={styles.deleteBtnText}>🗑️</Text>
            </TouchableOpacity>
          </View>
        ))
      }

      <View style={{ height: 80 }} />
    </ScrollView>
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

  sectionTitle: { color: '#fff', fontSize: 18, fontFamily: 'PlayfairDisplay_700Bold', marginBottom: 12 },

  productRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#2a0a0a', borderRadius: 10,
    padding: 12, marginBottom: 8,
  },
  productInfo: { flex: 1 },
  productName: { color: '#fff', fontSize: 14, fontFamily: 'PlayfairDisplay_700Bold' },
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
});

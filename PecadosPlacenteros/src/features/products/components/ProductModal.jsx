import React from 'react';
import {
  View, Text, StyleSheet, Modal, Image,
  TouchableOpacity, ScrollView, TouchableWithoutFeedback,
} from 'react-native';
import { useCart } from '../../cart/context/CartContext';

export default function ProductModal({ product, visible, onClose }) {
  if (!product) return null;
  const { addItem } = useCart();

  const handleAdd = () => {
    addItem(product);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      {/* Fondo oscuro - toca para cerrar */}
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay} />
      </TouchableWithoutFeedback>

      {/* Contenido del modal */}
      <View style={styles.sheet}>
        {/* Handle */}
        <View style={styles.handle} />

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Imagen */}
          {product.image ? (
            <Image source={{ uri: product.image }} style={styles.image} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={styles.imagePlaceholderText}>🍽️</Text>
            </View>
          )}

          {/* Badge categoría */}
          <View style={styles.badgeRow}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{product.category}</Text>
            </View>
            {product.featured && (
              <View style={[styles.badge, styles.badgeFeatured]}>
                <Text style={styles.badgeText}>★ DESTACADO</Text>
              </View>
            )}
          </View>

          {/* Nombre y precio */}
          <View style={styles.row}>
            <Text style={styles.name}>{product.name}</Text>
            <Text style={styles.price}>{product.price}</Text>
          </View>

          {/* Descripción */}
          <Text style={styles.description}>{product.description}</Text>

          {/* Botón */}
          <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
            <Text style={styles.addButtonText}>+ Añadir al Pedido</Text>
          </TouchableOpacity>

          <View style={{ height: 20 }} />
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#1a0000',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  handle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: '#3a1010', alignSelf: 'center', marginBottom: 16,
  },
  image: {
    width: '100%', height: 220,
    borderRadius: 14, marginBottom: 16,
  },
  imagePlaceholder: {
    width: '100%', height: 180, borderRadius: 14,
    backgroundColor: '#2a0a0a', alignItems: 'center',
    justifyContent: 'center', marginBottom: 16,
  },
  imagePlaceholderText: { fontSize: 48 },
  badgeRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  badge: {
    backgroundColor: '#2a0a0a', borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 4,
    borderWidth: 1, borderColor: '#cc0000',
  },
  badgeFeatured: { backgroundColor: '#cc0000', borderColor: '#cc0000' },
  badgeText: { color: '#cc0000', fontSize: 11, fontFamily: 'PlayfairDisplay_700Bold' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  name: { color: '#fff', fontSize: 22, fontFamily: 'PlayfairDisplay_700Bold', flex: 1, marginRight: 12 },
  price: { color: '#cc0000', fontSize: 22, fontFamily: 'PlayfairDisplay_700Bold' },
  description: {
    color: '#aaa', fontSize: 14,
    fontFamily: 'PlayfairDisplay_400Regular',
    lineHeight: 22, marginBottom: 24,
  },
  addButton: {
    backgroundColor: '#cc0000', borderRadius: 10,
    paddingVertical: 16, alignItems: 'center',
  },
  addButtonText: { color: '#fff', fontFamily: 'PlayfairDisplay_700Bold', fontSize: 15 },
});

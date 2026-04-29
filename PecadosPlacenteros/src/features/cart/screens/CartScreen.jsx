import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Image, Alert, ActivityIndicator,
} from 'react-native';
import { collection, addDoc } from 'firebase/firestore';
import { auth, db } from '../../../api/firebaseConfig';
import { useCart } from '../context/CartContext';
import CheckoutModal from '../components/CheckoutModal';

export default function CartScreen() {
  const { items, removeItem, updateQuantity, clearCart, total, count } = useCart();
  const [checkoutVisible, setCheckoutVisible] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const handleConfirmOrder = async ({ address, datosExtra, markerCoord, paymentMethod, tarjeta }) => {
    const usuario = auth.currentUser;
    if (!usuario) {
      Alert.alert('Sesión requerida', 'Debes iniciar sesión para realizar un pedido.');
      return;
    }

    setGuardando(true);
    try {
      await addDoc(collection(db, 'pedidos'), {
        uid: usuario.uid,
        email: usuario.email,
        items: items.map(i => ({
          id: i.id,
          name: i.name,
          price: i.price,
          quantity: i.quantity,
          image: i.image || null,
        })),
        total,
        direccion: address || '',
        datosExtra: datosExtra || '',
        coordenadas: markerCoord
          ? { lat: markerCoord.latitude, lon: markerCoord.longitude }
          : null,
        metodoPago: paymentMethod,
        tarjeta: tarjeta ? { ultimos4: tarjeta.ultimos4, titular: tarjeta.titular } : null,
        estado: 'en proceso',
        creadoEn: new Date().toISOString(),
      });

      clearCart();
      Alert.alert(
        '¡Pedido confirmado! ✦',
        `Tu pedido está en proceso.\nEntrega en: ${address || 'ubicación en mapa'}`,
        [{ text: '¡Perfecto!' }]
      );
    } catch (e) {
      Alert.alert('Error', `No se pudo guardar el pedido: ${e.message}`);
    } finally {
      setGuardando(false);
    }
  };

  if (items.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.title}>Mi Pedido</Text>
        <Text style={styles.emptyIcon}>🛒</Text>
        <Text style={styles.emptyText}>Tu carrito está vacío</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mi Pedido ({count})</Text>

      <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
        {items.map((item) => (
          <View key={item.id} style={styles.item}>
            {item.image ? (
              <Image source={{ uri: item.image }} style={styles.itemImage} />
            ) : (
              <View style={styles.itemImagePlaceholder}>
                <Text style={{ fontSize: 24 }}>🍽️</Text>
              </View>
            )}
            <View style={styles.itemInfo}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemPrice}>{item.price}</Text>
            </View>
            <View style={styles.quantityRow}>
              <TouchableOpacity
                style={styles.qBtn}
                onPress={() => updateQuantity(item.id, item.quantity - 1)}
              >
                <Text style={styles.qBtnText}>−</Text>
              </TouchableOpacity>
              <Text style={styles.quantity}>{item.quantity}</Text>
              <TouchableOpacity
                style={styles.qBtn}
                onPress={() => updateQuantity(item.id, item.quantity + 1)}
              >
                <Text style={styles.qBtnText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Total y botón */}
      <View style={styles.footer}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>${total.toLocaleString('es-CO')} COP</Text>
        </View>
        <TouchableOpacity
          style={[styles.orderButton, guardando && { opacity: 0.6 }]}
          onPress={() => setCheckoutVisible(true)}
          disabled={guardando}
        >
          {guardando
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.orderButtonText}>Realizar Pedido</Text>
          }
        </TouchableOpacity>
      </View>

      <CheckoutModal
        visible={checkoutVisible}
        onClose={() => setCheckoutVisible(false)}
        total={total.toLocaleString('es-CO')}
        onConfirm={handleConfirmOrder}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a0000', paddingHorizontal: 16, paddingTop: 50 },
  empty: { flex: 1, backgroundColor: '#1a0000', alignItems: 'center', justifyContent: 'center' },
  title: { color: '#fff', fontSize: 22, fontFamily: 'PlayfairDisplay_700Bold', marginBottom: 20 },
  emptyIcon: { fontSize: 60, marginBottom: 16 },
  emptyText: { color: '#666', fontSize: 14, fontFamily: 'PlayfairDisplay_400Regular' },

  item: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#2a0a0a', borderRadius: 12,
    marginBottom: 10, overflow: 'hidden',
  },
  itemImage: { width: 80, height: 80 },
  itemImagePlaceholder: {
    width: 80, height: 80, backgroundColor: '#3a1010',
    alignItems: 'center', justifyContent: 'center',
  },
  itemInfo: { flex: 1, paddingHorizontal: 12 },
  itemName: { color: '#fff', fontSize: 14, fontFamily: 'PlayfairDisplay_700Bold', marginBottom: 4 },
  itemPrice: { color: '#cc0000', fontSize: 13, fontFamily: 'PlayfairDisplay_700Bold' },

  quantityRow: { flexDirection: 'row', alignItems: 'center', paddingRight: 12, gap: 8 },
  qBtn: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: '#cc0000', alignItems: 'center', justifyContent: 'center',
  },
  qBtnText: { color: '#fff', fontSize: 18, lineHeight: 22 },
  quantity: { color: '#fff', fontSize: 16, fontFamily: 'PlayfairDisplay_700Bold', minWidth: 20, textAlign: 'center' },

  footer: { paddingVertical: 16, borderTopWidth: 1, borderTopColor: '#2a0a0a' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 },
  totalLabel: { color: '#aaa', fontSize: 16, fontFamily: 'PlayfairDisplay_400Regular' },
  totalValue: { color: '#fff', fontSize: 20, fontFamily: 'PlayfairDisplay_700Bold' },
  orderButton: {
    backgroundColor: '#cc0000', borderRadius: 10,
    paddingVertical: 16, alignItems: 'center',
  },
  orderButtonText: { color: '#fff', fontSize: 16, fontFamily: 'PlayfairDisplay_700Bold' },
});

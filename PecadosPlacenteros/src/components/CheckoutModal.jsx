import React, { useState } from 'react';
import {
  View, Text, StyleSheet, Modal, TouchableOpacity,
  TextInput, ScrollView, TouchableWithoutFeedback, Alert,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';

const PAYMENT_METHODS = [
  { id: 'card', icon: '💳', label: 'Tarjeta' },
  { id: 'cash', icon: '💵', label: 'Efectivo' },
];

export default function CheckoutModal({ visible, onClose, total, onConfirm }) {
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [markerCoord, setMarkerCoord] = useState(null);
  const [region, setRegion] = useState({
    latitude: 6.2442,
    longitude: -75.5812,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });

  const handleMapPress = (e) => {
    setMarkerCoord(e.nativeEvent.coordinate);
  };

  const handleConfirm = () => {
    if (!address && !markerCoord) {
      Alert.alert('Dirección requerida', 'Escribe una dirección o marca tu ubicación en el mapa.');
      return;
    }
    onConfirm({ address, markerCoord, paymentMethod });
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

          <Text style={styles.sectionLabel}>📍 Dirección de entrega</Text>
          <TextInput
            style={styles.input}
            placeholder="Escribe tu dirección..."
            placeholderTextColor="#555"
            value={address}
            onChangeText={setAddress}
          />

          <Text style={styles.hint}>O toca el mapa para marcar tu ubicación</Text>
          <MapView
            style={styles.map}
            region={region}
            onRegionChangeComplete={setRegion}
            onPress={handleMapPress}
          >
            {markerCoord && <Marker coordinate={markerCoord} pinColor="#cc0000" />}
          </MapView>
          {markerCoord && (
            <Text style={styles.coordText}>
              📌 {markerCoord.latitude.toFixed(5)}, {markerCoord.longitude.toFixed(5)}
            </Text>
          )}

          <Text style={styles.sectionLabel}>💳 Método de pago</Text>
          <View style={styles.paymentRow}>
            {PAYMENT_METHODS.map((m) => (
              <TouchableOpacity
                key={m.id}
                style={[styles.paymentOption, paymentMethod === m.id && styles.paymentActive]}
                onPress={() => setPaymentMethod(m.id)}
              >
                <Text style={styles.paymentIcon}>{m.icon}</Text>
                <Text style={[styles.paymentLabel, paymentMethod === m.id && styles.paymentLabelActive]}>
                  {m.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total a pagar</Text>
            <Text style={styles.totalValue}>{total}€</Text>
          </View>

          <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
            <Text style={styles.confirmText}>Confirmar Pedido</Text>
          </TouchableOpacity>

          <View style={{ height: 20 }} />
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' },
  sheet: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#1a0000', borderTopLeftRadius: 24,
    borderTopRightRadius: 24, maxHeight: '90%',
    paddingHorizontal: 20, paddingTop: 12,
  },
  handle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: '#3a1010', alignSelf: 'center', marginBottom: 16,
  },
  title: { color: '#fff', fontSize: 20, fontFamily: 'PlayfairDisplay_700Bold', marginBottom: 20 },
  sectionLabel: { color: '#ccc', fontSize: 13, fontFamily: 'PlayfairDisplay_700Bold', marginBottom: 10 },
  input: {
    backgroundColor: '#2a0a0a', borderRadius: 10, padding: 14,
    color: '#fff', fontSize: 14, borderWidth: 1, borderColor: '#3a1010', marginBottom: 10,
  },
  hint: { color: '#555', fontSize: 12, fontFamily: 'PlayfairDisplay_400Regular', marginBottom: 8 },
  map: { width: '100%', height: 200, borderRadius: 12, marginBottom: 8 },
  coordText: { color: '#cc0000', fontSize: 12, fontFamily: 'PlayfairDisplay_400Regular', marginBottom: 20 },
  paymentRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  paymentOption: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 14, borderRadius: 10,
    backgroundColor: '#2a0a0a', borderWidth: 1, borderColor: '#3a1010',
  },
  paymentActive: { borderColor: '#cc0000', backgroundColor: '#3a0a0a' },
  paymentIcon: { fontSize: 20 },
  paymentLabel: { color: '#888', fontSize: 14, fontFamily: 'PlayfairDisplay_700Bold' },
  paymentLabelActive: { color: '#fff' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  totalLabel: { color: '#aaa', fontSize: 16, fontFamily: 'PlayfairDisplay_400Regular' },
  totalValue: { color: '#fff', fontSize: 20, fontFamily: 'PlayfairDisplay_700Bold' },
  confirmButton: {
    backgroundColor: '#cc0000', borderRadius: 10,
    paddingVertical: 16, alignItems: 'center',
  },
  confirmText: { color: '#fff', fontSize: 16, fontFamily: 'PlayfairDisplay_700Bold' },
});

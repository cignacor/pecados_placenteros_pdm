import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function ReservarScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Reservar</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a0000', alignItems: 'center', justifyContent: 'center' },
  text: { color: '#fff', fontSize: 24, fontFamily: 'PlayfairDisplay_700Bold' },
});

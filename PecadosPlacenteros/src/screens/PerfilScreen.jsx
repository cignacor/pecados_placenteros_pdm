import React from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, ImageBackground,
} from 'react-native';
import { useRouter } from 'expo-router';
import { logout } from '../services/authService';

const menuSections = [
  {
    title: 'GESTIÓN DE CUENTA',
    items: [
      { icon: '👤', label: 'Datos personales' },
      { icon: '🔒', label: 'Seguridad' },
    ],
  },
  {
    title: 'ACTIVIDAD Y RECOMPENSAS',
    items: [
      { icon: '🎟️', label: 'Cupones', badge: '3 NUEVOS' },
      { icon: '🧾', label: 'Mis pedidos' },
      { icon: '📅', label: 'Mis reservas' },
    ],
  },
  {
    title: 'CONFIGURACIÓN DE APP',
    items: [
      { icon: '💳', label: 'Métodos de pago' },
      { icon: '⚙️', label: 'Configuración' },
    ],
  },
];

export default function PerfilScreen() {
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

      {/* Header con fondo */}
      <ImageBackground
        source={require('../../assets/images/background.jpg')}
        style={styles.headerBg}
        imageStyle={{ opacity: 0.4 }}
      >
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>👤</Text>
          </View>
          <TouchableOpacity style={styles.editBadge}>
            <Text style={styles.editIcon}>✏️</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.name}>Mi Perfil</Text>
        <Text style={styles.subtitle}>SOCIO GOLD • MIEMBRO DESDE 2024</Text>
      </ImageBackground>

      {/* Secciones */}
      <View style={styles.content}>
        {menuSections.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.card}>
              {section.items.map((item, index) => (
                <TouchableOpacity
                  key={item.label}
                  style={[
                    styles.row,
                    index < section.items.length - 1 && styles.rowBorder,
                  ]}
                >
                  <Text style={styles.rowIcon}>{item.icon}</Text>
                  <Text style={styles.rowLabel}>{item.label}</Text>
                  {item.badge && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{item.badge}</Text>
                    </View>
                  )}
                  <Text style={styles.chevron}>›</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* Botón cerrar sesión */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutIcon}>↪️</Text>
          <Text style={styles.logoutText}>Cerrar sesión</Text>
        </TouchableOpacity>

        <Text style={styles.version}>Pecados Placenteros v1.0.0</Text>
        <View style={{ height: 30 }} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a0000' },

  headerBg: {
    height: 220, alignItems: 'center', justifyContent: 'flex-end',
    paddingBottom: 20, backgroundColor: '#2a0a0a',
  },
  avatarContainer: { position: 'relative', marginBottom: 12 },
  avatar: {
    width: 90, height: 90, borderRadius: 45,
    backgroundColor: '#3a1010', borderWidth: 3, borderColor: '#cc0000',
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: 40 },
  editBadge: {
    position: 'absolute', bottom: 0, right: 0,
    backgroundColor: '#cc0000', borderRadius: 12,
    width: 24, height: 24, alignItems: 'center', justifyContent: 'center',
  },
  editIcon: { fontSize: 12 },
  name: { color: '#fff', fontSize: 22, fontFamily: 'PlayfairDisplay_700Bold' },
  subtitle: { color: '#cc0000', fontSize: 11, fontFamily: 'PlayfairDisplay_700Bold', letterSpacing: 1, marginTop: 4 },

  content: { paddingHorizontal: 16, paddingTop: 24 },

  section: { marginBottom: 20 },
  sectionTitle: {
    color: '#666', fontSize: 11, fontFamily: 'PlayfairDisplay_700Bold',
    letterSpacing: 2, marginBottom: 8,
  },
  card: { backgroundColor: '#2a0a0a', borderRadius: 12, overflow: 'hidden' },
  row: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 16,
  },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: '#3a1010' },
  rowIcon: { fontSize: 18, marginRight: 14 },
  rowLabel: { flex: 1, color: '#fff', fontSize: 15, fontFamily: 'PlayfairDisplay_400Regular' },
  badge: {
    backgroundColor: '#cc0000', borderRadius: 10,
    paddingHorizontal: 8, paddingVertical: 2, marginRight: 8,
  },
  badgeText: { color: '#fff', fontSize: 10, fontFamily: 'PlayfairDisplay_700Bold' },
  chevron: { color: '#666', fontSize: 20 },

  logoutButton: {
    backgroundColor: '#cc0000', borderRadius: 10,
    paddingVertical: 16, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center',
    gap: 10, marginBottom: 20,
  },
  logoutIcon: { fontSize: 18 },
  logoutText: { color: '#fff', fontSize: 16, fontFamily: 'PlayfairDisplay_700Bold' },

  version: { color: '#444', fontSize: 12, textAlign: 'center', fontFamily: 'PlayfairDisplay_400Regular' },
});

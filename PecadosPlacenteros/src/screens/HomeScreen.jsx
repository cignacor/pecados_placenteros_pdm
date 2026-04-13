import React from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  ImageBackground, TouchableOpacity, Image,
} from 'react-native';
import { useRouter } from 'expo-router';

const menuItems = [
  {
    id: 1,
    category: 'BURGERS',
    name: 'La Perdición',
    image: { uri: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400' },
  },
  {
    id: 2,
    category: 'ENTRANTES',
    name: 'Placer Prohibido',
    image: { uri: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400' },
  },
  {
    id: 3,
    category: 'POSTRES',
    name: 'Dulce Castigo',
    image: { uri: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400' },
  },
];

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>PECADOS PLACENTEROS</Text>
          <View style={styles.cartBadge}>
            <Text style={styles.cartIcon}>🛍️</Text>
            <View style={styles.badge}><Text style={styles.badgeText}>2</Text></View>
          </View>
        </View>

        {/* Hero Banner */}
        <ImageBackground
          source={{ uri: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=800' }}
          style={styles.hero}
          imageStyle={{ borderRadius: 12 }}
        >
          <View style={styles.heroOverlay}>
            <View style={styles.premiumBadge}>
              <Text style={styles.premiumText}>★ PREMIUM</Text>
            </View>
            <Text style={styles.heroSubtitle}>RECOMENDACIÓN DEL CHEF</Text>
            <Text style={styles.heroTitle}>GUSTO</Text>
            <Text style={styles.heroTitleRed}>INFERNAL</Text>
            <Text style={styles.heroDesc}>
              Carne madurada, queso ahumado y nuestra mermelada secreta de chiles rojos.
            </Text>
            <TouchableOpacity style={styles.heroButton}>
              <Text style={styles.heroButtonText}>PEDIR AHORA 🔥</Text>
            </TouchableOpacity>
          </View>
        </ImageBackground>

        {/* Menú de Tentaciones */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Menú de Tentaciones</Text>
            <TouchableOpacity onPress={() => router.push('/menu')}>
              <Text style={styles.seeAll}>VER TODO</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.grid}>
            {menuItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[styles.card, item.id === 3 && styles.cardWide]}
                onPress={() => router.push({ pathname: '/(tabs)/menu', params: { category: item.category } })}
              >
                <ImageBackground source={item.image} style={styles.cardImage} imageStyle={{ borderRadius: 10 }}>
                  <View style={styles.cardOverlay}>
                    <Text style={styles.cardCategory}>{item.category}</Text>
                    <Text style={styles.cardName}>{item.name}</Text>
                  </View>
                </ImageBackground>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Club del Pecado */}
        <View style={styles.club}>
          <View style={styles.clubInfo}>
            <Text style={styles.clubTitle}>CLUB DEL PECADO</Text>
            <Text style={styles.clubDesc}>
              Acumula puntos en cada mordisco y canjéalos por recompensas exclusivas.
            </Text>
            <TouchableOpacity>
              <Text style={styles.clubLink}>UNIRSE AHORA</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.clubIcon}>
            <Text style={{ fontSize: 28 }}>🏆</Text>
          </View>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a0000' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingHorizontal: 16, paddingTop: 50, paddingBottom: 12,
  },
  headerTitle: {
    color: '#fff', fontSize: 16,
    fontFamily: 'PlayfairDisplay_700Bold', letterSpacing: 1,
  },
  cartBadge: { position: 'relative' },
  cartIcon: { fontSize: 24 },
  badge: {
    position: 'absolute', top: -4, right: -4,
    backgroundColor: '#cc0000', borderRadius: 10,
    width: 18, height: 18, alignItems: 'center', justifyContent: 'center',
  },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },

  // Hero
  hero: { marginHorizontal: 16, height: 280, borderRadius: 12, marginBottom: 24 },
  heroOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: 12, padding: 16, justifyContent: 'flex-end',
  },
  premiumBadge: {
    position: 'absolute', top: 12, right: 12,
    backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 10,
    paddingVertical: 4, borderRadius: 20,
  },
  premiumText: { color: '#fff', fontSize: 11, fontFamily: 'PlayfairDisplay_700Bold' },
  heroSubtitle: { color: '#aaa', fontSize: 10, letterSpacing: 2, marginBottom: 4 },
  heroTitle: {
    color: '#fff', fontSize: 36,
    fontFamily: 'PlayfairDisplay_700Bold', lineHeight: 38,
  },
  heroTitleRed: {
    color: '#cc0000', fontSize: 32,
    fontFamily: 'PlayfairDisplay_700Bold', marginBottom: 8,
  },
  heroDesc: { color: '#ddd', fontSize: 13, fontFamily: 'PlayfairDisplay_400Regular', marginBottom: 16 },
  heroButton: {
    backgroundColor: '#cc0000', borderRadius: 8,
    paddingVertical: 12, paddingHorizontal: 20, alignSelf: 'flex-start',
  },
  heroButtonText: { color: '#fff', fontFamily: 'PlayfairDisplay_700Bold', fontSize: 14 },

  // Sección menú
  section: { paddingHorizontal: 16, marginBottom: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sectionTitle: { color: '#fff', fontSize: 20, fontFamily: 'PlayfairDisplay_700Bold' },
  seeAll: { color: '#cc0000', fontSize: 12, fontFamily: 'PlayfairDisplay_700Bold' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  card: { width: '47%', height: 150 },
  cardWide: { width: '47%' },
  cardImage: { flex: 1, justifyContent: 'flex-end' },
  cardOverlay: {
    backgroundColor: 'rgba(0,0,0,0.45)', borderRadius: 10,
    padding: 10,
  },
  cardCategory: { color: '#cc0000', fontSize: 10, fontFamily: 'PlayfairDisplay_700Bold', letterSpacing: 1 },
  cardName: { color: '#fff', fontSize: 14, fontFamily: 'PlayfairDisplay_700Bold' },

  // Club
  club: {
    marginHorizontal: 16, backgroundColor: '#2a0a0a',
    borderRadius: 12, padding: 16,
    flexDirection: 'row', alignItems: 'center',
  },
  clubInfo: { flex: 1 },
  clubTitle: { color: '#cc0000', fontSize: 14, fontFamily: 'PlayfairDisplay_700Bold', letterSpacing: 1, marginBottom: 6 },
  clubDesc: { color: '#aaa', fontSize: 12, fontFamily: 'PlayfairDisplay_400Regular', marginBottom: 10 },
  clubLink: { color: '#cc0000', fontSize: 12, fontFamily: 'PlayfairDisplay_700Bold' },
  clubIcon: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: '#cc0000', alignItems: 'center', justifyContent: 'center',
  },
});

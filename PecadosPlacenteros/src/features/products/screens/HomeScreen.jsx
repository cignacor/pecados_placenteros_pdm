import { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  ImageBackground, TouchableOpacity, Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useCart } from '../../cart/context/CartContext';

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

const GUSTO_INFERNAL = {
  id: 'gusto-infernal',
  name: 'Gusto Infernal',
  price: '32900 COP',
  category: 'BURGERS',
  image: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=800',
  description:
    'La burger más temida del menú. Carne madurada 45 días, queso gouda ahumado fundido, mermelada secreta de chiles rojos y cebolla caramelizada al vino tinto. Solo para los que se atreven.',
  ingredientes: [
    { icono: '🥩', nombre: 'Doble carne madurada 45 días', detalle: '2 × 150 g, cocción media' },
    { icono: '🧀', nombre: 'Queso gouda ahumado', detalle: 'Fundido en dos capas' },
    { icono: '🌶️', nombre: 'Mermelada de chiles rojos', detalle: 'Receta secreta de la casa' },
    { icono: '🧅', nombre: 'Cebolla caramelizada', detalle: 'Al vino tinto, 3 horas de cocción' },
    { icono: '🥬', nombre: 'Lechuga mantequilla', detalle: 'Fresca, hoja entera' },
    { icono: '🍅', nombre: 'Tomate asado', detalle: 'Confitado con hierbas provenzales' },
    { icono: '🫙', nombre: 'Salsa infernal', detalle: 'Mayonesa ahumada + sriracha + ajo negro' },
    { icono: '🍞', nombre: 'Pan brioche negro', detalle: 'Con carbón activado, tostado en mantequilla' },
  ],
  extras: ['Papas fritas de la casa', 'Bebida a elección'],
};

export default function HomeScreen() {
  const router = useRouter();
  const { addItem, count } = useCart();
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>PECADOS PLACENTEROS</Text>
          <TouchableOpacity style={styles.cartBadge} onPress={() => router.push('/(tabs)/cart')}>
            <Text style={styles.cartIcon}>🛍️</Text>
            {count > 0 && (
              <View style={styles.badge}><Text style={styles.badgeText}>{count}</Text></View>
            )}
          </TouchableOpacity>
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
            <TouchableOpacity style={styles.heroButton} onPress={() => setModalVisible(true)}>
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

        {/* Club del Pecado
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
        </View> */}

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* ── Modal Gusto Infernal ── */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* Imagen hero */}
            <ImageBackground
              source={{ uri: GUSTO_INFERNAL.image }}
              style={styles.modalHero}
              imageStyle={{ borderTopLeftRadius: 20, borderTopRightRadius: 20 }}
            >
              <View style={styles.modalHeroOverlay}>
                <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setModalVisible(false)}>
                  <Text style={styles.modalCloseTxt}>✕</Text>
                </TouchableOpacity>
                <View style={styles.modalBadge}>
                  <Text style={styles.modalBadgeTxt}>★ RECOMENDACIÓN DEL CHEF</Text>
                </View>
                <Text style={styles.modalNombre}>{GUSTO_INFERNAL.name}</Text>
                <Text style={styles.modalPrecio}>{GUSTO_INFERNAL.price}</Text>
              </View>
            </ImageBackground>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {/* Descripción */}
              <Text style={styles.modalDesc}>{GUSTO_INFERNAL.description}</Text>

              {/* Ingredientes */}
              <Text style={styles.modalSeccion}>LA RECETA</Text>
              {GUSTO_INFERNAL.ingredientes.map((ing, i) => (
                <View key={i} style={styles.ingredienteRow}>
                  <Text style={styles.ingredienteIcono}>{ing.icono}</Text>
                  <View style={styles.ingredienteInfo}>
                    <Text style={styles.ingredienteNombre}>{ing.nombre}</Text>
                    <Text style={styles.ingredienteDetalle}>{ing.detalle}</Text>
                  </View>
                </View>
              ))}

              {/* Incluye */}
              <Text style={styles.modalSeccion}>INCLUYE</Text>
              {GUSTO_INFERNAL.extras.map((e, i) => (
                <View key={i} style={styles.extraRow}>
                  <Text style={styles.extraPunto}>✦</Text>
                  <Text style={styles.extraTexto}>{e}</Text>
                </View>
              ))}

              {/* Botón agregar */}
              <TouchableOpacity
                style={styles.modalAddBtn}
                onPress={() => {
                  addItem({
                    id: GUSTO_INFERNAL.id,
                    name: GUSTO_INFERNAL.name,
                    price: GUSTO_INFERNAL.price,
                    image: GUSTO_INFERNAL.image,
                    category: GUSTO_INFERNAL.category,
                  });
                  setModalVisible(false);
                  router.push('/(tabs)/cart');
                }}
              >
                <Text style={styles.modalAddTxt}>AGREGAR AL CARRITO  🔥</Text>
              </TouchableOpacity>

              <View style={{ height: 32 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1b0101ff' },
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

  // Modal Gusto Infernal
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#1a0000',
    borderTopLeftRadius: 20, borderTopRightRadius: 20,
    maxHeight: '92%',
  },
  modalHero: {
    height: 220,
  },
  modalHeroOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderTopLeftRadius: 20, borderTopRightRadius: 20,
    padding: 16,
    justifyContent: 'flex-end',
  },
  modalCloseBtn: {
    position: 'absolute', top: 14, right: 14,
    backgroundColor: 'rgba(0,0,0,0.6)',
    width: 32, height: 32, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
  },
  modalCloseTxt: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  modalBadge: {
    backgroundColor: 'rgba(204,0,0,0.85)',
    alignSelf: 'flex-start',
    borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4,
    marginBottom: 8,
  },
  modalBadgeTxt: { color: '#fff', fontSize: 10, fontFamily: 'PlayfairDisplay_700Bold', letterSpacing: 1 },
  modalNombre: {
    color: '#fff', fontSize: 28,
    fontFamily: 'PlayfairDisplay_700Bold', lineHeight: 30,
  },
  modalPrecio: {
    color: '#cc0000', fontSize: 18,
    fontFamily: 'PlayfairDisplay_700Bold', marginTop: 4,
  },
  modalBody: {
    paddingHorizontal: 20, paddingTop: 16,
  },
  modalDesc: {
    color: '#ccc', fontSize: 14,
    fontFamily: 'PlayfairDisplay_400Regular',
    lineHeight: 22, marginBottom: 20,
  },
  modalSeccion: {
    color: '#cc0000', fontSize: 11,
    fontFamily: 'PlayfairDisplay_700Bold',
    letterSpacing: 2, marginBottom: 12, marginTop: 4,
  },
  ingredienteRow: {
    flexDirection: 'row', alignItems: 'flex-start',
    gap: 12, marginBottom: 12,
    backgroundColor: '#2a0a0a', borderRadius: 10,
    padding: 12, borderWidth: 1, borderColor: '#3d0000',
  },
  ingredienteIcono: { fontSize: 22, marginTop: 1 },
  ingredienteInfo: { flex: 1 },
  ingredienteNombre: {
    color: '#fff', fontSize: 14,
    fontFamily: 'PlayfairDisplay_700Bold',
  },
  ingredienteDetalle: {
    color: '#888', fontSize: 12,
    fontFamily: 'PlayfairDisplay_400Regular', marginTop: 2,
  },
  extraRow: {
    flexDirection: 'row', alignItems: 'center',
    gap: 10, marginBottom: 8,
  },
  extraPunto: { color: '#cc0000', fontSize: 12 },
  extraTexto: { color: '#ccc', fontSize: 13 },
  modalAddBtn: {
    backgroundColor: '#cc0000', borderRadius: 12,
    paddingVertical: 16, alignItems: 'center',
    marginTop: 24,
    shadowColor: '#cc0000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5, shadowRadius: 8, elevation: 6,
  },
  modalAddTxt: {
    color: '#fff', fontSize: 15,
    fontFamily: 'PlayfairDisplay_700Bold', letterSpacing: 1,
  },
});

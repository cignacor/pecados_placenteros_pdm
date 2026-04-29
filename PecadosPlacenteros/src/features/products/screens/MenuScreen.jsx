import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Image, TextInput, ActivityIndicator,
} from 'react-native';
import { fetchMenu } from '../services/productService';
import { useLocalSearchParams } from 'expo-router';
import ProductModal from '../components/ProductModal';

const categories = ['BURGERS', 'ENTRANTES', 'POSTRES', 'BEBIDAS'];

export default function MenuScreen() {
  const { category } = useLocalSearchParams();
  const [activeCategory, setActiveCategory] = useState(category || 'BURGERS');
  const [menuData, setMenuData] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const scrollRef = useRef(null);
  const sectionOffsets = useRef({});

  const scrollToCategory = (cat) => {
    setActiveCategory(cat);
    const offset = sectionOffsets.current[cat];
    if (offset !== undefined && scrollRef.current) {
      scrollRef.current.scrollTo({ y: offset, animated: true });
    }
  };

  useEffect(() => {
    fetchMenu()
      .then(setMenuData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (category && !loading) {
      setTimeout(() => scrollToCategory(category), 100);
    }
  }, [category, loading]);

  const renderItem = (item) => {
    const imageSource = item.image ? { uri: item.image } : null;

    if (item.featured) {
      return (
        <TouchableOpacity key={item.id} onPress={() => setSelectedProduct(item)}>
        <View style={styles.featuredCard}>
          {item.featuredLabel ? (
            <View style={styles.featuredBadgeRow}>
              <Text style={styles.featuredBadge}>{item.featuredLabel}</Text>
            </View>
          ) : null}
          {imageSource && <Image source={imageSource} style={styles.featuredImage} />}
          <View style={styles.featuredInfo}>
            <View style={styles.itemRow}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemPrice}>{item.price}</Text>
            </View>
            <Text style={styles.itemDesc}>{item.description}</Text>
            <TouchableOpacity style={styles.addButton} onPress={() => setSelectedProduct(item)}>
              <Text style={styles.addButtonText}>+ Añadir al Pedido</Text>
            </TouchableOpacity>
          </View>
        </View>
        </TouchableOpacity>
      );
    }

    if (!imageSource) {
      return (
        <TouchableOpacity key={item.id} style={styles.drinkRow} onPress={() => setSelectedProduct(item)}>
          <View style={styles.drinkInfo}>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemDesc}>{item.description}</Text>
          </View>
          <View style={styles.drinkRight}>
            <Text style={styles.itemPrice}>{item.price}</Text>
            <TouchableOpacity style={styles.addCircle}>
              <Text style={styles.addCircleText}>+</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity key={item.id} style={styles.compactCard} onPress={() => setSelectedProduct(item)}>
        <Image source={imageSource} style={styles.compactImage} />
        <View style={styles.compactInfo}>
          <View style={styles.itemRow}>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemPrice}>{item.price}</Text>
          </View>
          <Text style={styles.itemDesc}>{item.description}</Text>
        </View>
        <TouchableOpacity style={styles.addCircle} onPress={() => setSelectedProduct(item)}>
          <Text style={styles.addCircleText}>+</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, { alignItems: 'center', justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color="#cc0000" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.avatar} />
          <Text style={styles.headerTitle}>PECADOS PLACENTEROS</Text>
        </View>
        <Text style={styles.cartIcon}>🛒</Text>
      </View>

      {/* Buscador */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Busca tu tentación..."
          placeholderTextColor="#666"
        />
      </View>

      {/* Categorías */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesBar}>
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[styles.catTab, activeCategory === cat && styles.catTabActive]}
            onPress={() => scrollToCategory(cat)}
          >
            <Text style={[styles.catText, activeCategory === cat && styles.catTextActive]}>
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Contenido */}
      <ScrollView ref={scrollRef} showsVerticalScrollIndicator={false} style={styles.content}>
        {categories.map((cat) => (
          <View
            key={cat}
            style={styles.section}
            onLayout={(e) => { sectionOffsets.current[cat] = e.nativeEvent.layout.y; }}
          >
            <View style={styles.sectionTitleRow}>
              <View style={styles.sectionAccent} />
              <Text style={styles.sectionTitle}>{cat.charAt(0) + cat.slice(1).toLowerCase()}</Text>
            </View>
            {menuData[cat].map((item) => renderItem(item))}
          </View>
        ))}
        <View style={{ height: 80 }} />
      </ScrollView>

      <ProductModal
        product={selectedProduct}
        visible={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a0000' },

  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingHorizontal: 16,
    paddingTop: 50, paddingBottom: 12,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#cc0000' },
  headerTitle: { color: '#fff', fontSize: 15, fontFamily: 'PlayfairDisplay_700Bold', letterSpacing: 1 },
  cartIcon: { fontSize: 22 },

  searchContainer: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#2a0a0a', marginHorizontal: 16,
    borderRadius: 10, paddingHorizontal: 12, marginBottom: 12,
    borderWidth: 1, borderColor: '#3a1010',
  },
  searchIcon: { fontSize: 14, marginRight: 8 },
  searchInput: { flex: 1, color: '#fff', paddingVertical: 10, fontFamily: 'PlayfairDisplay_400Regular' },

  categoriesBar: { paddingHorizontal: 16, marginBottom: 8, flexGrow: 0 },
  catTab: { paddingHorizontal: 14, paddingVertical: 6, marginRight: 8, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  catTabActive: { borderBottomColor: '#cc0000' },
  catText: { color: '#666', fontSize: 12, fontFamily: 'PlayfairDisplay_700Bold' },
  catTextActive: { color: '#cc0000' },

  content: { flex: 1, paddingHorizontal: 16 },

  section: { marginBottom: 24 },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  sectionAccent: { width: 4, height: 22, backgroundColor: '#cc0000', borderRadius: 2, marginRight: 10 },
  sectionTitle: { color: '#fff', fontSize: 20, fontFamily: 'PlayfairDisplay_700Bold' },

  // Featured card
  featuredCard: { backgroundColor: '#2a0a0a', borderRadius: 12, overflow: 'hidden', marginBottom: 12 },
  featuredBadgeRow: { position: 'absolute', top: 10, right: 10, zIndex: 1 },
  featuredBadge: { color: '#cc0000', fontSize: 10, fontFamily: 'PlayfairDisplay_700Bold' },
  featuredImage: { width: '100%', height: 200 },
  featuredInfo: { padding: 14 },

  // Compact card
  compactCard: {
    flexDirection: 'row', backgroundColor: '#2a0a0a',
    borderRadius: 10, marginBottom: 10, overflow: 'hidden', alignItems: 'center',
  },
  compactImage: { width: 80, height: 80 },
  compactInfo: { flex: 1, padding: 10 },

  // Drink row
  drinkRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: '#2a0a0a',
  },
  drinkInfo: { flex: 1, paddingRight: 10 },
  drinkRight: { alignItems: 'flex-end', gap: 8 },

  // Shared
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  itemName: { color: '#fff', fontSize: 14, fontFamily: 'PlayfairDisplay_700Bold', flex: 1 },
  itemPrice: { color: '#cc0000', fontSize: 14, fontFamily: 'PlayfairDisplay_700Bold' },
  itemDesc: { color: '#888', fontSize: 12, fontFamily: 'PlayfairDisplay_400Regular', lineHeight: 18 },

  addButton: {
    backgroundColor: '#cc0000', borderRadius: 8,
    paddingVertical: 12, alignItems: 'center', marginTop: 12,
  },
  addButtonText: { color: '#fff', fontFamily: 'PlayfairDisplay_700Bold', fontSize: 14 },

  addCircle: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: '#cc0000', alignItems: 'center', justifyContent: 'center',
  },
  addCircleText: { color: '#fff', fontSize: 20, lineHeight: 22 },
});

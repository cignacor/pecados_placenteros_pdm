import { Tabs } from 'expo-router';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

function TabIcon({ emoji, focused }: { emoji: string; focused: boolean }) {
  return <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.5 }}>{emoji}</Text>;
}

function CartButton({ onPress }: { onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.cartWrapper}>
      <View style={styles.cartButton}>
        <Text style={styles.cartIcon}>🛒</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#1a0000',
          borderTopColor: '#3a1010',
          height: 64,
          paddingBottom: 8,
        },
        tabBarActiveTintColor: '#cc0000',
        tabBarInactiveTintColor: '#888',
        tabBarLabelStyle: {
          fontFamily: 'PlayfairDisplay_400Regular',
          fontSize: 10,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'INICIO',
          tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="menu"
        options={{
          title: 'CARTA',
          tabBarIcon: ({ focused }) => <TabIcon emoji="🍽️" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: '',
          tabBarLabel: () => null,
          tabBarIcon: () => null,
          tabBarButton: (props) => <CartButton onPress={props.onPress ?? (() => {})} />,
        }}
      />
      <Tabs.Screen
        name="reservar"
        options={{
          title: 'RESERVAR',
          tabBarIcon: ({ focused }) => <TabIcon emoji="📅" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          title: 'PERFIL',
          tabBarIcon: ({ focused }) => <TabIcon emoji="👤" focused={focused} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  cartWrapper: {
    top: -20,
    alignItems: 'center',
    justifyContent: 'center',
    width: 70,
  },
  cartButton: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#cc0000',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#cc0000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  cartIcon: { fontSize: 26 },
});

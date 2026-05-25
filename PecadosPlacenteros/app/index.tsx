import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { View, ActivityIndicator } from 'react-native';
import { auth } from '../src/api/firebaseConfig';
import { getUserProfile } from '../src/features/auth/services/authService';

export default function Index() {
  const [route, setRoute] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setRoute('/login');
        return;
      }
      try {
        const profile = await getUserProfile(user.uid);
        setRoute(profile?.role === 'admin' ? '/admin' : '/(tabs)');
      } catch {
        setRoute('/login');
      }
    });
    return unsubscribe;
  }, []);

  if (!route) {
    return (
      <View style={{ flex: 1, backgroundColor: '#1a0000', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color="#cc0000" size="large" />
      </View>
    );
  }

  return <Redirect href={route as any} />;
}

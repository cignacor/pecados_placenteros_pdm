import { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import { onAuthStateChanged } from 'firebase/auth';
import { View, ActivityIndicator } from 'react-native';
import { auth } from '../src/api/firebaseConfig';
import { getUserProfile } from '../src/features/auth/services/authService';
import AdminScreen from '../src/features/products/screens/AdminScreen';

export default function AdminRoute() {
  const [status, setStatus] = useState<'loading' | 'admin' | 'denied'>('loading');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setStatus('denied');
        return;
      }
      try {
        const profile = await getUserProfile(user.uid);
        setStatus(profile?.role === 'admin' ? 'admin' : 'denied');
      } catch {
        setStatus('denied');
      }
    });
    return unsubscribe;
  }, []);

  if (status === 'loading') {
    return (
      <View style={{ flex: 1, backgroundColor: '#1a0000', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color="#cc0000" size="large" />
      </View>
    );
  }

  if (status === 'denied') return <Redirect href="/login" />;

  return <AdminScreen />;
}

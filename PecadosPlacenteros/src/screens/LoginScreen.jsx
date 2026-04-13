import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ImageBackground,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { signInWithEmail, getUserProfile } from '../services/authService';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      alert('Ingresa tu correo y contraseña.');
      return;
    }
    setLoading(true);
    try {
      const user = await signInWithEmail(email, password);
      const profile = await getUserProfile(user.uid);
      if (profile?.role === 'admin') {
        router.replace('/admin');
      } else {
        router.replace('/(tabs)');
      }
    } catch (e) {
      alert('Correo o contraseña incorrectos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground
      source={require('../../assets/images/background.jpg')}
      style={styles.container}
      resizeMode="cover"
    >
      <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inner}
      >
        {/* Logo */}
        <Image
          source={require('../../assets/images/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />

        {/* Título */}
        <Text style={styles.title}>Bienvenido</Text>
        <Text style={styles.subtitle}>Entra en un mundo de sensaciones</Text>

        {/* Formulario */}
        <View style={styles.form}>
          <Text style={styles.label}>Correo Electrónico</Text>
          <TextInput
            style={styles.input}
            placeholder="ejemplo@correo.com"
            placeholderTextColor="#666"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />

          <Text style={styles.label}>Contraseña</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="••••••••"
              placeholderTextColor="#666"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Text style={styles.eyeIcon}>{showPassword ? '🙈' : '👁️'}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity>
            <Text style={styles.forgotPassword}>¿Olvidaste tu contraseña?</Text>
          </TouchableOpacity>
        </View>

        {/* Botón principal */}
        <TouchableOpacity style={styles.loginButton} onPress={handleLogin} disabled={loading}>
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
          }
        </TouchableOpacity>

        {/* Registro */}
        <View style={styles.registerContainer}>
          <Text style={styles.registerText}>¿No tienes cuenta? </Text>
          <TouchableOpacity onPress={() => router.push('/register')}>
            <Text style={styles.registerLink}>Regístrate</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  logo: {
    width: 320,
    height: 140,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontFamily: 'PlayfairDisplay_700Bold',
    color: '#fff',
    marginBottom: 6,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'PlayfairDisplay_400Regular',
    color: '#aaa',
    marginBottom: 32,
  },
  form: {
    width: '100%',
    backgroundColor: '#2a0a0a',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
  },
  label: {
    color: '#ccc',
    fontSize: 13,
    fontFamily: 'PlayfairDisplay_400Regular',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#1a0000',
    borderRadius: 8,
    padding: 14,
    color: '#fff',
    fontSize: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#3a1010',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a0000',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3a1010',
    paddingHorizontal: 14,
    marginBottom: 12,
  },
  passwordInput: {
    flex: 1,
    padding: 14,
    color: '#fff',
    fontSize: 14,
  },
  eyeIcon: {
    fontSize: 18,
    padding: 4,
  },
  forgotPassword: {
    color: '#cc2222',
    fontSize: 13,
    textAlign: 'right',
  },
  loginButton: {
    width: '100%',
    backgroundColor: '#cc0000',
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'PlayfairDisplay_700Bold',
    letterSpacing: 1,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#3a1010',
  },
  dividerText: {
    color: '#666',
    fontSize: 11,
    marginHorizontal: 10,
  },
  socialContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 28,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#3a1010',
    borderRadius: 10,
    paddingVertical: 12,
    gap: 8,
  },
  socialIcon: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  socialText: {
    color: '#fff',
    fontSize: 14,
  },
  registerContainer: {
    flexDirection: 'row',
  },
  registerText: {
    color: '#aaa',
    fontSize: 14,
  },
  registerLink: {
    color: '#cc0000',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

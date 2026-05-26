import { useState } from 'react';
import PropTypes from 'prop-types';
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
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../../api/firebaseConfig';
import { signInWithEmail, getUserProfile } from '../services/authService';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Recuperar contraseña
  const [modalRecuperar, setModalRecuperar] = useState(false);
  const [emailRecuperar, setEmailRecuperar] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);

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
    } catch {
      alert('Correo o contraseña incorrectos.');
    } finally {
      setLoading(false);
    }
  };

  const abrirRecuperar = () => {
    setEmailRecuperar(email); // pre-llenar con el email del login si ya lo escribió
    setEnviado(false);
    setModalRecuperar(true);
  };

  const cerrarRecuperar = () => {
    setModalRecuperar(false);
    setEmailRecuperar('');
    setEnviado(false);
  };

  const handleEnviarRecuperar = async () => {
    if (!emailRecuperar.trim()) {
      alert('Ingresa tu correo electrónico.');
      return;
    }
    setEnviando(true);
    try {
      await sendPasswordResetEmail(auth, emailRecuperar.trim());
      setEnviado(true);
    } catch (e) {
      if (e.code === 'auth/user-not-found' || e.code === 'auth/invalid-email') {
        alert('No encontramos una cuenta con ese correo.');
      } else {
        alert('No se pudo enviar el correo. Inténtalo de nuevo.');
      }
    } finally {
      setEnviando(false);
    }
  };

  return (
    <ImageBackground
      source={require('../../../../assets/images/background.jpg')}
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
          source={require('../../../../assets/images/logo.png')}
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

          <TouchableOpacity onPress={abrirRecuperar}>
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

      {/* ── Modal recuperar contraseña ── */}
      <Modal visible={modalRecuperar} transparent animationType="fade">
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.modalCard}>

            {!enviado ? (
              <>
                <Text style={styles.modalTitulo}>Recuperar contraseña</Text>
                <Text style={styles.modalDesc}>
                  Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.
                </Text>

                <Text style={styles.modalLabel}>Correo electrónico</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="ejemplo@correo.com"
                  placeholderTextColor="#555"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={emailRecuperar}
                  onChangeText={setEmailRecuperar}
                />

                <View style={styles.modalBotones}>
                  <TouchableOpacity style={styles.btnCancelar} onPress={cerrarRecuperar}>
                    <Text style={styles.btnCancelarTexto}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.btnEnviar}
                    onPress={handleEnviarRecuperar}
                    disabled={enviando}
                  >
                    {enviando
                      ? <ActivityIndicator color="#fff" size="small" />
                      : <Text style={styles.btnEnviarTexto}>Enviar</Text>
                    }
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <>
                <Text style={styles.enviadoIcono}>✉️</Text>
                <Text style={styles.modalTitulo}>Correo enviado</Text>
                <Text style={styles.modalDesc}>
                  Revisa tu bandeja de entrada en{' '}
                  <Text style={{ color: '#cc0000' }}>{emailRecuperar}</Text>
                  {' '}y sigue el enlace para restablecer tu contraseña.
                </Text>
                <TouchableOpacity style={styles.btnEnviar} onPress={cerrarRecuperar}>
                  <Text style={styles.btnEnviarTexto}>Entendido</Text>
                </TouchableOpacity>
              </>
            )}

          </View>
        </KeyboardAvoidingView>
      </Modal>
    </ImageBackground>
  );
}

LoginScreen.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func,
  }),
};

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

  // Modal recuperar contraseña
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalCard: {
    width: '100%',
    backgroundColor: '#2a0a0a',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: '#3d0000',
  },
  enviadoIcono: {
    fontSize: 40,
    textAlign: 'center',
    marginBottom: 12,
  },
  modalTitulo: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'PlayfairDisplay_700Bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalDesc: {
    color: '#aaa',
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalLabel: {
    color: '#ccc',
    fontSize: 12,
    marginBottom: 6,
  },
  modalInput: {
    backgroundColor: '#1a0000',
    borderRadius: 8,
    padding: 14,
    color: '#fff',
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#3a1010',
    marginBottom: 20,
  },
  modalBotones: {
    flexDirection: 'row',
    gap: 10,
  },
  btnCancelar: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#555',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  btnCancelarTexto: {
    color: '#aaa',
    fontSize: 14,
    fontFamily: 'PlayfairDisplay_700Bold',
  },
  btnEnviar: {
    flex: 1,
    backgroundColor: '#cc0000',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  btnEnviarTexto: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'PlayfairDisplay_700Bold',
  },
});

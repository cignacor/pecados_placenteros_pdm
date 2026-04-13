import { Redirect } from 'expo-router';

export default function Index() {
  // TODO: verificar sesión activa, si hay sesión ir a tabs, si no a login
  return <Redirect href="/login" />;
}

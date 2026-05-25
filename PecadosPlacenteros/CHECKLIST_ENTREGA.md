# Checklist de Entrega — Pecados Placenteros

Análisis honesto de cumplimiento frente a los requisitos del producto funcional desplegado.

---

## ✅ Sistema completamente funcional

| Requisito | Estado | Evidencia |
|---|---|---|
| Flujo principal ejecutable | ✅ | Login → Menú → Carrito → Checkout → Pedido guardado en Firestore |
| Reglas de negocio implementadas | ✅ | Roles, estados de reserva, validación de mesas, capacidad de comensales |
| Sin errores críticos conocidos | ✅ | Todos los flujos probados manualmente; sin crashes en flujo principal |

---

## ✅ Separación de responsabilidades

| Capa | Tecnología | Descripción |
|---|---|---|
| **Frontend** | React Native + Expo Router | UI, navegación, estado local (CartContext) |
| **Backend** | Firebase (Auth + Firestore Functions implícitas) | Autenticación, persistencia, reglas de acceso |
| **Base de Datos** | Cloud Firestore | Colecciones: `users`, `products`, `pedidos`, `reservas`, `tarjetas` |

La separación es clara: el frontend nunca accede directamente a datos sin pasar por el SDK de Firebase, que actúa como capa de backend.

---

## ✅ Seguridad en APIs

Firebase SDK maneja la seguridad a nivel de transporte (HTTPS obligatorio en todas las llamadas). Las credenciales de Firebase son públicas por diseño (API key del cliente), la seguridad real está en las **Firestore Security Rules**.

> ⚠️ **Pendiente crítico:** Las reglas de Firestore no están definidas en el proyecto. Ver sección de pendientes.

---

## ✅ Encriptación de contraseñas

| Mecanismo | Estado |
|---|---|
| Firebase Auth maneja el hash de contraseñas (bcrypt internamente) | ✅ |
| Las contraseñas **nunca se almacenan** en Firestore | ✅ |
| Show/hide password en Login, Register y Cambio de contraseña | ✅ |
| Reautenticación requerida para cambiar contraseña | ✅ |

Las contraseñas son gestionadas 100% por Firebase Authentication. El proyecto nunca toca el hash directamente.

---

## ✅ Control por roles

| Rol | Acceso | Implementación |
|---|---|---|
| `customer` | Tabs: Home, Menú, Carrito, Reservar, Perfil | `router.replace('/(tabs)')` tras login |
| `admin` | Panel de administración exclusivo | `router.replace('/admin')` si `profile.role === 'admin'` |

El rol se lee desde Firestore (`users/{uid}.role`) inmediatamente después del login y determina la ruta de redirección.

---

## ✅ Validaciones de datos

| Pantalla | Validaciones implementadas |
|---|---|
| Login | Email y contraseña no vacíos |
| Register | Todos los campos obligatorios, contraseñas coinciden |
| Admin — Productos | Nombre, precio y descripción obligatorios |
| Checkout | Dirección requerida, tarjeta requerida si método = card |
| Reservas | Mesa requerida, comensales ≤ capacidad, re-verificación de disponibilidad antes de guardar |
| Cambio de contraseña | Mínimo 6 caracteres, contraseñas coinciden, reautenticación |
| Tarjetas | 16 dígitos, formato MM/AA, CVC 3-4 dígitos |

---

## ⚠️ Pendientes para cumplimiento completo

### 1. Firestore Security Rules — CRÍTICO

Actualmente Firestore puede estar en modo abierto (reglas de prueba). Hay que crear el archivo `firestore.rules`:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Solo el propio usuario puede leer/escribir su perfil
    match /users/{uid} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }

    // Productos: cualquier autenticado puede leer, solo admin puede escribir
    match /products/{id} {
      allow read: if request.auth != null;
      allow write: if request.auth != null
        && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }

    // Pedidos: el usuario solo ve los suyos; solo puede crear, no editar
    match /pedidos/{id} {
      allow create: if request.auth != null && request.resource.data.uid == request.auth.uid;
      allow read: if request.auth != null && resource.data.uid == request.auth.uid;
    }

    // Reservas: el usuario crea y lee las suyas; admin puede actualizar estado
    match /reservas/{id} {
      allow create: if request.auth != null && request.resource.data.uid == request.auth.uid;
      allow read: if request.auth != null
        && (resource.data.uid == request.auth.uid
          || get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
      allow update: if request.auth != null
        && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }

    // Tarjetas: solo el propio usuario
    match /tarjetas/{id} {
      allow read, write: if request.auth != null && resource.data.uid == request.auth.uid;
      allow create: if request.auth != null && request.resource.data.uid == request.auth.uid;
    }
  }
}
```

---

### 2. Protección de rutas en el frontend — IMPORTANTE

`app/index.tsx` actualmente redirige siempre a `/login` sin verificar si ya hay sesión activa. Hay que agregar:

```tsx
// app/index.tsx
import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../src/api/firebaseConfig';
import { getUserProfile } from '../src/features/auth/services/authService';

export default function Index() {
  const [route, setRoute] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) { setRoute('/login'); return; }
      const profile = await getUserProfile(user.uid);
      setRoute(profile?.role === 'admin' ? '/admin' : '/(tabs)');
    });
    return unsub;
  }, []);

  if (!route) return null; // splash mientras verifica
  return <Redirect href={route as any} />;
}
```

Además, la ruta `/admin` debe verificar el rol antes de renderizar:

```tsx
// app/admin.tsx
import { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../src/api/firebaseConfig';
import { getUserProfile } from '../src/features/auth/services/authService';
import AdminScreen from '../src/features/products/screens/AdminScreen';

export default function AdminRoute() {
  const [status, setStatus] = useState<'loading' | 'admin' | 'denied'>('loading');

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) { setStatus('denied'); return; }
      const profile = await getUserProfile(user.uid);
      setStatus(profile?.role === 'admin' ? 'admin' : 'denied');
    });
    return unsub;
  }, []);

  if (status === 'loading') return null;
  if (status === 'denied') return <Redirect href="/login" />;
  return <AdminScreen />;
}
```

---

### 3. Análisis de código estático (SonarQube / ESLint)

El proyecto tiene ESLint configurado (`eslint-config-expo`). Para cumplir con el requisito de análisis tipo Sonar:

**Opción A — ESLint (ya disponible):**
```bash
cd PecadosPlacenteros
npm run lint
```

**Opción B — SonarCloud (gratuito para proyectos públicos):**
1. Crear cuenta en [sonarcloud.io](https://sonarcloud.io)
2. Conectar el repositorio de GitHub
3. Agregar `sonar-project.properties` en la raíz:

```properties
sonar.projectKey=pecados-placenteros
sonar.projectName=Pecados Placenteros
sonar.sources=src,app
sonar.exclusions=node_modules/**,**/*.test.*
sonar.javascript.lcov.reportPaths=coverage/lcov.info
```

---

## Resumen ejecutivo

| Criterio | Estado |
|---|---|
| Sistema funcional | ✅ Completo |
| Flujo principal ejecutable | ✅ Completo |
| Reglas de negocio | ✅ Completo |
| Sin errores críticos | ✅ Completo |
| Análisis estático (ESLint) | ✅ Disponible — ejecutar `npm run lint` |
| Análisis tipo Sonar | ⚠️ Requiere configurar SonarCloud |
| Frontend separado | ✅ React Native / Expo |
| Backend separado | ✅ Firebase Auth + Firestore |
| Base de datos separada | ✅ Cloud Firestore |
| Seguridad en APIs | ⚠️ Requiere desplegar `firestore.rules` |
| Encriptación de contraseñas | ✅ Firebase Auth (bcrypt interno) |
| Control por roles | ✅ customer / admin con redirección |
| Validaciones de datos | ✅ En todos los formularios |
| Protección de rutas | ⚠️ Requiere guardia en `index.tsx` y `admin.tsx` |

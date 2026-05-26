# Pecados Placenteros 🍔

Aplicación móvil para un restaurante temático de hamburguesas y comida premium. Construida con **React Native + Expo**, backend en **Firebase** (Auth + Firestore). Disponible en iOS, Android y Web.

---

## Índice

- [Descripción](#descripción)
- [Pantallas y funcionalidades](#pantallas-y-funcionalidades)
- [Arquitectura y estructura](#arquitectura-y-estructura)
- [Modelo de datos (Firestore)](#modelo-de-datos-firestore)
- [Roles de usuario](#roles-de-usuario)
- [Stack tecnológico](#stack-tecnológico)
- [Requisitos previos](#requisitos-previos)
- [Instalación y ejecución](#instalación-y-ejecución)
- [Variables de entorno](#variables-de-entorno)
- [Reglas de seguridad Firestore](#reglas-de-seguridad-firestore)
- [Calidad de código](#calidad-de-código)
- [Documentación adicional](#documentación-adicional)

---

## Descripción

**Pecados Placenteros** es una app de restaurante con identidad visual oscura y premium — fondos casi negros (`#1a0000`), rojo intenso (`#cc0000`) y tipografía Playfair Display. Permite a los clientes explorar el menú, agregar productos al carrito, realizar pedidos con entrega a domicilio (mapa interactivo), hacer reservas de mesa y gestionar su perfil. Los administradores disponen de un panel CRUD para gestionar productos y reservas.

---

## Pantallas y funcionalidades

### Cliente

| Pantalla | Descripción |
|---|---|
| **Login** | Autenticación con email/contraseña. Recuperación de contraseña por correo. Redirección automática según rol. |
| **Registro** | Crea cuenta con nombre, email y contraseña. Rol `customer` asignado por defecto. |
| **Home** | Hero banner con producto destacado, grid de categorías del menú, modal de detalle con ingredientes. |
| **Menú (Carta)** | Menú completo agrupado por categorías (BURGERS, ENTRANTES, POSTRES, BEBIDAS). Scroll a categoría, buscador, modal de producto con botón "Añadir al pedido". |
| **Carrito** | Lista de ítems con control de cantidad, total en tiempo real, flujo de checkout con `CheckoutModal`. |
| **Checkout** | Dirección de entrega con autocompletado (Nominatim/OpenStreetMap), mapa interactivo para marcar ubicación, selección de tarjeta guardada o pago en efectivo. |
| **Reservar** | Calendario mensual, selector de hora de entrada/salida, plano visual del restaurante (Zona Ventana, Salón Principal, Zona Fondo), control de comensales, verificación de disponibilidad en tiempo real. |
| **Perfil** | Datos personales editables, cambio de contraseña, historial de pedidos, historial de reservas, gestión de tarjetas de pago, cierre de sesión. |

### Administrador

| Pantalla | Descripción |
|---|---|
| **Panel Admin** | CRUD completo de productos (nombre, precio, descripción, imagen, categoría, destacado). Gestión de reservas pendientes (confirmar / cancelar). |

---

## Arquitectura y estructura

```
PecadosPlacenteros/
├── app/                        # Rutas Expo Router
│   ├── (tabs)/                 # Navegación por tabs (Home, Menú, Carrito, Reservar, Perfil)
│   ├── login.tsx               # Pantalla de login
│   ├── register.tsx            # Pantalla de registro
│   ├── admin.tsx               # Panel de administrador
│   └── _layout.tsx             # Layout raíz (CartProvider + fuentes)
│
├── src/
│   ├── api/
│   │   └── firebaseConfig.js   # Inicialización Firebase (Auth + Firestore)
│   │
│   ├── features/               # Módulos por dominio
│   │   ├── auth/
│   │   │   ├── screens/        # LoginScreen, RegisterScreen
│   │   │   └── services/       # authService.js (register, login, logout, getUserProfile)
│   │   ├── cart/
│   │   │   ├── components/     # CheckoutModal (dirección, mapa, pago)
│   │   │   ├── context/        # CartContext (addItem, removeItem, updateQuantity, clearCart)
│   │   │   └── screens/        # CartScreen
│   │   ├── perfil/
│   │   │   └── screens/        # PerfilScreen
│   │   ├── products/
│   │   │   ├── components/     # ProductModal
│   │   │   ├── screens/        # HomeScreen, MenuScreen, AdminScreen
│   │   │   └── services/       # productService.js (fetchMenu, CRUD)
│   │   └── reservar/
│   │       └── screens/        # ReservarScreen
│   │
│   └── shared/
│       ├── constants/          # theme.ts (colores, tipografía)
│       └── hooks/              # use-color-scheme
│
├── assets/images/              # Íconos, splash, logo, fondo
├── __tests__/                  # Tests unitarios (Jest)
├── __mocks__/                  # Mock de firebaseConfig para tests
├── eslint.config.js            # Configuración ESLint (Expo + reglas custom)
├── eslint-report.html          # Reporte visual de calidad de código
├── diagramas.html              # Diagramas técnicos (secuencia, ER, componentes)
├── firestore.rules             # Reglas de seguridad Firestore
├── docker-compose.yml          # Entorno de desarrollo con emuladores Firebase
└── .env                        # Variables de entorno (no subir al repo)
```

---

## Modelo de datos (Firestore)

### `users/{uid}`
```json
{
  "name": "string",
  "email": "string",
  "role": "customer | admin",
  "createdAt": "ISO string",
  "telefono": "string",
  "documento": "string",
  "fechaNacimiento": "string"
}
```

### `products/{id}`
```json
{
  "name": "string",
  "price": "string",
  "description": "string",
  "category": "BURGERS | ENTRANTES | POSTRES | BEBIDAS",
  "image": "url",
  "featured": "boolean",
  "featuredLabel": "string"
}
```

### `pedidos/{id}`
```json
{
  "uid": "string",
  "email": "string",
  "items": [{ "id", "name", "price", "quantity", "image" }],
  "total": "number",
  "direccion": "string",
  "datosExtra": "string",
  "coordenadas": { "lat", "lon" },
  "metodoPago": "card | cash",
  "tarjeta": { "ultimos4", "titular" },
  "estado": "en proceso | entregado | cancelado",
  "creadoEn": "ISO string"
}
```

### `reservas/{id}`
```json
{
  "uid": "string",
  "email": "string",
  "fecha": "YYYY-MM-DD",
  "hora": "HH:MM",
  "horaSalida": "HH:MM",
  "mesa": "T-01 … T-18",
  "asientos": "number",
  "comensales": "number",
  "estado": "en espera | confirmado | cancelado",
  "creadoEn": "ISO string"
}
```

### `tarjetas/{id}`
```json
{
  "uid": "string",
  "ultimos4": "string",
  "titular": "string",
  "vencimiento": "MM/AA",
  "creadoEn": "ISO string"
}
```

---

## Roles de usuario

| Rol | Acceso |
|---|---|
| `customer` | Todas las tabs (Home, Menú, Carrito, Reservar, Perfil) |
| `admin` | Panel de administrador (`/admin`) — CRUD productos + gestión de reservas |

El rol se asigna en Firestore al registrarse (`customer` por defecto). Para crear un admin, cambiar manualmente el campo `role` en la consola de Firebase.

---

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Framework | React Native 0.81 + Expo SDK 54 |
| Navegación | Expo Router 6 (file-based routing) |
| Backend | Firebase 12 (Auth + Firestore) |
| Estado global | React Context (CartContext) |
| Mapas | react-native-maps + Nominatim (geocodificación) |
| Tipografía | Playfair Display (@expo-google-fonts) |
| Linter | ESLint 9 + eslint-config-expo |
| Tests | Jest + mocks de Firebase |
| Lenguaje | JavaScript (JSX) + TypeScript (configuración/tipos) |

---

## Requisitos previos

- **Node.js** ≥ 18
- **npm** ≥ 9
- **Expo CLI** — `npm install -g expo-cli` (o usar `npx expo`)
- **Expo Go** en el dispositivo móvil (para desarrollo)
- Cuenta en [Firebase](https://console.firebase.google.com) con proyecto configurado

---

## Instalación y ejecución

```bash
# 1. Entrar a la carpeta del proyecto
cd PecadosPlacenteros

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno (ver sección siguiente)
cp .env.example .env
# Editar .env con los valores reales de Firebase

# 4. Iniciar el servidor de desarrollo
npm start          # Expo DevTools en el navegador
npm run android    # Emulador Android
npm run ios        # Simulador iOS (solo macOS)
npm run web        # Navegador web
```

---

## Variables de entorno

Crear un archivo `.env` en `PecadosPlacenteros/` con las siguientes claves (obtenerlas desde la consola de Firebase → Configuración del proyecto → SDK):

```env
EXPO_PUBLIC_FIREBASE_API_KEY=...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=...
EXPO_PUBLIC_FIREBASE_PROJECT_ID=...
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=...
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
EXPO_PUBLIC_FIREBASE_APP_ID=...
```

> El prefijo `EXPO_PUBLIC_` es requerido por Expo para exponer variables al bundle del cliente.

---

## Reglas de seguridad Firestore

El archivo `firestore.rules` implementa las siguientes políticas:

- **`users`** — cada usuario solo lee/edita su propio perfil; admin puede leer todos
- **`products`** — lectura para cualquier usuario autenticado; escritura solo admin
- **`pedidos`** — el usuario crea y lee sus propios pedidos; admin lee todos y puede actualizar estado
- **`reservas`** — el usuario crea y lee sus propias reservas; admin gestiona el estado
- **`tarjetas`** — solo el propio usuario puede crear, leer, editar y eliminar sus tarjetas

Para desplegar las reglas:
```bash
firebase deploy --only firestore:rules
```

---

## Calidad de código

```bash
# Ejecutar linter
npm run lint

# Ver reporte visual
# Abrir PecadosPlacenteros/eslint-report.html en el navegador
```

Estado actual: **0 errores · 0 advertencias** en 15 archivos analizados.

Reglas activas: `no-unused-vars`, `no-console`, `react-hooks/rules-of-hooks`, `react-hooks/exhaustive-deps`, `eqeqeq`, `prefer-const`, `comma-dangle`, `quotes`, entre otras.

---

## Documentación adicional

| Archivo | Contenido |
|---|---|
| `PecadosPlacenteros/diagramas.html` | Diagramas de secuencia (pedido, reserva), entidad-relación y componentes — renderizados con Mermaid |
| `PecadosPlacenteros/eslint-report.html` | Reporte visual de calidad de código con historial de correcciones |
| `PecadosPlacenteros/firestore.rules` | Reglas de seguridad completas de Firestore |
| `PecadosPlacenteros/docker-compose.yml` | Emuladores locales de Firebase (Auth + Firestore) |

---

> UI en **español**. Toda la interfaz, alertas y textos de usuario están escritos en español.

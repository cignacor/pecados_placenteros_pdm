# 🍔 Pecados Placenteros — Documentación Wiki

> Aplicación móvil para restaurante temático de hamburguesas premium. Dark, sensual y "pecaminosa".

---

## Tabla de Contenidos

1. [Contexto del Problema](#1-contexto-del-problema)
2. [Usuario Final](#2-usuario-final)
3. [Caso de Uso Principal](#3-caso-de-uso-principal)
4. [Alcance Final](#4-alcance-final)
5. [API REST Documentada](#5-api-rest-documentada)
6. [Diseño de Pantallas](#6-diseño-de-pantallas)
7. [Modelo de Monetización](#7-modelo-de-monetización)
8. [Estrategia de Visibilidad](#8-estrategia-de-visibilidad)
9. [Riesgos y Mitigaciones](#9-riesgos-y-mitigaciones)
10. [Estudio de Mercado](#10-estudio-de-mercado)
11. [Roadmap y Mejoras Futuras](#11-roadmap-y-mejoras-futuras)

---

## 1. Contexto del Problema

### El problema

Los restaurantes temáticos de nicho —especialmente los de concepto premium— dependen casi exclusivamente de plataformas de terceros como Rappi, iFood o Uber Eats para sus pedidos digitales. Esto genera tres problemas críticos:

| Problema | Impacto |
|---|---|
| Comisiones del 25–35% por pedido | Margen operativo destruido |
| Pérdida de identidad de marca | El cliente recuerda la plataforma, no el restaurante |
| Sin datos propios del cliente | Imposible fidelizar o hacer remarketing |

### La solución

**Pecados Placenteros** es una app propia que permite al restaurante:
- Recibir pedidos directos sin intermediarios
- Gestionar reservas de mesa con confirmación manual
- Construir una base de clientes propia
- Proyectar su identidad de marca oscura y premium en cada interacción

### Contexto técnico

La app fue construida con **React Native + Expo** para correr en iOS, Android y Web desde un único codebase. El backend es **Firebase** (Auth + Firestore), eliminando la necesidad de un servidor propio y reduciendo costos operativos al mínimo.

---

## 2. Usuario Final

### Segmentos de usuario

#### 👤 Cliente (rol: `customer`)
- **Perfil:** Adulto de 22–40 años, urbano, con poder adquisitivo medio-alto
- **Comportamiento:** Busca experiencias gastronómicas con identidad, no solo comida
- **Motivación:** Vivir la experiencia "pecaminosa" desde el primer toque en la app
- **Dispositivo:** Principalmente smartphone (iOS/Android)
- **Expectativa:** Reservar mesa o pedir a domicilio en menos de 3 minutos

#### 🔑 Administrador (rol: `admin`)
- **Perfil:** Dueño o encargado del restaurante
- **Responsabilidades:** Gestionar el menú, confirmar/cancelar reservas
- **Acceso:** Panel de administración exclusivo desde la misma app
- **Expectativa:** Control total del negocio desde el celular, sin conocimientos técnicos

### Mapa de empatía del cliente

```
PIENSA Y SIENTE          |  ESCUCHA
"Quiero algo diferente"  |  Recomendaciones de amigos
"Vale la pena el precio" |  Reseñas en Instagram
                         |
DICE Y HACE              |  VE
Comparte fotos en RRSS   |  Contenido oscuro y premium
Reserva con anticipación |  Menú visual y apetitoso
```

---

## 3. Caso de Uso Principal

### CU-01: Realizar un pedido a domicilio

**Actor:** Cliente autenticado  
**Precondición:** Usuario registrado y con sesión activa

```
1. El cliente abre la app y ve el Home con el hero "Gusto Infernal"
2. Navega al Menú y filtra por categoría (BURGERS, ENTRANTES, POSTRES, BEBIDAS)
3. Toca un producto → ve descripción, precio e imagen
4. Agrega uno o más productos al carrito
5. Abre el carrito y revisa su pedido
6. Toca "Realizar Pedido" → se abre el CheckoutModal
7. Ingresa dirección de entrega (texto o marcando en el mapa)
8. Selecciona método de pago (tarjeta guardada o efectivo)
9. Confirma el pedido → se guarda en Firestore con estado "en proceso"
10. Recibe confirmación en pantalla
```

**Resultado:** Pedido registrado en colección `pedidos` con todos los datos del cliente, items, total, dirección y método de pago.

---

### CU-02: Reservar una mesa

**Actor:** Cliente autenticado  
**Precondición:** Usuario registrado y con sesión activa

```
1. El cliente abre la pestaña "Reservar"
2. Selecciona fecha en el calendario (no miércoles, no días pasados)
3. Selecciona hora de entrada y hora de salida
4. Visualiza el plano del restaurante con mesas disponibles/ocupadas
5. Selecciona una mesa según su capacidad
6. Ajusta el número de comensales
7. Confirma la reserva → se guarda con estado "en espera"
8. Ve la tarjeta de estado EN ESPERA en pantalla
9. El admin confirma desde su panel → estado cambia a "confirmado"
10. El cliente ve el badge CONFIRMADO en "Mis reservas" (Perfil)
```

---

### CU-03: Gestionar el menú (Admin)

**Actor:** Administrador  
**Precondición:** Usuario con rol `admin`

```
1. El admin inicia sesión → es redirigido al Panel de Administrador
2. Ve la pestaña "Productos" con el formulario de creación
3. Completa nombre, precio, descripción, imagen, categoría y si es destacado
4. Guarda → el producto aparece en el menú inmediatamente
5. Puede editar o eliminar cualquier producto existente
```

---

## 4. Alcance Final

### ✅ Funcionalidades implementadas

| Módulo | Funcionalidad | Estado |
|---|---|---|
| Auth | Registro con email/password | ✅ |
| Auth | Login / Logout | ✅ |
| Auth | Roles customer / admin | ✅ |
| Home | Hero banner con modal de producto | ✅ |
| Home | Menú de tentaciones con navegación | ✅ |
| Menú | Carta completa por categorías | ✅ |
| Menú | Búsqueda de productos | ✅ |
| Menú | Scroll a categoría | ✅ |
| Carrito | Agregar / quitar / actualizar cantidad | ✅ |
| Carrito | Cálculo de total | ✅ |
| Checkout | Dirección con autocompletado (Nominatim) | ✅ |
| Checkout | Mapa interactivo (react-native-maps) | ✅ |
| Checkout | Pago con tarjeta o efectivo | ✅ |
| Checkout | Guardar tarjetas por usuario | ✅ |
| Reservas | Calendario con días deshabilitados | ✅ |
| Reservas | Plano visual del restaurante | ✅ |
| Reservas | Verificación de disponibilidad en tiempo real | ✅ |
| Reservas | Estado en espera / confirmado / cancelado | ✅ |
| Perfil | Datos personales editables | ✅ |
| Perfil | Cambio de contraseña con show/hide | ✅ |
| Perfil | Historial de pedidos | ✅ |
| Perfil | Historial de reservas con estado | ✅ |
| Perfil | Gestión de tarjetas guardadas | ✅ |
| Admin | CRUD de productos | ✅ |
| Admin | Gestión de reservas en espera | ✅ |
| Admin | Confirmar / cancelar reservas | ✅ |

### ❌ Fuera de alcance (versión actual)

- Pasarela de pago real (Stripe, PayU, MercadoPago)
- Notificaciones push
- Sistema de puntos / fidelización activo
- Tracking de domicilio en tiempo real
- Panel de analytics para el admin
- Soporte multi-restaurante

---

## 5. API REST Documentada

> La app usa **Firebase SDK directamente** (no REST HTTP tradicional). A continuación se documenta cada operación como si fuera una API REST equivalente, en formato compatible con Swagger/Postman.

---

### Base URL (Firestore REST)
```
https://firestore.googleapis.com/v1/projects/pecadosplacenterospdm/databases/(default)/documents
```

---

### 🔐 Autenticación

#### `POST /auth/register`
Registra un nuevo usuario.

**Body:**
```json
{
  "name": "María López",
  "email": "maria@email.com",
  "password": "miPassword123"
}
```

**Respuesta exitosa `201`:**
```json
{
  "uid": "abc123",
  "email": "maria@email.com",
  "role": "customer",
  "createdAt": "2025-05-17T10:00:00.000Z"
}
```

**Errores:**
| Código | Descripción |
|---|---|
| `400` | Email ya registrado |
| `400` | Contraseña menor a 6 caracteres |

---

#### `POST /auth/login`
Inicia sesión.

**Body:**
```json
{
  "email": "maria@email.com",
  "password": "miPassword123"
}
```

**Respuesta exitosa `200`:**
```json
{
  "uid": "abc123",
  "email": "maria@email.com",
  "role": "customer",
  "token": "<Firebase ID Token>"
}
```

---

#### `POST /auth/logout`
Cierra la sesión activa. No requiere body.

**Respuesta `200`:** `{ "success": true }`

---

### 🍔 Productos

#### `GET /products`
Retorna todos los productos del menú.

**Respuesta `200`:**
```json
[
  {
    "id": "prod_001",
    "name": "Gusto Infernal",
    "price": "32900 COP",
    "description": "Carne madurada, queso ahumado...",
    "category": "BURGERS",
    "image": "https://...",
    "featured": true,
    "featuredLabel": "RECOMENDACIÓN DEL CHEF"
  }
]
```

---

#### `POST /products` 🔑 Admin
Crea un nuevo producto.

**Headers:** `Authorization: Bearer <admin_token>`

**Body:**
```json
{
  "name": "La Perdición",
  "price": "28500 COP",
  "description": "Descripción del producto",
  "category": "BURGERS",
  "image": "https://...",
  "featured": false,
  "featuredLabel": ""
}
```

**Respuesta `201`:** `{ "id": "prod_002", ...datos }`

---

#### `PUT /products/:id` 🔑 Admin
Actualiza un producto existente.

**Body:** Campos a actualizar (parcial o total)

**Respuesta `200`:** `{ "id": "prod_002", ...datos actualizados }`

---

#### `DELETE /products/:id` 🔑 Admin
Elimina un producto.

**Respuesta `200`:** `{ "success": true }`

---

### 🛒 Pedidos

#### `POST /pedidos`
Crea un nuevo pedido.

**Headers:** `Authorization: Bearer <user_token>`

**Body:**
```json
{
  "items": [
    { "id": "prod_001", "name": "Gusto Infernal", "price": "32900 COP", "quantity": 2 }
  ],
  "total": 65800,
  "direccion": "Calle 10 # 43-20, Medellín",
  "datosExtra": "Apartamento 301",
  "coordenadas": { "lat": 6.2442, "lon": -75.5812 },
  "metodoPago": "card",
  "tarjeta": { "ultimos4": "4242", "titular": "MARIA LOPEZ" }
}
```

**Respuesta `201`:**
```json
{
  "id": "ped_001",
  "estado": "en proceso",
  "creadoEn": "2025-05-17T10:30:00.000Z"
}
```

---

#### `GET /pedidos?uid=:uid`
Retorna los pedidos de un usuario.

**Respuesta `200`:** Array de pedidos ordenados por fecha descendente.

---

### 📅 Reservas

#### `GET /reservas?fecha=:fecha`
Retorna reservas para una fecha específica (para verificar disponibilidad).

**Query params:** `fecha=2025-06-15`

**Respuesta `200`:**
```json
[
  {
    "id": "res_001",
    "mesa": "T-06",
    "hora": "20:00",
    "horaSalida": "22:00",
    "estado": "en espera"
  }
]
```

---

#### `POST /reservas`
Crea una nueva reserva.

**Body:**
```json
{
  "fecha": "2025-06-15",
  "hora": "20:00",
  "horaSalida": "22:00",
  "mesa": "T-06",
  "asientos": 4,
  "comensales": 3
}
```

**Respuesta `201`:**
```json
{
  "id": "res_001",
  "estado": "en espera",
  "creadoEn": "2025-05-17T10:00:00.000Z"
}
```

---

#### `PATCH /reservas/:id` 🔑 Admin
Actualiza el estado de una reserva.

**Body:**
```json
{ "estado": "confirmado" }
```

**Valores válidos:** `"confirmado"` | `"cancelado"`

**Respuesta `200`:** `{ "id": "res_001", "estado": "confirmado" }`

---

#### `GET /reservas?uid=:uid`
Retorna las reservas de un usuario.

**Respuesta `200`:** Array de reservas con estado actualizado.

---

### 💳 Tarjetas

#### `GET /tarjetas?uid=:uid`
Retorna las tarjetas guardadas del usuario (solo últimos 4 dígitos).

#### `POST /tarjetas`
Guarda una nueva tarjeta (solo se almacenan los últimos 4 dígitos, titular y vencimiento).

#### `DELETE /tarjetas/:id`
Elimina una tarjeta guardada.

---

## 6. Diseño de Pantallas

### Herramienta recomendada: Figma

> El diseño visual de la app sigue el sistema de diseño descrito a continuación. Para replicarlo en Figma, crear un proyecto con los siguientes tokens.

### Design Tokens

| Token | Valor | Uso |
|---|---|---|
| `color-background` | `#1a0000` | Fondo principal |
| `color-surface` | `#2a0a0a` | Tarjetas y modales |
| `color-border` | `#3d0000` | Bordes sutiles |
| `color-primary` | `#cc0000` | Botones, badges, acentos |
| `color-text-primary` | `#ffffff` | Texto principal |
| `color-text-secondary` | `#888888` | Texto secundario |
| `color-text-muted` | `#555555` | Placeholders |
| `font-heading` | `PlayfairDisplay_700Bold` | Títulos |
| `font-body` | `PlayfairDisplay_400Regular` | Cuerpo de texto |
| `border-radius-card` | `12px` | Tarjetas |
| `border-radius-button` | `8px` | Botones |

### Pantallas principales

```
┌─────────────────────────────────────────────────────────┐
│  PANTALLAS DE LA APP                                    │
├──────────────┬──────────────────────────────────────────┤
│ Login        │ Email + Password + botón rojo            │
│ Register     │ Nombre + Email + Password                │
├──────────────┼──────────────────────────────────────────┤
│ Home         │ Hero "Gusto Infernal" + grid de menú     │
│ Menú         │ Chips de categoría + lista de productos  │
│ Carrito      │ Items + cantidades + total + checkout    │
│ Reservar     │ Calendario + plano de mesas + resumen    │
│ Perfil       │ Secciones colapsables + historial        │
├──────────────┼──────────────────────────────────────────┤
│ Admin        │ Tabs: Productos | Reservas               │
└──────────────┴──────────────────────────────────────────┘
```

### Flujo de navegación

```
Login / Register
      │
      ▼
   Home (Tab 1)
   ├── Modal Gusto Infernal
   Menú (Tab 2)
   ├── Modal de producto
   Carrito (Tab 3)
   ├── CheckoutModal
   │   ├── Mapa + dirección
   │   └── Método de pago
   Reservar (Tab 4)
   └── Perfil (Tab 5)
       ├── Datos personales
       ├── Mis pedidos
       ├── Mis reservas
       └── Métodos de pago

Admin (ruta separada)
   ├── Tab Productos (CRUD)
   └── Tab Reservas (confirmar/cancelar)
```

### Link de referencia Figma
Para crear el prototipo en Figma se recomienda:
1. Crear un **Frame** de 390×844 px (iPhone 14)
2. Importar la fuente **Playfair Display** desde Google Fonts
3. Usar los tokens de color definidos arriba como **Styles**
4. Replicar cada pantalla con los componentes: `Card`, `Button`, `Input`, `Badge`, `TabBar`

---

## 7. Modelo de Monetización

### Estrategia principal: Comisión cero + suscripción SaaS

La app elimina las comisiones de terceros. El modelo de negocio se sostiene así:

### Fuentes de ingreso

#### 1. Pedidos directos sin comisión
El restaurante recibe el 100% del valor del pedido. Al eliminar el 30% de comisión de Rappi/Uber Eats, la app se paga sola desde el primer mes si el volumen de pedidos digitales supera los 15–20 pedidos mensuales.

```
Ejemplo:
  Pedido promedio:        $35.000 COP
  Comisión Rappi (30%):   $10.500 COP por pedido
  Con 50 pedidos/mes:     $525.000 COP ahorrados = app gratuita
```

#### 2. Plan SaaS para otros restaurantes (escalabilidad)
Si el modelo se replica para otros restaurantes:

| Plan | Precio/mes | Incluye |
|---|---|---|
| **Básico** | $150.000 COP | Menú + pedidos + hasta 2 admins |
| **Pro** | $280.000 COP | Todo Básico + reservas + analytics |
| **Premium** | $450.000 COP | Todo Pro + app personalizada con su marca |

#### 3. Club del Pecado (fidelización futura)
- Membresía mensual: $15.000 COP/mes
- Beneficios: descuentos exclusivos, acceso anticipado a nuevos platos, reservas prioritarias

#### 4. Publicidad de proveedores
Marcas de bebidas, salsas o ingredientes premium pueden pagar por aparecer destacados en el menú digital.

### Costos operativos estimados

| Servicio | Costo mensual |
|---|---|
| Firebase Spark (gratuito hasta 50k lecturas/día) | $0 |
| Firebase Blaze (si escala) | ~$20–50 USD |
| Expo EAS Build (builds nativos) | $29 USD/mes |
| Dominio + hosting web | $10 USD/mes |
| **Total estimado** | **~$80 USD/mes** |

---

## 8. Estrategia de Visibilidad

### Canales digitales

#### Instagram y TikTok (principal)
- Contenido oscuro y premium: fotos de las hamburguesas con la estética de la app
- Reels mostrando el proceso de reserva y pedido desde la app
- Hashtags: `#PecadosPlacenteros` `#BurgerPremium` `#PecadoGastronomico`
- Colaboraciones con foodbloggers locales

#### Google My Business
- Perfil completo con fotos, horarios y enlace directo a la app
- Responder reseñas activamente para mejorar posicionamiento local

#### App Store Optimization (ASO)
- Título: "Pecados Placenteros — Burgers Premium"
- Keywords: burger, hamburguesa premium, restaurante, reservas, domicilio
- Screenshots con la estética oscura de la app

### Estrategia de lanzamiento

```
Semana 1-2:  Beta privada con 20 clientes frecuentes
Semana 3:    Lanzamiento en redes con contenido teaser
Semana 4:    Publicación en App Store y Google Play
Mes 2:       Primera campaña de influencers locales
Mes 3:       Programa de referidos (trae un amigo, obtén descuento)
```

### Métricas clave (KPIs)

| Métrica | Meta mes 1 | Meta mes 3 |
|---|---|---|
| Descargas | 200 | 800 |
| Pedidos digitales | 50 | 200 |
| Reservas gestionadas | 30 | 100 |
| Calificación App Store | — | ≥ 4.5 ⭐ |

---

## 9. Riesgos y Mitigaciones

| # | Riesgo | Probabilidad | Impacto | Mitigación |
|---|---|---|---|---|
| R1 | Baja adopción de la app por parte de clientes habituales | Alta | Alto | Campaña de onboarding con descuento en primer pedido digital |
| R2 | Costos de Firebase escalan con el volumen | Media | Medio | Monitorear uso mensual; migrar a Blaze plan con presupuesto controlado |
| R3 | Pasarela de pago no integrada (pagos reales) | Alta | Alto | Versión 1 acepta efectivo; integrar Stripe/PayU en v2 |
| R4 | Competencia de plataformas grandes (Rappi) | Alta | Medio | Diferenciación por experiencia de marca y cero comisiones |
| R5 | Problemas de disponibilidad de Firebase | Baja | Alto | Firebase tiene SLA del 99.95%; plan de contingencia con caché local |
| R6 | Rechazo en App Store por políticas de pago | Media | Alto | Revisar guidelines de Apple antes de publicar; usar WebView para pagos si es necesario |
| R7 | Pérdida de datos de clientes | Baja | Crítico | Firestore tiene backups automáticos; reglas de seguridad estrictas |
| R8 | El admin no adopta el panel de gestión | Media | Alto | Capacitación presencial + video tutorial de 5 minutos |

---

## 10. Estudio de Mercado

### Aplicaciones similares existentes

| App | Tipo | Fortalezas | Debilidades |
|---|---|---|---|
| **Rappi** | Marketplace multi-restaurante | Enorme base de usuarios, logística propia | 30% comisión, sin identidad de marca |
| **Uber Eats** | Marketplace multi-restaurante | Alcance global, confianza del usuario | 25-30% comisión, experiencia genérica |
| **iFood** | Marketplace multi-restaurante | Fuerte en Latinoamérica | Mismos problemas de comisión |
| **Restorando** | Reservas de restaurantes | Especializado en reservas | Solo reservas, sin pedidos |
| **OpenTable** | Reservas de restaurantes | Reconocimiento global | No disponible en todos los mercados LATAM |
| **Olo** | App propia para restaurantes (USA) | Sin comisiones, marca propia | Solo disponible en EE.UU., costoso |

### Diferenciadores de Pecados Placenteros

| Característica | Rappi/Uber Eats | Pecados Placenteros |
|---|---|---|
| Comisión por pedido | 25–35% | **0%** |
| Identidad de marca | Genérica | **100% personalizada** |
| Reservas integradas | ❌ | **✅ Con plano visual** |
| Datos del cliente | De la plataforma | **Del restaurante** |
| Experiencia premium | ❌ | **✅ Dark theme, Playfair** |
| Costo mensual | Variable (comisiones) | **Fijo y predecible** |
| Gestión de menú | Limitada | **CRUD completo en tiempo real** |
| Historial del cliente | No accesible | **✅ En perfil del usuario** |

### Conclusión del estudio

El mercado de apps de restaurantes está dominado por marketplaces que benefician al intermediario. **Pecados Placenteros** apuesta por el modelo de **app propia de restaurante**, un segmento en crecimiento donde el restaurante recupera el control de su relación con el cliente. La diferenciación clave es la **experiencia de marca inmersiva** combinada con **funcionalidad completa** (pedidos + reservas + perfil) en una sola app.

---

## 11. Roadmap y Mejoras Futuras

### Versión 1.0 — Actual ✅
- Autenticación completa
- Menú con categorías y búsqueda
- Carrito y checkout con mapa
- Reservas con plano visual
- Panel de administración
- Perfil de usuario completo

---

### Versión 1.1 — Corto plazo (1–2 meses)

- [ ] **Notificaciones push** — Avisar al usuario cuando su reserva es confirmada o su pedido está en camino
- [ ] **Integración de pago real** — Stripe o PayU para cobros en línea
- [ ] **Tracking de domicilio** — Mapa en tiempo real del repartidor
- [ ] **Calificación de pedidos** — El cliente puede dejar una reseña tras recibir su pedido

---

### Versión 1.2 — Mediano plazo (3–4 meses)

- [ ] **Club del Pecado activo** — Sistema de puntos por cada pedido, canjeable por descuentos
- [ ] **Cupones y promociones** — El admin puede crear códigos de descuento
- [ ] **Modo oscuro / claro** — Opción de tema para el usuario
- [ ] **Soporte para múltiples idiomas** — Español e inglés
- [ ] **Analytics para el admin** — Dashboard con ventas, productos más pedidos, horas pico

---

### Versión 2.0 — Largo plazo (6–12 meses)

- [ ] **Multi-restaurante** — Convertir la plataforma en SaaS para otros restaurantes
- [ ] **Menú con realidad aumentada** — Ver el plato en 3D antes de pedirlo
- [ ] **Integración con POS** — Sincronización con sistemas de caja del restaurante
- [ ] **Programa de referidos** — Trae un amigo y obtén descuento en tu próximo pedido
- [ ] **App para repartidores** — Gestión de domicilios con ruta optimizada
- [ ] **Reservas con prepago** — Garantizar la mesa con un pago anticipado

---

### Deuda técnica identificada

| Item | Prioridad | Descripción |
|---|---|---|
| Reglas de seguridad Firestore | 🔴 Alta | Implementar `firestore.rules` para proteger colecciones por rol |
| Tests unitarios | 🟡 Media | Agregar Jest + Testing Library para componentes críticos |
| Manejo de errores global | 🟡 Media | Error boundary y logging centralizado |
| Optimización de imágenes | 🟢 Baja | Usar `expo-image` con caché para mejorar rendimiento |
| Paginación en el menú | 🟢 Baja | Cargar productos en lotes cuando el catálogo crezca |

---

*Documentación generada para el proyecto académico Pecados Placenteros — Mayo 2025*

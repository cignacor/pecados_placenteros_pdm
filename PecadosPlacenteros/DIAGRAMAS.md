# Diagramas — Pecados Placenteros

---

## 1. Diagrama de Secuencia — Flujo principal: Pedido de un cliente

```mermaid
sequenceDiagram
    actor U as Usuario
    participant App as App (React Native)
    participant Auth as Firebase Auth
    participant FS as Firestore
    participant Cart as CartContext

    %% ── Autenticación ──
    U->>App: Ingresa email y contraseña
    App->>Auth: signInWithEmailAndPassword()
    Auth-->>App: userCredential
    App->>FS: getDoc("users/{uid}")
    FS-->>App: { name, email, role }
    App-->>U: Redirige a Home (tabs)

    %% ── Explorar menú y agregar al carrito ──
    U->>App: Abre Menú / Home
    App->>FS: getDocs("products")
    FS-->>App: Lista de productos
    U->>App: Toca "Agregar" en un producto
    App->>Cart: addItem(product)
    Cart-->>App: items[] actualizado

    %% ── Checkout ──
    U->>App: Abre carrito → "Realizar Pedido"
    App-->>U: Muestra CheckoutModal
    U->>App: Ingresa dirección + método de pago
    App->>FS: addDoc("pedidos", { uid, items, total, direccion, estado:"en proceso" })
    FS-->>App: docRef confirmado
    App->>Cart: clearCart()
    App-->>U: Alert "¡Pedido confirmado! ✦"
```

---

## 2. Diagrama de Secuencia — Flujo de Reserva

```mermaid
sequenceDiagram
    actor U as Usuario
    actor A as Admin
    participant App as App (React Native)
    participant FS as Firestore

    %% ── Usuario hace reserva ──
    U->>App: Selecciona fecha, hora, mesa y comensales
    App->>FS: getDocs("reservas") [verificar disponibilidad]
    FS-->>App: Reservas existentes para esa fecha
    App-->>U: Mesas ocupadas marcadas en el plano
    U->>App: Confirma reserva
    App->>FS: addDoc("reservas", { uid, mesa, fecha, hora, estado:"en espera" })
    FS-->>App: OK
    App-->>U: Tarjeta de estado "EN ESPERA" visible en pantalla

    %% ── Admin gestiona reserva ──
    A->>App: Abre Panel Admin → pestaña "Reservas"
    App->>FS: getDocs("reservas") where estado == "en espera"
    FS-->>App: Lista de reservas pendientes
    A->>App: Toca "Confirmar" o "Cancelar"
    App->>FS: updateDoc("reservas/{id}", { estado: "confirmado" | "cancelado" })
    FS-->>App: OK
    App-->>A: Reserva desaparece de la lista

    %% ── Usuario ve el estado actualizado ──
    U->>App: Abre Perfil → "Mis reservas"
    App->>FS: getDocs("reservas") where uid == usuario.uid
    FS-->>App: Reservas con estado actualizado
    App-->>U: Badge "CONFIRMADO" (verde) o "CANCELADO" (gris)
```

---

## 3. Diagrama Entidad-Relación — Modelo real de Firestore

```mermaid
erDiagram
    USERS {
        string uid PK
        string name
        string email
        string role "customer | admin"
        string createdAt
        string telefono
        string documento
        string fechaNacimiento
    }

    PRODUCTS {
        string id PK
        string name
        string price
        string description
        string category "BURGERS | ENTRANTES | POSTRES | BEBIDAS"
        string image
        boolean featured
        string featuredLabel
    }

    PEDIDOS {
        string id PK
        string uid FK
        string email
        array items "[ {id, name, price, quantity, image} ]"
        number total
        string direccion
        string datosExtra
        object coordenadas "{ lat, lon }"
        string metodoPago "card | cash"
        object tarjeta "{ ultimos4, titular }"
        string estado "en proceso"
        string creadoEn
    }

    RESERVAS {
        string id PK
        string uid FK
        string email
        string fecha "YYYY-MM-DD"
        string hora "HH:MM"
        string horaSalida "HH:MM"
        string mesa "T-01 … T-18"
        number asientos
        number comensales
        string estado "en espera | confirmado | cancelado"
        string creadoEn
    }

    TARJETAS {
        string id PK
        string uid FK
        string ultimos4
        string titular
        string vencimiento "MM/AA"
        string creadoEn
    }

    USERS ||--o{ PEDIDOS : "realiza"
    USERS ||--o{ RESERVAS : "solicita"
    USERS ||--o{ TARJETAS : "guarda"
    PEDIDOS }o--o{ PRODUCTS : "contiene"
```

---

## 4. Diagrama de Componentes — Arquitectura lógica

```mermaid
graph TD
    subgraph Dispositivo["📱 Dispositivo (iOS / Android / Web)"]

        subgraph ExpoRouter["Expo Router — Navegación"]
            ROOT["app/_layout.tsx\nCartProvider + Fonts"]
            TABS["app/(tabs)/_layout.tsx\nTab Bar"]
            HOME["(tabs)/index\nHomeScreen"]
            MENU["(tabs)/menu\nMenuScreen"]
            CART["(tabs)/cart\nCartScreen"]
            RESERVAR["(tabs)/reservar\nReservarScreen"]
            PERFIL["(tabs)/perfil\nPerfilScreen"]
            LOGIN["app/login\nLoginScreen"]
            REGISTER["app/register\nRegisterScreen"]
            ADMIN["app/admin\nAdminScreen"]
        end

        subgraph Features["src/features — Lógica de negocio"]
            AUTH_SVC["authService.js\nregister / login / logout"]
            CART_CTX["CartContext.jsx\naddItem / removeItem\nupdateQuantity / total"]
            CHECKOUT["CheckoutModal.jsx\nDirección + Mapa\nMétodo de pago"]
            PRODUCT_SVC["productService.js\nCRUD productos"]
        end

        subgraph Shared["src/shared"]
            THEME["theme.ts\nColores y tipografía"]
            ICONS["icon-symbol.tsx\nIconos SF / Material"]
        end
    end

    subgraph Firebase["☁️ Firebase (BaaS)"]
        FBAUTH["Firebase Auth\nEmail / Password"]
        FIRESTORE["Cloud Firestore\nusers · products\npedidos · reservas\ntarjetas"]
    end

    subgraph External["🌐 APIs externas"]
        NOMINATIM["Nominatim API\nOpenStreetMap\nGeocodificación"]
        MAPVIEW["react-native-maps\nMapView + Marker"]
    end

    ROOT --> TABS
    ROOT --> LOGIN
    ROOT --> REGISTER
    ROOT --> ADMIN
    TABS --> HOME & MENU & CART & RESERVAR & PERFIL

    HOME --> CART_CTX
    MENU --> CART_CTX
    CART --> CART_CTX
    CART --> CHECKOUT

    CHECKOUT --> NOMINATIM
    CHECKOUT --> MAPVIEW
    CHECKOUT --> FIRESTORE

    LOGIN --> AUTH_SVC
    REGISTER --> AUTH_SVC
    PERFIL --> AUTH_SVC
    AUTH_SVC --> FBAUTH
    AUTH_SVC --> FIRESTORE

    ADMIN --> PRODUCT_SVC
    ADMIN --> FIRESTORE
    RESERVAR --> FIRESTORE
    PERFIL --> FIRESTORE
    MENU --> FIRESTORE
    HOME --> FIRESTORE

    PRODUCT_SVC --> FIRESTORE
```

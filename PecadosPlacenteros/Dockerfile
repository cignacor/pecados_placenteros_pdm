# ─── Pecados Placenteros — Dockerfile ────────────────────────────────────────
#
# Levanta la app Expo en modo web dentro de un contenedor local.
# Accede en: http://localhost:8081
#
# Uso rápido:
#   docker build -t pecados-placenteros .
#   docker run --env-file .env -p 8081:8081 pecados-placenteros
# ─────────────────────────────────────────────────────────────────────────────

FROM node:20-alpine

# Metadatos
LABEL maintainer="Pecados Placenteros PDM"
LABEL description="App móvil Expo — modo web"

# Directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiar manifiestos primero para aprovechar la caché de capas de Docker
COPY package.json package-lock.json ./

# Instalar dependencias (sin scripts de postinstall que requieran entorno nativo)
RUN npm install --legacy-peer-deps

# Copiar el resto del código fuente
COPY . .

# Puerto que expone Expo web
EXPOSE 8081

# Variables de entorno con valores por defecto (sobreescribibles con --env-file)
ENV EXPO_NO_DOTENV=0
ENV CI=1

# Arrancar Expo en modo web (no interactivo)
CMD ["npx", "expo", "start", "--web", "--port", "8081", "--no-dev", "--non-interactive"]

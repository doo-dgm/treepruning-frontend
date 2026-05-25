# syntax=docker/dockerfile:1.7

# ----- Build stage -----
FROM node:22-alpine AS build
WORKDIR /app

# Cache de dependencias
COPY package.json package-lock.json ./
RUN npm ci

# Codigo fuente
COPY . .

# Placeholders: Vite los bake en el bundle. El entrypoint los reemplaza
# con los valores reales de Infisical al iniciar el contenedor.
ENV VITE_API_BASE_URL=__VITE_API_BASE_URL__ \
    VITE_KEYCLOAK_ISSUER_URI=__VITE_KEYCLOAK_ISSUER_URI__ \
    VITE_KEYCLOAK_CLIENT=__VITE_KEYCLOAK_CLIENT__ \
    VITE_FIREBASE_API_KEY=__VITE_FIREBASE_API_KEY__ \
    VITE_FIREBASE_AUTH_DOMAIN=__VITE_FIREBASE_AUTH_DOMAIN__ \
    VITE_FIREBASE_PROJECT_ID=__VITE_FIREBASE_PROJECT_ID__ \
    VITE_FIREBASE_MESSAGING_SENDER_ID=__VITE_FIREBASE_MESSAGING_SENDER_ID__ \
    VITE_FIREBASE_APP_ID=__VITE_FIREBASE_APP_ID__ \
    VITE_FIREBASE_VAPID_KEY=__VITE_FIREBASE_VAPID_KEY__ \
    VITE_RECAPTCHA_SITE_KEY=__VITE_RECAPTCHA_SITE_KEY__ \
    VITE_GOOGLE_MAPS_API_KEY=__VITE_GOOGLE_MAPS_API_KEY__

RUN npm run build

# ----- Runtime stage -----
FROM nginx:1.27-alpine AS runtime

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 80
ENTRYPOINT ["/docker-entrypoint.sh"]

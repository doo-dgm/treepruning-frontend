# Tree Pruning - Frontend

SPA (Single Page Application) que consume el backend del sistema de gestion de
arbolado urbano de Rionegro. Diseno mobile-first para uso en campo por las
cuadrillas, con vista administrativa para gestores y vista publica para que
los ciudadanos registren PQR.

Stack: Vue 3 (Composition API) + Vite 7 + TypeScript + Pinia + Vue Router 4 +
Bootstrap 5.3 + Axios. Integraciones: Keycloak (auth), Google Maps Platform
(mapas), Firebase Cloud Messaging (notificaciones push), reCAPTCHA v3 (PQR
publicas), vue-i18n (textos).

---

## Estructura del proyecto

Arquitectura: Clean Architecture en cinco capas, con responsabilidad clara
en cada una.

```
src/
+-- ui/                              Capa de presentacion visual
|   +-- router/                      Rutas de Vue Router + guards
|   +-- views/                       Paginas (una por ruta)
|   |   +-- HomeView.vue             Dashboard inicial post-login
|   |   +-- LoginView.vue            Formulario de login
|   |   +-- PruningManagement.vue    Gestion completa de podas
|   |   +-- GestionView.vue          Catalogos (arboles, cuadrillas, tipos, etc.)
|   |   +-- StatisticsPanel.vue      Panel de estadisticas
|   |   +-- PQR.vue                  Formulario publico de PQR
|   +-- components/                  Componentes reutilizables
|   |   +-- Sidebar.vue              Barra lateral con menu por rol
|   |   +-- TreeMap.vue              Mapa Google Maps con arboles geo
|   |   +-- PhotoCapture.vue         Captura/seleccion de fotos
|   |   +-- PruningDetailModal.vue   Modal con detalle de poda + fotos
|   +-- layouts/                     Layouts compartidos (publico, admin)
|   +-- assets/                      Imagenes, iconos, estilos globales
|
+-- presentation/                    Capa de estado e interaccion
|   +-- stores/                      Pinia (JWT, rol, modulos habilitados)
|   |   +-- auth.ts                  Token, refresh, login, logout
|   +-- composables/                 Logica reactiva reutilizable
|
+-- domain/                          Capa de negocio (pura, sin frameworks)
|   +-- gestion/                     Entidades y casos de uso de catalogos
|   +-- pruning/                     Entidades + SchedulePreventivePruningUseCase
|   +-- share/                       Tipos compartidos
|
+-- data/                            Capa de acceso a datos
|   +-- services/                    Llamadas Axios al backend
|   |   +-- api.ts                   Instancia axios con interceptores
|   |   +-- pruning.service.ts
|   |   +-- photo.service.ts
|   |   +-- tree.service.ts          (resto de catalogos)
|   |   +-- ...
|   +-- repositories/                Implementacion del patron Repository
|
+-- infra/                           Capa de infraestructura tecnica
|   +-- api.ts                       Helper de baseURL y headers
|   +-- config.ts                    Lectura de env vars (import.meta.env)
|   +-- auth/                        Cliente Keycloak (login programatico, refresh, storage)
|   +-- i18n/                        Configuracion vue-i18n
|   +-- notifications/               Firebase init + registro de device token
|   +-- recaptcha/                   Helper para reCAPTCHA v3
|
+-- App.vue                          Root component
+-- main.ts                          Bootstrap (Pinia, Router, i18n, etc.)
+-- vite-env.d.ts                    Types para env vars de Vite
```

---

## Dependencias clave (package.json)

| Dependencia | Para que |
|---|---|
| `vue@^3.5` | Framework reactivo |
| `vue-router@^4.5` | Router declarativo con guards por rol |
| `pinia@^3.0` | Store global tipado |
| `axios@^1.9` | Cliente HTTP con interceptores |
| `bootstrap@^5.3` | UI components |
| `@googlemaps/js-api-loader@^2.0` | Carga diferida del SDK de Google Maps |
| `firebase@^12.13` | SDK web para FCM (notificaciones push) |
| `vue-i18n@^9.14` | i18n (textos en espanol con keys) |
| `vue-recaptcha-v3@^2.0` | reCAPTCHA v3 para formularios publicos |
| `typescript@^6.0`, `vue-tsc@^3.3` | Tipado completo + type-check |
| `vite@^7.1` | Bundler + dev server |

---

## Variables de entorno (Vite)

Se cargan en build-time desde `.env*` o se inyectan en `npm run dev`.
Todas deben prefijarse con `VITE_` para estar disponibles en el bundle.

| Variable | Para que |
|---|---|
| `VITE_API_BASE_URL` | URL base del backend (ej: `https://api-dev.treepruning.org/api/v1`) |
| `VITE_KEYCLOAK_URL` | URL de Keycloak (`https://auth.treepruning.org`) |
| `VITE_KEYCLOAK_REALM` | Realm (`tree-pruning-dev` o `tree-pruning-prod`) |
| `VITE_KEYCLOAK_CLIENT_ID` | `tree-pruning-frontend` |
| `VITE_GOOGLE_MAPS_API_KEY` | API key de Google Maps |
| `VITE_RECAPTCHA_SITE_KEY` | Site key publica de reCAPTCHA v3 |
| `VITE_FIREBASE_API_KEY` | Config de Firebase (web app) |
| `VITE_FIREBASE_PROJECT_ID` | |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | |
| `VITE_FIREBASE_APP_ID` | |
| `VITE_FIREBASE_VAPID_KEY` | Para que el navegador pida el device token |

En produccion las inyecta el CI/CD en el build. Para correr local crear un
`.env.local` (ignorado por git).

---

## Vistas y flujo

### Rol Administrador

1. Login -> HomeView.
2. Sidebar: Inventario (arboles), Podas, PQR, Reportes/Stats, Gestion
   (catalogos).
3. PruningManagement: filtrar, ver detalle, crear nueva poda (formulario
   completo), subir fotos via PhotoCapture, ver mapa de arboles con
   TreeMap, revisar evidencias en PruningDetailModal.
4. GestionView: CRUD de catalogos (cuadrillas, tipos, estados, etc.).
5. StatisticsPanel: indicadores agregados.

### Rol Encargado de Cuadrilla

- Vista mobile-first.
- Lista de podas asignadas, ordenadas por fecha.
- Detalle de cada poda con mapa al arbol.
- Captura de fotos con la camara del dispositivo via `PhotoCapture.vue`.
- Marcar poda como ejecutada con fecha de ejecucion y observaciones.

### Rol Ciudadano (publico, sin login)

- `PQR.vue` accesible sin autenticacion.
- Formulario: nombre, documento, descripcion, evidencias opcionales,
  reCAPTCHA v3.
- Envio directo al backend, sin necesidad de cuenta.

---

## Auth: Keycloak login programatico

A diferencia de un redirect tipico de OIDC, el frontend hace login con
username/password directo contra el backend (`POST /auth/login`), que a su
vez consulta a Keycloak via Direct Access Grant. Razon: UX mas fluida en
campo (sin redirects) y soporte de PWA offline-friendly.

Flujo (`src/infra/auth/KeycloakClient.ts`):

1. Usuario llena LoginView.
2. `keycloakClient.login({ username, password })` -> `POST /api/v1/auth/
   login`.
3. Backend devuelve `{ accessToken, refreshToken, expiresIn, roles, ... }`.
4. `keycloakStorage` persiste tokens en localStorage.
5. Antes de que expire (margen 30s), `keycloakClient.updateToken()` hace
   refresh.
6. Logout limpia storage y redirige a `/login`.

Pinia store (`presentation/stores/auth.ts`):

- `token`, `refreshToken`, `user`, `roles`.
- Getters: `isAuthenticated`, `is(role)`.
- Acciones: `setSession`, `clearSession`.

El interceptor de Axios (`data/services/api.ts`) adjunta
`Authorization: Bearer <token>` a cada request y, ante 401, intenta
refresh + retry una vez antes de redirigir a login.

---

## Subida de fotos (flujo)

`PhotoCapture.vue` muestra preview + soporta camara movil (`capture="environ
ment"`). El usuario puede agregar multiples fotos.

Por cada foto:

```ts
const { data } = await photoService.upload(file)
// data: { path: "2026/05/uuid.jpg" }
keys.push(data.path)
```

Al guardar la poda:

```ts
await pruningService.create({
  // ... resto del DTO
  photographicRecordPath: keys.join(','),  // "k1,k2,k3"
})
```

Para visualizar las fotos en `PruningDetailModal.vue`:

```ts
const { data } = await pruningService.getPhotoUrls(pruningId)
// data: { urls: ["https://s3.../...?Expires=900&...", ...] }
```

Las URLs son presigned (validas 15 min). Si el modal se mantiene abierto
mas tiempo, hace falta volver a llamar.

---

## Notificaciones push (FCM)

`src/infra/notifications/` maneja todo:

1. `firebase.initializeApp(...)` con la config de `VITE_FIREBASE_*`.
2. Pedir permiso de notificacion al navegador (`Notification.request
   Permission()`).
3. Obtener device token con `getToken(messaging, { vapidKey })`.
4. Registrarlo en backend: `POST /api/v1/notifications/tokens`.
5. Escuchar mensajes en foreground con `onMessage(messaging, callback)` y
   mostrar toast con Bootstrap.
6. Para background, el `firebase-messaging-sw.js` (service worker) muestra
   notificaciones nativas del SO.

Si el usuario rechaza permiso o el browser no lo soporta, el resto de la
app sigue funcionando sin notificaciones.

---

## Cache buster y nginx

El frontend se sirve via nginx (Dockerfile multi-stage Vite -> nginx). El
`nginx.conf` aplica:

- `/assets/*` -> `Cache-Control: public, immutable, max-age=1y` (los
  bundles tienen hash en el nombre, son inmutables).
- `*.html` -> `Cache-Control: no-store, no-cache, must-revalidate` (el
  `index.html` debe revalidar siempre para que los usuarios obtengan los
  hash nuevos tras un deploy).

El matcher es `location ~* \.html$` (no `location = /index.html`) porque
nginx hace `try_files $uri $uri/ /index.html` como redirect interno y el
matcher exacto no se re-evalua.

---

## Correr local

### Setup

```bash
npm install
cp .env.example .env.local   # editar con tus credenciales
npm run dev
```

`http://localhost:5173`. Apunta al backend que configures en
`VITE_API_BASE_URL` (puede ser `http://localhost:8080/api/v1` si lo corres
local o `https://api-dev.treepruning.org/api/v1` para usar la VM).

### Build de produccion

```bash
npm run build       # genera dist/
npm run preview     # sirve dist/ en :4173 para verificar
```

### Linting + type-check

```bash
npm run lint
npx vue-tsc --noEmit
```

---

## Despliegue

Push a `develop` -> CI construye `ghcr.io/.../treepruning-frontend:dev` ->
dispatch a infra -> recrea `tp-frontend-dev` (publicado en
`dev.treepruning.org`).

Push a `main` -> mismo flujo con tag `:latest` -> recrea `tp-frontend`
(`treepruning.org`).

Ambos pipelines corren tambien `sonar-scanner` contra
`sonar.treepruning.org` con projectKey `TreePruning-Frontend` o
`TreePruning-Frontend-Dev`.

Detalles del workflow en `.github/workflows/frontend.yml`.

---

## Bruno collection

La carpeta `Dev/bruno/` contiene requests de ejemplo del backend que se
pueden ejecutar directamente para probar el API sin abrir el frontend.
Util para debuggear endpoints. Ver el README del backend o
`bruno/auth/Obtener Token (Password).bru` para el setup.

---

## Convenciones de codigo

- **TypeScript estricto**: `strict: true` en `tsconfig.json`.
- **Composition API** (no Options API).
- **Single File Components** con `<script setup lang="ts">`.
- **Path alias** `@/...` -> `src/...`.
- **Naming**:
  - Componentes: PascalCase (`PruningDetailModal.vue`).
  - Services / composables: camelCase (`pruning.service.ts`,
    `useNotifications.ts`).
  - Stores: camelCase singular (`auth.ts`).
- **Imports relativos** dentro de un mismo paquete; **alias `@/`** para
  cruzar paquetes.
- **Case sensitivity**: el filesystem de Windows es case-insensitive pero
  Linux no. Siempre escribir los imports con el mismo case que el archivo
  real, sino el build en CI falla.

---

## Ver tambien

- `treepruning-backend/README.md` - API que consume.
- `treepruning-infra/README.md` - Como esta montada la VM.

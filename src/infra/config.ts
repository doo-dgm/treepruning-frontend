declare const __VITE_API_URL__:                 string
declare const __VITE_KEYCLOAK_ISSUER_URI__:          string
declare const __VITE_KEYCLOAK_CLIENT__:              string
declare const __VITE_FIREBASE_API_KEY__:             string
declare const __VITE_FIREBASE_AUTH_DOMAIN__:         string
declare const __VITE_FIREBASE_PROJECT_ID__:          string
declare const __VITE_FIREBASE_MESSAGING_SENDER_ID__: string
declare const __VITE_FIREBASE_APP_ID__:              string
declare const __VITE_FIREBASE_VAPID_KEY__:           string
declare const __VITE_GOOGLE_MAPS_API_KEY__:          string
declare const __VITE_RECAPTCHA_SITE_KEY__:           string

export const config = {
  apiBaseUrl:                __VITE_API_URL__,
  keycloakIssuerUri:         __VITE_KEYCLOAK_ISSUER_URI__,
  keycloakClient:            __VITE_KEYCLOAK_CLIENT__,
  firebaseApiKey:            __VITE_FIREBASE_API_KEY__,
  firebaseAuthDomain:        __VITE_FIREBASE_AUTH_DOMAIN__,
  firebaseProjectId:         __VITE_FIREBASE_PROJECT_ID__,
  firebaseMessagingSenderId: __VITE_FIREBASE_MESSAGING_SENDER_ID__,
  firebaseAppId:             __VITE_FIREBASE_APP_ID__,
  firebaseVapidKey:          __VITE_FIREBASE_VAPID_KEY__,
  googleMapsApiKey:          __VITE_GOOGLE_MAPS_API_KEY__,
  recaptchaSiteKey:          __VITE_RECAPTCHA_SITE_KEY__,
}

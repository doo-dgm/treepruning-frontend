/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_KEYCLOAK_URL:    string
  readonly VITE_KEYCLOAK_REALM:  string
  readonly VITE_KEYCLOAK_CLIENT: string
  readonly VITE_API_URL:    string
  readonly VITE_FIREBASE_API_KEY:              string
  readonly VITE_FIREBASE_AUTH_DOMAIN:          string
  readonly VITE_FIREBASE_PROJECT_ID:           string
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID:  string
  readonly VITE_FIREBASE_APP_ID:               string
  readonly VITE_FIREBASE_VAPID_KEY:            string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

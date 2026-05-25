#!/bin/sh
set -e

ASSETS=/usr/share/nginx/html/assets

for f in "$ASSETS"/*.js; do
  [ -f "$f" ] || continue
  sed -i \
    -e "s|__VITE_API_BASE_URL__|${VITE_API_BASE_URL:-}|g" \
    -e "s|__VITE_KEYCLOAK_ISSUER_URI__|${VITE_KEYCLOAK_ISSUER_URI:-}|g" \
    -e "s|__VITE_KEYCLOAK_CLIENT__|${VITE_KEYCLOAK_CLIENT:-}|g" \
    -e "s|__VITE_FIREBASE_API_KEY__|${VITE_FIREBASE_API_KEY:-}|g" \
    -e "s|__VITE_FIREBASE_AUTH_DOMAIN__|${VITE_FIREBASE_AUTH_DOMAIN:-}|g" \
    -e "s|__VITE_FIREBASE_PROJECT_ID__|${VITE_FIREBASE_PROJECT_ID:-}|g" \
    -e "s|__VITE_FIREBASE_MESSAGING_SENDER_ID__|${VITE_FIREBASE_MESSAGING_SENDER_ID:-}|g" \
    -e "s|__VITE_FIREBASE_APP_ID__|${VITE_FIREBASE_APP_ID:-}|g" \
    -e "s|__VITE_FIREBASE_VAPID_KEY__|${VITE_FIREBASE_VAPID_KEY:-}|g" \
    -e "s|__VITE_RECAPTCHA_SITE_KEY__|${VITE_RECAPTCHA_SITE_KEY:-}|g" \
    -e "s|__VITE_GOOGLE_MAPS_API_KEY__|${VITE_GOOGLE_MAPS_API_KEY:-}|g" \
    "$f"
done

exec nginx -g 'daemon off;'

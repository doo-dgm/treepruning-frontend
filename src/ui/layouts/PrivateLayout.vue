<script setup lang="ts">
import { watch }             from 'vue'
import Sidebar               from '@/ui/components/Sidebar.vue'
import { useNotifications }  from '@/presentation/composables/useNotifications'

const { notifications, dismissNotification } = useNotifications()

// Auto-dismiss cada notificación después de 6 segundos
watch(notifications, (list) => {
  const newest = list[0]
  if (!newest) return
  setTimeout(() => dismissNotification(newest.id), 6000)
}, { deep: false })
</script>

<template>
  <div class="private-layout">
    <Sidebar />
    <main class="private-layout__content">
      <router-view />
    </main>

    <!-- Notificaciones push flotantes (foreground FCM) -->
    <div class="notifications-container">
      <transition-group name="toast">
        <div
          v-for="n in notifications"
          :key="n.id"
          class="notification-toast"
        >
          <div class="notification-toast__icon">🌳</div>
          <div class="notification-toast__body">
            <strong class="notification-toast__title">{{ n.title }}</strong>
            <p class="notification-toast__text">{{ n.body }}</p>
          </div>
          <button
            class="notification-toast__close"
            aria-label="Cerrar"
            @click="dismissNotification(n.id)"
          >✕</button>
        </div>
      </transition-group>
    </div>
  </div>
</template>

<style scoped>
.private-layout {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

.private-layout__content {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
  background: #f0f2f5;
}

/* ── Toast container ── */
.notifications-container {
  position: fixed;
  bottom: 1.5rem;
  right: 1.5rem;
  z-index: 9999;
  display: flex;
  flex-direction: column-reverse;
  gap: 0.75rem;
  max-width: 340px;
  width: 100%;
  pointer-events: none;
}

/* ── Individual toast ── */
.notification-toast {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  background: #ffffff;
  border-left: 4px solid #198754;
  border-radius: 10px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  padding: 0.875rem 1rem;
  pointer-events: all;
}

.notification-toast__icon {
  font-size: 1.4rem;
  line-height: 1;
  flex-shrink: 0;
}

.notification-toast__body {
  flex: 1;
  min-width: 0;
}

.notification-toast__title {
  display: block;
  font-size: 0.9rem;
  font-weight: 600;
  color: #1a2635;
  margin-bottom: 0.2rem;
}

.notification-toast__text {
  font-size: 0.82rem;
  color: #555;
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
}

.notification-toast__close {
  background: none;
  border: none;
  color: #aaa;
  cursor: pointer;
  font-size: 0.85rem;
  padding: 0;
  flex-shrink: 0;
  line-height: 1;
  margin-top: 2px;
}
.notification-toast__close:hover {
  color: #555;
}

/* ── Animación de entrada/salida ── */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}
.toast-enter-from {
  opacity: 0;
  transform: translateX(40px);
}
.toast-leave-to {
  opacity: 0;
  transform: translateX(40px);
}
</style>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import Sidebar              from '@/ui/components/Sidebar.vue'
import { useNotifications } from '@/presentation/composables/useNotifications'

const { notifications, dismissNotification } = useNotifications()

// ── Estado del sidebar ────────────────────────────────────────────────────
const collapsed    = ref(false)   // desktop: solo iconos
const mobileOpen   = ref(false)   // mobile: drawer visible
const isMobile     = ref(false)

function checkMobile() {
  isMobile.value = window.innerWidth <= 768
}

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})

function toggleDesktop() { collapsed.value = !collapsed.value }
function openMobile()    { mobileOpen.value = true  }
function closeMobile()   { mobileOpen.value = false }
</script>

<template>
  <div class="private-layout" :class="{ 'private-layout--collapsed': collapsed && !isMobile }">

    <!-- Top bar — solo visible en mobile -->
    <header v-if="isMobile" class="topbar">
      <button class="topbar__hamburger" aria-label="Abrir menú" @click="openMobile">
        ☰
      </button>
      <span class="topbar__title">TreePruning</span>
    </header>

    <!-- Overlay — mobile, cuando el drawer está abierto -->
    <div
      v-if="isMobile && mobileOpen"
      class="sidebar-overlay"
      @click="closeMobile"
    />

    <!-- Sidebar -->
    <Sidebar
      :collapsed="collapsed && !isMobile"
      :open="mobileOpen"
      @toggle="toggleDesktop"
      @close="closeMobile"
    />

    <!-- Contenido principal -->
    <main class="private-layout__content">
      <router-view />
    </main>

    <!-- Notificaciones push flotantes -->
    <div class="notifications-container">
      <transition-group name="toast">
        <div
          v-for="n in notifications"
          :key="n.id"
          class="notification-toast"
          :class="`notification-toast--${n.type}`"
        >
          <div class="notification-toast__icon">
            <span v-if="n.type === 'error'">❌</span>
            <span v-else-if="n.type === 'warning'">⚠️</span>
            <span v-else-if="n.type === 'success'">🌳</span>
            <span v-else>ℹ️</span>
          </div>
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
/* ── Layout base ─────────────────────────────────────────────────────────── */
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
  transition: margin-left 0.25s ease;
  min-width: 0; /* evita overflow en flex */
}

/* ── Top bar (mobile) ────────────────────────────────────────────────────── */
.topbar {
  display: none;
}

/* ── Overlay (mobile) ────────────────────────────────────────────────────── */
.sidebar-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  z-index: 999;
}

/* ── Toast container ─────────────────────────────────────────────────────── */
.notifications-container {
  position: fixed;
  bottom: 1.5rem;
  right: 1.5rem;
  z-index: 9999;
  display: flex;
  flex-direction: column-reverse;
  gap: 0.75rem;
  max-width: 340px;
  width: calc(100% - 3rem);
  pointer-events: none;
}

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
.notification-toast__close:hover { color: #555; }

/* ── Variantes por tipo ──────────────────────────────────────────────────── */
.notification-toast--success { border-left-color: #198754; }
.notification-toast--error   { border-left-color: #dc3545; }
.notification-toast--warning { border-left-color: #fd7e14; }
.notification-toast--info    { border-left-color: #0d6efd; }

/* ── Animación toast ─────────────────────────────────────────────────────── */
.toast-enter-active,
.toast-leave-active { transition: all 0.3s ease; }
.toast-enter-from   { opacity: 0; transform: translateX(40px); }
.toast-leave-to     { opacity: 0; transform: translateX(40px); }

/* ── Mobile (≤ 768px) ────────────────────────────────────────────────────── */
@media (max-width: 768px) {
  .private-layout {
    flex-direction: column;
  }

  .topbar {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 0 16px;
    height: 56px;
    background: #1a2635;
    color: #ffffff;
    flex-shrink: 0;
    z-index: 100;
  }

  .topbar__hamburger {
    background: none;
    border: none;
    color: #ffffff;
    font-size: 1.4rem;
    cursor: pointer;
    padding: 4px;
    line-height: 1;
  }

  .topbar__title {
    font-size: 1rem;
    font-weight: 700;
    letter-spacing: 0.5px;
  }

  .private-layout__content {
    padding: 1rem;
    height: calc(100dvh - 56px);
  }
}
</style>

<script setup lang="ts">
import Sidebar from '@/ui/components/Sidebar.vue'
import { useNotifications } from '@/presentation/composables/useNotifications'

const { notifications, dismissNotification } = useNotifications()
</script>

<template>
  <div class="private-layout">
    <Sidebar />
    <main class="private-layout__content">
      <router-view />
    </main>

    <!-- Notificaciones flotantes -->
    <div class="notifications-container">
      <div
        v-for="n in notifications"
        :key="n.id"
        class="notification-toast alert alert-info alert-dismissible mb-0"
      >
        <strong>{{ n.title }}</strong>
        <p class="mb-0 mt-1 text-sm">{{ n.body }}</p>
        <button
          type="button"
          class="btn-close"
          @click="dismissNotification(n.id)"
        />
      </div>
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
</style>

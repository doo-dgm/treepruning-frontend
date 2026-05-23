<template>
  <div class="private-layout">
    <Sidebar />
    <main class="private-layout__content">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import Sidebar from '@/ui/components/Sidebar.vue'
</script>

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

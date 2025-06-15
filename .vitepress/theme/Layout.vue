<script setup lang="ts">
// All existing imports from the original Layout.vue
import { useRoute } from 'vitepress'
import { computed, provide, useSlots, watch, ref } from 'vue'
import VPBackdrop from './components/VPBackdrop.vue'
import VPContent from './components/VPContent.vue'
import VPFooter from './components/VPFooter.vue'
import VPLocalNav from './components/VPLocalNav.vue'
import VPNav from './components/VPNav.vue'
import VPSidebar from './components/VPSidebar.vue'
import VPSkipLink from './components/VPSkipLink.vue'
import { useData } from './composables/data'
import { useCloseSidebarOnEscape, useSidebar } from './composables/sidebar'

// --- CRITICAL FIX: Import ChatbotWidget here ---
import ChatbotWidget from './ChatbotWidget.vue'
// This path assumes ChatbotWidget.vue is directly in .vitepress/theme/
// as per our previous relocation to that folder.
// If your ChatbotWidget.vue is in './components/ChatbotWidget.vue' (e.g. .vitepress/theme/components/), use that path instead.
// Based on our latest common understanding, it's sibling to index.js and Layout.vue.
// --- END CRITICAL FIX ---

const {
  isOpen: isSidebarOpen,
  open: openSidebar,
  close: closeSidebar
} = useSidebar()

const route = useRoute()
watch(() => route.path, closeSidebar)

useCloseSidebarOnEscape(isSidebarOpen, closeSidebar)

const { frontmatter } = useData()

const slots = useSlots()
const heroImageSlotExists = computed(() => !!slots['home-hero-image'])

provide('hero-image-slot-exists', heroImageSlotExists)

const isChatOpen = ref(false)
function toggleChat() {
  isChatOpen.value = !isChatOpen.value
}
</script>

<template>
  <div v-if="frontmatter.layout !== false" class="Layout" :class="frontmatter.pageClass">
    <slot name="layout-top" />
    <VPSkipLink />
    <VPBackdrop class="backdrop" :show="isSidebarOpen" @click="closeSidebar" />
    <VPNav>
      <template #nav-bar-title-before><slot name="nav-bar-title-before" /></template>
      <template #nav-bar-title-after><slot name="nav-bar-title-after" /></template>
      <template #nav-bar-content-before><slot name="nav-bar-content-before" /></template>
      <template #nav-bar-content-after><slot name="nav-bar-content-after" /></template>
      <template #nav-screen-content-before><slot name="nav-screen-content-before" /></template>
      <template #nav-screen-content-after><slot name="nav-screen-content-after" /></template>
    </VPNav>
    <VPLocalNav :open="isSidebarOpen" @open-menu="openSidebar" />

    <VPSidebar :open="isSidebarOpen">
      <template #sidebar-nav-before><slot name="sidebar-nav-before" /></template>
      <template #sidebar-nav-after><slot name="sidebar-nav-after" /></template>
    </VPSidebar>

    <VPContent>
      <template #page-top><slot name="page-top" /></template>
      <template #page-bottom><slot name="page-bottom" /></template>

      <template #not-found><slot name="not-found" /></template>
      <template #home-hero-before><slot name="home-hero-before" /></template>
      <template #home-hero-info-before><slot name="home-hero-info-before" /></template>
      <template #home-hero-info><slot name="home-hero-info" /></template>
      <template #home-hero-info-after><slot name="home-hero-info-after" /></template>
      <template #home-hero-actions-after><slot name="home-hero-actions-after" /></template>
      <template #home-hero-image><slot name="home-hero-image" /></template>
      <template #home-hero-after><slot name="home-hero-after" /></template>
      <template #home-features-before><slot name="home-features-before" /></template>
      <template #home-features-after><slot name="home-features-after" /></template>

      <template #doc-footer-before><slot name="doc-footer-before" /></template>
      <template #doc-before><slot name="doc-before" /></template>
      <template #doc-after><slot name="doc-after" /></template>
      <template #doc-top><slot name="doc-top" /></template>
      <template #doc-bottom><slot name="doc-bottom" /></template>

      <template #aside-top><slot name="aside-top" /></template>
      <template #aside-bottom><slot name="aside-bottom" /></template>
      <template #aside-outline-before><slot name="aside-outline-before" /></template>
      <template #aside-outline-after><slot name="aside-outline-after" /></template>
      <template #aside-ads-before><slot name="aside-ads-before" /></template>
      <template #aside-ads-after><slot name="aside-ads-after" /></template>
    </VPContent>

    <VPFooter />
    <slot name="layout-bottom" />
    
    <!-- Chatbot Widget -->
    <div class="chatbot-widget">
      <div class="chat-button" @click="toggleChat">
        <span class="chat-icon">💬</span>
        <span class="chat-text">Chat with us</span>
      </div>
      <div v-if="isChatOpen" class="chat-window">
        <div class="chat-header">
          <h3>Chat Support</h3>
          <button @click.stop="toggleChat" class="close-button">×</button>
        </div>
        <div class="chat-messages">
          <p>Welcome! How can we help you today?</p>
        </div>
      </div>
    </div>
  </div>
  <Content v-else />
</template>

<style scoped>
.Layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.chatbot-widget {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 9999;
}

.chat-button {
  background-color: #3eaf7c;
  color: white;
  padding: 12px 20px;
  border-radius: 25px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.chat-button:hover {
  background-color: #2d8a5d;
  transform: translateY(-2px);
}

.chat-icon {
  font-size: 1.2em;
}

.chat-window {
  position: absolute;
  bottom: 70px;
  right: 0;
  width: 300px;
  height: 400px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
}

.chat-header {
  background: #3eaf7c;
  color: white;
  padding: 12px 16px;
  border-radius: 12px 12px 0 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chat-header h3 {
  margin: 0;
  font-size: 1.1em;
}

.close-button {
  background: none;
  border: none;
  color: white;
  font-size: 1.5em;
  cursor: pointer;
  padding: 0;
  line-height: 1;
}

.chat-messages {
  padding: 16px;
  flex-grow: 1;
  overflow-y: auto;
}
</style>
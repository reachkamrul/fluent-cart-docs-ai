import { createApp } from 'vue'
import ChatbotWidget from './ChatbotWidget.vue'

export function mountGlobalChatbot() {
  if (typeof window !== 'undefined' && !document.getElementById('global-chatbot-widget')) {
    const container = document.createElement('div')
    container.id = 'global-chatbot-widget'
    document.body.appendChild(container)
    createApp(ChatbotWidget).mount(container)
  }
} 
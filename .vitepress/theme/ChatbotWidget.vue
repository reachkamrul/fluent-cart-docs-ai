<template>
  <div :class="['chatbot-container', { 'is-open': isOpen }]">
    <button class="chatbot-toggle-button" @click="toggleChatbot" aria-label="Toggle AI Docs Chat">
      <span v-if="!isOpen">💬 AI Docs Chat</span>
      <span v-else>✖️ Close Chat</span>
    </button>

    <div class="chatbot-window">
      <div class="chatbot-messages" ref="messagesContainer">
        <div v-for="(msg, index) in messages" :key="index" :class="['message', msg.role]">
          <p v-html="formatMessage(msg.content)"></p>
        </div>
        <div v-if="isLoading" class="message assistant loading">
          <p>Thinking...</p>
        </div>
      </div>

      <div class="chatbot-input">
        <input
          v-model="currentMessage"
          @keyup.enter="sendMessage"
          :disabled="isLoading"
          placeholder="Ask a question about FluentCart docs..."
          ref="inputRef"
        />
        <button @click="sendMessage" :disabled="isLoading || !currentMessage.trim()">Send</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, watch } from 'vue';

// --- Configuration ---
// Replace with your deployed serverless function URL
const API_ENDPOINT = 'https://fluent-cart-docs-ai.vercel.app/api/docs-query'; 

// --- Reactive State ---
const isOpen = ref(false); // Controls chatbot window visibility
const messages = ref([]); // Stores chat history: [{ role: 'user'|'assistant', content: '...' }]
const currentMessage = ref(''); // Current message being typed by the user
const isLoading = ref(false); // Indicates if AI is thinking
const messagesContainer = ref(null); // Ref for scrolling messages
const inputRef = ref(null);
let threadId = null; // OpenAI Assistant thread ID for conversation context

// --- Lifecycle Hook ---
onMounted(() => {
  // Load threadId from localStorage if continuing a conversation
  if (localStorage.getItem('openai_docs_thread_id')) {
    threadId = localStorage.getItem('openai_docs_thread_id');
    messages.value.push({ role: 'assistant', content: 'Welcome back! How can I help you today?' });
  } else {
    messages.value.push({ role: 'assistant', content: 'Hello! Ask me anything about FluentCart documentation.' });
  }
});

watch(isOpen, (open) => {
  if (open) {
    nextTick(() => {
      if (inputRef.value) inputRef.value.focus();
      scrollToBottom();
    });
  }
});

// --- Methods ---

function toggleChatbot() {
  isOpen.value = !isOpen.value;
}

async function sendMessage() {
  const userMessage = currentMessage.value.trim();
  if (!userMessage || isLoading.value) return;

  messages.value.push({ role: 'user', content: userMessage });
  currentMessage.value = '';
  isLoading.value = true;
  scrollToBottom();

  try {
    const body = { message: userMessage };
    if (threadId && typeof threadId === 'string' && threadId.startsWith('thread_')) {
      body.threadId = threadId;
    }
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    let data;
    try {
      data = await response.json();
    } catch (jsonErr) {
      throw new Error('Invalid server response');
    }

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch response');
    }

    threadId = data.threadId; // Update threadId for continued conversation
    localStorage.setItem('openai_docs_thread_id', threadId); // Persist thread ID

    messages.value.push({ role: 'assistant', content: data.response });

  } catch (error) {
    console.error('Chatbot API Error:', error);
    messages.value.push({ role: 'assistant', content: 'Sorry, I encountered an error. Please try again later.' });
  } finally {
    isLoading.value = false;
    scrollToBottom();
  }
}

function scrollToBottom() {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
  });
}

function formatMessage(content) {
  // Basic markdown-like formatting if needed (e.g., for newlines)
  return content.replace(/\n/g, '<br>');
}
</script>

<style scoped>
/* --- Basic Chatbot Styling --- */
.chatbot-container {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000; /* Ensure it's above other content */
  font-family: Arial, sans-serif;
}

.chatbot-toggle-button {
  background-color: #3eaf7c; /* VitePress brand color */
  color: white;
  border: none;
  border-radius: 50px;
  padding: 10px 20px;
  cursor: pointer;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 50px;
  transition: background-color 0.3s ease;
}

.chatbot-toggle-button:hover {
  background-color: #369c6f;
}

.chatbot-toggle-button span {
  display: flex;
  align-items: center;
  gap: 8px;
}

.chatbot-window {
  display: none; /* Hidden by default */
  width: 350px;
  height: 500px;
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  flex-direction: column;
  overflow: hidden;
  margin-top: 10px; /* Space between button and window */
  position: absolute;
  bottom: 60px; /* Position above the toggle button */
  right: 0;
}

.chatbot-container.is-open .chatbot-window {
  display: flex; /* Show when open */
}

.chatbot-messages {
  flex-grow: 1;
  padding: 15px;
  overflow-y: auto;
  border-bottom: 1px solid #eee;
  background-color: #f9f9f9;
}

.message {
  margin-bottom: 10px;
  padding: 8px 12px;
  border-radius: 8px;
  max-width: 85%;
  word-wrap: break-word;
}

.message p {
  margin: 0;
  line-height: 1.4;
}

.message.user {
  background-color: #e0f7fa; /* Light blue for user */
  align-self: flex-end; /* Push to right */
  margin-left: auto; /* Push to right */
}

.message.assistant {
  background-color: #e8e8e8; /* Light grey for assistant */
  align-self: flex-start; /* Push to left */
  margin-right: auto; /* Push to left */
}

.message.assistant.loading p {
  font-style: italic;
  color: #666;
}

.chatbot-input {
  display: flex;
  padding: 10px;
  border-top: 1px solid #eee;
}

.chatbot-input input {
  flex-grow: 1;
  border: 1px solid #ddd;
  border-radius: 20px;
  padding: 8px 15px;
  font-size: 14px;
  margin-right: 10px;
}

.chatbot-input button {
  background-color: #3eaf7c;
  color: white;
  border: none;
  border-radius: 20px;
  padding: 8px 15px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.chatbot-input button:hover {
  background-color: #369c6f;
}
</style>
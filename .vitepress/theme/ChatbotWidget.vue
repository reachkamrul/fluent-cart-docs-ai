<template>
  <div :class="['chatbot-container', { 'is-open': isOpen }]">
    <button class="chatbot-toggle-button" @click="toggleChatbot" aria-label="Toggle AI Docs Chat">
      <span v-if="!isOpen">💬 AI Docs Chat</span>
      <span v-else>✖️ Close Chat</span>
    </button>

    <div class="chatbot-window">
      <div class="chatbot-messages" ref="messagesContainer">
        <div v-for="(msg, index) in messages" :key="index" :class="['message', msg.role]">
          <div v-html="formatMessage(msg.content)" class="markdown-message"></div>
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
import { marked } from 'marked';

// --- Configuration ---
const API_ENDPOINT = `${import.meta.env.BASE_URL}api/docs-query`;

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
  let storedThreadId = localStorage.getItem('openai_docs_thread_id');
  if (storedThreadId === 'undefined' || !storedThreadId || !storedThreadId.startsWith('thread_')) {
    storedThreadId = null;
    localStorage.removeItem('openai_docs_thread_id');
  }
  if (storedThreadId) {
    threadId = storedThreadId;
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

    if (data.threadId && typeof data.threadId === 'string' && data.threadId.startsWith('thread_')) {
      threadId = data.threadId;
      localStorage.setItem('openai_docs_thread_id', threadId);
    }

    // Log the raw assistant response for debugging
    console.log('Raw GPT response:', data.response);

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
  return marked.parse(content);
}
</script>

<style scoped>
/* --- Basic Chatbot Styling --- */
.chatbot-container {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
  font-family: Arial, sans-serif;
}

.chatbot-toggle-button {
  background-color: #3eaf7c;
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
  display: none;
  width: 350px;
  height: 500px;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 5px 24px rgba(0, 0, 0, 0.18);
  border: 1px solid #e0e0e0;
  flex-direction: column;
  overflow: hidden;
  margin-top: 10px;
  position: absolute;
  bottom: 60px;
  right: 0;
}

.chatbot-container.is-open .chatbot-window {
  display: flex;
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
  padding: 10px 14px;
  border-radius: 8px;
  max-width: 85%;
  word-wrap: break-word;
  font-size: 15px;
}

.message p {
  margin: 0;
  line-height: 1.5;
}

.message.user {
  background-color: #e0f7fa;
  align-self: flex-end;
  margin-left: auto;
  color: #222;
}

.message.assistant {
  background-color: #f1f1f1;
  align-self: flex-start;
  margin-right: auto;
  color: #222;
}

.message.assistant.loading p {
  font-style: italic;
  color: #666;
}

.chatbot-input {
  display: flex;
  padding: 12px;
  border-top: 1px solid #eee;
  background: #fafbfc;
}

.chatbot-input input {
  flex-grow: 1;
  border: 1px solid #ddd;
  border-radius: 20px;
  padding: 10px 15px;
  font-size: 15px;
  margin-right: 10px;
  background: #fff;
  color: #222;
}

.chatbot-input input:disabled {
  background: #f5f5f5;
  color: #aaa;
}

.chatbot-input button {
  background-color: #3eaf7c;
  color: white;
  border: none;
  border-radius: 20px;
  padding: 10px 18px;
  cursor: pointer;
  font-size: 15px;
  transition: background-color 0.3s ease;
}

.chatbot-input button:hover:enabled {
  background-color: #369c6f;
}

/* Moved markdown-message styles to global style block below */
</style>

<style>
.markdown-message {
  font-size: 14px;
  line-height: 1.6;
  color: #2c3e50;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
}

/* Headings */
.markdown-message h1,
.markdown-message h2,
.markdown-message h3,
.markdown-message h4 {
  margin-top: 1.5em;
  margin-bottom: 0.5em;
  font-weight: 600;
  line-height: 1.25;
  color: #1a1a1a;
}

.markdown-message h1 { font-size: 1.4em; }
.markdown-message h2 { font-size: 1.3em; }
.markdown-message h3 { font-size: 1.2em; }
.markdown-message h4 { font-size: 1.1em; }

/* Paragraphs and spacing */
.markdown-message p {
  line-height: 1.6;
  margin-top: 18px;
}

/* Lists */
.markdown-message ul,
.markdown-message ol {
  padding-left: 1.5em;
  list-style: outside;
}

.markdown-message li {
  margin: 0.4em 0;
  line-height: 1.2;
}

.markdown-message li > p {
  margin: 0.4em 0;
}

/* Code blocks */
.markdown-message code {
  font-family: ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas, Liberation Mono, monospace;
  font-size: 0.9em;
  background-color: #f6f8fa;
  padding: 0.2em 0.4em;
  border-radius: 3px;
  color: #476582;
}

.markdown-message pre {
  background-color: #f6f8fa;
  border-radius: 6px;
  padding: 1em;
  margin: 0.75em 0;
  overflow-x: auto;
  font-size: 0.9em;
  line-height: 1.5;
}

.markdown-message pre code {
  background-color: transparent;
  padding: 0;
  border-radius: 0;
  color: inherit;
}

/* Blockquotes */
.markdown-message blockquote {
  margin: 0.75em 0;
  padding: 0.5em 1em;
  border-left: 4px solid #3eaf7c;
  background-color: #f8f8f8;
  color: #666;
}

.markdown-message blockquote p {
  margin: 0.5em 0;
}

/* Links */
.markdown-message a {
  color: #3eaf7c;
  text-decoration: none;
}

.markdown-message a:hover {
  text-decoration: underline;
}

/* Strong and emphasis */
.markdown-message strong,
.markdown-message b {
  font-weight: 600;
  color: #1a1a1a;
}

.markdown-message em {
  font-style: italic;
  color: #2c3e50;
}

/* Horizontal rule */
.markdown-message hr {
  margin: 1.5em 0;
  border: none;
  border-top: 1px solid #eaecef;
}

/* Tables */
.markdown-message table {
  border-collapse: collapse;
  margin: 0.75em 0;
  width: 100%;
  font-size: 0.9em;
}

.markdown-message th,
.markdown-message td {
  padding: 0.6em 1em;
  border: 1px solid #dfe2e5;
}

.markdown-message th {
  background-color: #f6f8fa;
  font-weight: 600;
}

/* Images */
.markdown-message img {
  max-width: 100%;
  height: auto;
  margin: 0.75em 0;
  border-radius: 4px;
}

.message.user .markdown-message p{
  margin-bottom: 18px;
}
</style>
<template>
  <div style="position: fixed; bottom: 20px; right: 20px; z-index: 9999; background-color: #3eaf7c; color: white; padding: 10px; border-radius: 8px; cursor: pointer;" @click="openChat">
    💬 Chatbot Test
  </div>
</template>

<script setup>
// This script will just log a message for now when clicked,
// to ensure the component is functional.
function openChat() {
  console.log('Chatbot button clicked!');
  // Later, this will open your full chat window.
}
</script>

<style scoped>
/* Minimal styles */
</style>
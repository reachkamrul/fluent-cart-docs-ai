// .vitepress/theme/index.js
import DefaultTheme from 'vitepress/theme';
import ChatbotWidget from './ChatbotWidget.vue'; // Import the minimal component

export default {
    extends: DefaultTheme, // Extend the default VitePress theme
    // Use the enhanceApp hook to register your component globally
    enhanceApp({ app }) {
        app.component('ChatbotWidget', ChatbotWidget); // Register it as 'ChatbotWidget'
    }
};
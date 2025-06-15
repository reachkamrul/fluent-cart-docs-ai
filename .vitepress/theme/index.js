// .vitepress/theme/index.js
import DefaultTheme from 'vitepress/theme';
import ChatbotWidget from './ChatbotWidget.vue'; // Import the minimal component
import './custom.css';
import { mountGlobalChatbot } from './GlobalChatbot.js';

export default {
    extends: DefaultTheme, // Extend the default VitePress theme
    // Use the enhanceApp hook to register your component globally
    enhanceApp({ app, router }) {
        app.component('ChatbotWidget', ChatbotWidget); // Register it as 'ChatbotWidget'
        if (typeof window !== 'undefined') {
            router.onAfterRouteChanged = () => {
                mountGlobalChatbot();
            };
            mountGlobalChatbot();
        }
    }
};
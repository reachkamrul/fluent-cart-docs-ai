// .vitepress/theme/index.js (or index.ts)
import DefaultTheme from 'vitepress/theme';
import ChatbotWidget from './components/ChatbotWidget.vue'; // Import your chatbot component

/** @type {import('vitepress').Theme} */
export default {
    extends: DefaultTheme,

    setup() {

    },

    Layout: {
        extends: DefaultTheme.Layout,
        setup() {}, // Keep setup if it exists
        // Add the chatbot directly to the template
        template: `
      <Layout>
        <template #layout-bottom>
          <ChatbotWidget />
        </template>
      </Layout>
    `,
        components: {
            ChatbotWidget // Register the component
        }
    }
};
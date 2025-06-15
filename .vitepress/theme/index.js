import DefaultTheme from 'vitepress/theme';
import ChatbotWidget from '@/components/ChatbotWidget.vue'; // <--- UPDATED IMPORT PATH USING ALIAS

/** @type {import('vitepress').Theme} */
export default {
    extends: DefaultTheme,
    Layout: {
        extends: DefaultTheme.Layout,
        setup() {
            // This setup is for the Layout, not the component itself.
        },
        template: `
          <Layout>
          <template #layout-bottom>
            <ChatbotWidget />
          </template>
          </Layout>
        `,
        components: {
            ChatbotWidget
        }
    }
};
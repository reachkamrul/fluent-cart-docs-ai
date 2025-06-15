// .vitepress/theme/index.js
import DefaultTheme from 'vitepress/theme';
import ChatbotWidget from './ChatbotWidget.vue'; // Direct sibling import

/** @type {import('vitepress').Theme} */
export default {
    extends: DefaultTheme,
    Layout: {
        extends: DefaultTheme.Layout,
        setup() { },
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
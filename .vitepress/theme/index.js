// .vitepress/theme/index.js
import DefaultTheme from 'vitepress/theme';
import ChatbotWidget from './ChatbotWidget.vue'; // The component we're trying to integrate

/** @type {import('vitepress').Theme} */
export default {
    extends: DefaultTheme, // Correctly extend the default theme

    // This is the simplest way to override the layout to add a global component.
    // We'll keep it here, as it's been tested.
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
            ChatbotWidget // Register the component here
        }
    }
};
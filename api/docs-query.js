// api/docs-query.js (for Vercel/Netlify Functions)

const OpenAI = require('openai'); // Make sure you've installed 'openai' in your project
                                  // and it's listed in package.json dependencies.

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY, // Accessed securely from environment variables
});

const ASSISTANT_ID = process.env.OPENAI_ASSISTANT_ID; // Your Assistant ID

// Citation key to doc link mapping
const citationMap = {
  // Batch 1
  'understanding-shipping-classes_part2.txt': '/guide/shipping/understanding-shipping-classes#how-to-add-and-manage-shipping-classes',
  'understanding-shipping-classes_part6.txt': '/guide/shipping/understanding-shipping-classes#assigning-shipping-classes-to-products',
  'creating-physical-products_part2.txt': '/guide/product-types-creation/creating-physical-products#steps-to-create-a-new-physical-product',
  'creating-physical-products_part4.txt': '/guide/product-types-creation/creating-physical-products#1-basic-product-information',
  'creating-physical-products_part6.txt': '/guide/product-types-creation/creating-physical-products#2-media',
  'creating-physical-products_part8.txt': '/guide/product-types-creation/creating-physical-products#3-product-organizer',
  'creating-physical-products_part10.txt': '/guide/product-types-creation/creating-physical-products#4-pricing-variations',
  'creating-physical-products_part12.txt': '/guide/product-types-creation/creating-physical-products#simple-variations-for-products-with-different-versions',
  'creating-physical-products_part14.txt': '/guide/product-types-creation/creating-physical-products#5-inventory-management',
  'creating-physical-products_part16.txt': '/guide/product-types-creation/creating-physical-products#publishing-your-physical-product',
  'initial-setup-wizard_part2.txt': '/guide/getting-started/initial-setup-wizard#1-store-details',
  'initial-setup-wizard_part4.txt': '/guide/getting-started/initial-setup-wizard#2-page-setup',
  'initial-setup-wizard_part6.txt': '/guide/getting-started/initial-setup-wizard#3-product-setup',
  'initial-setup-wizard_part8.txt': '/guide/getting-started/initial-setup-wizard#completing-the-wizard--next-steps-for-your-business',
  'order-details-overview_part2.txt': '/guide/store-management/orders-management/order-details-overview#accessing-order-details',
  'order-details-overview_part4.txt': '/guide/store-management/orders-management/order-details-overview#understanding-the-order-details-screen',
  'order-details-overview_part6.txt': '/guide/store-management/orders-management/order-details-overview#3-payment--financial-summary',
  'order-details-overview_part8.txt': '/guide/store-management/orders-management/order-details-overview#5-notes',

  // Batch 2
  'creating-managing-product-categories_part2.txt': '/guide/product-types-creation/creating-managing-product-categories#index',
  'creating-managing-product-types_part2.txt': '/guide/product-types-creation/creating-managing-product-types#index',
  'creating-digital-products_part2.txt': '/guide/product-types-creation/creating-digital-products#index',
  'creating-digital-products-with-licenses_part2.txt': '/guide/product-types-creation/creating-digital-products-with-licenses#index',
  'advanced-shipping-calculations_part2.txt': '/guide/shipping/advanced-shipping-calculations#index',
  'configuring-shipping-zones_part2.txt': '/guide/shipping/configuring-shipping-zones#index',
  'setting-up-shipping-methods_part2.txt': '/guide/shipping/setting-up-shipping-methods#index',
  'installation-activation_part2.txt': '/guide/getting-started/installation-activation#index',
  'dashboard-overview_part2.txt': '/guide/getting-started/dashboard-overview#index',

  // Batch 3
  'orders-management_part2.txt': '/guide/store-management/orders-management/index#orders-management-overview',
  'viewing-filtering-orders_part2.txt': '/guide/store-management/orders-management/viewing-filtering-orders#index',
  'creating-new-orders_part2.txt': '/guide/store-management/orders-management/creating-new-orders#index',
  'editing-existing-orders_part2.txt': '/guide/store-management/orders-management/editing-existing-orders#index',
  'processing-refunds_part2.txt': '/guide/store-management/orders-management/processing-refunds#index',
  'collecting-payments-modified-orders_part2.txt': '/guide/store-management/orders-management/collecting-payments-modified-orders#index',
  'changing-order-statuses_part2.txt': '/guide/store-management/orders-management/changing-order-statuses#index',
  'inventory-management_part2.txt': '/guide/store-management/inventory-management#index',
  'customers-management_part2.txt': '/guide/store-management/customers-management/index#customers-management-overview',
  'viewing-searching-customers_part2.txt': '/guide/store-management/customers-management/viewing-searching-customers#index',
  'using-advanced-customer-filters_part2.txt': '/guide/store-management/customers-management/using-advanced-customer-filters#index',
  'customer-details-overview_part2.txt': '/guide/store-management/customers-management/customer-details-overview#index',

  // Batch 4
  'customer-dashboard_part2.txt': '/guide/customer-dashboard/index#customer-dashboard-overview',
  'purchase-history_part2.txt': '/guide/customer-dashboard/purchase-history#index',
  'subscriptions_part2.txt': '/guide/customer-dashboard/subscriptions#index',
  'licenses_part2.txt': '/guide/customer-dashboard/licenses#index',
  'downloads_part2.txt': '/guide/customer-dashboard/downloads#index',
  'profile-management_part2.txt': '/guide/customer-dashboard/profile-management#index',
  'payments-checkout_part2.txt': '/guide/payments-checkout/index#payments-checkout-overview',
  'connecting-payment-gateways_part2.txt': '/guide/payments-checkout/connecting-payment-gateways#index',
  'stripe-settings_part2.txt': '/guide/payments-checkout/connecting-payment-gateways/stripe-settings#index',
  'paypal-settings_part2.txt': '/guide/payments-checkout/connecting-payment-gateways/paypal-settings#index',
  'cash-on-delivery-settings_part2.txt': '/guide/payments-checkout/connecting-payment-gateways/cash-on-delivery-settings#index',
  'checkout-actions-integrations_part2.txt': '/guide/payments-checkout/checkout-actions-integrations#index',
  'marketing-sales-tools_part2.txt': '/guide/marketing-sales-tools/index#marketing-sales-tools-overview',
  'creating-managing-coupons_part2.txt': '/guide/marketing-sales-tools/creating-managing-coupons/index#creating-managing-coupons-overview',
  'adding-coupons_part2.txt': '/guide/marketing-sales-tools/creating-managing-coupons/adding-coupons/index#adding-coupons-overview',

  // Batch 5
  'reporting-analytics_part2.txt': '/guide/reporting-analytics/index#reporting-analytics-overview',
  'reports-dashboard-overview_part2.txt': '/guide/reporting-analytics/reports-dashboard-overview#index',
  'orders-report_part2.txt': '/guide/reporting-analytics/orders-report#index',
  'revenue-report_part2.txt': '/guide/reporting-analytics/revenue-report#index',
  'refunds-report_part2.txt': '/guide/reporting-analytics/refunds-report#index',
  'subscription-report_part2.txt': '/guide/reporting-analytics/subscription-report#index',
  'product-report_part2.txt': '/guide/reporting-analytics/product-report#index',
  'settings-configuration_part2.txt': '/guide/settings-configuration/index#settings-configuration-overview',
  'general-settings_part2.txt': '/guide/settings-configuration/general-settings#index',
  'pages-setup_part2.txt': '/guide/settings-configuration/pages-setup#index',
  'single-product-order-setup_part2.txt': '/guide/settings-configuration/single-product-order-setup#index',
  'theme-setup_part2.txt': '/guide/settings-configuration/theme-setup#index',
  'additional-info-settings_part2.txt': '/guide/settings-configuration/additional-info-settings#index',
  'payment-settings_part2.txt': '/guide/settings-configuration/payment-settings#index',
  'email-notifications_part2.txt': '/guide/settings-configuration/email-notifications/index#email-notifications-overview',
  'editing-email-templates_part2.txt': '/guide/settings-configuration/email-notifications/editing-email-templates#index',
  'roles-permissions_part2.txt': '/guide/settings-configuration/roles-permissions/index#roles-permissions-overview',
  'adding-new-roles_part2.txt': '/guide/settings-configuration/roles-permissions/adding-new-roles/index#adding-new-roles-overview',
  'storage-settings_part2.txt': '/guide/settings-configuration/storage-settings#index',
  'licensing-settings_part2.txt': '/guide/settings-configuration/licensing-settings#index',

  // Batch 6
  'troubleshooting-support_part2.txt': '/guide/troubleshooting-support/index#troubleshooting-support-overview',
  'understanding-logs_part2.txt': '/guide/troubleshooting-support/understanding-logs#index',
  'common-issues-faqs_part2.txt': '/guide/troubleshooting-support/common-issues-faqs#index',
  'how-to-get-support_part2.txt': '/guide/troubleshooting-support/how-to-get-support#index',
  'email-notifications_editing-email-templates_part2.txt': '/guide/settings-configuration/email-notifications/editing-email-templates#index',
  'roles-permissions_adding-new-roles_part2.txt': '/guide/settings-configuration/roles-permissions/adding-new-roles/index#adding-new-roles-overview',

  // Batch 7
  'index_part2.txt': '/guide/index#user-guides',
  'index_part4.txt': '/guide/shipping/understanding-shipping-classes',
  'index_part6.txt': '/guide/shipping/understanding-shipping-classes#assigning-shipping-classes-to-products',
  'index_part8.txt': '/guide/product-types-creation/creating-physical-products#publishing-your-physical-product',
  'guide_part2.txt': '/guide/index#user-guides',
  'guide_part4.txt': '/guide/index#developer-docs',
  'developer_part2.txt': '/developer/index#developer-docs',

  // Batch 8
  'creating-managing-product-categories_part4.txt': '/guide/product-types-creation/creating-managing-product-categories#index',
  'creating-managing-product-types_part4.txt': '/guide/product-types-creation/creating-managing-product-types#index',
  'managing-product-integrations_part2.txt': '/guide/product-types-creation/managing-product-integrations#index',
  'defining-upgrade-paths_part2.txt': '/guide/product-types-creation/defining-upgrade-paths#index',
  'product-list-overview_part2.txt': '/guide/product-types-creation/product-list-overview#index',

  // Batch 9
  'connecting-payment-gateways_stripe-settings_part2.txt': '/guide/payments-checkout/connecting-payment-gateways/stripe-settings#index',
  'connecting-payment-gateways_paypal-settings_part2.txt': '/guide/payments-checkout/connecting-payment-gateways/paypal-settings#index',
  'connecting-payment-gateways_cash-on-delivery-settings_part2.txt': '/guide/payments-checkout/connecting-payment-gateways/cash-on-delivery-settings#index',
  'creating-managing-coupons_adding-coupons_part2.txt': '/guide/marketing-sales-tools/creating-managing-coupons/adding-coupons/index#adding-coupons-overview',
  'roles-permissions_adding-new-roles_part4.txt': '/guide/settings-configuration/roles-permissions/adding-new-roles/index#adding-new-roles-overview',

  // Batch 10
  'general-fallback_part2.txt': '/guide/index',
  'settings-fallback_part2.txt': '/guide/settings-configuration/index',
  'shipping-fallback_part2.txt': '/guide/shipping/index',
  'products-fallback_part2.txt': '/guide/product-types-creation/index',
  'orders-fallback_part2.txt': '/guide/store-management/orders-management/index',
  'customers-fallback_part2.txt': '/guide/store-management/customers-management/index',
  'dashboard-fallback_part2.txt': '/guide/customer-dashboard/index',
  'analytics-fallback_part2.txt': '/guide/reporting-analytics/index',
  'support-fallback_part2.txt': '/guide/troubleshooting-support/index',
};

function postProcessResponse(text) {
  // Replace citation tags with markdown links
  text = text.replace(/【\d+:\d+†([\w-]+\.txt)】/g, (match, citation) => {
    const url = citationMap[citation];
    return url ? `([see docs](${url}))` : '';
  });
  // Replace any remaining citation tags (without numbers)
  text = text.replace(/【[\w:†]+([\w-]+\.txt)】/g, (match, citation) => {
    const url = citationMap[citation];
    return url ? `([see docs](${url}))` : '';
  });
  // Generalize: Replace any numbered bold step with just bold text (removes number and colon)
  text = text.replace(/\d+\. (\*\*[^\*]+\*\*):?/g, '$1');
  return text;
}

module.exports = async (req, res) => {
    // Ensure this is a POST request
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    // Parse the request body
    const { message, threadId } = req.body;
    console.log('--- Incoming Request ---');
    console.log('Request body:', JSON.stringify(req.body));
    console.log('Received threadId:', threadId, 'Type:', typeof threadId);

    if (!message) {
        return res.status(400).json({ error: 'Message is required.' });
    }

    if (!ASSISTANT_ID) {
        console.error("OPENAI_ASSISTANT_ID is not set.");
        return res.status(500).json({ error: 'Assistant ID is not configured.' });
    }

    // Only use threadId if it's a valid OpenAI thread ID and not the string or value undefined
    let currentThreadId = null;
    if (
        typeof threadId === 'string' &&
        threadId.startsWith('thread_') &&
        threadId !== 'undefined'
    ) {
        currentThreadId = threadId;
    }
    console.log('Using currentThreadId:', currentThreadId, 'Type:', typeof currentThreadId);
    try {
        // 1. Create or retrieve a Thread
        if (!currentThreadId) {
            const thread = await openai.beta.threads.create();
            currentThreadId = thread.id;
            console.log('Created new thread:', currentThreadId);
            console.log('Thread creation response:', JSON.stringify(thread));
        }

        // 2. Add the user's message to the Thread
        console.log('Adding message to thread:', currentThreadId);
        const addMsgResp = await openai.beta.threads.messages.create(
            currentThreadId,
            {
                role: "user",
                content: message,
            }
        );
        console.log('Add message response:', JSON.stringify(addMsgResp));

        // 3. Run the Assistant on the Thread
        console.log('Running assistant on thread:', currentThreadId);
        const run = await openai.beta.threads.runs.create(
            currentThreadId,
            {
                assistant_id: ASSISTANT_ID,
            }
        );
        console.log('Run creation response:', JSON.stringify(run));

        // Add a delay before polling run status to avoid race conditions
        await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait 2 seconds

        // 4. Poll for the Assistant's response (use fetch instead of SDK for run status)
        console.log('Polling run status for thread (via fetch):', currentThreadId);
        const runStatusUrl = `https://api.openai.com/v1/threads/${currentThreadId}/runs/${run.id}`;
        const runStatusResp = await fetch(runStatusUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
            'OpenAI-Beta': 'assistants=v2'
          }
        });
        const runStatus = await runStatusResp.json();
        console.log('Initial run status response (via fetch):', JSON.stringify(runStatus));

        // Wait until the run is 'completed' or 'failed'
        while (runStatus.status === "queued" || runStatus.status === "in_progress" || runStatus.status === "cancelling") {
            await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait for 1 second
            const pollResp = await fetch(runStatusUrl, {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                'Content-Type': 'application/json',
                'OpenAI-Beta': 'assistants=v2'
              }
            });
            Object.assign(runStatus, await pollResp.json());
            console.log('Polled run status response (via fetch):', JSON.stringify(runStatus));
        }

        if (runStatus.status === 'completed') {
            // 5. Retrieve the Assistant's final message
            console.log('Listing messages for thread:', currentThreadId);
            const messages = await openai.beta.threads.messages.list(
                currentThreadId,
                { order: 'desc', limit: 1 } // Get the latest message
            );
            console.log('Messages list response:', JSON.stringify(messages));

            const assistantMessage = messages.data[0];
            const responseContent = assistantMessage.content.find(
                (content) => content.type === 'text'
            );

            const responseText = responseContent ? responseContent.text.value : 'No response from Assistant.';
            const processedText = postProcessResponse(responseText);
            return res.status(200).json({
                response: processedText,
                threadId: currentThreadId // Return thread ID for continued conversation
            });
        } else {
            console.error('Assistant run failed:', runStatus.status, JSON.stringify(runStatus));
            return res.status(500).json({ error: `Assistant run failed: ${runStatus.status}` });
        }

    } catch (error) {
        console.error('Error interacting with OpenAI Assistant:', error);
        if (error.stack) {
            console.error('Stack trace:', error.stack);
        }
        if (error.response) {
            console.error('OpenAI error response:', JSON.stringify(error.response));
        }
        return res.status(500).json({ error: 'Failed to get response from Assistant.' });
    }
};
// api/docs-query.js (for Vercel/Netlify Functions)

const OpenAI = require('openai'); // Make sure you've installed 'openai' in your project
                                  // and it's listed in package.json dependencies.

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY, // Accessed securely from environment variables
});

const ASSISTANT_ID = process.env.OPENAI_ASSISTANT_ID; // Your Assistant ID

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

        // 4. Poll for the Assistant's response (simplified polling for serverless context)
        // In a real-world app, you might use webhooks or more robust long-polling.
        // For a serverless function, a short polling loop is often acceptable.
        console.log('Polling run status for thread:', currentThreadId);
        let runStatus = await openai.beta.threads.runs.retrieve(
            currentThreadId,
            run.id
        );
        console.log('Initial run status response:', JSON.stringify(runStatus));

        // Wait until the run is 'completed' or 'failed'
        while (runStatus.status === "queued" || runStatus.status === "in_progress" || runStatus.status === "cancelling") {
            await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait for 1 second
            runStatus = await openai.beta.threads.runs.retrieve(
                currentThreadId,
                run.id
            );
            console.log('Polled run status response:', JSON.stringify(runStatus));
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

            return res.status(200).json({
                response: responseContent ? responseContent.text.value : 'No response from Assistant.',
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
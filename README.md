# Mixgarden JavaScript SDK

A lightweight promise‑based wrapper around the Mixgarden REST API.

```bash
npm install @mixgarden/sdk
```

- Use `models()` to get a list of available models.
- Use `plugins()` to get a list of available plugins.
- Use `conversations()` to get a list of available conversations.
- Use `conversation(id)` to get a specific conversation.
- Use `chat()` when you’re building a conversational UI, or want the platform to maintain context for you.
- Use `getCompletion()` when you need a quick, stateless generation and want absolute control over the prompt and token usage. 

```ts
import { MixgardenSDK } from '@mixgarden/sdk';

const sdk = new MixgardenSDK({ apiKey: process.env.MIXGARDEN_API_KEY });

const models = await sdk.getModels();
const chat = await sdk.chat({ 
    model: "gpt-4o-mini", 
    content: 'Hi there!', 
    conversationId: '123', 
    pluginId: '456', 
    pluginSettings: { foo: 'bar' } 
});
const plugins = await sdk.getPlugins();
const conversations = await sdk.getConversations();
const conversation = await sdk.getConversation(conversations[0].id);
const completion = await sdk.getCompletion({ 
    model: models[0].id, 
    messages: [{ role: 'user', content: 'Hi there!' }], 
    maxTokens: 100, temperature: 0.7 
});
```

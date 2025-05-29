# Mixgarden JavaScript SDK

A lightweight promise‑based wrapper around the Mixgarden REST API.

```bash
npm install @mixgarden/sdk
```

- Use `models()` to get a list of available models and providers.
- Use `plugins()` to get a list of available plugins.
- Use `conversations()` to get a list of available conversations.
- Use `conversation(id)` to get a specific conversation.
- Use `chat()` when you’re building a conversational UI, or want the platform to maintain context for you.
- Use `getMGCompletion()` when you need a one-off, stateless generation enhanced by Mixgarden plugins.
- Use `getCompletion()` when you need a one-off, stateless generation directly from LLM (Raw LLM Output).

```ts
import { MixgardenSDK } from '@mixgarden/sdk';

const sdk = new MixgardenSDK({ apiKey: process.env.MIXGARDEN_API_KEY });

const models = await sdk.getModels();
const chat = await sdk.chat({
  model: "openai/gpt-4o-mini",
  // Optionally add conversationId to add to an existing conversation
  // conversationId: "your-convo-id",
  content: 'hello mixgarden!',
  pluginId: 'tone-pro',
  pluginSettings: {
      'emotion-type': 'neutral',
      'emotion-intensity': 6,
      'personality-type': 'friendly'
  }
});
const plugins = await sdk.getPlugins();
const conversations = await sdk.getConversations();
const conversation = await sdk.getConversation(conversations[0].id);

// Mixgarden Enhanced Output - Single Message
const mgCompletion = await sdk.getMGCompletion({
  model: "openai/gpt-4o-mini",
  content: "hello mixgarden!",
  maxTokens: 100,
  temperature: 0.7,
  pluginId: "tone-pro",
  pluginSettings: {
    "emotion-type": "neutral",
    "emotion-intensity": 6,
    "personality-type": "friendly"
  }
});

// Raw LLM Output - Single Message
const completion = await sdk.getCompletion({ 
    model: "openai/gpt-4o-mini", 
    messages: [{ role: 'user', content: 'Hi there!' }], 
    maxTokens: 100, temperature: 0.7 
});
```

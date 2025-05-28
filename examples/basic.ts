import { MixgardenSDK } from '../src/index';

(async () => {
  const sdk = new MixgardenSDK();

  // 1. List models
  const models = await sdk.getModels();
  console.log('Models:', models);

  // 2. Simple chat
  const chat = await sdk.chat({
    model: models[0]?.id ?? 'mistral-small',
    content: 'hello mixgarden!',
    pluginId: 'tone-pro',
    pluginSettings: {
      'emotion-type': 'neutral',
      'emotion-intensity': 6,
      'personality-type': 'friendly'
    }
  });
  console.log('Chat response:', chat);

  // 3. Plugins
  const plugins = await sdk.getPlugins();
  console.log('Plugins:', plugins);

  // 4. Conversations
  const conversations = await sdk.getConversations();
  console.log('Conversations:', conversations);

  if (conversations.length) {
    const conversation = await sdk.getConversation(conversations[0].id);
    console.log('First conversation:', conversation);
  }
})().catch(console.error);

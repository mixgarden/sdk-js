// examples/basic.mjs
// Simple Node demo for @mixgarden/sdk
// Usage:
//   export MG_API_KEY="sk-..."   # your Mixgarden API key
//   node examples/basic.mjs

import { Mixgarden } from '@mixgarden/sdk';

const mg = new Mixgarden({ apiKey: process.env.MG_API_KEY });

const { text } = await mg.chat(
  'Say hello in pirate',
  { pluginId: 'tonepro' }
);

console.log(text);

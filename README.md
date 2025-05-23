# @mixgarden/sdk

Tiny, zero‑dependency client for talking to the **Mixgarden** API and its plugin
marketplace from Node or the browser.

<p align="center">
  <a href="https://www.npmjs.com/package/@mixgarden/sdk">
    <img src="https://img.shields.io/npm/v/@mixgarden/sdk.svg" />
  </a>
  <a href="https://github.com/mixgarden/sdk-js/actions">
    <img src="https://github.com/mixgarden/sdk-js/actions/workflows/ci.yml/badge.svg" />
  </a>
</p>

---

## Install

```bash
npm i @mixgarden/sdk          # or pnpm add / yarn add
```

Requires Node 18 + (or any modern browser).

---

## Quick start

```ts
import { Mixgarden } from "@mixgarden/sdk";

const mg = new Mixgarden({ apiKey: process.env.MG_API_KEY });

const { text } = await mg.chat(
  "Rewrite this in pirate slang",
  { pluginId: "tonepro" }
);

console.log(text);
```

---

## API

| Method | Purpose |
| ------ | ------- |
| `new Mixgarden({ apiKey, baseUrl? })` | create a client (default URL is `https://api.mixgarden.ai/v1`) |
| `chat(prompt, opts)` | run a plugin (`opts = { pluginId, model?, params? }`) |
| `listPlugins()` | return visible plugins |
| `getPlugin(id)` | fetch one plugin’s metadata |

All calls resolve to plain JSON.

---

## TypeScript

Bundled `.d.ts` files give full IntelliSense.

---

## Examples

* `examples/basic.mjs` – minimal Node script  
* `examples/browser` – vanilla `<script type="module">` demo

```bash
node examples/basic.mjs
```

---

## Contributing

```bash
pnpm install
pnpm run test
```

Follow Conventional Commits; releases are cut automatically from git tags.

---

## License

MIT

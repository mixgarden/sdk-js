import { fetch } from "undici";

interface MixgardenOptions {
  apiKey: string;
  baseUrl?: string;
}

export interface ChatOptions {
  pluginId: string;
  model?: string;
  params?: Record<string, unknown>;
}

export class Mixgarden {
  private key: string;
  private url: string;

  constructor({ apiKey, baseUrl }: MixgardenOptions) {
    this.key = apiKey;
    this.url = baseUrl ?? "https://api.mixgarden.ai/v1";
  }

  private async call<T>(
    path: string,
    body?: Record<string, unknown>
  ): Promise<T> {
    const res = await fetch(`${this.url}${path}`, {
      method: body ? "POST" : "GET",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${this.key}`
      },
      body: body ? JSON.stringify(body) : undefined
    });
    if (!res.ok) {
      throw new Error(`${res.status} ${await res.text()}`);
    }
    return res.json() as Promise<T>;
  }

  /** Invoke a plugin on some text */
  chat(prompt: string, opts: ChatOptions) {
    return this.call<{
      text: string;
      meta: Record<string, unknown>;
    }>("/chat", { prompt, ...opts });
  }

  listPlugins() {
    return this.call<{ plugins: unknown[] }>("/plugins");
  }

  getPlugin(id: string) {
    return this.call<{ plugin: unknown }>(`/plugins/${id}`);
  }
}

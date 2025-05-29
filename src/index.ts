import axios, { AxiosInstance } from 'axios';

export interface SDKOptions {
  apiKey?: string;
  baseUrl?: string;
}

export interface ChatParams {
  model: string;
  content: string;
  conversationId?: string;
  pluginId?: string;
  pluginSettings?: Record<string, any>;
}

export interface CompletionParams {
  model: string;
  messages: { role: 'system' | 'user' | 'assistant'; content: string }[];
  maxTokens?: number;
  temperature?: number;
}

export interface MGCompletionParams {
  model: string;
  content: string;
  pluginId?: string;
  pluginSettings?: Record<string, any>;
  maxTokens?: number;
  temperature?: number;
}

export class MixgardenSDK {
  private client: AxiosInstance;
  private baseUrl: string;

  constructor({ apiKey = process.env.MIXGARDEN_API_KEY, baseUrl = 'https://api.mixgarden.ai/api/v1' }: SDKOptions = {}) {
    if (!apiKey) {
      throw new Error('Mixgarden API key is required (set MIXGARDEN_API_KEY env or pass in constructor)');
    }

    this.baseUrl = baseUrl;
    this.client = axios.create({
      baseURL: baseUrl,
      headers: { Authorization: `Bearer ${apiKey}` },
      timeout: 30_000
    });
  }

  private async request<T = any>(method: 'get' | 'post', path: string, data?: any, params?: any): Promise<T> {
    const res = await this.client.request<T>({ method, url: path, data, params });
    return res.data;
  }

  // --- High‑level helpers -------------------------------------------------
  public getModels() {
    return this.request<any[]>('get', '/models');
  }

  public async chat(params: ChatParams) {
    if (params.conversationId) {
      // Add message to existing conversation
      const { conversationId, ...rest } = params;
      await this.request<any>(
        'post',
        `/conversations/${conversationId}/messages`,
        {
          ...rest,
          role: 'user', // Always set role
        }
      );
      return this.getConversation(conversationId);
    } else {
      // Create a new conversation
      const convoRes = await this.request<any>(
        'post',
        '/conversations',
        params
      );
      const conversationId = convoRes.id;
      const { model, pluginId, pluginSettings, content } = params;
      await this.request<any>(
        'post',
        `/conversations/${conversationId}/messages`,
        {
          model,
          pluginId,
          pluginSettings,
          content,
          role: 'user', // Always set role
        }
      );
      return this.getConversation(conversationId);
    }
  }

  public getCompletion(params: CompletionParams) {
    return this.request<any>('post', '/chat/completions', params);
  }

  public getMGCompletion(params: MGCompletionParams) {
    return this.request<any>('post', '/mg-completion', params);
  }

  public getPlugins() {
    return this.request<any[]>('get', '/plugins');
  }

  public getConversations(params?: { limit?: number; offset?: number }) {
    return this.request<any[]>('get', '/conversations', undefined, params);
  }

  public getConversation(conversationId: string) {
    return this.request<any>('get', `/conversations/${conversationId}`);
  }
}

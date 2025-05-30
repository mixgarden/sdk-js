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

  public async chat(params: {
    conversationId?: string;
    content: string;
    model: string;
    pluginId?: string;
    pluginSettings?: Record<string, any>;
    waitForResponse?: boolean;
    pollInterval?: number;
    timeout?: number;
  }) {
    // 1. Ensure conversation exists
    let conversationId = params.conversationId;
    if (!conversationId) {
      const convRes = await this.request<any>('post', '/conversations', {
        title: 'New Conversation',
        model: params.model
      });
      conversationId = convRes.id;
      if (!conversationId) throw new Error('Failed to create conversation');
    }
  
    // 2. Add user message
    await this.request<any>('post', `/conversations/${conversationId}/messages`, {
      role: 'user',
      content: params.content,
      pluginId: params.pluginId,
      pluginSettings: params.pluginSettings
    });
  
    // 3. Start AI/plugin job
    const genRes = await this.request<any>(
      'post',
      `/conversations/${conversationId}/generate`,
      {
        model: params.model,
        pluginId: params.pluginId,
        pluginSettings: params.pluginSettings
      }
    );
    const jobId = genRes.jobId;
    if (!jobId) throw new Error('No jobId returned from backend');
  
    // 4. Optionally poll for result
    if (params.waitForResponse !== false) {
      const pollInterval = params.pollInterval ?? 1500;
      const timeout = params.timeout ?? 30000;
      const start = Date.now();
      while (Date.now() - start < timeout) {
        const result = await this.request<any>('get', `/conversations/generate/status/${jobId}`);
        if (result && result.status === 'completed' && result.result) {
          return result.result; // The AI/plugin message
        }
        if (result && result.status === 'failed') {
          throw new Error(result.error || 'AI/plugin job failed');
        }
        await new Promise(res => setTimeout(res, pollInterval));
      }
      throw new Error('Timed out waiting for AI/plugin response');
    } else {
      return { jobId };
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

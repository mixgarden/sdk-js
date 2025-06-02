import axios, { AxiosInstance } from 'axios';

export interface SDKOptions {
  apiKey?: string;
  baseUrl?: string;
}

export interface PluginAuthor {
  id: string;
  name: string | null;
  username: string;
  avatar: string | null;
}

export interface Plugin {
  id: string;
  name: string;
  description: string;
  category: string; // Or an enum
  author: PluginAuthor;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  version: string; // Or a more complex version object
}

export interface PaginatedPluginsResponse {
  plugins: Plugin[];
  total: number;
  page: number;
  limit: number;
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

  /**
   * Fetches a single page of plugins.
   * @param page Page number to fetch.
   * @param limit Number of plugins per page.
   * @returns A promise that resolves to the paginated plugin response.
   */
  public getPlugins(page: number = 1, limit: number = 10): Promise<PaginatedPluginsResponse> {
    return this.request<PaginatedPluginsResponse>('get', '/plugins', undefined, { page, limit });
  }

  /**
   * Fetches all plugins by handling pagination.
   * @param batchSize Number of plugins to fetch per backend request during pagination.
   * @returns A promise that resolves to an array of all plugins.
   */
  public async getAllPlugins(batchSize: number = 50): Promise<Plugin[]> {
    let allPlugins: Plugin[] = [];
    let currentPage = 1;
    let totalPlugins = 0;
    let fetchedPlugins = 0;

    do {
      const response = await this.getPlugins(currentPage, batchSize);
      if (response && response.plugins) {
        allPlugins = allPlugins.concat(response.plugins);
        fetchedPlugins = allPlugins.length;
        if (currentPage === 1) { // Only set totalPlugins on the first call
          totalPlugins = response.total;
        }
      } else {
        // Should not happen if backend is consistent, but good to handle
        console.error("Failed to fetch a page of plugins or received invalid response.");
        break; 
      }
      currentPage++;
    } while (fetchedPlugins < totalPlugins && totalPlugins > 0);

    return allPlugins;
  }

  public getConversations(params?: { limit?: number; offset?: number }) {
    return this.request<any[]>('get', '/conversations', undefined, params);
  }

  public getConversation(conversationId: string) {
    return this.request<any>('get', `/conversations/${conversationId}`);
  }
}

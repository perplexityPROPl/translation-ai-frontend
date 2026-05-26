import { API_BASE_URL } from '@/constants/languages';
import type { TranslationRequest, TranslationResponse, DetectionResponse, BatchJob } from '@/types';

export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `API Error: ${response.statusText}`);
    }

    return response.json();
  }

  async translate(request: TranslationRequest): Promise<TranslationResponse> {
    return this.request<TranslationResponse>('/translate', {
      method: 'POST',
      body: JSON.stringify({
        text: request.text,
        source_lang: request.sourceLanguage !== 'auto' ? request.sourceLanguage : undefined,
        target_lang: request.targetLanguage,
        html: request.html,
        transliteration: request.transliteration,
        glossary_id: request.glossaryId,
      }),
    });
  }

  async detect(text: string): Promise<DetectionResponse> {
    return this.request<DetectionResponse>('/detect', {
      method: 'POST',
      body: JSON.stringify({ text }),
    });
  }

  async startBatch(texts: string[], sourceLanguage: string, targetLanguage: string): Promise<string> {
    const response = await this.request<{ task_id: string }>('/batch', {
      method: 'POST',
      body: JSON.stringify({
        texts,
        source_lang: sourceLanguage !== 'auto' ? sourceLanguage : undefined,
        target_lang: targetLanguage,
      }),
    });
    return response.task_id;
  }

  async getBatchStatus(taskId: string): Promise<BatchJob> {
    return this.request<BatchJob>(`/batch/status/${taskId}`);
  }

  async searchMemory(sourceText: string, sourceLanguage: string, targetLanguage: string) {
    const params = new URLSearchParams({
      source_text: sourceText,
      source_lang: sourceLanguage,
      target_lang: targetLanguage,
    });
    return this.request(`/memory/search?${params}`);
  }
}

export const apiClient = new ApiClient();

import { WS_BASE_URL } from '@/constants/languages';

export type WebSocketMessage = {
  text: string;
  source_lang?: string;
  target_lang: string;
};

export type WebSocketResponse = {
  translatedText: string;
  sourceLanguageDetected?: string;
  transliteration?: string;
};

export class TranslationWebSocket {
  private ws: WebSocket | null = null;
  private url: string;
  private listeners: Set<(data: WebSocketResponse) => void> = new Set();
  private errorListeners: Set<(error: Error) => void> = new Set();
  private isConnecting = false;

  constructor(url: string = WS_BASE_URL) {
    this.url = url;
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        resolve();
        return;
      }

      if (this.isConnecting) {
        const checkConnection = setInterval(() => {
          if (this.ws?.readyState === WebSocket.OPEN) {
            clearInterval(checkConnection);
            resolve();
          }
        }, 100);
        return;
      }

      this.isConnecting = true;

      try {
        this.ws = new WebSocket(`${this.url}/translate`);

        this.ws.onopen = () => {
          this.isConnecting = false;
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const raw = JSON.parse(event.data);
            const data: WebSocketResponse = {
              translatedText: raw.translated_text,
              sourceLanguageDetected: raw.source_lang_detected,
              transliteration: raw.transliteration,
            };
            this.listeners.forEach(listener => listener(data));
          } catch (error) {
            this.errorListeners.forEach(listener =>
              listener(new Error('Failed to parse WebSocket message'))
            );
          }
        };

        this.ws.onerror = () => {
          this.isConnecting = false;
          this.errorListeners.forEach(listener =>
            listener(new Error('WebSocket connection error'))
          );
          reject(new Error('WebSocket connection failed'));
        };

        this.ws.onclose = () => {
          this.isConnecting = false;
        };
      } catch (error) {
        this.isConnecting = false;
        reject(error);
      }
    });
  }

  send(message: WebSocketMessage): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }

  subscribe(listener: (data: WebSocketResponse) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  onError(listener: (error: Error) => void): () => void {
    this.errorListeners.add(listener);
    return () => this.errorListeners.delete(listener);
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.listeners.clear();
    this.errorListeners.clear();
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

export const translationWebSocket = new TranslationWebSocket();

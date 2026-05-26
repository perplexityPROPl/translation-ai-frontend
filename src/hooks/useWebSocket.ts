import { useEffect, useState, useCallback } from 'react';
import { translationWebSocket, type WebSocketMessage, type WebSocketResponse } from '@/services/websocket';
import { toast } from 'sonner';

export const useWebSocket = (enabled: boolean = false) => {
  const [connected, setConnected] = useState(false);
  const [response, setResponse] = useState<WebSocketResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!enabled) {
      if (translationWebSocket.isConnected()) {
        translationWebSocket.disconnect();
      }
      return;
    }

    const connect = async () => {
      try {
        setLoading(true);
        await translationWebSocket.connect();
        setConnected(true);
      } catch (error) {
        toast.error('WebSocket connection failed');
        setConnected(false);
      } finally {
        setLoading(false);
      }
    };

    connect();

    const unsubscribe = translationWebSocket.subscribe((data) => {
      setResponse(data);
    });

    const unsubscribeError = translationWebSocket.onError((error) => {
      toast.error(error.message);
      setConnected(false);
    });

    return () => {
      unsubscribe();
      unsubscribeError();
    };
  }, [enabled]);

  const send = useCallback((message: WebSocketMessage) => {
    if (translationWebSocket.isConnected()) {
      translationWebSocket.send(message);
    } else {
      toast.error('WebSocket not connected');
    }
  }, []);

  return {
    connected,
    loading,
    response,
    send,
  };
};

import { useState, useCallback } from 'react';
import { apiClient } from '@/services/api';
import type { TranslationRequest, TranslationResponse } from '@/types';
import { toast } from 'sonner';

export const useTranslate = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const translate = useCallback(async (request: TranslationRequest): Promise<TranslationResponse | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.translate(request);
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Translation failed';
      setError(message);
      toast.error(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { translate, loading, error };
};

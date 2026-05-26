export type SupportedLanguage = {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
};

export type TranslationRequest = {
  text: string;
  sourceLanguage: string;
  targetLanguage: string;
  html?: boolean;
  transliteration?: boolean;
  glossaryId?: number;
};

export type TranslationResponse = {
  translatedText: string;
  sourceLanguageDetected?: string;
  transliteration?: string;
  confidence?: number;
};

export type DetectionResponse = {
  language: string;
  confidence: number;
};

export type BatchJob = {
  taskId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  results?: string[];
  error?: string;
};

export type GlossaryTerm = {
  id?: number;
  sourceText: string;
  targetText: string;
  sourceLanguage: string;
  targetLanguage: string;
  createdAt?: string;
};

export type TranslationHistory = {
  id: string;
  sourceText: string;
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
  timestamp: number;
};

export type AppSettings = {
  theme: 'light' | 'dark';
  autoDetect: boolean;
  realTimeTranslation: boolean;
  soundEnabled: boolean;
};

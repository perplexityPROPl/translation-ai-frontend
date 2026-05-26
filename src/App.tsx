import { useState, useCallback, useEffect } from 'react';
import { ThemeProvider } from '@/components/ThemeProvider';
import { TopBar } from '@/components/TopBar';
import { LanguageSelector } from '@/components/LanguageSelector';
import { TranslationBox } from '@/components/TranslationBox';
import { HistoryPanel } from '@/components/HistoryPanel';
import { BatchUploadModal } from '@/components/BatchUploadModal';
import { GlossaryModal } from '@/components/GlossaryModal';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Toaster } from 'sonner';
import { useTranslate } from '@/hooks/useTranslate';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useDebounce } from '@/hooks/useDebounce';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { apiClient } from '@/services/api';
import type { TranslationHistory, GlossaryTerm } from '@/types';

function AppContent() {
  // Language state
  const [sourceLanguage, setSourceLanguage] = useState('auto');
  const [targetLanguage, setTargetLanguage] = useState('en');

  // Translation state
  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [detectedLanguage, setDetectedLanguage] = useState<string | null>(null);

  // UI state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [batchModalOpen, setBatchModalOpen] = useState(false);
  const [glossaryModalOpen, setGlossaryModalOpen] = useState(false);
  const [realTimeMode, setRealTimeMode] = useState(false);
  const [htmlMode, setHtmlMode] = useState(false);
  const [transliterationMode, setTransliterationMode] = useState(false);

  // Persistent storage
  const [history, setHistory] = useLocalStorage<TranslationHistory[]>('translation-history', []);
  const [glossary, setGlossary] = useLocalStorage<GlossaryTerm[]>('translation-glossary', []);

  // Hooks
  const { translate, loading: translateLoading } = useTranslate();
  const debouncedText = useDebounce(sourceText, 800);
  const { connected: wsConnected, response: wsResponse, send: wsSend } = useWebSocket(realTimeMode);

  // Batch state
  const [batchLoading, setBatchLoading] = useState(false);

  // Handle WebSocket response
  useEffect(() => {
    if (wsResponse && realTimeMode) {
      setTranslatedText(wsResponse.translatedText);
      if (wsResponse.sourceLanguageDetected && sourceLanguage === 'auto') {
        setDetectedLanguage(wsResponse.sourceLanguageDetected);
      }
    }
  }, [wsResponse, realTimeMode, sourceLanguage]);

  // Auto-translate with WebSocket in real-time mode
  useEffect(() => {
    if (realTimeMode && wsConnected && debouncedText.trim()) {
      wsSend({
        text: debouncedText,
        source_lang: sourceLanguage !== 'auto' ? sourceLanguage : undefined,
        target_lang: targetLanguage,
      });
    }
  }, [debouncedText, realTimeMode, wsConnected, sourceLanguage, targetLanguage, wsSend]);

  // Handle manual translation
  const handleTranslate = useCallback(async () => {
    if (!sourceText.trim()) return;

    // Handle auto-detection
    if (sourceLanguage === 'auto') {
      try {
        const detection = await apiClient.detect(sourceText);
        setDetectedLanguage(detection.language);
      } catch (error) {
        console.error('Detection failed:', error);
      }
    }

    const result = await translate({
      text: sourceText,
      sourceLanguage,
      targetLanguage,
      html: htmlMode,
      transliteration: transliterationMode,
    });

    if (result) {
      setTranslatedText(result.translatedText);
      if (result.sourceLanguageDetected && sourceLanguage === 'auto') {
        setDetectedLanguage(result.sourceLanguageDetected);
      }

      // Add to history
      addToHistory(sourceText, result.translatedText);
    }
  }, [sourceText, sourceLanguage, targetLanguage, htmlMode, transliterationMode, translate]);

  const addToHistory = useCallback(
    (source: string, translated: string) => {
      const newEntry: TranslationHistory = {
        id: Date.now().toString(),
        sourceText: source,
        translatedText: translated,
        sourceLanguage: sourceLanguage === 'auto' ? detectedLanguage || 'unknown' : sourceLanguage,
        targetLanguage,
        timestamp: Date.now(),
      };

      setHistory((prev: TranslationHistory[]) => [newEntry, ...prev.slice(0, 49)]);
    },
    [sourceLanguage, targetLanguage, detectedLanguage, setHistory]
  );

  const handleHistorySelect = (item: TranslationHistory) => {
    setSourceText(item.sourceText);
    setTranslatedText(item.translatedText);
    setSourceLanguage(item.sourceLanguage);
    setTargetLanguage(item.targetLanguage);
    setHistoryOpen(false);
  };

  const handleHistoryDelete = (id: string) => {
    setHistory((prev: TranslationHistory[]) => prev.filter((item: TranslationHistory) => item.id !== id));
  };

  const handleClearHistory = () => {
    if (confirm('Clear all translation history?')) {
      setHistory([]);
    }
  };

  const handleClear = () => {
    setSourceText('');
    setTranslatedText('');
    setDetectedLanguage(null);
  };

  const handleBatchSubmit = useCallback(
    async (texts: string[], sourceLang: string, targetLang: string) => {
      setBatchLoading(true);
      try {
        const taskId = await apiClient.startBatch(texts, sourceLang, targetLang);

        // Poll for results
        const pollInterval = setInterval(async () => {
          try {
            const status = await apiClient.getBatchStatus(taskId);
            if (status.status === 'completed') {
              clearInterval(pollInterval);
              setBatchModalOpen(false);
            } else if (status.status === 'failed') {
              clearInterval(pollInterval);
              throw new Error(status.error || 'Batch translation failed');
            }
          } catch (error) {
            clearInterval(pollInterval);
            throw error;
          }
        }, 1000);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Batch submission failed';
        console.error('Batch error:', message);
      } finally {
        setBatchLoading(false);
      }
    },
    []
  );

  const handleAddGlossaryTerm = (term: GlossaryTerm) => {
    const newTerm = {
      ...term,
      id: Date.now(),
    };
    setGlossary((prev: GlossaryTerm[]) => [...prev, newTerm]);
  };

  const handleDeleteGlossaryTerm = (id: number) => {
    setGlossary((prev: GlossaryTerm[]) => prev.filter((term: GlossaryTerm) => term.id !== id));
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <TopBar
        onHistoryClick={() => setHistoryOpen(!historyOpen)}
        onBatchClick={() => setBatchModalOpen(true)}
        onGlossaryClick={() => setGlossaryModalOpen(true)}
        realTimeMode={realTimeMode}
        onRealTimeToggle={() => setRealTimeMode(!realTimeMode)}
        mobileMenuOpen={mobileMenuOpen}
        onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
      />

      <div className="flex-1 overflow-hidden">
        <div className="flex h-full gap-4 p-4 max-w-7xl mx-auto w-full">
          {/* Sidebar */}
          <div className="hidden lg:flex flex-col w-80 space-y-4 overflow-y-auto">
            <LanguageSelector
              sourceLanguage={sourceLanguage}
              targetLanguage={targetLanguage}
              onSourceChange={setSourceLanguage}
              onTargetChange={setTargetLanguage}
            />

            {/* Options */}
            <div className="space-y-3 p-4 bg-card border border-border rounded-lg">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Switch
                    id="html-mode"
                    checked={htmlMode}
                    onCheckedChange={setHtmlMode}
                  />
                  <Label htmlFor="html-mode" className="text-sm cursor-pointer">
                    HTML Mode
                  </Label>
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    id="transliteration"
                    checked={transliterationMode}
                    onCheckedChange={setTransliterationMode}
                  />
                  <Label htmlFor="transliteration" className="text-sm cursor-pointer">
                    Transliteration
                  </Label>
                </div>
              </div>

              {detectedLanguage && sourceLanguage === 'auto' && (
                <div className="p-3 bg-accent/10 border border-accent rounded text-sm">
                  <p className="opacity-70">Detected: <span className="font-semibold">{detectedLanguage}</span></p>
                </div>
              )}
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1 flex flex-col gap-4 overflow-hidden">
            {/* Mobile language selector */}
            <div className="lg:hidden">
              <LanguageSelector
                sourceLanguage={sourceLanguage}
                targetLanguage={targetLanguage}
                onSourceChange={setSourceLanguage}
                onTargetChange={setTargetLanguage}
              />
            </div>

            {/* Translation box */}
            <div className="flex-1 overflow-hidden">
              <TranslationBox
                sourceText={sourceText}
                translatedText={translatedText}
                onSourceChange={setSourceText}
                isLoading={translateLoading || (realTimeMode && !translatedText && sourceText.trim() !== '')}
                onTranslate={handleTranslate}
                onClear={handleClear}
                realTimeMode={realTimeMode && wsConnected}
              />
            </div>
          </div>

          {/* History sidebar (desktop) */}
          {historyOpen && (
            <div className="hidden lg:block w-80 border-l border-border bg-card rounded-lg overflow-hidden">
              <HistoryPanel
                history={history}
                onSelect={handleHistorySelect}
                onDelete={handleHistoryDelete}
                onClearAll={handleClearHistory}
                isOpen={true}
                onClose={() => setHistoryOpen(false)}
              />
            </div>
          )}
        </div>
      </div>

      {/* Mobile history drawer */}
      {historyOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <HistoryPanel
            history={history}
            onSelect={handleHistorySelect}
            onDelete={handleHistoryDelete}
            onClearAll={handleClearHistory}
            isOpen={true}
            onClose={() => setHistoryOpen(false)}
          />
        </div>
      )}

      {/* Modals */}
      <BatchUploadModal
        isOpen={batchModalOpen}
        onClose={() => setBatchModalOpen(false)}
        onSubmit={handleBatchSubmit}
        isLoading={batchLoading}
        sourceLanguage={sourceLanguage}
        targetLanguage={targetLanguage}
      />

      <GlossaryModal
        isOpen={glossaryModalOpen}
        onClose={() => setGlossaryModalOpen(false)}
        glossary={glossary}
        onAddTerm={handleAddGlossaryTerm}
        onDeleteTerm={handleDeleteGlossaryTerm}
        sourceLanguage={sourceLanguage}
        targetLanguage={targetLanguage}
      />

      <Toaster position="top-right" />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;

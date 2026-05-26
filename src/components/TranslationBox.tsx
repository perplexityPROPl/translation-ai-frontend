import { useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Copy, Zap, Volume2, Loader2, Check } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface TranslationBoxProps {
  sourceText: string;
  translatedText: string;
  onSourceChange: (text: string) => void;
  isLoading?: boolean;
  onTranslate?: () => void;
  onClear?: () => void;
  realTimeMode?: boolean;
  onSpeech?: (text: string) => void;
}

export const TranslationBox = ({
  sourceText,
  translatedText,
  onSourceChange,
  isLoading = false,
  onTranslate,
  onClear,
  realTimeMode = false,
  onSpeech,
}: TranslationBoxProps) => {
  const [copied, setCopied] = useState(false);
  const sourceRef = useRef<HTMLTextAreaElement>(null);
  const targetRef = useRef<HTMLTextAreaElement>(null);

  const autoGrow = (element: HTMLTextAreaElement) => {
    element.style.height = 'auto';
    element.style.height = Math.min(element.scrollHeight, 400) + 'px';
  };

  useEffect(() => {
    if (sourceRef.current) {
      autoGrow(sourceRef.current);
    }
  }, [sourceText]);

  useEffect(() => {
    if (targetRef.current) {
      autoGrow(targetRef.current);
    }
  }, [translatedText]);

  const copyToClipboard = async () => {
    if (!translatedText) return;
    try {
      await navigator.clipboard.writeText(translatedText);
      setCopied(true);
      toast.success('Copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy');
    }
  };

  const handleSpeak = (text: string) => {
    if (!text || !window.speechSynthesis) {
      toast.error('Speech synthesis not available');
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
    onSpeech?.(text);
  };

  const wordCount = sourceText.trim().split(/\s+/).filter(Boolean).length;
  const charCount = sourceText.length;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
      {/* Source */}
      <div className="flex flex-col space-y-3">
        <div className="flex items-center justify-between px-1">
          <label className="text-xs font-semibold opacity-70">SOURCE TEXT</label>
          <span className="text-xs opacity-50">
            {charCount} chars • {wordCount} words
          </span>
        </div>

        <Textarea
          ref={sourceRef}
          value={sourceText}
          onChange={e => onSourceChange(e.target.value)}
          placeholder="Enter text to translate..."
          className="resize-none min-h-48 max-h-96 focus:ring-2 focus:ring-primary"
        />

        <Button
          onClick={() => onClear?.()}
          variant="outline"
          size="sm"
          className="w-full"
        >
          Clear
        </Button>
      </div>

      {/* Target */}
      <div className="flex flex-col space-y-3">
        <div className="flex items-center justify-between px-1">
          <label className="text-xs font-semibold opacity-70">TRANSLATION</label>
          {realTimeMode && (
            <div className="flex items-center gap-1 text-xs text-accent">
              <Zap className="w-3 h-3 fill-current" />
              Live
            </div>
          )}
        </div>

        <Textarea
          ref={targetRef}
          value={translatedText}
          readOnly
          placeholder="Translation will appear here..."
          className="resize-none min-h-48 max-h-96 bg-muted/30 cursor-default"
        />

        <div className="flex gap-2">
          <Button
            onClick={copyToClipboard}
            variant="outline"
            size="sm"
            className="flex-1"
            disabled={!translatedText}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Copied
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-2" />
                Copy
              </>
            )}
          </Button>

          <Button
            onClick={() => handleSpeak(translatedText)}
            variant="outline"
            size="sm"
            disabled={!translatedText}
          >
            <Volume2 className="w-4 h-4" />
          </Button>

          {!realTimeMode && onTranslate && (
            <Button
              onClick={onTranslate}
              className="flex-1"
              disabled={!sourceText.trim() || isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Translating...
                </>
              ) : (
                'Translate'
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

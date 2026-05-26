import { X, Trash2, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { TranslationHistory } from '@/types';
import { toast } from 'sonner';

interface HistoryPanelProps {
  history: TranslationHistory[];
  onSelect: (item: TranslationHistory) => void;
  onDelete: (id: string) => void;
  onClearAll: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export const HistoryPanel = ({
  history,
  onSelect,
  onDelete,
  onClearAll,
  isOpen,
  onClose,
}: HistoryPanelProps) => {
  if (!isOpen) return null;

  const handleCopy = (text: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  return (
    <div className="fixed inset-0 z-50 lg:static lg:h-full lg:border-l lg:border-border lg:bg-card">
      {/* Mobile header */}
      <div className="lg:hidden flex items-center justify-between p-4 border-b border-border bg-card">
        <h2 className="font-semibold">History</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Desktop header */}
      <div className="hidden lg:flex items-center justify-between p-4 border-b border-border">
        <h2 className="font-semibold">History</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearAll}
          disabled={history.length === 0}
          className="text-destructive hover:text-destructive"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      <ScrollArea className="h-[calc(100vh-120px)] lg:h-[calc(100%-60px)]">
        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-center text-muted-foreground">
            <p className="text-sm">No translation history</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {history.map(item => (
              <button
                key={item.id}
                onClick={() => onSelect(item)}
                className="w-full p-4 text-left hover:bg-accent/10 transition-colors space-y-2 group"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold opacity-50 mb-1">
                      {item.sourceLanguage} → {item.targetLanguage}
                    </p>
                    <p className="text-sm font-medium truncate text-foreground group-hover:text-accent transition-colors">
                      {item.sourceText}
                    </p>
                    <p className="text-xs opacity-60 line-clamp-2 mt-1">
                      {item.translatedText}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={e => handleCopy(item.translatedText, e)}
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={e => {
                        e.stopPropagation();
                        onDelete(item.id);
                      }}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                <p className="text-xs opacity-40">
                  {new Date(item.timestamp).toLocaleDateString()} {new Date(item.timestamp).toLocaleTimeString()}
                </p>
              </button>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Mobile footer */}
      <div className="lg:hidden border-t border-border p-4 bg-card">
        <Button onClick={onClearAll} variant="outline" className="w-full text-destructive" disabled={history.length === 0}>
          Clear All
        </Button>
      </div>
    </div>
  );
};

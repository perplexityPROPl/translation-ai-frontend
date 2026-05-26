import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Upload, X } from 'lucide-react';
import { toast } from 'sonner';

interface BatchUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (texts: string[], sourceLanguage: string, targetLanguage: string) => void;
  isLoading?: boolean;
  sourceLanguage: string;
  targetLanguage: string;
}

export const BatchUploadModal = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  sourceLanguage,
  targetLanguage,
}: BatchUploadModalProps) => {
  const [texts, setTexts] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [uploadMode, setUploadMode] = useState<'manual' | 'file'>('manual');

  const handleAddText = () => {
    if (inputValue.trim()) {
      setTexts([...texts, inputValue]);
      setInputValue('');
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = e => {
      try {
        const content = e.target?.result as string;
        const lines = content.split('\n').filter(line => line.trim());
        setTexts(prev => [...prev, ...lines]);
        toast.success(`Added ${lines.length} lines from file`);
      } catch (error) {
        toast.error('Failed to read file');
      }
    };
    reader.readAsText(file);
  };

  const handleSubmit = () => {
    if (texts.length === 0) {
      toast.error('Add at least one text');
      return;
    }
    onSubmit(texts, sourceLanguage, targetLanguage);
    setTexts([]);
    setInputValue('');
  };

  const handleClose = () => {
    setTexts([]);
    setInputValue('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-96 flex flex-col">
        <DialogHeader>
          <DialogTitle>Batch Translation</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col gap-4">
          {/* Mode selector */}
          <div className="flex gap-2 border-b border-border pb-4">
            <Button
              variant={uploadMode === 'manual' ? 'default' : 'outline'}
              onClick={() => setUploadMode('manual')}
              size="sm"
            >
              Manual Entry
            </Button>
            <Button
              variant={uploadMode === 'file' ? 'default' : 'outline'}
              onClick={() => setUploadMode('file')}
              size="sm"
            >
              Upload File
            </Button>
          </div>

          {uploadMode === 'manual' ? (
            <div className="flex gap-2">
              <Textarea
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                placeholder="Enter text to add to batch..."
                className="resize-none flex-1 min-h-20"
                onKeyDown={e => {
                  if (e.key === 'Enter' && e.ctrlKey) {
                    handleAddText();
                  }
                }}
              />
              <Button
                onClick={handleAddText}
                variant="outline"
                className="self-end"
              >
                Add
              </Button>
            </div>
          ) : (
            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
              <Input
                type="file"
                accept=".txt,.csv"
                onChange={handleFileUpload}
                className="hidden"
                id="batch-file"
              />
              <label htmlFor="batch-file" className="cursor-pointer">
                <div className="flex flex-col items-center gap-2">
                  <Upload className="w-8 h-8 opacity-40" />
                  <span className="text-sm text-muted-foreground">
                    Click to upload or drag and drop
                  </span>
                  <span className="text-xs opacity-50">Supported: .txt, .csv</span>
                </div>
              </label>
            </div>
          )}

          {/* Added texts list */}
          <div className="flex-1 overflow-y-auto border border-border rounded-lg p-3 bg-muted/30">
            {texts.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">
                No texts added yet
              </p>
            ) : (
              <div className="space-y-2">
                {texts.map((text, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-2 p-2 bg-background rounded border border-border"
                  >
                    <span className="text-xs font-semibold opacity-50 flex-shrink-0 mt-0.5">
                      {index + 1}
                    </span>
                    <span className="text-sm line-clamp-2 flex-1">{text}</span>
                    <button
                      onClick={() => setTexts(texts.filter((_, i) => i !== index))}
                      className="flex-shrink-0 hover:text-destructive transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-between pt-4 border-t border-border">
          <span className="text-sm text-muted-foreground">
            {texts.length} text{texts.length !== 1 ? 's' : ''} to translate
          </span>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={texts.length === 0 || isLoading}
            >
              {isLoading ? 'Processing...' : 'Start Translation'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X, Plus } from 'lucide-react';
import { toast } from 'sonner';
import type { GlossaryTerm } from '@/types';

interface GlossaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  glossary: GlossaryTerm[];
  onAddTerm: (term: GlossaryTerm) => void;
  onDeleteTerm: (id: number) => void;
  sourceLanguage: string;
  targetLanguage: string;
}

export const GlossaryModal = ({
  isOpen,
  onClose,
  glossary,
  onAddTerm,
  onDeleteTerm,
  sourceLanguage,
  targetLanguage,
}: GlossaryModalProps) => {
  const [sourceText, setSourceText] = useState('');
  const [targetText, setTargetText] = useState('');

  const handleAdd = () => {
    if (!sourceText.trim() || !targetText.trim()) {
      toast.error('Please fill in both fields');
      return;
    }

    onAddTerm({
      sourceText: sourceText.trim(),
      targetText: targetText.trim(),
      sourceLanguage,
      targetLanguage,
    });

    setSourceText('');
    setTargetText('');
    toast.success('Term added to glossary');
  };

  const filteredGlossary = glossary.filter(
    term =>
      term.sourceLanguage === sourceLanguage && term.targetLanguage === targetLanguage
  );

  const handleClose = () => {
    setSourceText('');
    setTargetText('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-96 flex flex-col">
        <DialogHeader>
          <DialogTitle>Glossary Manager</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col gap-4">
          {/* Add new term */}
          <div className="space-y-3 p-4 bg-muted/30 rounded-lg border border-border">
            <h3 className="text-sm font-semibold">Add New Term</h3>
            <div className="flex gap-2">
              <Input
                value={sourceText}
                onChange={e => setSourceText(e.target.value)}
                placeholder={`${sourceLanguage} term`}
                className="flex-1"
              />
              <Input
                value={targetText}
                onChange={e => setTargetText(e.target.value)}
                placeholder={`${targetLanguage} term`}
                className="flex-1"
              />
              <Button onClick={handleAdd} size="icon">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Glossary list */}
          <div className="flex-1 overflow-hidden flex flex-col">
            <h3 className="text-sm font-semibold px-1 mb-2">
              Terms ({filteredGlossary.length})
            </h3>
            <ScrollArea className="flex-1 border border-border rounded-lg">
              {filteredGlossary.length === 0 ? (
                <div className="flex items-center justify-center h-32 text-center">
                  <p className="text-sm text-muted-foreground">
                    No glossary terms for this language pair
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {filteredGlossary.map((term, index) => (
                    <div
                      key={term.id || index}
                      className="flex items-center justify-between p-3 hover:bg-accent/10 transition-colors group"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{term.sourceText}</p>
                        <p className="text-sm opacity-60">{term.targetText}</p>
                      </div>
                      <button
                        onClick={() => term.id && onDeleteTerm(term.id)}
                        className="flex-shrink-0 opacity-0 group-hover:opacity-100 hover:text-destructive transition-all p-1"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </div>

        <div className="pt-4 border-t border-border">
          <Button onClick={handleClose} className="w-full">
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

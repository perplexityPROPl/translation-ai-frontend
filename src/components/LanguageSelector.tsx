import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowRightLeft } from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '@/constants/languages';

interface LanguageSelectorProps {
  sourceLanguage: string;
  targetLanguage: string;
  onSourceChange: (lang: string) => void;
  onTargetChange: (lang: string) => void;
}

export const LanguageSelector = ({
  sourceLanguage,
  targetLanguage,
  onSourceChange,
  onTargetChange,
}: LanguageSelectorProps) => {
  const [sourceOpen, setSourceOpen] = useState(false);
  const [targetOpen, setTargetOpen] = useState(false);
  const [searchSource, setSearchSource] = useState('');
  const [searchTarget, setSearchTarget] = useState('');

  const swapLanguages = () => {
    if (sourceLanguage !== 'auto') {
      onSourceChange(targetLanguage);
      onTargetChange(sourceLanguage);
    }
  };

  const getLanguageName = (code: string) => {
    if (code === 'auto') return 'Detect Language';
    return SUPPORTED_LANGUAGES.find(l => l.code === code)?.nativeName || code;
  };

  const getFlag = (code: string) => {
    return SUPPORTED_LANGUAGES.find(l => l.code === code)?.flag || '';
  };

  const filteredLanguages = (search: string) => {
    const query = search.toLowerCase();
    return SUPPORTED_LANGUAGES.filter(
      lang => lang.name.toLowerCase().includes(query) || lang.nativeName.toLowerCase().includes(query)
    );
  };

  const LanguageDropdown = ({
    isOpen,
    onOpen,
    selected,
    onSelect,
    search,
    onSearch,
    allowAuto = false,
  }: {
    isOpen: boolean;
    onOpen: () => void;
    selected: string;
    onSelect: (code: string) => void;
    search: string;
    onSearch: (s: string) => void;
    allowAuto?: boolean;
  }) => (
    <div className="relative flex-1">
      <button
        onClick={() => onOpen()}
        className="w-full px-4 py-3 bg-card border border-border rounded-lg hover:bg-accent/10 transition-colors text-left flex items-center gap-2"
      >
        <span className="text-xl">{getFlag(selected)}</span>
        <span className="font-medium text-sm flex-1">{getLanguageName(selected)}</span>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg shadow-lg z-50 w-64">
          <div className="p-3 border-b border-border">
            <Input
              placeholder="Search languages..."
              value={search}
              onChange={e => onSearch(e.target.value)}
              className="h-9 text-sm"
              autoFocus
            />
          </div>
          <div className="max-h-64 overflow-y-auto">
            {allowAuto && (
              <button
                onClick={() => {
                  onSelect('auto');
                  onOpen();
                  onSearch('');
                }}
                className="w-full px-4 py-2.5 text-left hover:bg-accent/10 transition-colors text-sm border-b border-border"
              >
                Auto-detect
              </button>
            )}
            {filteredLanguages(search).map(lang => (
              <button
                key={lang.code}
                onClick={() => {
                  onSelect(lang.code);
                  onOpen();
                  onSearch('');
                }}
                className={`w-full px-4 py-2.5 text-left hover:bg-accent/10 transition-colors text-sm flex items-center gap-2 ${
                  selected === lang.code ? 'bg-accent/20' : ''
                }`}
              >
                <span className="text-lg">{lang.flag}</span>
                <div className="flex-1">
                  <div className="font-medium">{lang.name}</div>
                  <div className="text-xs opacity-60">{lang.nativeName}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-4 p-4 bg-card border border-border rounded-lg">
      <div className="flex items-end gap-3">
        <div className="flex-1 space-y-2">
          <label className="text-xs font-semibold opacity-70">FROM</label>
          <LanguageDropdown
            isOpen={sourceOpen}
            onOpen={() => {
              setSourceOpen(!sourceOpen);
              setTargetOpen(false);
            }}
            selected={sourceLanguage}
            onSelect={onSourceChange}
            search={searchSource}
            onSearch={setSearchSource}
            allowAuto
          />
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={swapLanguages}
          className="mb-0 hover:bg-accent/20"
          title="Swap languages"
        >
          <ArrowRightLeft className="w-4 h-4" />
        </Button>

        <div className="flex-1 space-y-2">
          <label className="text-xs font-semibold opacity-70">TO</label>
          <LanguageDropdown
            isOpen={targetOpen}
            onOpen={() => {
              setTargetOpen(!targetOpen);
              setSourceOpen(false);
            }}
            selected={targetLanguage}
            onSelect={onTargetChange}
            search={searchTarget}
            onSearch={setSearchTarget}
          />
        </div>
      </div>
    </div>
  );
};

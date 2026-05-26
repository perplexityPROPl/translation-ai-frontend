import { Button } from '@/components/ui/button';
import { Moon, Sun, Menu, X, History, Upload, BookOpen, Zap } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';

interface TopBarProps {
  onHistoryClick: () => void;
  onBatchClick: () => void;
  onGlossaryClick: () => void;
  realTimeMode: boolean;
  onRealTimeToggle: () => void;
  mobileMenuOpen: boolean;
  onMobileMenuToggle: () => void;
}

export const TopBar = ({
  onHistoryClick,
  onBatchClick,
  onGlossaryClick,
  realTimeMode,
  onRealTimeToggle,
  mobileMenuOpen,
  onMobileMenuToggle,
}: TopBarProps) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="border-b border-border bg-card backdrop-blur-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <span className="text-white font-bold text-lg">T</span>
            </div>
            <span className="font-bold text-lg hidden sm:inline">Translate</span>
          </div>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={onHistoryClick}
              className="gap-2"
            >
              <History className="w-4 h-4" />
              <span className="hidden lg:inline">History</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={onBatchClick}
              className="gap-2"
            >
              <Upload className="w-4 h-4" />
              <span className="hidden lg:inline">Batch</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={onGlossaryClick}
              className="gap-2"
            >
              <BookOpen className="w-4 h-4" />
              <span className="hidden lg:inline">Glossary</span>
            </Button>

            <div className="w-px h-6 bg-border mx-1" />

            <Button
              variant={realTimeMode ? 'default' : 'ghost'}
              size="sm"
              onClick={onRealTimeToggle}
              className="gap-2"
            >
              <Zap className="w-4 h-4" />
              <span className="hidden lg:inline">Real-time</span>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="h-10 w-10"
            >
              {theme === 'light' ? (
                <Moon className="w-4 h-4" />
              ) : (
                <Sun className="w-4 h-4" />
              )}
            </Button>
          </div>

          {/* Mobile menu toggle */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={onMobileMenuToggle}
              className="h-10 w-10"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border py-4 space-y-2">
            <Button
              variant="ghost"
              className="w-full justify-start gap-2"
              onClick={() => {
                onHistoryClick();
                onMobileMenuToggle();
              }}
            >
              <History className="w-4 h-4" />
              History
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start gap-2"
              onClick={() => {
                onBatchClick();
                onMobileMenuToggle();
              }}
            >
              <Upload className="w-4 h-4" />
              Batch
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start gap-2"
              onClick={() => {
                onGlossaryClick();
                onMobileMenuToggle();
              }}
            >
              <BookOpen className="w-4 h-4" />
              Glossary
            </Button>
            <div className="h-px bg-border my-2" />
            <Button
              variant={realTimeMode ? 'default' : 'ghost'}
              className="w-full justify-start gap-2"
              onClick={() => {
                onRealTimeToggle();
                onMobileMenuToggle();
              }}
            >
              <Zap className="w-4 h-4" />
              Real-time Mode
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start gap-2"
              onClick={() => {
                toggleTheme();
                onMobileMenuToggle();
              }}
            >
              {theme === 'light' ? (
                <Moon className="w-4 h-4" />
              ) : (
                <Sun className="w-4 h-4" />
              )}
              {theme === 'light' ? 'Dark' : 'Light'} Mode
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

# Translation Platform - Frontend Architecture

A modern, production-ready translation platform UI built with React 18, TypeScript, Vite, and Tailwind CSS. Features real-time translation, history management, batch processing, and glossary management.

## Architecture Overview

### Project Structure

```
src/
├── components/
│   ├── ui/                    # shadcn/ui components (pre-installed)
│   ├── ThemeProvider.tsx      # Dark/light mode context
│   ├── TopBar.tsx             # Navigation header with theme toggle
│   ├── LanguageSelector.tsx   # Language selection with search
│   ├── TranslationBox.tsx     # Main translation interface
│   ├── HistoryPanel.tsx       # Translation history panel
│   ├── BatchUploadModal.tsx   # Batch translation modal
│   └── GlossaryModal.tsx      # Glossary management modal
├── hooks/
│   ├── useTranslate.ts        # Translation API hook
│   ├── useWebSocket.ts        # Real-time WebSocket hook
│   ├── useDebounce.ts         # Debounce utility hook
│   └── useLocalStorage.ts     # LocalStorage persistence hook
├── services/
│   ├── api.ts                 # REST API client
│   └── websocket.ts           # WebSocket client
├── theme/
│   ├── colors.ts              # Color system (light/dark)
│   └── typography.ts          # Typography & spacing tokens
├── constants/
│   └── languages.ts           # Supported languages & API URLs
├── types/
│   └── index.ts               # TypeScript type definitions
├── App.tsx                    # Main application component
└── main.tsx                   # Entry point
```

## Key Components

### ThemeProvider
- Global context for dark/light mode management
- Persists theme preference to localStorage
- Automatically applies class to document root

### LanguageSelector
- Dual language selection (source/target)
- Language search functionality
- Swap languages button
- Auto-detect option for source language
- Responsive dropdown menus

### TranslationBox
- Split view: source text (left) + translation (right)
- Auto-growing textareas with height constraints
- Real-time word/character counting
- Copy-to-clipboard functionality
- Text-to-speech button
- Loading indicators
- Manual translate or real-time mode

### HistoryPanel
- Displays up to 50 recent translations
- Click to restore translation
- Delete individual or all history
- Mobile drawer + desktop sidebar
- Persistent localStorage storage

### BatchUploadModal
- Manual text entry or file upload
- Support for .txt and .csv files
- Edit/remove individual entries before submission
- Progress polling for batch job completion
- Results display

### GlossaryModal
- Add custom translation pairs
- Language-pair specific glossary
- Delete glossary entries
- Persistent localStorage storage

### TopBar
- Responsive navigation
- History, Batch, Glossary shortcuts
- Real-time mode toggle
- Dark/light mode toggle
- Mobile hamburger menu with all features

## State Management

### Global State
- **Theme**: Context-based (ThemeProvider)
- **History**: localStorage via useLocalStorage hook
- **Glossary**: localStorage via useLocalStorage hook

### Component State
- **Translation**: sourceText, translatedText, detectedLanguage
- **UI**: modals, panels, loading states
- **Settings**: htmlMode, transliterationMode, realTimeMode

## API Integration

### REST Endpoints
```
POST /api/v1/translate          # Main translation
POST /api/v1/detect             # Language detection
POST /api/v1/batch              # Batch job submission
GET  /api/v1/batch/status/{id}  # Batch job status
GET  /api/v1/memory/search      # Translation memory
CRUD /api/v1/glossary           # Glossary management
```

### WebSocket
```
ws://localhost:8000/ws/translate
```

Real-time translation with debounced input (800ms delay).

## Features

### Translation
- Single text translation with language detection
- Auto-detection of source language
- HTML mode for preserving markup
- Transliteration support
- Translation memory integration

### Real-Time Mode
- WebSocket-based live translation
- Updates as user types (debounced)
- Automatic language detection display
- Visual indicator showing real-time status

### History Management
- Stores last 50 translations
- Persistent across sessions (localStorage)
- Quick restore of previous translations
- Timestamp tracking
- Delete single or clear all

### Batch Processing
- Manual text entry or file upload
- Process multiple texts at once
- Polling-based job status tracking
- Results aggregation

### Glossary
- Custom translation term storage
- Language-pair specific
- Easy add/remove workflow
- Cross-session persistence

### UI/UX
- Dark/light mode toggle
- Fully responsive design (mobile, tablet, desktop)
- Smooth transitions and animations
- Loading states with spinners
- Error notifications via sonner toast
- Auto-growing textareas
- Word/character counts

## Responsive Design

### Breakpoints
- **Mobile**: < 640px (single column, drawer-based history)
- **Tablet**: 640px - 1024px (optimized layout)
- **Desktop**: ≥ 1024px (full sidebar layout)

### Layout Changes
- Mobile: Full-width, modal-based features
- Tablet: Single column with optimized spacing
- Desktop: Sidebar + main content + optional history sidebar

## Hooks

### useTranslate
```typescript
const { translate, loading, error } = useTranslate();
const result = await translate({
  text: 'Hello',
  sourceLanguage: 'en',
  targetLanguage: 'es',
});
```

### useWebSocket
```typescript
const { connected, response, send } = useWebSocket(enabled);
send({
  text: 'Hello',
  source_lang: 'en',
  target_lang: 'es',
});
```

### useDebounce
```typescript
const debouncedText = useDebounce(sourceText, 800);
```

### useLocalStorage
```typescript
const [history, setHistory] = useLocalStorage('key', []);
// Supports both direct values and updater functions
setHistory(prev => [...prev, newItem]);
```

## Styling System

### Design Tokens

**Colors**
- Primary: Blue (#0EA5E9)
- Secondary: Slate (#64748B)
- Accent: Cyan (#06B6D4)
- Destructive: Red (#EF4444)
- Separate light/dark palettes

**Typography**
- Font: System font stack
- 5 size levels (h1-h4, body variants)
- 120% line-height for headings, 150% for body

**Spacing**
- 8px base unit
- xs (0.25rem) to 4xl (4rem)

**Border Radius**
- sm to full (9999px)

### Tailwind Integration
- Utility-first CSS framework
- Custom color system via CSS variables
- Dark mode via class strategy
- Responsive prefixes (sm:, md:, lg:)

## Performance Optimizations

1. **Code Splitting**: Vite automatic chunk splitting
2. **Lazy Loading**: Modal dialogs load on demand
3. **Memoization**: useCallback for stable references
4. **Debouncing**: 800ms debounce for real-time mode
5. **Asset Optimization**: Gzip compression, minification

### Build Size
- CSS: ~9.5 kB gzipped
- JS: ~87 kB gzipped
- Total: ~97 kB gzipped

## Environment Configuration

```env
VITE_API_URL=http://localhost:8000/api/v1
VITE_WS_URL=ws://localhost:8000/ws
```

## Type Safety

All components and hooks are fully typed with TypeScript:
- `TranslationRequest/Response` types
- `SupportedLanguage` types
- `TranslationHistory` types
- `GlossaryTerm` types
- `BatchJob` types
- `AppSettings` types

## Error Handling

- Toast notifications for errors
- Graceful API failure handling
- WebSocket reconnection attempts
- LocalStorage fallback handling
- Proper error messages to users

## Accessibility

- Semantic HTML structure
- ARIA labels for interactive elements
- Keyboard navigation support
- Focus management in modals
- High contrast color ratios (WCAG AA+)
- Screen reader friendly

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- ES2020+ target
- CSS Grid and Flexbox support
- LocalStorage required for persistence

## Development

### Scripts
```bash
npm run dev        # Start dev server
npm run build      # Build for production
npm run lint       # Run ESLint
npm run typecheck  # Type check with TypeScript
npm run preview    # Preview production build
```

### Adding New Features

1. Create new component in `src/components/`
2. Add types to `src/types/index.ts`
3. Create hooks if needed in `src/hooks/`
4. Update main App.tsx to integrate
5. Ensure TypeScript compilation passes
6. Test responsive design
7. Verify dark mode support

## Known Limitations

1. History/Glossary stored in localStorage (limited by browser quota)
2. WebSocket requires backend support
3. Batch processing limited to backend capacity
4. No offline mode

## Future Enhancements

- [ ] User authentication & cloud sync
- [ ] Advanced glossary search/filter
- [ ] Multiple glossaries/projects
- [ ] Export history/results
- [ ] Translation comparison
- [ ] Custom backend API configuration UI
- [ ] Keyboard shortcuts
- [ ] Voice input support
- [ ] Advanced analytics
- [ ] Collaborative translation features

## Production Deployment

1. Build: `npm run build`
2. Deploy `dist/` folder to static hosting
3. Configure environment variables
4. Ensure CORS headers from backend
5. Test with production API URLs
6. Monitor error rates via toasts
7. Cache built assets with long TTL

## License

[Your License Here]

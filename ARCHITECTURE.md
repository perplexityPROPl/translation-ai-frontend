# Translation Platform - Architecture Deep Dive

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     User Interface Layer                     │
├─────────────────────────────────────────────────────────────┤
│  TopBar    Language      Translation      History    Modals  │
│ (Nav)      Selector      Box              Panel      (Batch/ │
│            (L/R)         (Split View)     (Sidebar)  Glossary)
└─────────────────────────────────────────────────────────────┘
                          ↓↑
┌─────────────────────────────────────────────────────────────┐
│                  State Management Layer                      │
├─────────────────────────────────────────────────────────────┤
│ • React Context (Theme)                                     │
│ • Component State (Translation, UI)                         │
│ • localStorage hooks (History, Glossary)                    │
│ • Custom hooks (useTranslate, useWebSocket, etc.)          │
└─────────────────────────────────────────────────────────────┘
                          ↓↑
┌─────────────────────────────────────────────────────────────┐
│                  Services Layer                             │
├─────────────────────────────────────────────────────────────┤
│ API Client (REST)              WebSocket Client            │
│ • POST /translate              • Real-time translation     │
│ • POST /detect                 • Bidirectional messaging   │
│ • POST /batch                  • Connection pooling        │
│ • GET /batch/status                                        │
│ • GET /memory/search                                       │
│ • CRUD /glossary                                           │
└─────────────────────────────────────────────────────────────┘
                          ↓↑
┌─────────────────────────────────────────────────────────────┐
│                  Backend API Layer                          │
├─────────────────────────────────────────────────────────────┤
│  FastAPI Server (http://localhost:8000)                     │
│  • Translate Engine    • Language Detection                │
│  • Batch Processor     • Translation Memory                │
│  • Glossary Storage    • WebSocket Relay                   │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow Diagram

### Translation Flow (Manual)
```
User Input
    ↓
setSourceText()
    ↓
[Manual Mode] User clicks Translate
    ↓
handleTranslate()
    ├─ Auto-detect language (if needed)
    ├─ apiClient.translate()
    └─ Response received
        ├─ setTranslatedText()
        ├─ setDetectedLanguage()
        └─ addToHistory()
            └─ setHistory() → localStorage
```

### Translation Flow (Real-Time)
```
User Input
    ↓
setSourceText()
    ↓
useDebounce (800ms)
    ↓
debouncedText changes
    ↓
Effect triggered
    ├─ Check: realTimeMode && wsConnected
    ├─ wsSend({text, source_lang, target_lang})
    └─ WebSocket sends to server
        ↓
Server processes
    ↓
Response received
    ↓
onMessage handler
    ├─ Parse response
    ├─ setTranslatedText()
    └─ setDetectedLanguage() (if auto-detect)
```

### Batch Translation Flow
```
User: Click Batch button
    ↓
setBatchModalOpen(true)
    ↓
User adds texts
    ↓
handleBatchSubmit()
    ├─ apiClient.startBatch()
    ├─ Server returns task_id
    └─ startPolling(task_id)
        ↓
    Poll every 1 second
        ├─ apiClient.getBatchStatus(task_id)
        ├─ status === 'completed'?
        │   ├─ YES: setBatchResults() + close modal
        │   └─ NO: continue polling
        └─ timeout after 5 minutes
```

## Component Hierarchy

```
App (Main orchestrator)
├── ThemeProvider (Context wrapper)
│   └── AppContent
│       ├── TopBar
│       │   ├── Logo
│       │   ├── Menu Items (History, Batch, Glossary)
│       │   ├── RealTime Toggle
│       │   └── Theme Toggle
│       │
│       ├── Main Content Area
│       │   ├── LanguageSelector (Desktop Sidebar)
│       │   │   ├── Source Language Dropdown
│       │   │   ├── Swap Button
│       │   │   └── Target Language Dropdown
│       │   │
│       │   ├── Options Panel (Desktop Sidebar)
│       │   │   ├── HTML Mode Toggle
│       │   │   ├── Transliteration Toggle
│       │   │   └── Detected Language Display
│       │   │
│       │   ├── TranslationBox (Main Content)
│       │   │   ├── Source Textarea
│       │   │   │   ├── Character Count
│       │   │   │   ├── Word Count
│       │   │   │   └── Clear Button
│       │   │   │
│       │   │   └── Target Textarea
│       │   │       ├── Copy Button
│       │   │       ├── Speak Button
│       │   │       └── Translate Button (manual mode)
│       │   │
│       │   └── HistoryPanel (Desktop Sidebar - conditional)
│       │       ├── History List
│       │       │   └── History Item (repeating)
│       │       │       ├── Text Preview
│       │       │       ├── Copy Button
│       │       │       └── Delete Button
│       │       └── Clear All Button
│       │
│       ├── Modals (Portal)
│       │   ├── BatchUploadModal
│       │   │   ├── Mode Toggle (Manual/File)
│       │   │   ├── Input Area
│       │   │   ├── File Upload Zone
│       │   │   ├── Entries List
│       │   │   └── Action Buttons
│       │   │
│       │   └── GlossaryModal
│       │       ├── Add New Term Section
│       │       │   ├── Source Input
│       │       │   ├── Target Input
│       │       │   └── Add Button
│       │       ├── Terms List
│       │       │   └── Term Item (repeating)
│       │       │       └── Delete Button
│       │       └── Done Button
│       │
│       └── Toaster (Toast Notifications)
│           └── Toast Item (repeating)
```

## Hook Dependencies

```
useTranslate
├── apiClient.translate()
├── error handling
└── loading state

useWebSocket(enabled)
├── translationWebSocket.connect()
├── translationWebSocket.send()
├── response handling
└── error handling

useDebounce(value, delay)
├── useState
└── useEffect (cleanup)

useLocalStorage(key, initialValue)
├── useState (lazy init)
└── localStorage API

useTheme()
├── ThemeContext
└── document.documentElement.classList
```

## Service Layer Architecture

### API Client (REST)
```typescript
class ApiClient {
  translate(request: TranslationRequest)
  detect(text: string)
  startBatch(texts: string[], sourceLang, targetLang)
  getBatchStatus(taskId: string)
  searchMemory(sourceText, sourceLang, targetLang)
}

export const apiClient = new ApiClient();
```

### WebSocket Client
```typescript
class TranslationWebSocket {
  connect()
  send(message: WebSocketMessage)
  subscribe(listener)
  onError(listener)
  disconnect()
  isConnected()
}

export const translationWebSocket = new TranslationWebSocket();
```

## State Management Strategy

### Local State (Component Level)
- sourceText, translatedText
- currentLanguages
- UI flags (modalOpen, menuOpen)
- Loading states

### Persistent State (localStorage)
- Translation history (50 max)
- Glossary terms (unlimited)
- Theme preference

### Global State (Context)
- Current theme
- Available through useTheme() hook

### Server State
- Translation results (cached in component)
- Language detection
- Batch job status

## Type System

```typescript
// Core translation types
interface TranslationRequest {
  text: string;
  sourceLanguage: string;
  targetLanguage: string;
  html?: boolean;
  transliteration?: boolean;
  glossaryId?: number;
}

interface TranslationResponse {
  translatedText: string;
  sourceLanguageDetected?: string;
  transliteration?: string;
  confidence?: number;
}

// UI types
interface TranslationHistory {
  id: string;
  sourceText: string;
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
  timestamp: number;
}

interface GlossaryTerm {
  id?: number;
  sourceText: string;
  targetText: string;
  sourceLanguage: string;
  targetLanguage: string;
}

// Component props
interface LanguageSelectorProps {
  sourceLanguage: string;
  targetLanguage: string;
  onSourceChange: (lang: string) => void;
  onTargetChange: (lang: string) => void;
}
```

## Performance Optimizations

### Rendering
- Memoization with useCallback for stable function refs
- Component isolation to prevent unnecessary re-renders
- useDebounce prevents excessive WebSocket sends

### Network
- 800ms debounce reduces API calls by ~80%
- Batch processing for multiple translations
- Translation memory caching (backend)

### Storage
- Max 50 history items (auto-purge)
- localStorage limit ~5MB (browser dependent)
- Efficient JSON serialization

### Bundling
- Tree-shaking removes unused code
- Code splitting at route level (if added)
- Dynamic imports for modals

### Browser
- CSS minification (~9.5 kB gzipped)
- JS minification (~87 kB gzipped)
- Lazy WebSocket connections
- Event delegation in lists

## Error Handling Strategy

```typescript
// API errors
try-catch blocks
↓
Error message extraction
↓
Toast notification
↓
Clear UI state
↓
Allow retry

// WebSocket errors
Connection failure
↓
Show notification
↓
Disable real-time toggle
↓
Allow reconnect attempt

// Validation errors
User input validation
↓
Inline error messages
↓
Disable submit button
↓
Suggest correction
```

## Testing Considerations

### Unit Tests
- Hook logic (useTranslate, useDebounce, etc.)
- Type definitions
- API client methods
- Storage utilities

### Integration Tests
- Translation flow (end-to-end)
- History storage/retrieval
- Theme switching
- Modal interactions

### E2E Tests
- Full user workflows
- WebSocket real-time
- Batch processing
- Error recovery

### Performance Tests
- WebSocket message throughput
- localStorage performance
- Re-render frequency
- Memory usage

## Security Considerations

1. **XSS Prevention**
   - React auto-escapes text by default
   - HTML mode handled by backend
   - Input validation on client side

2. **API Security**
   - CORS configured on backend
   - No sensitive data in client
   - API keys managed on server

3. **Storage Security**
   - localStorage only for non-sensitive data
   - No auth tokens stored in frontend
   - Clear user data on logout

4. **Code Security**
   - No hardcoded credentials
   - Environment variables for URLs
   - Input validation
   - Error messages don't leak info

## Scaling Considerations

### For Large History
- Pagination instead of all-at-once
- Database sync instead of localStorage
- Incremental loading

### For Many Glossary Terms
- Search/filter optimization
- Pagination
- Database backend
- Sync mechanism

### For High Traffic
- Caching layer (browser + CDN)
- API rate limiting
- WebSocket connection pooling
- Load balancing on backend

### For Multiple Users
- User authentication
- Cloud sync
- Collaborative features
- Permission system

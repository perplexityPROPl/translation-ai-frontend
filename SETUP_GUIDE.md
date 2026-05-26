# Translation Platform - Setup Guide

## Quick Start

### 1. Installation
```bash
npm install
```

### 2. Configuration

Create a `.env.local` file in the project root:

```env
VITE_API_URL=http://localhost:8000/api/v1
VITE_WS_URL=ws://localhost:8000/ws
```

### 3. Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### 4. Build for Production

```bash
npm run build
```

Output will be in the `dist/` folder.

## Backend Setup

This frontend requires a FastAPI backend providing the following endpoints:

```
POST /api/v1/translate
POST /api/v1/detect
POST /api/v1/batch
GET  /api/v1/batch/status/{task_id}
GET  /api/v1/memory/search?source_text=...&source_lang=...&target_lang=...
CRUD /api/v1/glossary
WS   /ws/translate
```

Ensure CORS is properly configured on the backend.

## Supported Languages

The platform supports 16+ languages including:
- English, Spanish, French, German
- Japanese, Chinese, Tamil, Hindi
- Portuguese, Russian, Arabic, Korean
- Italian, Dutch, Polish, Turkish

Add more by updating `src/constants/languages.ts`

## Key Features Usage

### Real-Time Translation
1. Click "Real-time" button in top bar
2. Start typing - translations appear automatically
3. Toggle off to return to manual mode

### Translation History
1. Click "History" to view recent translations
2. Click any entry to restore it
3. Use delete button to remove specific entries
4. "Clear All" removes entire history

### Batch Translation
1. Click "Batch" button
2. Choose manual entry or file upload
3. Add texts one by one or upload .txt/.csv file
4. Click "Start Translation"
5. Results appear in real-time

### Glossary Management
1. Click "Glossary" button
2. Add custom translation pairs
3. Terms are language-pair specific
4. Delete individual terms as needed

### Dark Mode
- Click sun/moon icon to toggle theme
- Preference is saved automatically

## File Organization

```
src/
├── components/          # React components
├── hooks/              # Custom React hooks
├── services/           # API and WebSocket clients
├── theme/              # Design system
├── constants/          # Configuration
├── types/              # TypeScript types
└── App.tsx             # Main component
```

## Component Tree

```
App
├── ThemeProvider
├── TopBar
├── Main Content
│   ├── LanguageSelector
│   ├── TranslationBox
│   └── HistoryPanel (optional)
├── BatchUploadModal
├── GlossaryModal
└── Toaster (notifications)
```

## State Flow

1. **User Input** → sourceText state
2. **Debounce** → debouncedText (800ms)
3. **Real-time Mode** → WebSocket send
4. **Manual Mode** → API call on button click
5. **Response** → translatedText state
6. **History** → Add to localStorage
7. **Render** → UI updates

## API Request Format

### Translation
```typescript
POST /api/v1/translate
{
  "text": "Hello world",
  "source_lang": "en",
  "target_lang": "es",
  "html": false,
  "transliteration": false,
  "glossary_id": 1
}
```

### Detection
```typescript
POST /api/v1/detect
{
  "text": "Hola mundo"
}
```

### WebSocket
```json
{
  "text": "Hello",
  "source_lang": "en",
  "target_lang": "es"
}
```

## Customization

### Add Language
Edit `src/constants/languages.ts`:
```typescript
{ code: 'lang', name: 'Language', nativeName: 'Language', flag: '🇳🇦' }
```

### Modify Colors
Edit `src/theme/colors.ts` or update Tailwind CSS variables

### Change Debounce Delay
In `src/App.tsx`, modify the useDebounce call:
```typescript
const debouncedText = useDebounce(sourceText, 1000); // 1 second instead of 800ms
```

### Update API Base URL
Modify environment variables or `src/constants/languages.ts`

## Troubleshooting

### API Connection Error
- Verify backend is running on correct port
- Check environment variables in `.env.local`
- Ensure CORS headers are set
- Check browser console for details

### WebSocket Not Connecting
- Verify `VITE_WS_URL` is correct
- Ensure backend WebSocket endpoint is available
- Check network tab in DevTools

### History/Glossary Not Persisting
- Verify localStorage is enabled in browser
- Check browser storage limits
- Clear browser cache if corrupted

### Styles Not Applying
- Clear browser cache
- Restart dev server
- Verify Tailwind build process ran

## Performance Tips

1. **Mobile**: Disable WebSocket for faster load
2. **Batch**: Limit to ~100 texts per batch
3. **History**: Clears oldest items when reaching 50
4. **Glossary**: Keep under 1000 terms for performance

## Browser Requirements

- Modern browsers (2022+)
- JavaScript enabled
- LocalStorage available
- ES2020+ support

## Deployment

### Vercel
```bash
vercel deploy
```
Set environment variables in project settings.

### Netlify
Connect GitHub repo, configure build command:
```
npm run build
```
Set environment variables in site settings.

### Self-Hosted
1. Build: `npm run build`
2. Serve `dist/` folder with any static server
3. Configure backend API URL
4. Set up SSL/HTTPS

## Monitoring

Key metrics to track:
- API response times
- WebSocket connection success rate
- Error frequency
- Cache hit rates (if applicable)

Use browser DevTools Performance tab or external monitoring service.

## Support

For issues or questions:
1. Check browser console for errors
2. Review API responses in Network tab
3. Verify environment configuration
4. Check backend API logs
5. Consult PROJECT_DOCUMENTATION.md

## Next Steps

1. Connect to your backend API
2. Test all translation features
3. Customize colors/languages as needed
4. Set up deployment pipeline
5. Configure monitoring and logging

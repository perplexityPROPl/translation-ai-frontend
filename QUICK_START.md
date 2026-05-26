# Translation Platform - Quick Start

## 30-Second Setup

```bash
# 1. Install dependencies (already done)
npm install

# 2. Create environment file
echo "VITE_API_URL=http://localhost:8000/api/v1" > .env.local
echo "VITE_WS_URL=ws://localhost:8000/ws" >> .env.local

# 3. Start development server
npm run dev

# 4. Open http://localhost:5173
```

## 5-Minute First Run

1. **Configure API URLs** in `.env.local`
2. **Start backend** on http://localhost:8000
3. **Run dev server** with `npm run dev`
4. **Test translation** - type text, click Translate
5. **Toggle themes** - click sun/moon icon
6. **Try features**:
   - Real-time mode: Click "Real-time" button
   - Batch: Click "Batch" button
   - History: Click "History" button
   - Glossary: Click "Glossary" button

## Production Build

```bash
npm run build    # Creates dist/ folder
npm run preview  # Test production build locally
```

Then deploy `dist/` to your hosting provider.

## Key Shortcuts

| Feature | How to Access |
|---------|---------------|
| Real-Time Translation | Click "Real-time" button in top bar |
| Translation History | Click "History" button in top bar |
| Batch Translation | Click "Batch" button in top bar |
| Glossary | Click "Glossary" button in top bar |
| Dark Mode | Click sun/moon icon in top bar |
| Swap Languages | Click arrows between language selectors |
| Auto-Detect | Select "Detect Language" as source |
| Copy Translation | Click copy icon on translation box |
| Text-to-Speech | Click speaker icon on translation box |

## API Endpoints Required

Your backend must provide these endpoints:

```
POST   /api/v1/translate          Transfer text
POST   /api/v1/detect             Detect language
POST   /api/v1/batch              Start batch job
GET    /api/v1/batch/status/{id}  Check batch status
GET    /api/v1/memory/search      Find in translation memory
CRUD   /api/v1/glossary           Manage glossary
WS     /ws/translate              Real-time translation
```

## File Organization at a Glance

```
src/
├── components/        Custom UI components
├── hooks/             Custom React hooks
├── services/          API & WebSocket clients
├── theme/             Color & typography system
├── constants/         Configuration
├── types/             TypeScript definitions
└── App.tsx            Main application
```

## Customization Checklist

- [ ] Update `VITE_API_URL` and `VITE_WS_URL`
- [ ] Customize languages in `src/constants/languages.ts`
- [ ] Modify colors in `src/theme/colors.ts`
- [ ] Update typography in `src/theme/typography.ts`
- [ ] Adjust debounce delay in `src/App.tsx` (line 72)
- [ ] Change history limit from 50 in `src/App.tsx` (line 115)

## Debugging Tips

### WebSocket not connecting?
- Check `VITE_WS_URL` is correct
- Verify backend WebSocket endpoint exists
- Open DevTools Network → WS tab

### API errors?
- Check `VITE_API_URL` is correct
- Verify backend is running
- Open DevTools Console for error messages
- Check CORS headers on backend

### Styles look wrong?
- Clear browser cache
- Restart dev server
- Check Tailwind CSS build completed

### History/Glossary not saving?
- Check localStorage is enabled
- Verify browser storage quota
- Open DevTools → Storage → Local Storage

## Performance Tips

1. **Disable WebSocket** in production if not needed
2. **Limit batch** to 100 texts per job
3. **Clear history** occasionally (50 item limit helps)
4. **Compress images** if adding new ones
5. **Monitor bundle** size with `npm run build`

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| "Connection refused" | Verify backend is running on correct port |
| History not persisting | Ensure localStorage enabled in browser |
| Real-time not working | Check WebSocket URL and backend support |
| Dark mode not working | Clear browser cache, restart dev server |
| Buttons not responding | Check console for JavaScript errors |
| Slow performance | Reduce batch size, disable WebSocket |

## Scripts Reference

```bash
npm run dev          # Start development server (port 5173)
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run typecheck    # Check TypeScript types
```

## Browser Requirements

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**NOT supported**: IE 11, very old browsers

## File Size

- JavaScript: 87 KB (gzipped)
- CSS: 9.5 KB (gzipped)
- **Total**: ~97 KB (fully functional)

## Next Steps

1. ✅ Set up `.env.local` with API URLs
2. ✅ Start your FastAPI backend
3. ✅ Run `npm run dev`
4. ✅ Test basic translation
5. ✅ Customize if needed
6. ✅ Deploy with `npm run build`

## Need Help?

- Check `PROJECT_DOCUMENTATION.md` for detailed features
- See `SETUP_GUIDE.md` for installation help
- Review `ARCHITECTURE.md` for technical details
- Inspect `src/` for implementation examples

## Deploy in 3 Steps

### Vercel
```bash
npm install -g vercel
vercel
```

### Netlify
1. Connect GitHub repo
2. Set build: `npm run build`
3. Set publish: `dist`
4. Deploy

### Self-Hosted
```bash
npm run build
# Copy dist/ to your web server
# Configure API URLs
# Set up HTTPS
```

---

**Build Status**: ✅ Ready for Production
**Last Build**: Successful (4.29s)
**TypeScript**: ✅ Strict Mode
**Tests**: Ready to add

# Developer Notes - ARIA AI Assistant

Internal documentation for developers working on ARIA.

## Project Overview

ARIA (AI Response & Intelligence Assistant) is a Thunderbird extension that provides AI-powered email assistance with support for multiple AI providers and voice input.

## Architecture

### Module Structure

```
ai-mail-assistant/
├── Core Files
│   ├── manifest.json          # Extension manifest
│   ├── background.js          # Background service
│   ├── popup.html/js         # Main UI
│   └── settings.html/js      # Settings page
│
├── Modules (ES6)
│   ├── api-client.js         # API communication & prompts
│   ├── email-context.js      # Email data extraction
│   ├── i18n.js               # Internationalization
│   ├── stt-recorder.js       # Voice recording & transcription
│   ├── ui-helpers.js         # UI state management
│   ├── settings-*.js         # Settings page modules
│   └── logger.js             # Logging system
│
├── Locales (i18n)
│   └── [lang]/messages.json  # 14 language files
│
└── Documentation
    ├── README.md             # User documentation
    ├── QUICKSTART.md         # Quick start guide
    ├── PRIVACY.md            # Privacy policy
    ├── CHANGELOG.md          # Version history
    └── SUBMISSION_CHECKLIST.md
```

### Data Flow

```
User Action → popup.js → Module → API → Response → Email
                ↓
          settings.js → Storage (local)
                ↓
          background.js → Identity fetch
```

## Key Technologies

- **Language**: JavaScript (ES6 modules)
- **Framework**: WebExtensions API (Thunderbird)
- **Storage**: browser.storage.local
- **I18n**: Custom implementation with JSON files
- **API**: Fetch API for HTTP requests

## Module Responsibilities

### popup.js
- Main UI initialization
- User interaction handling
- Coordinates all popup modules
- Voice input management
- Email generation workflow

### api-client.js
- API communication (Chat)
- Prompt building
- Cost calculation
- Statistics management
- Token usage tracking

### email-context.js
- Email data extraction
- Composer/viewer detection
- Identity retrieval
- HTML stripping
- Text insertion

### stt-recorder.js
- Microphone access
- Audio recording (MediaRecorder)
- Audio transcription
- STT API communication

### settings-*.js
- Settings persistence
- API testing
- Import/export
- Data validation
- I18n for settings

## API Integration

### Chat API (OpenAI-compatible)
```javascript
POST /v1/chat/completions
{
  "model": "gpt-4o-mini",
  "messages": [
    {"role": "system", "content": "..."},
    {"role": "user", "content": "..."}
  ],
  "temperature": 1.0,
  "max_tokens": 2000
}
```

### STT API (Whisper-compatible)
```javascript
POST /v1/audio/transcriptions
FormData:
  - file: audio.wav
  - model: whisper-1
  - language: en (optional)
```

## Storage Schema

```javascript
{
  // Chat settings
  chat: {
    apiUrl: string,
    apiKey: string,
    model: string,
    temperature: number,
    maxTokens: number,
    systemPrompt: string
  },
  
  // Extension settings
  extension: {
    contextSize: number,
    includeSender: boolean,
    clearEmailAfterSubmit: boolean
  },
  
  // STT settings
  stt: {
    apiUrl: string,
    apiKey: string,
    model: string,
    language: string
  },
  
  // UI settings
  uiLanguage: string,
  
  // Temporary data
  lastPrompt: string,
  lastStats: {
    inputTokens: number,
    outputTokens: number,
    model: string,
    time: string,
    cost: string,
    temperature: number
  },
  generatedEmails: number
}
```

## Testing Guidelines

### Manual Testing Checklist

1. **Basic Functionality**
   - [ ] Extension loads without errors
   - [ ] Popup opens correctly
   - [ ] Settings page accessible
   - [ ] Icons display properly

2. **Settings**
   - [ ] Save settings works
   - [ ] Language change reloads correctly
   - [ ] API test functions work
   - [ ] Export creates valid JSON
   - [ ] Import restores settings

3. **Email Generation**
   - [ ] Works in compose window
   - [ ] Works in reply context
   - [ ] Correct email context extracted
   - [ ] AI response inserted properly
   - [ ] Statistics display correctly

4. **Voice Input**
   - [ ] Microphone access requested
   - [ ] Recording indicator shows
   - [ ] Stop recording works
   - [ ] Transcription appears in textarea
   - [ ] Error handling works

5. **Multi-language**
   - [ ] Language selector works
   - [ ] All UI strings translate
   - [ ] Fallback to English works
   - [ ] Email responses in correct language

6. **Error Handling**
   - [ ] Missing API settings alert
   - [ ] Network errors handled
   - [ ] Invalid API key handled
   - [ ] No email context handled
   - [ ] Microphone denied handled

### Browser Console Testing

Open Thunderbird Developer Tools and check for:
- No console errors on load
- Clean logging from logger.js
- No unhandled promise rejections
- Proper error messages

### API Testing

Test with:
- OpenAI (real API)
- Ollama (local)
- Invalid credentials
- Network offline
- Slow responses

## Common Development Tasks

### Adding a New Language

1. Copy `locales/en/messages.json`
2. Create `locales/[code]/messages.json`
3. Translate all strings
4. Add to language selector in `settings.html`
5. Test thoroughly

### Adding a New Setting

1. Add UI field to `settings.html`
2. Add load logic in `settings-data.js::loadSettings()`
3. Add save logic in `settings-data.js::saveSettings()`
4. Add i18n strings to all language files
5. Use setting in appropriate module

### Modifying the Prompt

Edit `api-client.js::buildPrompt()` function:
- Email context formatting
- Instruction integration
- System prompt handling

### Debugging Tips

1. **Enable verbose logging**
   - Check logger.js output in console
   - Add temporary console.log statements

2. **Test with minimal settings**
   - Clear storage: browser.storage.local.clear()
   - Test fresh install experience

3. **Network debugging**
   - Use Network tab in DevTools
   - Check API request/response
   - Verify headers and body

4. **Storage debugging**
   ```javascript
   // In console
   browser.storage.local.get().then(console.log)
   ```

## Code Style Guidelines

- Use ES6 modules (`import`/`export`)
- Async/await for async operations
- Try/catch for error handling
- JSDoc comments for functions
- Descriptive variable names
- Consistent indentation (2 spaces)
- Single quotes for strings (preference)

## Security Considerations

### API Keys
- Never log API keys
- Use password fields in UI
- Store in local storage only
- Transmit only to configured endpoints

### User Data
- No telemetry
- No external data collection
- User controls all transmissions
- Clear privacy policy

### Input Validation
- Validate all user inputs
- Sanitize before storage
- Check API responses
- Handle edge cases

## Performance Optimization

### Current Optimizations
- Modular code loading
- Lazy initialization
- Efficient DOM updates
- Minimal storage usage

### Future Improvements
- Cache frequently used data
- Debounce user inputs
- Optimize large email handling
- Reduce memory footprint

## Known Limitations

1. **Thunderbird 115+ only**
   - Uses modern WebExtensions API
   - Manifest v2 required

2. **Email context**
   - Limited to visible email
   - May not capture all attachments
   - HTML stripping may lose formatting

3. **Voice input**
   - Requires microphone permission
   - Depends on STT API availability
   - Audio quality affects transcription

4. **API dependencies**
   - Requires API access
   - Network connectivity needed
   - API rate limits apply

## Troubleshooting Development Issues

### Extension won't load
- Check manifest.json syntax
- Verify all files exist
- Check browser console for errors
- Ensure Thunderbird version ≥ 115

### Modules not importing
- Verify file paths
- Check for circular dependencies
- Ensure `type="module"` in HTML
- Check file extensions (.js)

### Settings not saving
- Check storage permissions
- Verify save function called
- Check browser console for errors
- Test with browser.storage.local directly

### API calls failing
- Verify API URL format
- Check network tab
- Test API key validity
- Check CORS if applicable

## Release Process

1. Push commit to `main` or `master`
2. GitHub Actions runs `lint` and `build`
3. CI creates `.xpi` and `.zip` artifacts in `dist/`
4. CI creates an automatic commit release with download links
5. For official versions, create and push a tag (`git tag v1.0.0 && git push --tags`)
6. Tag pipeline creates an official tag release
7. Test packaged extension and submit to addons.thunderbird.net

## Contributing Guidelines

When contributing:
1. Fork the repository
2. Create feature branch
3. Follow code style
4. Add tests if applicable
5. Update documentation
6. Submit pull request

## Resources

- [Thunderbird WebExtensions](https://webextension-api.thunderbird.net/)
- [MDN WebExtensions](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions)
- [OpenAI API Docs](https://platform.openai.com/docs)
- [Ollama API](https://github.com/ollama/ollama/blob/main/docs/api.md)

## Support

For development questions:
- Check existing issues on GitHub
- Review documentation
- Ask in developer community
- Contact maintainers

---

Last Updated: 2025-10-31
Version: 1.0.0

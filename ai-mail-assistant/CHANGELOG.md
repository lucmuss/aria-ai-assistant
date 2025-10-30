# Changelog

All notable changes to ARIA - AI Assistant will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-10-31

### Initial Release 🎉

First public release of ARIA - AI Assistant for Thunderbird!

#### Added
- **AI-Powered Email Generation**
  - Generate intelligent email responses using AI
  - Support for OpenAI GPT models (GPT-4, GPT-4o, GPT-3.5-turbo, GPT-4o-mini)
  - Support for local AI models (Ollama, LM Studio, and compatible services)
  - Customizable system prompts for different writing styles
  - Temperature control for response creativity
  - Max token configuration

- **Voice Input Feature**
  - Record voice instructions using microphone
  - Automatic transcription via Whisper API or compatible STT services
  - Support for multiple languages in voice recognition
  - Language auto-detection option

- **Multi-Language Support**
  - Interface available in 14 languages:
    - English, German, Spanish, French
    - Chinese, Hindi, Arabic, Bengali
    - Russian, Portuguese, Urdu, Indonesian
    - Japanese, Polish
  - Automatic language detection for email responses
  - Responds in the same language as the original email

- **Smart Email Context**
  - Automatic extraction of email subject, sender, and content
  - Receiver identity integration (name, email, organization)
  - Configurable context size (1-10 previous messages)
  - Optional sender inclusion in prompts

- **User-Friendly Interface**
  - Clean, intuitive popup design
  - Quick autoresponse button for instant acknowledgments
  - Real-time statistics display (tokens, cost, time, model)
  - Generation counter to track usage
  - Persistent prompt field for convenience

- **Settings Management**
  - Comprehensive settings page with organized sections
  - API testing functionality for Chat and STT services
  - Export/import settings for backup and migration
  - Separate configurations for Chat API and STT API
  - Password-protected API key fields

- **Privacy & Security**
  - No data collection or telemetry
  - All settings stored locally
  - User controls which AI service to use
  - Open source and auditable code
  - Secure API key storage

- **Developer Features**
  - Modular code architecture
  - Comprehensive logging system
  - Easy to extend and customize
  - Well-documented codebase

#### Technical Details
- Manifest version: 2
- Minimum Thunderbird version: 115.0
- Permissions: storage, messagesRead, compose, tabs, accountsRead
- Architecture: Modular ES6 JavaScript
- No external dependencies
- No build process required

#### Documentation
- Comprehensive README.md with setup instructions
- Detailed PRIVACY.md explaining data handling
- MIT License for open source distribution
- Inline code documentation

---

## Future Plans

### Planned for 1.1.0
- [ ] Additional AI provider integrations (Anthropic Claude, Google Gemini)
- [ ] Email template system
- [ ] Conversation history view
- [ ] Enhanced prompt library
- [ ] Keyboard shortcuts
- [ ] Dark mode support

### Under Consideration
- [ ] Email classification and categorization
- [ ] Automated email sorting
- [ ] Calendar integration for meeting scheduling
- [ ] Attachment analysis
- [ ] Multi-account support enhancements
- [ ] Custom model pricing configurations
- [ ] Offline mode with cached responses

---

## Version History Summary

- **1.0.0** (2025-10-31) - Initial public release

---

## Contributing

We welcome contributions! Please see our GitHub repository for:
- Bug reports
- Feature requests
- Pull requests
- Translation improvements

---

## Support

For help and support:
- Check the README.md for common issues
- Review the PRIVACY.md for data handling questions
- Open an issue on GitHub
- Contact via email

---

**Note**: This changelog will be updated with each new release to document all changes, improvements, and bug fixes.

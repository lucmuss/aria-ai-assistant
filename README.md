# ARIA - AI Assistant for Thunderbird

![ARIA Logo](icons/ai-icon_128.png)

**ARIA** (AI Response & Intelligence Assistant) is a powerful Thunderbird extension that helps you compose emails faster and smarter using artificial intelligence. Generate intelligent email responses, use voice input, and leverage both OpenAI and local AI models.

## Features

✨ **AI-Powered Email Generation**
- Generate professional email responses with AI assistance
- Support for OpenAI GPT models (GPT-4, GPT-4o, GPT-3.5-turbo)
- Support for local AI models (Ollama, LM Studio, etc.)
- Customizable system prompts and temperature settings

🎤 **Voice Input**
- Record voice instructions using your microphone
- Automatic transcription using Whisper API or compatible services
- Support for multiple languages

🌍 **Multi-Language Support**
- Interface available in 14 languages: English, German, Spanish, French, Chinese, Hindi, Arabic, Bengali, Russian, Portuguese, Urdu, Indonesian, Japanese, Polish
- Automatic language detection for email responses
- Responds in the same language as the original email

⚙️ **Flexible Configuration**
- Use OpenAI API or your own local AI server
- Adjustable context size and temperature
- Custom system prompts for different writing styles
- Export and import settings for easy backup

📊 **Statistics & Insights**
- Track token usage (input/output)
- Monitor API costs
- View processing time
- Temperature tracking

## Installation

### From Thunderbird Add-ons Store
1. Open Thunderbird
2. Go to **Menu** → **Add-ons and Themes**
3. Search for "ARIA AI Assistant"
4. Click **Add to Thunderbird**

### Manual Installation (Development)
1. Download the latest release from this repository
2. Open Thunderbird
3. Go to **Menu** → **Add-ons and Themes**
4. Click the gear icon → **Install Add-on From File**
5. Select the downloaded `.xpi` file

## Setup

### 1. Configure API Settings

After installation, configure your AI provider:

1. Click the ARIA icon in the compose window or open Settings
2. Navigate to **Chat API Settings**
3. Enter your configuration:

**For OpenAI:**
- API URL: `https://api.openai.com/v1/chat/completions`
- API Key: Your OpenAI API key (get one at https://platform.openai.com)
- Model: `gpt-4o-mini` or `gpt-4o`

**For Ollama (Local):**
- API URL: `http://localhost:11434/v1/chat/completions`
- API Key: `ollama` (or leave empty)
- Model: `llama3`, `mistral`, `phi3`, etc.

**For LM Studio (Local):**
- API URL: `http://localhost:1234/v1/chat/completions`
- API Key: `lm-studio` (or leave empty)
- Model: Your loaded model name

### 2. Configure Speech-to-Text (Optional)

For voice input functionality:

1. Go to **STT Settings** in settings page
2. Configure:
   - STT API URL: `https://api.openai.com/v1/audio/transcriptions`
   - STT API Key: Your OpenAI API key
   - Model: `whisper-1`
   - Language: Select your preferred language or leave as "Auto"

### 3. Test Your Configuration

- Click **🧪 Test API** to verify your chat API settings
- Click **🧪 Test STT API** to verify your speech-to-text settings

## Usage

### Generating Email Responses

1. **Open or Reply to an Email**
   - Open an email you want to respond to, or click Reply

2. **Click the ARIA Icon**
   - In the compose window toolbar, click the ARIA icon
   - The ARIA popup will appear

3. **Enter Instructions**
   - Type your instructions in the text field (e.g., "Write a professional reply accepting the meeting invitation")
   - Or click **🎤 Voice Input** to speak your instructions

4. **Generate Response**
   - Click **📤 Submit**
   - ARIA will generate a response based on the email context and your instructions
   - The response will be automatically inserted into your email

### Quick Autoresponse

Click **🪄 Autoresponse** for instant AI-generated acknowledgment emails. Perfect for:
- Confirming receipt of emails
- Accepting meeting invitations
- Quick professional responses

### Voice Input

1. Click **🎤 Voice Input**
2. Allow microphone access when prompted
3. Speak your instructions clearly
4. Click **⏹️ Stop Recording**
5. Wait for transcription
6. Review and submit

**Shortcuts (popup only):**
- `Ctrl/Cmd + Shift + V`: Start voice input
- `Ctrl/Cmd + Shift + A`: Trigger autoresponse

## Settings Overview

### Extension Settings
- **Interface Language**: Choose your preferred UI language
- **Context Size**: Number of previous messages to include (1-10)
- **Include Sender**: Add sender email to context
- **Clear Email After Submit**: Remove existing content before inserting AI response

### Chat API Settings
- **API URL**: Endpoint for your AI model
- **API Key**: Your authentication key
- **Model**: AI model to use
- **Temperature**: Creativity level (0.0-2.0)
  - 0.0 = More factual and deterministic
  - 1.0 = Balanced (recommended)
  - 2.0 = More creative and varied
- **Max Tokens**: Maximum response length (500-4000)
- **System Prompt**: Define AI assistant behavior and style

### Speech-to-Text Settings
- **STT API URL**: Transcription service endpoint
- **STT API Key**: Authentication for STT service
- **Model**: Speech recognition model
- **Language**: Recognition language (auto-detect or specific)

## Tips for Best Results

### Writing Effective Instructions

**Good Examples:**
- "Write a professional reply accepting the meeting invitation for Tuesday"
- "Politely decline this job offer and thank them for the opportunity"
- "Answer their technical question about API authentication in detail"
- "Write a friendly follow-up email about the project status"

**Pro Tips:**
- Be specific about the tone (professional, friendly, formal, casual)
- Mention key points you want to address
- Specify if you need a short or detailed response
- Use voice input for natural, conversational instructions

### Customizing System Prompts

Tailor the AI's behavior with custom system prompts:

**Professional:**
```
You are a professional business email assistant. Write clear, concise, and formal emails.
```

**Friendly:**
```
You are a friendly email assistant. Write warm, personable emails while maintaining professionalism.
```

**Technical:**
```
You are a technical email assistant. Provide detailed, accurate technical information in a clear manner.
```

### Managing Costs

- Use `gpt-4o-mini` for cost-effective responses (recommended)
- Use `gpt-4o` for complex or important emails
- Monitor token usage in the statistics panel
- Consider local models (Ollama) for unlimited free usage

## Privacy & Security

- **No Data Collection**: ARIA does not collect, store, or transmit your personal data
- **API Communications**: Only communicates with your configured API endpoint
- **Local Storage**: Settings stored locally in Thunderbird
- **Your Control**: You control which AI service to use and what data to send

See [PRIVACY.md](PRIVACY.md) for complete privacy policy.

## Troubleshooting

### Common Issues

**"API settings missing" error**
- Solution: Configure API URL, API Key, and Model in settings

**"No message or reply draft open" error**
- Solution: Open an email or click Reply before using ARIA

**Voice input not working**
- Solution: Grant microphone permissions in your browser/system settings
- Check STT API configuration in settings

**API connection fails**
- Solution: Click "Test API" to diagnose the issue
- Verify API key is correct and has sufficient credits
- Check if API URL is accessible

**Wrong language in response**
- Solution: The email body language detection may be incorrect
- Specify the language in your instructions: "Respond in English"

### Getting Help

- Check the [FAQ section](https://github.com/yourusername/aria-thunderbird)
- Report bugs via the `/reportbug` command in chat
- Open an issue on GitHub

## System Requirements

- **Thunderbird**: Version 115.0 or higher
- **API Access**: OpenAI API key or local AI server
- **Microphone**: Required for voice input (optional feature)
- **Internet**: Required for API-based services

## Development

### Building from Source

```bash
# Clone the repository
git clone https://github.com/yourusername/aria-thunderbird.git
cd aria-thunderbird

# The extension is ready to load
# No build process required
```

### CI/CD (GitHub Actions)

- Every push/PR runs lint + build and produces `.xpi` + `.zip` artifacts.
- Every commit on `main`/`master` creates an automatic prerelease with both files.
- Tag pushes (`vX.Y.Z`) create official GitHub Releases with both files.

### Loading as Temporary Extension

1. Open Thunderbird
2. Go to **Menu** → **Add-ons and Themes**
3. Click gear icon → **Debug Add-ons**
4. Click **Load Temporary Add-on**
5. Select `manifest.json` from the project directory

### Project Structure

```
ai-mail-assistant/
├── manifest.json          # Extension manifest
├── background.js          # Background scripts
├── popup.html            # Main popup interface
├── popup.js              # Popup logic
├── settings.html         # Settings page
├── settings.js           # Settings logic
├── style.css             # Styles
├── icons/                # Extension icons
├── locales/              # Translations (14 languages)
│   ├── en/
│   ├── de/
│   ├── es/
│   └── ...
└── modules/              # Modular components
    ├── api-client.js     # API communication
    ├── email-context.js  # Email handling
    ├── i18n.js           # Internationalization
    ├── stt-recorder.js   # Voice recording
    └── ...
```

## Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues.

### Translation Contributions

To add a new language:
1. Copy `locales/en/messages.json`
2. Create a new folder `locales/[language-code]/`
3. Translate all message strings
4. Add language to `settings.html` language selector
5. Submit a pull request

## License

This project is licensed under the MIT License - see [LICENSE](LICENSE) file for details.

## Acknowledgments

- OpenAI for GPT models and Whisper API
- Thunderbird team for the excellent email client
- Ollama and LM Studio for local AI model support
- All contributors and translators

## Support the Project

If you find ARIA useful, consider supporting its development:

[![Donate](https://img.shields.io/badge/Donate-PayPal-blue.svg)](https://www.paypal.com/pool/9jCVLXPPmR?sr=wccr)

---

**Version**: 1.0.0  
**Author**: Lucas M.
**Website**: https://github.com/yourusername/aria-thunderbird  
**License**: MIT

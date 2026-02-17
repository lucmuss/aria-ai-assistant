# Quick Start Guide - ARIA AI Assistant

Get started with ARIA in just 5 minutes! 🚀

## Step 1: Install the Extension

### Option A: From Thunderbird Add-ons (Recommended)
1. Open Thunderbird
2. Go to **Menu (☰)** → **Add-ons and Themes**
3. Search for "ARIA AI Assistant"
4. Click **Add to Thunderbird**
5. Click **Add** when prompted

### Option B: Manual Installation
1. Download the latest `.xpi` file from the releases page
2. Open Thunderbird
3. Go to **Menu (☰)** → **Add-ons and Themes**
4. Click the **gear icon (⚙️)** → **Install Add-on From File**
5. Select the downloaded `.xpi` file

## Step 2: Get Your API Key

### For OpenAI (Recommended for beginners)
1. Visit https://platform.openai.com
2. Sign up or log in
3. Go to **API Keys** section
4. Click **Create new secret key**
5. Copy the key (starts with `sk-...`)
6. **Save it somewhere safe** - you won't see it again!

### For Local AI (Free alternative)
Install Ollama from https://ollama.ai and run:
```bash
ollama pull llama3
```

## Step 3: Configure ARIA

1. Click the **ARIA icon** in any compose window (or go to Settings)
2. Click **⚙️ Settings**
3. Fill in the **Chat API Settings**:

**For OpenAI:**
```
API URL: https://api.openai.com/v1/chat/completions
API Key: sk-your-key-here
Model: gpt-4o-mini
```

**For Ollama (local):**
```
API URL: http://localhost:11434/v1/chat/completions
API Key: ollama
Model: llama3
```

4. Click **💾 Save Settings**
5. Click **🧪 Test API** to verify it works

## Step 4: Generate Your First Email

1. **Open or reply to an email** in Thunderbird
2. Click the **ARIA icon** in the compose window
3. Type your instruction, for example:
   ```
   Write a professional reply accepting the meeting invitation
   ```
4. Click **📤 Submit**
5. Wait a few seconds
6. **Done!** The AI-generated response is now in your email

## Quick Tips 💡

### Use the Autoresponse Button
Click **🪄 Autoresponse** for instant acknowledgment emails - perfect for:
- "Thanks, received your email"
- Confirming meeting times
- Quick professional responses

### Try Voice Input 🎤
1. Click **🎤 Voice Input**
2. Allow microphone access if Thunderbird asks for it
3. Speak your instructions
4. Click **⏹️ Stop Recording**
5. Wait for transcription
6. Review and submit

**Note**: Voice input requires STT API configuration (use OpenAI Whisper)

**Shortcuts (popup only):**
- `Ctrl/Cmd + Shift + V`: Start voice input
- `Ctrl/Cmd + Shift + A`: Autoresponse

### Change the Language
- Go to Settings → **Interface Language**
- Choose from 14 available languages
- The AI will respond in the same language as the email

## Common Instructions Examples

**Professional:**
- "Write a professional reply accepting this meeting for Tuesday at 2 PM"
- "Politely decline this job offer and thank them"
- "Answer their technical question about API authentication"

**Friendly:**
- "Write a warm thank you email for their help"
- "Reply enthusiastically accepting the lunch invitation"

**Quick:**
- "Acknowledge receipt and confirm I'll review by Friday"
- "Say thanks and that I'll get back to them soon"

## Troubleshooting

### "API settings missing" error?
→ Go to Settings and fill in API URL, API Key, and Model

### "No message or reply draft open" error?
→ You need to open an email or click Reply before using ARIA

### Wrong language in response?
→ Add to your instruction: "Respond in English" (or your language)

### API test fails?
→ Check your API key is correct and has credits

## Next Steps

- **Customize System Prompt**: Change the AI's tone in Settings
- **Adjust Temperature**: 0 = factual, 1 = balanced, 2 = creative
- **Export Settings**: Backup your configuration
- **Explore Languages**: Try ARIA in your native language

## Cost Management

**Using OpenAI:**
- `gpt-4o-mini`: ~$0.01 per 10 emails (very cheap!)
- `gpt-4o`: ~$0.10 per 10 emails (higher quality)
- Monitor costs in the statistics panel

**Free Alternative:**
- Use Ollama with local models = $0 forever!

## Need Help?

- 📖 Read the full [README.md](README.md)
- 🔒 Check [PRIVACY.md](PRIVACY.md) for data handling
- 🐛 Report issues on GitHub
- 💬 Join our community

---

**You're all set!** Start generating intelligent emails with ARIA! 🎉

For advanced features and detailed documentation, see [README.md](README.md)

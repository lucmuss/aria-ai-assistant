# Privacy Policy for ARIA - AI Assistant

**Last Updated**: October 31, 2025  
**Version**: 1.0.0

## Overview

ARIA - AI Assistant ("ARIA", "the Extension", "we") is committed to protecting your privacy. This privacy policy explains how the extension handles your data when you use it with Mozilla Thunderbird.

## Data Collection and Usage

### What Data We DO NOT Collect

ARIA does **NOT** collect, store, transmit, or share any of the following:

- ❌ Personal information (name, email address, phone number)
- ❌ Email content or metadata
- ❌ Contact lists or address books
- ❌ Usage statistics or analytics
- ❌ User behavior tracking
- ❌ IP addresses or location data
- ❌ Device information
- ❌ Any telemetry or diagnostic data

### What Data Stays Local

The following data is stored **locally** on your device using Thunderbird's local storage API:

✅ **Settings and Configuration**
- API URLs and API keys you configure
- Model preferences (e.g., GPT-4o-mini)
- Temperature and token settings
- System prompt customizations
- UI language preference
- Extension preferences (context size, sender inclusion, etc.)

✅ **Temporary Working Data**
- Last prompt text (for convenience)
- Last API statistics (tokens, cost, model used)
- Generation counter (number of emails generated)

**Important**: All this data remains on your local device and is never transmitted to us or any third party except the AI services you explicitly configure.

### Data Transmitted to Third Parties

When you use ARIA to generate email responses or transcribe voice input, the extension sends data to the AI service provider **YOU** configure:

#### To Chat API (e.g., OpenAI, Ollama, etc.)
When you click "Submit" to generate a response:
- Email context (subject, sender, receiver, message body)
- Your instructions/prompt
- System prompt
- Configuration parameters (model, temperature, max tokens)

#### To Speech-to-Text API (e.g., OpenAI Whisper)
When you use voice input:
- Audio recording of your voice
- Language preference (if configured)
- Model selection

**You Control What Is Sent**: You decide which AI service to use by configuring the API URL. You can use:
- Commercial services (OpenAI, Anthropic, etc.) - subject to their privacy policies
- Self-hosted services (Ollama, LM Studio) - data stays on your network
- Local models - no internet transmission required

## Third-Party Services

### OpenAI (if you choose to use it)
If you configure ARIA to use OpenAI's services:
- Data is transmitted to OpenAI's servers
- OpenAI's Privacy Policy applies: https://openai.com/privacy
- OpenAI may use data for service improvement (check their current policy)
- API calls are logged by OpenAI according to their data retention policies

### Other AI Providers
If you configure ARIA to use other services (Anthropic Claude, Google Gemini, etc.):
- Their respective privacy policies apply
- Review their data handling practices before use

### Self-Hosted/Local AI Models
If you use local AI services (Ollama, LM Studio, local Whisper):
- No data leaves your network
- Complete privacy and control
- Recommended for sensitive communications

## Permissions Explained

ARIA requests the following Thunderbird permissions:

### `storage`
**Why**: To save your settings, preferences, and temporary working data locally
**Data**: API keys, preferences, last prompt, statistics
**Scope**: Local only, never transmitted

### `messagesRead`
**Why**: To read email content when generating responses
**Data**: Email subject, sender, receiver, message body
**Scope**: Only when you explicitly use ARIA to generate a response

### `compose`
**Why**: To insert AI-generated text into your email drafts
**Data**: Generated response text
**Scope**: Only your compose windows

### `tabs`
**Why**: To open the settings page in a new tab
**Data**: None
**Scope**: Settings page only

### `accountsRead`
**Why**: To retrieve your identity (name, email, organization) for email context
**Data**: Your configured Thunderbird identity
**Scope**: Read-only access to display information

## Security Measures

### API Key Security
- API keys are stored locally in Thunderbird's secure storage
- Keys are transmitted only to the API endpoints you configure
- Password fields mask API keys in the UI
- No API keys are ever sent to us or logged

### Communication Security
- All API communications use HTTPS encryption (when configured properly)
- No man-in-the-middle data collection
- Extension code is open source and auditable

### Voice Recording
- Microphone access requires explicit permission
- Audio is processed only when you actively use voice input
- Recordings are temporary and deleted after transcription
- No audio is stored permanently

## Data Retention

### Local Storage
- Settings persist until you uninstall the extension or clear Thunderbird's storage
- You can export settings for backup
- You can manually clear data by uninstalling the extension

### No Cloud Storage
- ARIA does not use any cloud storage
- No backups are created by the extension
- All data management is in your control

## Your Rights and Control

You have complete control over your data:

### ✅ Access
- View all settings in the Settings page
- Export settings to JSON file

### ✅ Modification
- Change any setting at any time
- Update or remove API keys

### ✅ Deletion
- Clear last prompt by clicking Cancel
- Uninstall extension to remove all local data
- Clear Thunderbird storage manually

### ✅ Portability
- Export settings to JSON
- Import settings to another device
- No vendor lock-in

## Children's Privacy

ARIA is not directed at children under 13 years of age. We do not knowingly collect information from children. If you are a parent or guardian and believe your child has used this extension, please supervise their AI service usage according to the third-party provider's terms.

## Changes to This Privacy Policy

We may update this privacy policy from time to time. Changes will be noted in:
- The "Last Updated" date at the top of this document
- The CHANGELOG.md file in the extension repository
- Release notes for version updates

Continued use of ARIA after changes constitutes acceptance of the updated policy.

## Open Source Transparency

ARIA is open source software:
- Source code is available for review on GitHub
- No hidden data collection or tracking
- Community audited and maintained
- You can build from source and verify behavior

## Contact

For privacy-related questions or concerns:
- Open an issue on GitHub: [GitHub Repository URL]
- Email: [Your Contact Email]

## Compliance

### GDPR (European Union)
ARIA does not collect personal data as defined by GDPR. You are the data controller for any information you choose to send to third-party AI services.

### CCPA (California)
ARIA does not sell personal information. The extension does not collect personal information for sale or commercial purposes.

### Data Processing
When you use third-party AI services through ARIA:
- You are the data controller
- The AI service provider is the data processor
- Review the AI provider's data processing agreements

## Best Practices for Privacy

To maximize your privacy when using ARIA:

1. **Use Local AI Models**: Consider Ollama or LM Studio for complete privacy
2. **Review Before Sending**: Check email context before clicking Submit
3. **Minimize Sensitive Data**: Avoid including highly sensitive information in prompts
4. **Secure API Keys**: Keep your API keys confidential
5. **Regular Audits**: Periodically review your settings and API usage
6. **Update Regularly**: Keep ARIA updated for security patches

## Disclaimer

ARIA is a tool that facilitates communication with AI services. The privacy and security of data sent to third-party AI providers is governed by their respective privacy policies and terms of service. We recommend:

- Reading the privacy policy of any AI service you use
- Understanding data retention policies
- Using services that align with your privacy requirements
- Considering data sensitivity when choosing AI providers

---

**Summary**: ARIA respects your privacy. We don't collect your data. What you configure stays local. What you send to AI services is your choice and governed by their policies.

For the most up-to-date privacy information, visit: [GitHub Repository URL]

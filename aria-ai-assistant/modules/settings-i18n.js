/**
 * Settings Internationalization Module
 */

export async function loadI18n() {
  let langSetting = await browser.storage.local.get('uiLanguage');
  const lang = langSetting.uiLanguage || browser.i18n.getUILanguage().split('-')[0] || 'en';
  
  const messagesUrl = browser.runtime.getURL(`locales/${lang}/messages.json`);
  
  try {
    const response = await fetch(messagesUrl);
    if (!response.ok) {
      throw new Error(`Failed to load messages: ${response.status}`);
    }
    const messages = await response.json();

    const t = key => messages[key]?.message || key;
    await applyTranslations(t);
    return t;
  } catch (error) {
    console.error('Failed to load i18n:', error);
    return getFallbackTranslations();
  }
}

function getFallbackTranslations() {
  const fallbackMessages = {
    extensionName: 'AI Mail Assistant',
    settingsTitle: 'AI Mail Assistant Settings',
    saveBtn: 'Save Settings',
    languageLabel: 'Interface Language:',
    languageDesc: 'Choose the user interface language',
    savedMsg: 'Settings saved successfully!',
    chatSettings: 'Chat API Settings',
    apiUrlLabel: 'API URL:',
    apiUrlPlaceholder: 'https://api.openai.com/v1/chat/completions',
    apiUrlDesc: 'Endpoint for your model (e.g. OpenAI or local ULAMA server)',
    apiKeyLabel: 'API Key:',
    apiKeyPlaceholder: 'sk-xxxxxxxxxxxx',
    apiKeyDesc: 'Your API key from the provider (e.g. OpenAI, Ollama etc.)',
    modelLabel: 'Model:',
    modelDesc: 'Model name (e.g. gpt-4o, llama3, mistral)',
    temperatureLabel: 'Temperature:',
    temperatureDesc: 'Controls creativity (0 = factual, 1 = creative)',
    maxTokensLabel: 'Max Tokens:',
    maxTokensDesc: 'Maximum length of the response',
    systemPromptLabel: 'System Prompt:',
    systemPromptPlaceholder: 'You are a polite email assistant.',
    systemPromptDesc: 'Default text for the assistant (e.g. tone or style)',
    contextSizeLabel: 'Context Size:',
    contextSizeDesc: 'Number of previous messages to include as context',
    includeSenderLabel: 'Include Sender:',
    includeSenderDesc: 'Includes the sender address in the prompt context',
    sttSettings: 'Speech-to-Text Settings',
    sttApiUrlLabel: 'STT API URL:',
    sttApiUrlPlaceholder: 'https://api.openai.com/v1/audio/transcriptions',
    sttApiUrlDesc: 'URL for speech transcription (e.g. Whisper)',
    sttApiKeyLabel: 'STT API Key:',
    sttApiKeyPlaceholder: 'sk-xxxxxxxxxxxx',
    sttApiKeyDesc: 'API key for the STT provider',
    sttModelLabel: 'Model:',
    sttModelDesc: 'Speech model (e.g. whisper-1 or local tiny)',
    sttLanguageLabel: 'Language:',
    sttLanguageDesc: 'Recognition language (empty = automatic)',
    exportBtn: 'Export Settings',
    importBtn: 'Import Settings',
    exportSuccessMsg: 'Settings exported successfully!',
    importSuccessMsg: 'Settings imported successfully!',
    importErrorMsg: 'Import error: ',
    testApiBtn: '🧪 Test API',
    testApiTesting: '🧪 Testing API connection...',
    testApiSuccess: '✅ API connection tested successfully!',
    testApiError: '❌ API Error: ',
    testApiMissingSettings: '❌ Please fill out all API settings first',
    testSttBtn: '🧪 Test STT API',
    testSttTesting: '🧪 Testing STT API connection...',
    testSttSuccess: '✅ STT API connection tested successfully! Transcription: ',
    testSttError: '❌ STT API Error: ',
    testSttMissingSettings: '❌ Please fill out all STT API settings first',
    extensionSettings: 'Extension Settings',
    clearEmailLabel: 'Clear email content after submit',
    clearEmailDesc: 'Clears the email body before inserting the AI response'
  };
  
  const fallbackT = key => fallbackMessages[key] || key;
  applyTranslations(fallbackT);
  return fallbackT;
}

async function applyTranslations(t) {
  document.title = `⚙️ ${t('extensionName')} - ${t('settingsTitle')}`;
  
  // Translate all data-i18n elements
  document.querySelectorAll('[data-i18n]').forEach(element => {
    const key = element.getAttribute('data-i18n');
    if (key) {
      element.innerText = t(key);
    }
  });

  // Translate placeholders
  document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
    const key = element.getAttribute('data-i18n-placeholder');
    element.placeholder = t(key);
  });

  // Reset status
  const statusElement = document.getElementById('status');
  if (statusElement) {
    statusElement.innerText = '';
  }
}

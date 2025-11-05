/**
 * Internationalization Module
 * Handles translation and localization
 */

/**
 * Load translations for specified language
 */
export async function loadI18n() {
  let langSetting = await browser.storage.local.get('uiLanguage');
  const lang = langSetting.uiLanguage || 'en';
  
  const messagesUrl = browser.runtime.getURL(`locales/${lang}/messages.json`);
  
  try {
    const response = await fetch(messagesUrl);
    if (!response.ok) {
      throw new Error(`Failed to load messages: ${response.status}`);
    }
    const messages = await response.json();

    const t = (key) => {
      if (key.startsWith('alerts.')) {
        const nestedKey = key.split('.')[1];
        return messages.alerts?.[nestedKey]?.message || key;
      }
      return messages[key]?.message || key;
    };

    console.log('i18n loaded for language:', lang);
    return t;
  } catch (error) {
    console.error('Failed to load i18n:', error);
    return getFallbackTranslations();
  }
}

/**
 * Get fallback translations (English)
 */
function getFallbackTranslations() {
  const fallbackMessages = {
    'alerts.noEmailOpen': 'Please open or display an email first.',
    'alerts.noMessageSelected': 'No message selected.',
    'alerts.apiSettingsMissing': 'Please save API URL, API Key, and Model in settings first.',
    'alerts.sttSettingsMissing': 'Please enter STT API in settings first!',
    'noMessageContextMsg': 'No message or reply draft open. Please open an email or reply first.',
    'generalError': 'Error: ',
    'speechRecognitionError': 'Speech recognition error: ',
    'noInstructionsProvided': 'Please provide instructions for the AI.',
    'popupTitle': 'AI Mail Assistant',
    'settingsBtn': '⚙️ Settings',
    'voiceInputBtn': '🎤 Voice Input',
    'stopRecordingBtn': '⏹️ Stop Recording',
    'submitBtn': '📤 Submit',
    'cancelBtn': '❌ Cancel',
    'promptInputPlaceholder': 'Enter your instructions for the AI here...',
    'recordingInProgress': '🎤 Recording...',
    'transcribing': 'Transcribing...',
    'generating': '📤 Generating...'
  };
  
  const fallbackT = (key) => fallbackMessages[key] || key;
  console.log('Using fallback i18n (English)');
  return fallbackT;
}

/**
 * Apply translations to page elements
 */
export async function localizePage(t) {
  // Translate all elements with data-i18n attribute
  const elements = document.querySelectorAll('[data-i18n]');
  elements.forEach(element => {
    const key = element.getAttribute('data-i18n');
    element.textContent = t(key);
  });

  // Translate placeholders
  const placeholderElements = document.querySelectorAll('[data-i18n-placeholder]');
  placeholderElements.forEach(element => {
    const key = element.getAttribute('data-i18n-placeholder');
    element.setAttribute('placeholder', t(key));
  });

  console.log('Page localization completed');
}

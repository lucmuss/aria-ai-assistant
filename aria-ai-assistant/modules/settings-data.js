/**
 * Settings Data Module
 * Handles loading and saving settings
 */

/**
 * Get donation URL from app config
 */
export async function getDonationUrl() {
  try {
    // Import js-yaml dynamically
    const yaml = window.jsyaml;
    const configUrl = browser.runtime.getURL('app-config.yaml');
    const response = await fetch(configUrl);
    if (response.ok) {
      const yamlText = await response.text();
      const config = yaml.load(yamlText);
      return config.donation_url || 'https://www.paypal.com/pool/9jCVLXPPmR?sr=wccr';
    }
  } catch (error) {
    console.error('Failed to load donation URL:', error);
  }
  return 'https://www.paypal.com/pool/9jCVLXPPmR?sr=wccr'; // Fallback
}

/**
 * Get autoresponse default message from app config
 */
export async function getAutoresponseDefault() {
  try {
    // Import js-yaml dynamically
    const yaml = window.jsyaml;
    const configUrl = browser.runtime.getURL('app-config.yaml');
    const response = await fetch(configUrl);
    if (response.ok) {
      const yamlText = await response.text();
      const config = yaml.load(yamlText);
      return config.autoresponse_default || 'Write a short and polite confirmation that you have received the email. If the email contains an appointment, confirm it and wish best regards.';
    }
  } catch (error) {
    console.error('Failed to load autoresponse default:', error);
  }
  return 'Write a short and polite confirmation that you have received the email. If the email contains an appointment, confirm it and wish best regards.'; // Fallback
}

/**
 * Get default system prompt from app config
 */
export async function getDefaultSystemPrompt() {
  try {
    // Import js-yaml dynamically
    const yaml = window.jsyaml;
    const configUrl = browser.runtime.getURL('app-config.yaml');
    const response = await fetch(configUrl);
    if (response.ok) {
      const yamlText = await response.text();
      const config = yaml.load(yamlText);
      return config.system_prompt_template || 'You are a helpful email assistant.';
    }
  } catch (error) {
    console.error('Failed to load default system prompt:', error);
  }
  return 'You are a helpful email assistant.'; // Fallback
}

/**
 * Load settings from storage
 */
export async function loadSettings() {
  let settings = await browser.storage.local.get();
  
  // Chat API Settings
  document.getElementById('chatApiUrl').value = settings.chat?.apiUrl || '';
  document.getElementById('chatApiKey').value = settings.chat?.apiKey || '';
  document.getElementById('chatModel').value = settings.chat?.model || 'gpt-4o-mini';
  document.getElementById('chatTemperature').value = settings.chat?.temperature || 1.0;
  document.getElementById('chatMaxTokens').value = settings.chat?.maxTokens || 2000;

  // Extension Settings
  let extension = settings.extension || {};
  document.getElementById('extensionContextSize').value = extension.contextSize || 5;
  document.getElementById('extensionIncludeSender').checked = extension.includeSender || false;
  document.getElementById('clearEmailAfterSubmit').checked = extension.clearEmailAfterSubmit || false;

  // STT Settings
  let stt = settings.stt || {};
  document.getElementById('sttApiUrl').value = stt.apiUrl || '';
  document.getElementById('sttApiKey').value = stt.apiKey || '';
  document.getElementById('sttModel').value = stt.model || 'whisper-1';
  document.getElementById('sttLanguage').value = stt.language || '';
  
  // UI Language
  if (!window.initialLanguageSet) {
    document.getElementById('uiLanguage').value = settings.uiLanguage || 'de';
    window.initialLanguageSet = true;
  }

  // Tone and Length Settings
  if (settings.tone) {
    document.getElementById('chatTone').value = settings.tone;
  } else {
    document.getElementById('chatTone').value = 'none';
  }
  
  if (settings.length) {
    document.getElementById('chatLength').value = settings.length;
  } else {
    document.getElementById('chatLength').value = 'none';
  }

  // Load generation counter
  const generatedEmails = settings.generatedEmails || 0;
  const t = window.currentT || ((key) => key);
  document.getElementById('generationCounter').innerText = `${t('generatedEmailsLabel')} ${generatedEmails}`;
  
  // Load current system prompt if available, otherwise load default from config
  if (settings.currentSystemPrompt) {
    document.getElementById('systemPromptContent').value = settings.currentSystemPrompt;
  } else {
    // Load default system prompt from YAML config
    getDefaultSystemPrompt().then(defaultPrompt => {
      document.getElementById('systemPromptContent').value = defaultPrompt;
    }).catch(error => {
      console.error('Failed to load default system prompt:', error);
      document.getElementById('systemPromptContent').value = 'You are a helpful email assistant.';
    });
  }

  // Load current system prompt name if available, otherwise set to "Default"
  if (settings.currentSystemPromptName) {
    document.getElementById('systemPromptName').value = settings.currentSystemPromptName;
  } else {
    document.getElementById('systemPromptName').value = 'Default';
  }
}

/**
 * Save settings to storage
 */
export async function saveSettings(t) {
  const settings = {
    uiLanguage: document.getElementById('uiLanguage').value,
    chat: {
      apiUrl: document.getElementById('chatApiUrl').value,
      apiKey: document.getElementById('chatApiKey').value,
      model: document.getElementById('chatModel').value,
      temperature: parseFloat(document.getElementById('chatTemperature').value),
      maxTokens: parseInt(document.getElementById('chatMaxTokens').value)
    },
    extension: {
      contextSize: parseInt(document.getElementById('extensionContextSize').value),
      includeSender: document.getElementById('extensionIncludeSender').checked,
      clearEmailAfterSubmit: document.getElementById('clearEmailAfterSubmit').checked
    },
    stt: {
      apiUrl: document.getElementById('sttApiUrl').value,
      apiKey: document.getElementById('sttApiKey').value,
      model: document.getElementById('sttModel').value,
      language: document.getElementById('sttLanguage').value
    },
    tone: document.getElementById('chatTone').value,
    length: document.getElementById('chatLength').value
  };

  await browser.storage.local.set(settings);

  const statusElement = document.getElementById('status');
  statusElement.innerText = t('savedMsg');
  statusElement.style.color = 'green';
  statusElement.style.display = 'block';
}

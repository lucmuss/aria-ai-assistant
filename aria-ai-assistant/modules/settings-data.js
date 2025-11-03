/**
 * Settings Data Module
 * Handles loading and saving settings
 */

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
  document.getElementById('chatSystemPrompt').value = settings.chat?.systemPrompt || '';

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
      maxTokens: parseInt(document.getElementById('chatMaxTokens').value),
      systemPrompt: document.getElementById('chatSystemPrompt').value
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
}

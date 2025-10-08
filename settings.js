async function loadI18n() {
  let langSetting = await browser.storage.local.get("uiLanguage");
  const lang = langSetting.uiLanguage || browser.i18n.getUILanguage().split("-")[0] || "en";
  
  // Korrekter Pfad für Ihr locales-Verzeichnis
  const messagesUrl = browser.runtime.getURL(`locales/${lang}/messages.json`);
  
  try {
    const response = await fetch(messagesUrl);
    if (!response.ok) {
      throw new Error(`Failed to load messages: ${response.status}`);
    }
    const messages = await response.json();

    const t = key => messages[key]?.message || key;

    // Alle Texte übersetzen
    document.title = t("settingsTitle");
    document.querySelector("[data-i18n='settingsTitle']").innerText = t("settingsTitle");
    document.querySelector("[data-i18n='saveBtn']").innerText = t("saveBtn");
    document.querySelector("[data-i18n='languageLabel']").innerText = t("languageLabel");
    document.querySelector("[data-i18n='languageDesc']").innerText = t("languageDesc");

    // Übersetze alle Tabellen-Überschriften und Beschreibungen
    document.querySelectorAll("[data-i18n]").forEach(element => {
      const key = element.getAttribute("data-i18n");
      if (key && key !== "settingsTitle" && key !== "saveBtn" && key !== "languageLabel" && key !== "languageDesc") {
        element.innerText = t(key);
      }
    });

    // Übersetze Placeholder
    document.querySelectorAll("[data-i18n-placeholder]").forEach(element => {
      const key = element.getAttribute("data-i18n-placeholder");
      element.placeholder = t(key);
    });

    // Status zurücksetzen
    document.getElementById("status").innerText = "";

    return t;
  } catch (error) {
    console.error("Failed to load i18n:", error);
    // Fallback falls die Dateien nicht geladen werden können
    const fallbackT = key => {
      const fallbackMessages = {
        "settingsTitle": "AI Mail Assistant Settings",
        "saveBtn": "Save Settings", 
        "languageLabel": "Interface Language:",
        "languageDesc": "Choose the user interface language",
        "savedMsg": "Settings saved successfully!",
        "chatSettings": "Chat API Settings",
        "apiUrlLabel": "API URL:",
        "apiUrlPlaceholder": "https://api.openai.com/v1/chat/completions",
        "apiUrlDesc": "Endpoint for your model (e.g. OpenAI or local ULAMA server)",
        "apiKeyLabel": "API Key:",
        "apiKeyPlaceholder": "sk-xxxxxxxxxxxx",
        "apiKeyDesc": "Your API key from the provider (e.g. OpenAI, Ollama etc.)",
        "modelLabel": "Model:",
        "modelDesc": "Model name (e.g. gpt-4o, llama3, mistral)",
        "temperatureLabel": "Temperature:",
        "temperatureDesc": "Controls creativity (0 = factual, 1 = creative)",
        "maxTokensLabel": "Max Tokens:",
        "maxTokensDesc": "Maximum length of the response",
        "systemPromptLabel": "System Prompt:",
        "systemPromptPlaceholder": "You are a polite email assistant.",
        "systemPromptDesc": "Default text for the assistant (e.g. tone or style)",
        "contextSizeLabel": "Context Size:",
        "contextSizeDesc": "Number of previous messages to include as context",
        "includeSenderLabel": "Include Sender:",
        "includeSenderDesc": "Includes the sender address in the prompt context",
        "sttSettings": "Speech-to-Text Settings",
        "sttApiUrlLabel": "STT API URL:",
        "sttApiUrlPlaceholder": "https://api.openai.com/v1/audio/transcriptions",
        "sttApiUrlDesc": "URL for speech transcription (e.g. Whisper)",
        "sttApiKeyLabel": "STT API Key:",
        "sttApiKeyPlaceholder": "sk-xxxxxxxxxxxx",
        "sttApiKeyDesc": "API key for the STT provider",
        "sttModelLabel": "Model:",
        "sttModelDesc": "Speech model (e.g. whisper-1 or local tiny)",
        "sttLanguageLabel": "Language:",
        "sttLanguageDesc": "Recognition language (empty = automatic)"
      };
      return fallbackMessages[key] || key;
    };
    
    document.title = "AI Mail Assistant Settings";
    document.querySelector("[data-i18n='settingsTitle']").innerText = "AI Mail Assistant Settings";
    document.querySelector("[data-i18n='saveBtn']").innerText = "Save Settings";
    document.querySelector("[data-i18n='languageLabel']").innerText = "Interface Language:";
    document.querySelector("[data-i18n='languageDesc']").innerText = "Choose the user interface language";

    return fallbackT;
  }
}

async function loadSettings() {
  let settings = await browser.storage.local.get();
  
  // Chat API Einstellungen
  document.getElementById("chatApiUrl").value = settings.chat?.apiUrl || "";
  document.getElementById("chatApiKey").value = settings.chat?.apiKey || "";
  document.getElementById("chatModel").value = settings.chat?.model || "gpt-4o-mini";
  document.getElementById("chatTemperature").value = settings.chat?.temperature || 1.0;
  document.getElementById("chatMaxTokens").value = settings.chat?.maxTokens || 2000;
  document.getElementById("chatSystemPrompt").value = settings.chat?.systemPrompt || "";
  document.getElementById("chatContextSize").value = settings.chat?.contextSize || 5;
  document.getElementById("chatIncludeSender").checked = settings.chat?.includeSender || false;

  // STT Einstellungen
  let stt = settings.stt || {};
  document.getElementById("sttApiUrl").value = stt.apiUrl || "";
  document.getElementById("sttApiKey").value = stt.apiKey || "";
  document.getElementById("sttModel").value = stt.model || "whisper-1";
  document.getElementById("sttLanguage").value = stt.language || "";
  
  // UI Sprache - WICHTIG: Nur beim initialen Laden setzen
  // Nicht bei Sprachwechsel überschreiben
  if (!window.initialLanguageSet) {
    document.getElementById("uiLanguage").value = settings.uiLanguage || "de";
    window.initialLanguageSet = true;
  }
}

async function saveSettings(t) {
  const settings = {
    uiLanguage: document.getElementById("uiLanguage").value,
    chat: {
      apiUrl: document.getElementById("chatApiUrl").value,
      apiKey: document.getElementById("chatApiKey").value,
      model: document.getElementById("chatModel").value,
      temperature: parseFloat(document.getElementById("chatTemperature").value),
      maxTokens: parseInt(document.getElementById("chatMaxTokens").value),
      systemPrompt: document.getElementById("chatSystemPrompt").value,
      contextSize: parseInt(document.getElementById("chatContextSize").value),
      includeSender: document.getElementById("chatIncludeSender").checked
    },
    stt: {
      apiUrl: document.getElementById("sttApiUrl").value,
      apiKey: document.getElementById("sttApiKey").value,
      model: document.getElementById("sttModel").value,
      language: document.getElementById("sttLanguage").value
    }
  };

  await browser.storage.local.set(settings);
  document.getElementById("status").innerText = t("savedMsg");
  
  // Nach dem Speichern die Übersetzungen sofort aktualisieren
  await updateTranslations();
}

async function updateTranslations() {
  const t = await loadI18n();
  return t;
}

// Event Listener für Sprachänderung
function setupLanguageChangeListener() {
  document.getElementById("uiLanguage").addEventListener("change", async () => {
    // Sofortige Aktualisierung der Übersetzungen bei Sprachwechsel
    await updateTranslations();
    
    // Automatisch speichern bei Sprachwechsel
    const t = await updateTranslations();
    await saveSettings(t);
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  const t = await loadI18n();
  await loadSettings();
  setupLanguageChangeListener();
  document.getElementById("saveBtn").addEventListener("click", () => saveSettings(t));
});

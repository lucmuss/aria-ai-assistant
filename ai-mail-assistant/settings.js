async function applyTranslations(t) {
  // Apply translations to all elements
  document.title = `⚙️ ${t("extensionName")} - ${t("settingsTitle")}`;
  document.querySelector("[data-i18n='settingsTitle']").innerText = t("settingsTitle");
  document.querySelector("[data-i18n='saveBtn']").innerText = t("saveBtn");
  document.querySelector("[data-i18n='languageLabel']").innerText = t("languageLabel");
  document.querySelector("[data-i18n='languageDesc']").innerText = t("languageDesc");

  // Translate all data-i18n elements
  document.querySelectorAll("[data-i18n]").forEach(element => {
    const key = element.getAttribute("data-i18n");
    if (key) {
      element.innerText = t(key);
    }
  });

  // Translate buttons with specific IDs
  const buttonIds = ["testApiBtn", "exportBtn", "importBtn"];
  buttonIds.forEach(id => {
    const element = document.getElementById(id);
    if (element) {
      element.innerText = t(id);
    }
  });

  // Translate placeholders
  document.querySelectorAll("[data-i18n-placeholder]").forEach(element => {
    const key = element.getAttribute("data-i18n-placeholder");
    element.placeholder = t(key);
  });

  // Reset status
  document.getElementById("status").innerText = "";
}

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

    applyTranslations(t);

    return t;
  } catch (error) {
    console.error("Failed to load i18n:", error);
    // Fallback falls die Dateien nicht geladen werden können
    const fallbackT = key => {
      const fallbackMessages = {
        "extensionName": "AI Mail Assistant",
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
        "sttLanguageDesc": "Recognition language (empty = automatic)",
        "exportBtn": "Export Settings",
        "importBtn": "Import Settings",
        "exportSuccessMsg": "Settings exported successfully!",
        "importSuccessMsg": "Settings imported successfully!",
        "importErrorMsg": "Import error: ",
        "testApiBtn": "🧪 Test API",
        "testApiTesting": "🧪 Testing API connection...",
        "testApiSuccess": "✅ API connection tested successfully!",
        "testApiError": "❌ API Error: ",
        "testApiMissingSettings": "❌ Please fill out all API settings first"
      };
      return fallbackMessages[key] || key;
    };

    // Auch im Fallback die Buttons übersetzen
    const buttonIds = ["testApiBtn", "exportBtn", "importBtn"];
    buttonIds.forEach(id => {
      const element = document.getElementById(id);
      if (element) {
        element.innerText = fallbackT(id);
      }
    });
    
    document.title = `⚙️ ${fallbackT("extensionName")} - ${fallbackT("settingsTitle")}`;
    document.querySelector("[data-i18n='settingsTitle']").innerText = fallbackT("settingsTitle");
    document.querySelector("[data-i18n='saveBtn']").innerText = fallbackT("saveBtn");
    document.querySelector("[data-i18n='languageLabel']").innerText = fallbackT("languageLabel");
    document.querySelector("[data-i18n='languageDesc']").innerText = fallbackT("languageDesc");

    applyTranslations(fallbackT);

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
  const statusElement = document.getElementById("status");
  statusElement.innerText = t("savedMsg");
  statusElement.style.color = "green";
}

async function updateTranslations() {
  const t = await loadI18n(); // This now calls applyTranslations internally
  window.currentT = t; // Store globally for listeners
  return t;
}

// Event Listener für Sprachänderung
function setupLanguageChangeListener(t) {
  document.getElementById("uiLanguage").addEventListener("change", async () => {
    // Automatisch speichern bei Sprachwechsel
    await saveSettings(t);
    
    // Reload the settings tab to apply the new language
    location.reload();
  });
}

// API-Test-Funktion
async function testApi(t) {
  const statusElement = document.getElementById("status");
  
  // API-Einstellungen aus dem Formular lesen
  const apiUrl = document.getElementById("chatApiUrl").value.trim();
  const apiKey = document.getElementById("chatApiKey").value.trim();
  const model = document.getElementById("chatModel").value.trim();
  
  // Prüfen ob alle Felder ausgefüllt sind
  if (!apiUrl || !apiKey || !model) {
    statusElement.textContent = t("testApiMissingSettings");
    statusElement.style.color = "red";
    return;
  }
  
  try {
    statusElement.textContent = t("testApiTesting");
    statusElement.style.color = "blue";
    
    // Test-Request an die API senden
    const testBody = {
      model: model,
      messages: [
        { role: "system", content: "You are a test assistant." },
        { role: "user", content: "Hello, this is a test. Please respond with 'Test successful'." }
      ],
      max_tokens: 50,
      temperature: 0.1
    };
    
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(testBody)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    
    const data = await response.json();
    
    // Erfolgreiche Antwort
    statusElement.textContent = t("testApiSuccess");
    statusElement.style.color = "green";
    console.log("API-Test erfolgreich:", data);
    
  } catch (error) {
    console.error("API-Test fehlgeschlagen:", error);
    statusElement.textContent = t("testApiError") + error.message;
    statusElement.style.color = "red";
  }
}

// Export-Funktion - API Keys werden jetzt komplett exportiert
async function exportSettings(t) {
  const settings = await browser.storage.local.get();
  
  // Exportiere alle Daten OHNE Maskierung der API-Keys
  const exportData = {
    ...settings,
    exportInfo: {
      version: "1.0",
      exportDate: new Date().toISOString(),
      extension: "AI Mail Assistant",
      note: t("exportNote") || "This file contains sensitive API keys. Please keep it safe!"
    }
  };
  
  const dataStr = JSON.stringify(exportData, null, 2);
  const dataBlob = new Blob([dataStr], { type: "application/json" });
  
  const url = URL.createObjectURL(dataBlob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `ai-mail-assistant-settings-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  document.getElementById("status").innerText = t("exportSuccessMsg");
}

// Import-Funktion
async function importSettings(file, t) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        const importedData = JSON.parse(e.target.result);
        
        // Validiere die importierten Daten
        if (!importedData.chat || !importedData.stt) {
          throw new Error(t("importErrorMsg") || "Invalid file format");
        }
        
        // Übernehme die Einstellungen - API-Keys werden komplett übernommen
        const settingsToImport = {
          uiLanguage: importedData.uiLanguage || "en",
          chat: {
            apiUrl: importedData.chat.apiUrl || "",
            apiKey: importedData.chat.apiKey || "", // Vollständiger API-Key wird übernommen
            model: importedData.chat.model || "gpt-4o-mini",
            temperature: importedData.chat.temperature || 1.0,
            maxTokens: importedData.chat.maxTokens || 2000,
            systemPrompt: importedData.chat.systemPrompt || "",
            contextSize: importedData.chat.contextSize || 5,
            includeSender: importedData.chat.includeSender || false
          },
          stt: {
            apiUrl: importedData.stt.apiUrl || "",
            apiKey: importedData.stt.apiKey || "", // Vollständiger API-Key wird übernommen
            model: importedData.stt.model || "whisper-1",
            language: importedData.stt.language || ""
          }
        };
        
        // Speichere die importierten Einstellungen
        await browser.storage.local.set(settingsToImport);
        
        // Lade die neuen Einstellungen in die UI
        await loadSettings();
        
        // Aktualisiere die Übersetzungen
        const newT = await updateTranslations();
        
        document.getElementById("status").innerText = newT("importSuccessMsg");
        resolve();
      } catch (error) {
        console.error("Import error:", error);
        document.getElementById("status").innerText = t("importErrorMsg") + error.message;
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error(t("importErrorMsg") || "Error reading file"));
    };
    
    reader.readAsText(file);
  });
}

// Event Listener für Import/Export und API-Test
function setupImportExportListeners(t) {
  // Remove existing listeners to avoid duplicates
  const testBtn = document.getElementById("testApiBtn");
  const exportBtn = document.getElementById("exportBtn");
  const importBtn = document.getElementById("importBtn");
  const importFile = document.getElementById("importFile");

  testBtn.removeEventListener("click", testBtn._listener);
  exportBtn.removeEventListener("click", exportBtn._listener);
  importBtn.removeEventListener("click", importBtn._listener);
  importFile.removeEventListener("change", importFile._listener);

  // API-Test Button
  testBtn._listener = () => testApi(t);
  testBtn.addEventListener("click", testBtn._listener);
  
  // Export Button
  exportBtn._listener = () => exportSettings(t);
  exportBtn.addEventListener("click", exportBtn._listener);
  
  // Import Button
  importBtn._listener = () => {
    document.getElementById("importFile").click();
  };
  importBtn.addEventListener("click", importBtn._listener);
  
  // File Input
  importFile._listener = async (e) => {
    const file = e.target.files[0];
    if (file) {
      await importSettings(file, t);
      location.reload();
      // Reset file input
      e.target.value = "";
    }
  };
  importFile.addEventListener("change", importFile._listener);
}

function setupSaveBtnListener(t) {
  const saveBtn = document.getElementById("saveBtn");
  saveBtn.removeEventListener("click", saveBtn._listener);
  saveBtn._listener = () => saveSettings(t);
  saveBtn.addEventListener("click", saveBtn._listener);
}

document.addEventListener("DOMContentLoaded", async () => {
  const t = await loadI18n();
  window.currentT = t;
  await loadSettings();
  setupLanguageChangeListener(t);
  setupImportExportListeners(t);
  setupSaveBtnListener(t);
});

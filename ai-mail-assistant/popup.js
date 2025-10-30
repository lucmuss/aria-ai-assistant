async function getActiveMailTab() {
  try {
    // Zuerst versuchen, den aktuellen MailTab zu erhalten
    const mailTab = await browser.mailTabs.getCurrent();
    if (mailTab) {
      console.log("MailTab gefunden:", mailTab);
      return mailTab;
    }
  } catch (error) {
    console.log("Kein MailTab verfügbar:", error.message);
  }

  // Fallback: Aktive Tabs abfragen
  const tabs = await browser.tabs.query({ active: true, currentWindow: true });
  if (!tabs || tabs.length === 0) {
    console.log("Keine aktiven Tabs gefunden");
    return null;
  }
  
  const tab = tabs[0];
  console.log("Aktiver Tab:", tab);
  
  // Prüfen ob es sich um einen MailTab handelt
  if (tab.mailTab) {
    console.log("Tab ist ein MailTab");
    return tab;
  }
  
  return null;
}

async function getSettings() {
  let settings = await browser.storage.local.get("chat");
  return settings.chat || {};
}

async function getSTTSettings() {
  let settings = await browser.storage.local.get("stt");
  return settings.stt || {};
}

async function loadI18n() {
  let langSetting = await browser.storage.local.get("uiLanguage");
  const lang = langSetting.uiLanguage || "en";
  
  const messagesUrl = browser.runtime.getURL(`locales/${lang}/messages.json`);
  
  try {
    const response = await fetch(messagesUrl);
    if (!response.ok) {
      throw new Error(`Failed to load messages: ${response.status}`);
    }
    const messages = await response.json();

    const t = (key) => {
      if (key.startsWith("alerts.")) {
        const nestedKey = key.split(".")[1];
        return messages.alerts?.[nestedKey]?.message || key;
      }
      return messages[key]?.message || key;
    };

    console.log('Custom i18n loaded for language:', lang);
    return t;
  } catch (error) {
    console.error("Failed to load custom i18n:", error);
    const fallbackMessages = {
      "alerts.noEmailOpen": "Please open or display an email first.",
      "alerts.noMessageSelected": "No message selected.",
      "alerts.apiSettingsMissing": "Please save API URL, API Key, and Model in settings first.",
      "alerts.sttSettingsMissing": "Please enter STT API in settings first!",
      "generalError": "Error: ",
      "speechRecognitionError": "Speech recognition error: ",
      "noInstructionsProvided": "Please provide instructions for the AI.",
      "popupTitle": "AI Mail Assistant",
      "generateReplyBtn": "✉️ Generate Reply",
      "settingsBtn": "⚙️ Settings",
      "voiceInputBtn": "🎤 Voice Input",
      "textInputBtn": "📝 Text Input",
      "submitBtn": "📤 Submit",
      "cancelBtn": "❌ Cancel",
      "promptInputPlaceholder": "Enter your instructions for the AI here..."
    };
    const fallbackT = (key) => fallbackMessages[key] || key;
    console.log('Using fallback i18n (English)');
    return fallbackT;
  }
}

async function callOpenAI(prompt) {
  const settings = await getSettings();

  if (!settings.apiUrl || !settings.apiKey || !settings.model) {
    throw new Error(window.t("alerts.apiSettingsMissing"));
  }

  const body = {
    model: settings.model,
    messages: [
      { role: "system", content: settings.systemPrompt || "Du bist ein hilfreicher E-Mail-Assistent." },
      { role: "user", content: prompt }
    ],
    temperature: settings.temperature || 1.0,
    max_tokens: settings.maxTokens || 2000
  };

  const response = await fetch(settings.apiUrl, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${settings.apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    throw new Error("API-Fehler: " + (await response.text()));
  }

  const data = await response.json();
  return data.choices[0].message.content.trim();
}

async function transcribeAudio() {
  let sttSettings = await getSTTSettings();

  if (!sttSettings.apiUrl || !sttSettings.apiKey || !sttSettings.model) {
    throw new Error(window.t("alerts.sttSettingsMissing"));
  }

  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const mediaRecorder = new MediaRecorder(stream);
  let audioChunks = [];

  return new Promise((resolve, reject) => {
    mediaRecorder.ondataavailable = e => audioChunks.push(e.data);
    mediaRecorder.onstop = async () => {
      try {
        let audioBlob = new Blob(audioChunks, { type: "audio/wav" });

        const formData = new FormData();
        formData.append("file", audioBlob, "input.wav");
        formData.append("model", sttSettings.model);
        if (sttSettings.language) formData.append("language", sttSettings.language);

        const resp = await fetch(sttSettings.apiUrl, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${sttSettings.apiKey}`
          },
          body: formData
        });

        if (!resp.ok) throw new Error(await resp.text());

        const data = await resp.json();
        let transcript = data.text || "";
        resolve(transcript);
      } catch (err) {
        reject(err);
      } finally {
        stream.getTracks().forEach(track => track.stop());
      }
    };

    mediaRecorder.start();
    setTimeout(() => {
      mediaRecorder.stop();
    }, 5000); // 5 Sekunden Aufnahme
  });
}

async function getEmailContext() {
  console.log('getEmailContext: Starte Kontext-Erkennung...');
  
  const mailTab = await getActiveMailTab();
  if (!mailTab) {
    console.log('getEmailContext: Kein MailTab gefunden, prüfe Composer...');
    // Prüfe Composer-Kontext
    try {
      const composeSessions = await browser.compose.listComposeSessions();
      console.log('getEmailContext: Composer-Sessions:', composeSessions);
      
      if (composeSessions && composeSessions.length > 0) {
        const composeDetails = await browser.compose.getComposeDetails(composeSessions[0].id);
        console.log('getEmailContext: Composer-Details:', composeDetails);
        
        if (composeDetails && composeDetails.inReplyTo) {
          const message = await browser.messages.get(composeDetails.inReplyTo);
          const full = await browser.messages.getFull(message.id);
          let body = "";
          for (let part of Object.values(full.parts)) {
            if (part.contentType === "text/plain" && part.body) {
              body = part.body;
              break;
            }
          }
          
          return {
            messageId: message.id,
            emailBody: body,
            subject: message.subject,
            sender: message.author,
            context: 'composer'
          };
        }
      }
    } catch (error) {
      console.error('getEmailContext: Fehler beim Composer-Check:', error);
    }
    
    throw new Error(window.t("alerts.noEmailOpen"));
  }

  const message = await browser.messageDisplay.getDisplayedMessage(mailTab.id);
  console.log('getEmailContext: Angezeigte Nachricht:', message);
  
  if (!message) {
    throw new Error(window.t("alerts.noMessageSelected"));
  }

  const full = await browser.messages.getFull(message.id);
  let body = "";
  for (let part of Object.values(full.parts)) {
    if (part.contentType === "text/plain" && part.body) {
      body = part.body;
      break;
    }
  }

  return {
    messageId: message.id,
    emailBody: body,
    subject: message.subject,
    sender: message.author,
    context: 'viewer'
  };
}

async function insertTextAtCursor(text, context = 'viewer') {
  console.log('insertTextAtCursor: Context:', context);
  
  if (context === 'composer') {
    // Im Composer-Kontext: Text in das aktuelle Composer-Fenster einfügen
    try {
      const composeSessions = await browser.compose.listComposeSessions();
      if (composeSessions && composeSessions.length > 0) {
        // Text an den aktuellen Composer anhängen
        await browser.compose.setComposeDetails(composeSessions[0].id, {
          body: text
        });
        console.log('Text erfolgreich in Composer eingefügt');
        return;
      }
    } catch (error) {
      console.error('Fehler beim Einfügen in Composer:', error);
      throw new Error(window.t("generalError") + error.message);
    }
  } else {
    // Im Viewer-Kontext: Neue Antwort mit Text erstellen
    const mailTab = await getActiveMailTab();
    if (!mailTab) {
      throw new Error(window.t("alerts.noEmailOpen"));
    }

    const message = await browser.messageDisplay.getDisplayedMessage(mailTab.id);
    if (!message) {
      throw new Error(window.t("alerts.noMessageSelected"));
    }

    await browser.compose.beginReply(message.id, { body: text });
  }
}

async function openSettingsTab() {
  const settingsURL = browser.runtime.getURL('settings.html');

  // 1) Find existing settings tab
  let tabs = await browser.tabs.query({ url: settingsURL });
  let settingsTab;
  if (tabs.length) {
    settingsTab = tabs[0];
    // Activate existing tab
    await browser.tabs.update(settingsTab.id, { active: true });
  } else {
    // Create a new settings tab
    settingsTab = await browser.tabs.create({ url: settingsURL, active: true });
  }

  // 2) Focus the window containing that tab
  await browser.windows.update(settingsTab.windowId, { focused: true });

  // 3) Close the popup
  window.close();
}

// Vollständige Lokalisierungs-Funktion
async function localizePage(t) {
  // Alle Elemente mit data-i18n-Attribut übersetzen
  const elements = document.querySelectorAll('[data-i18n]');
  elements.forEach(element => {
    const key = element.getAttribute('data-i18n');
    element.textContent = t(key);
  });

  // Placeholder übersetzen
  const placeholderElements = document.querySelectorAll('[data-i18n-placeholder]');
  placeholderElements.forEach(element => {
    const key = element.getAttribute('data-i18n-placeholder');
    element.setAttribute('placeholder', t(key));
  });

  console.log('Lokalisierung abgeschlossen');
}

// Lokalisierung nach Sprachwechsel anwenden
async function refreshTranslations(t) {
  await localizePage(t);
}

// UI Event Handler
document.addEventListener('DOMContentLoaded', async function() {
  // Load custom i18n
  const t = await loadI18n();
  window.t = t;
  
  // Lokalisierung anwenden
  await localizePage(t);
  
  const mainSection = document.getElementById('mainSection');
  const inputSection = document.getElementById('inputSection');
  const generateReplyBtn = document.getElementById('generateReplyBtn');
  const settingsBtn = document.getElementById('settingsBtn');
  const voiceInputBtn = document.getElementById('voiceInputBtn');
  const textInputBtn = document.getElementById('textInputBtn');
  const submitBtn = document.getElementById('submitBtn');
  const cancelBtn = document.getElementById('cancelBtn');
  const promptInput = document.getElementById('promptInput');

  // Hauptfunktion: Antwort generieren
  generateReplyBtn.addEventListener('click', async () => {
    console.log('Generate Reply Button geklickt');
    try {
      // Prüfen ob eine E-Mail geöffnet ist
      console.log('Prüfe E-Mail-Kontext...');
      await getEmailContext();
      
      // UI umschalten
      console.log('Schalte UI um');
      mainSection.style.display = 'none';
      inputSection.style.display = 'block';
      promptInput.focus();
    } catch (err) {
      console.error('Fehler beim Generieren der Antwort:', err);
      alert(window.t("alerts.noEmailOpen") || err.message);
    }
  });

  // Einstellungen öffnen
  settingsBtn.addEventListener('click', openSettingsTab);

  // Spracheingabe
  voiceInputBtn.addEventListener('click', async () => {
    try {
      voiceInputBtn.disabled = true;
      voiceInputBtn.textContent = "🎤 Aufnahme läuft...";
      
      const transcript = await transcribeAudio();
      promptInput.value = transcript;
      submitBtn.style.display = 'block';
      
    } catch (err) {
      alert(window.t("speechRecognitionError") + err.message);
    } finally {
      voiceInputBtn.disabled = false;
      voiceInputBtn.textContent = window.t("voiceInputBtn");
    }
  });

  // Texteingabe - Textfeld fokussieren
  textInputBtn.addEventListener('click', () => {
    promptInput.focus();
    submitBtn.style.display = 'block';
  });

  // Abschicken
  submitBtn.addEventListener('click', async () => {
    try {
      const userPrompt = promptInput.value.trim();
      if (!userPrompt) {
        alert(window.t("noInstructionsProvided"));
        return;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = "📤 Wird generiert...";

      const emailContext = await getEmailContext();
      
      // Vollständiger Prompt mit E-Mail-Kontext und Benutzeranweisungen
      const fullPrompt = `E-Mail-Kontext:
Betreff: ${emailContext.subject}
Absender: ${emailContext.sender}
Nachricht: ${emailContext.emailBody}

Benutzeranweisungen: ${userPrompt}

Bitte schreibe eine passende Antwort basierend auf dem E-Mail-Kontext und den Benutzeranweisungen.`;

      const aiResponse = await callOpenAI(fullPrompt);
      
      // Antwort in die E-Mail einfügen
      await insertTextAtCursor(aiResponse, emailContext.context);
      
      // Popup schließen
      window.close();
      
    } catch (err) {
      console.error(err);
      alert(window.t("generalError") + err.message);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = window.t("submitBtn") || "📤 Submit";
    }
  });

  // Abbrechen
  cancelBtn.addEventListener('click', () => {
    mainSection.style.display = 'block';
    inputSection.style.display = 'none';
    promptInput.value = '';
    submitBtn.style.display = 'none';
  });
});

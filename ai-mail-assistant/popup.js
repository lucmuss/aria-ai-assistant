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
      "noMessageContextMsg": "No message or reply draft open. Please open an email or reply first.",
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

function stripHtml(text) {
  return text.replace(/<[^>]*>/g, '');
}

async function getEmailContext() {
  console.log('getEmailContext: Starte Kontext-Erkennung...');
  
  let message = null;
  let ctx = null;
  let windowInfo = null;
  
  try {
    windowInfo = await browser.windows.getCurrent();
    console.log('getEmailContext: Current window:', windowInfo);
    
    if (windowInfo.type === 'messageCompose') {
      console.log('getEmailContext: Composer context detected');
      const tabs = await browser.tabs.query({windowId: windowInfo.id, active: true});
      if (tabs.length > 0) {
        const composeTabId = tabs[0].id;
        const composeDetails = await browser.compose.getComposeDetails(composeTabId);
        console.log('getEmailContext: Compose details:', composeDetails);
        
        // Wenn wir Compose Details haben, behandle diesen Kontext
        if (composeDetails) {
          // Fall 1: Antwort auf eine existierende E-Mail (inReplyTo vorhanden)
          if (composeDetails.inReplyTo) {
            try {
              const compMsg = await browser.messages.get(composeDetails.inReplyTo);
              const full = await browser.messages.getFull(compMsg.id);
              let body = "";
              for (let part of Object.values(full.parts)) {
                if (part.contentType === "text/plain" && part.body) {
                  body = part.body;
                  break;
                }
              }
              
              return {
                messageId: compMsg.id,
                emailBody: body,
                subject: compMsg.subject,
                sender: compMsg.author,
                context: 'composer',
                tabId: composeTabId,
                windowId: windowInfo.id
              };
            } catch (error) {
              console.error('getEmailContext: Fehler beim Laden der Reply-Message:', error);
            }
          }
          
          // Fall 2: Neue E-Mail oder Draft ohne inReplyTo
          // Verwende die vorhandenen Compose-Details
          console.log('getEmailContext: Compose window ohne inReplyTo - verwende aktuelle Compose Details');
          return {
            messageId: null,
            emailBody: composeDetails.body || "",
            subject: composeDetails.subject || "",
            sender: composeDetails.to && composeDetails.to.length > 0 ? composeDetails.to[0] : "",
            context: 'composer',
            tabId: composeTabId,
            windowId: windowInfo.id
          };
        }
      }
    }
  } catch (error) {
    console.error('getEmailContext: Fehler beim Window/Compose-Check:', error);
  }

  // Fallback to viewer context
  console.log('getEmailContext: Checking viewer context...');
  const mailTab = await getActiveMailTab();
  if (mailTab) {
    try {
      message = await browser.messageDisplay.getDisplayedMessage(mailTab.id);
      console.log('getEmailContext: Angezeigte Nachricht:', message);
      if (message) {
        ctx = 'viewer';
      }
    } catch (error) {
      console.log('getEmailContext: Fehler beim Viewer-Check:', error);
    }
  }

  if (!message) {
    throw new Error(window.t("noMessageContextMsg") || "No message or reply draft open. Please open an email or reply first.");
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
    context: ctx
  };
}

async function insertTextAtCursor(text, context = 'viewer', tabId = null) {
  console.log('insertTextAtCursor: Context:', context, 'TabId:', tabId);
  
  if (context === 'composer') {
    // Im Composer-Kontext: Text in das aktuelle Composer-Fenster einfügen
    try {
      let composeTabId = tabId;
      if (!composeTabId) {
        const windowInfo = await browser.windows.getCurrent();
        if (windowInfo.type === 'messageCompose') {
          const tabs = await browser.tabs.query({windowId: windowInfo.id, active: true});
          if (tabs.length > 0) {
            composeTabId = tabs[0].id;
          }
        }
      }
      if (composeTabId) {
        const details = await browser.compose.getComposeDetails(composeTabId);
        let currentBody = details.body || '';
        const separator = currentBody.trim() ? '\n\n' : '';
        const newBody = currentBody + separator + text;
        await browser.compose.setComposeDetails(composeTabId, {
          body: newBody
        });
        console.log('Text appended to Composer');
        return;
      } else {
        throw new Error('No compose tab found');
      }
    } catch (error) {
      console.error('Fehler beim Einfügen in Composer:', error);
      throw new Error(window.t("generalError") + error.message);
    }
  } else {
    // Im Viewer-Kontext: Neue Antwort mit Text erstellen
    const mailTab = await getActiveMailTab();
    if (!mailTab) {
      throw new Error(window.t("noMessageContextMsg") || "No message or reply draft open. Please open an email or reply first.");
    }

    const message = await browser.messageDisplay.getDisplayedMessage(mailTab.id);
    if (!message) {
      throw new Error(window.t("noMessageContextMsg") || "No message or reply draft open. Please open an email or reply first.");
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
  
  const inputSection = document.getElementById('inputSection');
  const voiceInputBtn = document.getElementById('voiceInputBtn');
  const textInputBtn = document.getElementById('textInputBtn');
  const submitBtn = document.getElementById('submitBtn');
  const cancelBtn = document.getElementById('cancelBtn');
  const promptInput = document.getElementById('promptInput');

  // Speichere Eingabe bei Änderung
  promptInput.addEventListener('input', () => {
    browser.storage.local.set({ lastPrompt: promptInput.value });
  });

  // Lade gespeicherte Eingabe beim Öffnen des Input-Bereichs
  async function loadLastPrompt() {
    const result = await browser.storage.local.get('lastPrompt');
    if (result.lastPrompt) {
      promptInput.value = result.lastPrompt;
    }
  }

  // Initialisiere Input-Bereich
  async function initializeInput() {
    await loadLastPrompt();
    if (promptInput.value.trim()) {
      submitBtn.style.display = 'block';
    }
    promptInput.focus();
  }

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
      console.log('Email context:', emailContext);
      
      // Vollständiger Prompt mit E-Mail-Kontext und Benutzeranweisungen
      const fullPrompt = `E-Mail-Kontext:
Betreff: ${emailContext.subject}
Absender: ${emailContext.sender}
Nachricht: ${stripHtml(emailContext.emailBody)}
Erkenne die Sprache der Nachricht und antworte in derselben Sprache.

Benutzeranweisungen: ${userPrompt}

Bitte schreibe eine passende Antwort basierend auf dem E-Mail-Kontext und den Benutzeranweisungen. Formatiere die Antwort mit Zeilenumbrüchen und mehreren Absätzen, damit sie gut in Thunderbird als E-Mail-Körper eingefügt werden kann. Schreibe nur den Inhalt der E-Mail-Antwort, ohne den Betreff einzuschließen. Beginne die Antwort nicht mit 'AI response received:' oder ähnlichen Phrasen.`;

      console.log('Full prompt sent to API:', fullPrompt);

      const aiResponse = await callOpenAI(fullPrompt);
      
      const formattedResponse = aiResponse.replace(/\n/g, '<br>');
      
      console.log('AI response received:', aiResponse);
      
      // Antwort in die E-Mail einfügen
      await insertTextAtCursor(formattedResponse, emailContext.context, emailContext.tabId);
      
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

  // Abbrechen - nur Textfeld leeren
  cancelBtn.addEventListener('click', () => {
    promptInput.value = '';
    browser.storage.local.set({ lastPrompt: '' });
    submitBtn.style.display = 'none';
  });

  // Initialisiere beim Laden
  initializeInput();

  // Settings im Input-Bereich
  const inputSettingsBtn = document.getElementById('inputSettingsBtn');
  inputSettingsBtn.addEventListener('click', openSettingsTab);

  // Autoresponse
  const autoresponseBtn = document.getElementById('autoresponseBtn');
  autoresponseBtn.addEventListener('click', async () => {
    const fixedPrompt = 'Schreibe eine kurze Bestätigung, dass die E-Mail erhalten wurde und wünsche beste Grüße.';
    promptInput.value = fixedPrompt;
    browser.storage.local.set({ lastPrompt: fixedPrompt });
    submitBtn.style.display = 'block';

    // Automatisch absenden
    submitBtn.click();
  });
});

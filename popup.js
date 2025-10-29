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

async function callOpenAI(prompt) {
  const settings = await getSettings();

  if (!settings.apiUrl || !settings.apiKey || !settings.model) {
    throw new Error(browser.i18n.getMessage("apiSettingsMissing"));
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
    throw new Error(browser.i18n.getMessage("sttSettingsMissing"));
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
  const mailTab = await getActiveMailTab();
  if (!mailTab) {
    throw new Error("Bitte zuerst eine E-Mail öffnen oder anzeigen.");
  }

  const message = await browser.messageDisplay.getDisplayedMessage(mailTab.id);
  if (!message) {
    throw new Error("Keine Nachricht ausgewählt.");
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
    sender: message.author
  };
}

async function insertTextAtCursor(text) {
  const mailTab = await getActiveMailTab();
  if (!mailTab) {
    throw new Error("Keine E-Mail geöffnet.");
  }

  // Thunderbird API hat keine direkte Methode zum Einfügen an Cursor-Position
  // Wir verwenden beginReply und fügen den Text ein
  const message = await browser.messageDisplay.getDisplayedMessage(mailTab.id);
  if (!message) {
    throw new Error("Keine Nachricht ausgewählt.");
  }

  await browser.compose.beginReply(message.id, { body: text });
}

// Lokalisierungs-Funktion
async function localizePage() {
  const elements = document.querySelectorAll('[data-i18n]');
  for (const element of elements) {
    const key = element.getAttribute('data-i18n');
    const message = await browser.i18n.getMessage(key);
    if (message) {
      element.textContent = message;
    }
  }

  const placeholderElements = document.querySelectorAll('[data-i18n-placeholder]');
  for (const element of placeholderElements) {
    const key = element.getAttribute('data-i18n-placeholder');
    const message = await browser.i18n.getMessage(key);
    if (message) {
      element.setAttribute('placeholder', message);
    }
  }
}

// UI Event Handler
document.addEventListener('DOMContentLoaded', async function() {
  // Lokalisierung anwenden
  await localizePage();
  
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
      alert(err.message);
    }
  });

  // Einstellungen öffnen
  settingsBtn.addEventListener('click', () => browser.runtime.openOptionsPage());

  // Spracheingabe
  voiceInputBtn.addEventListener('click', async () => {
    try {
      voiceInputBtn.disabled = true;
      voiceInputBtn.textContent = "🎤 Aufnahme läuft...";
      
      const transcript = await transcribeAudio();
      promptInput.value = transcript;
      submitBtn.style.display = 'block';
      
    } catch (err) {
      alert(browser.i18n.getMessage("speechRecognitionError") + err.message);
    } finally {
      voiceInputBtn.disabled = false;
      voiceInputBtn.textContent = voiceInputBtn.getAttribute("data-i18n") === "voiceInputBtn" ? 
        browser.i18n.getMessage("voiceInputBtn") : "🎤 Spracheingabe";
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
        alert(browser.i18n.getMessage("noInstructionsProvided"));
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
      await insertTextAtCursor(aiResponse);
      
      // Popup schließen
      window.close();
      
    } catch (err) {
      console.error(err);
      alert("Fehler: " + err.message);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "📤 Abschicken";
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

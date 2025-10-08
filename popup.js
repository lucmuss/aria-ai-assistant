async function getActiveMailTab() {
  const tabs = await browser.tabs.query({ active: true, currentWindow: true });
  if (!tabs || tabs.length === 0) return null;
  const tab = tabs[0];
  if (tab.mailTab) return tab;
  return await browser.mailTabs.getCurrent().catch(() => null);
}

async function getSettings() {
  let settings = await browser.storage.local.get("chat");
  return settings.chat || {};
}

async function callOpenAI(prompt) {
  const settings = await getSettings();

  if (!settings.apiUrl || !settings.apiKey || !settings.model) {
    throw new Error("Bitte zuerst API-URL, API-Key und Modell in den Einstellungen speichern.");
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

document.getElementById("replyBtn").addEventListener("click", async () => {
  try {
    const mailTab = await getActiveMailTab();
    if (!mailTab) {
      alert("Bitte zuerst eine E-Mail öffnen oder anzeigen.");
      return;
    }

    const message = await browser.messageDisplay.getDisplayedMessage(mailTab.id);
    if (!message) {
      alert("Keine Nachricht ausgewählt.");
      return;
    }

    const full = await browser.messages.getFull(message.id);
    let body = "";
    for (let part of Object.values(full.parts)) {
      if (part.contentType === "text/plain" && part.body) {
        body = part.body;
        break;
      }
    }

    const prompt = `Schreibe eine höfliche Antwort auf folgende E-Mail:\n\n${body}`;
    const aiReply = await callOpenAI(prompt);

    await browser.compose.beginReply(message.id, { body: aiReply });
  } catch (err) {
    console.error(err);
    alert("Fehler: " + err.message);
  }
});

document.getElementById("sttBtn").addEventListener("click", startSTT);
document.getElementById("settingsBtn").addEventListener("click", () => browser.runtime.openOptionsPage());

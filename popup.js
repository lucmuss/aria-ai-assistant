async function generateReply() {
  let settings = await browser.storage.local.get();
  let apiUrl = settings.apiUrl || "https://api.openai.com/v1/chat/completions";
  let apiKey = settings.apiKey || "";
  let model = settings.model || "gpt-4o-mini";
  let systemPrompt = settings.systemPrompt || "Du bist ein höflicher Assistent, der beim E-Mail-Schreiben hilft.";
  let contextSize = settings.contextSize || 5;

  // Aktuelle Nachricht holen
  let mailTab = await browser.mailTabs.getCurrent();
  let message = await browser.messageDisplay.getDisplayedMessage(mailTab.id);

  if (!message) {
    alert("Bitte zuerst eine E-Mail öffnen.");
    return;
  }

  // Nachrichtenkontext abrufen (nur gleiche Konversation)
  let threadMsgs = await browser.messages.listThreads(message.folder);
  let conversation = threadMsgs.messages.filter(m => m.author === message.author);
  let lastMsgs = conversation.slice(-contextSize);

  let contextText = lastMsgs.map(m => `${m.author}: ${m.subject}\n${m.preview}`).join("\n");

  let prompt = `${systemPrompt}\n\nKontext:\n${contextText}\n\nAntwort auf:\n${message.subject}\n`;

  try {
    const resp = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt }
        ],
        temperature: settings.temperature || 0.7
      })
    });

    if (!resp.ok) throw new Error(await resp.text());

    const data = await resp.json();
    let answer = data.choices?.[0]?.message?.content || "Keine Antwort generiert.";

    await browser.compose.beginReply(message.id, { body: answer });

  } catch (err) {
    console.error(err);
    alert("Fehler beim API-Aufruf: " + err.message);
  }
}

document.getElementById("replyBtn").addEventListener("click", generateReply);
document.getElementById("settingsBtn").addEventListener("click", () => {
  browser.runtime.openOptionsPage();
});

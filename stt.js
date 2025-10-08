async function startSTT() {
  let settings = await browser.storage.local.get("stt");
  let sttSettings = settings.stt || {};

  if (!sttSettings.apiUrl || !sttSettings.apiKey || !sttSettings.model) {
    alert("Bitte zuerst STT-API in den Einstellungen eintragen!");
    return;
  }

  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const mediaRecorder = new MediaRecorder(stream);
  let audioChunks = [];

  mediaRecorder.ondataavailable = e => audioChunks.push(e.data);
  mediaRecorder.onstop = async () => {
    let audioBlob = new Blob(audioChunks, { type: "audio/wav" });

    const formData = new FormData();
    formData.append("file", audioBlob, "input.wav");
    formData.append("model", sttSettings.model);
    if (sttSettings.language) formData.append("language", sttSettings.language);
    if (sttSettings.mode) formData.append("task", sttSettings.mode);

    try {
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

      let mailTab = await browser.mailTabs.getCurrent();
      let message = await browser.messageDisplay.getDisplayedMessage(mailTab.id);
      if (!message) {
        alert("Bitte zuerst eine E-Mail öffnen.");
        return;
      }

      await browser.compose.beginReply(message.id, { body: transcript });

    } catch (err) {
      console.error(err);
      alert("STT Fehler: " + err.message);
    }
  };

  mediaRecorder.start();
  alert("🎤 Aufnahme läuft! Klick OK um zu stoppen.");
  mediaRecorder.stop();
}

document.getElementById("sttBtn").addEventListener("click", startSTT);

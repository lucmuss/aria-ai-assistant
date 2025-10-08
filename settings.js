async function loadSettings() {
  let settings = await browser.storage.local.get();
  document.getElementById("apiUrl").value = settings.apiUrl || "";
  document.getElementById("apiKey").value = settings.apiKey || "";
  document.getElementById("model").value = settings.model || "gpt-4o-mini";
  document.getElementById("systemPrompt").value = settings.systemPrompt || "";
  document.getElementById("temperature").value = settings.temperature || 0.7;
  document.getElementById("contextSize").value = settings.contextSize || 5;

  let stt = settings.stt || {};
  document.getElementById("sttApiUrl").value = stt.apiUrl || "";
  document.getElementById("sttApiKey").value = stt.apiKey || "";
  document.getElementById("sttModel").value = stt.model || "whisper-1";
  document.getElementById("sttLanguage").value = stt.language || "";
  document.getElementById("sttMode").value = stt.mode || "";
}

async function saveSettings() {
  await browser.storage.local.set({
    apiUrl: document.getElementById("apiUrl").value,
    apiKey: document.getElementById("apiKey").value,
    model: document.getElementById("model").value,
    systemPrompt: document.getElementById("systemPrompt").value,
    temperature: parseFloat(document.getElementById("temperature").value),
    contextSize: parseInt(document.getElementById("contextSize").value),
    stt: {
      apiUrl: document.getElementById("sttApiUrl").value,
      apiKey: document.getElementById("sttApiKey").value,
      model: document.getElementById("sttModel").value,
      language: document.getElementById("sttLanguage").value,
      mode: document.getElementById("sttMode").value
    }
  });
  alert("Einstellungen gespeichert!");
}

document.getElementById("saveBtn").addEventListener("click", saveSettings);
loadSettings();

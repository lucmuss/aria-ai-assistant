/**
 * UI Helpers Module
 * Handles UI state management and updates
 */

/**
 * Display statistics
 */
export async function displayStats() {
  try {
    const result = await browser.storage.local.get('lastStats');
    const stats = result.lastStats;
    const statsDiv = document.getElementById('stats');
    
    if (stats) {
      document.getElementById('inputTokens').textContent = stats.inputTokens;
      document.getElementById('outputTokens').textContent = stats.outputTokens;
      document.getElementById('model').textContent = stats.model;
      document.getElementById('time').textContent = stats.time;
      document.getElementById('cost').textContent = stats.cost;
      document.getElementById('temperature').textContent = stats.temperature ? stats.temperature.toFixed(2) : '1.00';
      statsDiv.style.display = 'block';
    } else {
      statsDiv.style.display = 'none';
    }
  } catch (err) {
    console.error('Error displaying stats:', err);
    document.getElementById('stats').style.display = 'none';
  }
}

/**
 * Show/hide submit/cancel button group
 */
export function updateSubmitCancelVisibility(show) {
  const group = document.getElementById('submitCancelGroup');
  group.style.display = show ? 'flex' : 'none';
}

/**
 * Open settings tab
 */
export async function openSettingsTab() {
  const settingsURL = browser.runtime.getURL('settings.html');

  // Find existing settings tab
  let tabs = await browser.tabs.query({ url: settingsURL });
  let settingsTab;
  
  if (tabs.length) {
    settingsTab = tabs[0];
    await browser.tabs.update(settingsTab.id, { active: true });
  } else {
    settingsTab = await browser.tabs.create({ url: settingsURL, active: true });
  }

  await browser.windows.update(settingsTab.windowId, { focused: true });
  window.close();
}

/**
 * Load last prompt from storage
 */
export async function loadLastPrompt() {
  const result = await browser.storage.local.get('lastPrompt');
  return result.lastPrompt || '';
}

/**
 * Save prompt to storage
 */
export async function savePrompt(prompt) {
  await browser.storage.local.set({ lastPrompt: prompt });
}

/**
 * Set button state
 */
export function setButtonState(button, text, disabled = false) {
  button.textContent = text;
  button.disabled = disabled;
}

/**
 * Show/hide recording buttons
 */
export function toggleRecordingUI(isRecording) {
  const voiceInputBtn = document.getElementById('voiceInputBtn');
  const stopRecordingBtn = document.getElementById('stopRecordingBtn');
  
  if (isRecording) {
    voiceInputBtn.style.display = 'none';
    stopRecordingBtn.style.display = 'block';
  } else {
    voiceInputBtn.style.display = 'block';
    stopRecordingBtn.style.display = 'none';
  }
}

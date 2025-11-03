/**
 * Main Settings Script
 * Coordinates all settings modules
 */

import { loadI18n } from './modules/settings-i18n.js';
import { testChatApi, testSttApi } from './modules/settings-api-test.js';
import { exportSettings, importSettings } from './modules/settings-import-export.js';
import { loadSettings, saveSettings } from './modules/settings-data.js';

let t = null;

/**
 * Initialize settings page
 */
async function init() {
  // Load translations
  t = await loadI18n();
  window.currentT = t;

  // Set version
  const manifest = browser.runtime.getManifest();
  document.getElementById('version').textContent = `v${manifest.version}`;

  // Setup donate button
  const donateBtn = document.getElementById('donateBtn');
  if (donateBtn) {
    donateBtn.addEventListener('click', () => {
      browser.tabs.create({ url: manifest.donation_url });
    });
  }

  // Load settings
  await loadSettings();

  // Setup event listeners
  setupEventListeners();
  
  // Load tone setting
  const tone = await browser.storage.local.get('tone');
  if (tone.tone) {
    document.getElementById('chatTone').value = tone.tone;
  }
}

/**
 * Setup all event listeners
 */
function setupEventListeners() {
  // Save button
  document.getElementById('saveBtn').addEventListener('click', async () => {
    await saveSettings(t);
  });
  
  // Tone change - auto save
  document.getElementById('chatTone').addEventListener('change', async () => {
    await saveSettings(t);
  });

  // Language change - auto save and reload
  document.getElementById('uiLanguage').addEventListener('change', async () => {
    await saveSettings(t);
    location.reload();
  });

  // Test API button
  document.getElementById('testApiBtn').addEventListener('click', () => {
    testChatApi(t);
  });

  // Test STT button
  document.getElementById('testSttBtn').addEventListener('click', () => {
    testSttApi(t);
  });

  // Export button
  document.getElementById('exportBtn').addEventListener('click', () => {
    exportSettings(t);
  });

  // Import button
  document.getElementById('importBtn').addEventListener('click', () => {
    document.getElementById('importFile').click();
  });

  // Import file selection
  document.getElementById('importFile').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (file) {
      await importSettings(file, t);
      location.reload();
      e.target.value = '';
    }
  });
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', init);

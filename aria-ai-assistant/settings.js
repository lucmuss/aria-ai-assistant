/**
 * Main Settings Script
 * Coordinates all settings modules
 */

import { loadI18n } from './modules/settings-i18n.js';
import { testChatApi, testSttApi } from './modules/settings-api-test.js';
import { exportSettings, importSettings } from './modules/settings-import-export.js';
import { loadSettings, saveSettings } from './modules/settings-data.js';
import { 
  populateSystemPromptLibrary, 
  loadSystemPromptIntoForm, 
  saveSystemPrompt, 
  deleteSystemPrompt 
} from './modules/system-prompt-manager.js';

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
  
  // Populate system prompt library
  await populateSystemPromptLibrary(document.getElementById('systemPromptLibrary'));

  // Setup event listeners
  setupEventListeners();
  
  // Load tone setting
  const tone = await browser.storage.local.get('tone');
  if (tone.tone) {
    document.getElementById('chatTone').value = tone.tone;
  } else {
    document.getElementById('chatTone').value = 'none';
  }
  
  // Load length setting
  const length = await browser.storage.local.get('length');
  if (length.length) {
    document.getElementById('chatLength').value = length.length;
  } else {
    document.getElementById('chatLength').value = 'none';
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
  
  // Length change - auto save
  document.getElementById('chatLength').addEventListener('change', async () => {
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
  
  // System Prompt Library dropdown change
  document.getElementById('systemPromptLibrary').addEventListener('change', async (e) => {
    const selectedName = e.target.value;
    if (selectedName) {
      const nameInput = document.getElementById('systemPromptName');
      const contentTextarea = document.getElementById('systemPromptContent');
      await loadSystemPromptIntoForm(selectedName, nameInput, contentTextarea);
      
      // Save this as the current system prompt
      await browser.storage.local.set({ currentSystemPrompt: contentTextarea.value });
    }
  });
  
  // System Prompt Content change - auto save as current
  document.getElementById('systemPromptContent').addEventListener('input', async (e) => {
    const content = e.target.value;
    await browser.storage.local.set({ currentSystemPrompt: content });
  });
  
  // Save System Prompt button
  document.getElementById('saveSystemPromptBtn').addEventListener('click', async () => {
    const nameInput = document.getElementById('systemPromptName');
    const contentTextarea = document.getElementById('systemPromptContent');
    const name = nameInput.value.trim();
    const content = contentTextarea.value;
    
    if (!name) {
      alert(t('systemPromptNameRequired') || 'Please enter a name for the system prompt.');
      return;
    }
    
    try {
      await saveSystemPrompt(name, content);
      await populateSystemPromptLibrary(document.getElementById('systemPromptLibrary'));
      
      // Update the dropdown to show the saved prompt
      document.getElementById('systemPromptLibrary').value = name;
      
      // Save this as the current system prompt
      await browser.storage.local.set({ currentSystemPrompt: content });
      
      const statusBox = document.getElementById('status');
      statusBox.textContent = t('systemPromptSaved') || 'System prompt saved successfully!';
      statusBox.style.display = 'block';
      setTimeout(() => {
        statusBox.style.display = 'none';
      }, 3000);
    } catch (error) {
      alert(t('systemPromptSaveError') || 'Error saving system prompt: ' + error.message);
    }
  });
  
  // Delete System Prompt button
  document.getElementById('deleteSystemPromptBtn').addEventListener('click', async () => {
    const libraryDropdown = document.getElementById('systemPromptLibrary');
    const selectedName = libraryDropdown.value;
    
    if (!selectedName) {
      alert(t('systemPromptSelectToDelete') || 'Please select a system prompt from the library to delete.');
      return;
    }
    
    const confirmed = confirm(t('systemPromptDeleteConfirm') || `Are you sure you want to delete the system prompt "${selectedName}"?`);
    if (!confirmed) {
      return;
    }
    
    try {
      await deleteSystemPrompt(selectedName);
      await populateSystemPromptLibrary(libraryDropdown);
      
      // Clear the form fields
      document.getElementById('systemPromptName').value = '';
      document.getElementById('systemPromptContent').value = '';
      libraryDropdown.value = '';
      
      const statusBox = document.getElementById('status');
      statusBox.textContent = t('systemPromptDeleted') || 'System prompt deleted successfully!';
      statusBox.style.display = 'block';
      setTimeout(() => {
        statusBox.style.display = 'none';
      }, 3000);
    } catch (error) {
      alert(t('systemPromptDeleteError') || 'Error deleting system prompt: ' + error.message);
    }
  });
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', init);

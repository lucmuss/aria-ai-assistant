/**
 * Main Popup Script
 * Coordinates all modules and handles user interactions
 */

import { loadI18n, localizePage } from './modules/i18n.js';
import { STTRecorder, transcribeAudio, getSTTSettings } from './modules/stt-recorder.js';
import { getEmailContext, insertTextAtCursor, stripHtml } from './modules/email-context.js';
import { callOpenAI, buildPrompt, saveStats, incrementGenerationCounter, getExtensionSettings } from './modules/api-client.js';
import { displayStats, updateSubmitCancelVisibility, openSettingsTab, loadLastPrompt, savePrompt, setButtonState, toggleRecordingUI } from './modules/ui-helpers.js';

// Global state
let sttRecorder = null;
let t = null;
let tone = 'none'; // Default tone (None)
let length = 'none'; // Default length (None)

/**
 * Initialize the popup
 */
async function init() {
  // Load translations
  t = await loadI18n();
  window.t = t;
  
  // Set version
  const manifest = browser.runtime.getManifest();
  document.getElementById('version').textContent = `v${manifest.version}`;

  // Apply translations
  await localizePage(t);
  
  // Load last prompt
  const lastPrompt = await loadLastPrompt();
  const promptInput = document.getElementById('promptInput');
  if (lastPrompt) {
    promptInput.value = lastPrompt;
    updateSubmitCancelVisibility(true);
  }

  // Load tone setting
  const toneSetting = await browser.storage.local.get('tone');
  if (toneSetting.tone) {
    tone = toneSetting.tone;
  } else {
    tone = 'none';
  }
  
  // Load length setting
  const lengthSetting = await browser.storage.local.get('length');
  if (lengthSetting.length) {
    length = lengthSetting.length;
  } else {
    length = 'none';
  }

  // Display stats
  await displayStats();

  // Setup event listeners
  setupEventListeners();
}

/**
 * Setup all event listeners
 */
function setupEventListeners() {
  const promptInput = document.getElementById('promptInput');
  const voiceInputBtn = document.getElementById('voiceInputBtn');
  const stopRecordingBtn = document.getElementById('stopRecordingBtn');
  const submitBtn = document.getElementById('submitBtn');
  const cancelBtn = document.getElementById('cancelBtn');
  const inputSettingsBtn = document.getElementById('inputSettingsBtn');
  const autoresponseBtn = document.getElementById('autoresponseBtn');

  // Prompt input changes
  promptInput.addEventListener('input', async () => {
    await savePrompt(promptInput.value);
    updateSubmitCancelVisibility(promptInput.value.trim().length > 0);
  });

  // Handle Enter key press to submit or autoresponse
  promptInput.addEventListener('keydown', async (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault(); // Prevent adding new line
      if (promptInput.value.trim().length > 0) {
        submitBtn.click();
      } else {
        autoresponseBtn.click();
      }
    }
  });

  // Add keyboard shortcuts for voice input and autoresponse
  document.addEventListener('keydown', async (event) => {
    // Voice input shortcut: Ctrl+V (or Cmd+V on Mac)
    if ((event.ctrlKey || event.metaKey) && event.key === 'v' && !event.shiftKey && !event.altKey) {
      event.preventDefault();
      voiceInputBtn.click();
    }
    
    // Autoresponse shortcut: Ctrl+A (or Cmd+A on Mac)
    if ((event.ctrlKey || event.metaKey) && event.key === 'a' && !event.shiftKey && !event.altKey) {
      event.preventDefault();
      autoresponseBtn.click();
    }
  });

  // Voice input button
  voiceInputBtn.addEventListener('click', handleVoiceInput);

  // Stop recording button
  stopRecordingBtn.addEventListener('click', handleStopRecording);

  // Submit button
  submitBtn.addEventListener('click', handleSubmit);

  // Cancel button
  cancelBtn.addEventListener('click', handleCancel);

  // Settings button
  inputSettingsBtn.addEventListener('click', openSettingsTab);

  // Autoresponse button
  autoresponseBtn.addEventListener('click', handleAutoresponse);
}

/**
 * Handle voice input button click
 */
async function handleVoiceInput() {
  try {
    sttRecorder = new STTRecorder();
    await sttRecorder.startRecording();
    
    toggleRecordingUI(true);
    setButtonState(document.getElementById('stopRecordingBtn'), t('recordingInProgress'), false);
  } catch (error) {
    console.error('Failed to start recording:', error);
    alert(t('speechRecognitionError') + error.message);
    sttRecorder = null;
    toggleRecordingUI(false);
  }
}

/**
 * Handle stop recording button click
 */
async function handleStopRecording() {
  if (!sttRecorder) return;

  try {
    const stopBtn = document.getElementById('stopRecordingBtn');
    setButtonState(stopBtn, t('transcribing'), true);

    // Stop recording and get audio blob
    const audioBlob = await sttRecorder.stopRecording();
    
    // Get STT settings
    const sttSettings = await getSTTSettings();
    
    // Transcribe audio
    const transcript = await transcribeAudio(audioBlob, sttSettings);
    
    // Update UI
    const promptInput = document.getElementById('promptInput');
    promptInput.value = transcript;
    await savePrompt(transcript);
    updateSubmitCancelVisibility(true);
    
  } catch (error) {
    console.error('Transcription failed:', error);
    alert(t('speechRecognitionError') + error.message);
  } finally {
    sttRecorder = null;
    toggleRecordingUI(false);
  }
}

/**
 * Handle submit button click
 */
async function handleSubmit() {
  const promptInput = document.getElementById('promptInput');
  const submitBtn = document.getElementById('submitBtn');
  
  try {
    const userPrompt = promptInput.value.trim();
    if (!userPrompt) {
      alert(t('noInstructionsProvided'));
      return;
    }

    setButtonState(submitBtn, t('generating'), true);

    // Get email context
    const emailContext = await getEmailContext();
    console.log('Email context:', emailContext);
    
    // Get extension settings
    const extensionSettings = await getExtensionSettings();
    emailContext.extensionSettings = extensionSettings;
    
    // Build full prompt
    const fullPrompt = buildPrompt(emailContext, userPrompt, stripHtml, tone, length);
    console.log('Full prompt sent to API:', fullPrompt);

    // Call OpenAI API
    const apiResult = await callOpenAI(fullPrompt);
    const { content, usage, model, time, cost } = apiResult;
    
    const settings = await browser.storage.local.get('chat');
    const temperature = settings.chat?.temperature || 1.0;
    
    // Format response for HTML display
    const formattedResponse = content.replace(/\n/g, '<br>');
    
    console.log('AI response received:', content);
    
    // Save statistics
    const stats = {
      inputTokens: usage.input,
      outputTokens: usage.output,
      model,
      time,
      cost,
      temperature
    };
    await saveStats(stats);
    
    // Display statistics
    await displayStats();
    
    // Insert response into email
    await insertTextAtCursor(formattedResponse, emailContext.context, emailContext.tabId);

    // Increment generation counter
    await incrementGenerationCounter();
    
    // Update UI to show success or stats
    setButtonState(submitBtn, t('submitBtn'), false);

  } catch (error) {
    console.error('Submit error:', error);
    alert(t('generalError') + error.message);
  } finally {
    setButtonState(submitBtn, t('submitBtn'), false);
  }
}

/**
 * Handle cancel button click
 */
async function handleCancel() {
  const promptInput = document.getElementById('promptInput');
  promptInput.value = '';
  await savePrompt('');
  updateSubmitCancelVisibility(false);
}

/**
 * Handle autoresponse button click
 */
async function handleAutoresponse() {
  const fixedPrompt = t('autoresponsePrompt');
  const promptInput = document.getElementById('promptInput');
  promptInput.value = fixedPrompt;
  await savePrompt(fixedPrompt);
  updateSubmitCancelVisibility(true);

  // Auto submit
  await handleSubmit();
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', init);

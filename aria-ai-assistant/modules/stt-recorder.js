/**
 * Speech-to-Text Recording Module
 * Handles audio recording and transcription
 */

export class STTRecorder {
  constructor() {
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.stream = null;
    this.mimeType = '';
    this.fileExtension = 'webm';
  }

  /**
   * Start recording audio from microphone
   */
  async startRecording() {
    try {
      const t = window.t || ((key) => key);

      if (!navigator.mediaDevices || typeof navigator.mediaDevices.getUserMedia !== 'function') {
        throw new Error(t('errorMediaDevicesUnavailable'));
      }

      if (typeof MediaRecorder === 'undefined') {
        throw new Error(t('errorMediaRecorderUnavailable'));
      }

      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = getSupportedMimeType();
      const recorderOptions = mimeType ? { mimeType } : undefined;
      this.mediaRecorder = recorderOptions
        ? new MediaRecorder(this.stream, recorderOptions)
        : new MediaRecorder(this.stream);

      this.mimeType = this.mediaRecorder.mimeType || mimeType || '';
      this.fileExtension = extensionFromMimeType(this.mimeType);
      this.audioChunks = [];

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.start();
      console.log('STT: Recording started');
    } catch (error) {
      console.error('STT: Failed to start recording:', error);
      const t = window.t || ((key) => key);
      throw new Error(error?.message || t('errorMicrophoneAccess'));
    }
  }

  /**
   * Stop recording and return the audio blob
   */
  async stopRecording() {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        const t = window.t || ((key) => key);
        reject(new Error(t('errorNoActiveRecording') || 'No active recording'));
        return;
      }

      this.mediaRecorder.onstop = () => {
        const t = window.t || ((key) => key);
        const resolvedMimeType = this.mimeType || this.audioChunks[0]?.type || 'audio/webm';
        const audioBlob = new Blob(this.audioChunks, { type: resolvedMimeType });

        if (!audioBlob.size) {
          this.cleanup();
          reject(new Error(t('errorEmptyRecording')));
          return;
        }

        const recording = {
          blob: audioBlob,
          mimeType: resolvedMimeType,
          fileExtension: this.fileExtension || extensionFromMimeType(resolvedMimeType)
        };

        this.cleanup();
        console.log('STT: Recording stopped, blob size:', audioBlob.size);
        resolve(recording);
      };

      this.mediaRecorder.onerror = (error) => {
        this.cleanup();
        reject(error);
      };

      this.mediaRecorder.stop();
    });
  }

  /**
   * Cleanup resources
   */
  cleanup() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.mimeType = '';
    this.fileExtension = 'webm';
  }

  /**
   * Check if currently recording
   */
  isRecording() {
    return this.mediaRecorder && this.mediaRecorder.state === 'recording';
  }
}

/**
 * Transcribe audio using STT API
 */
export async function transcribeAudio(audioBlob, sttSettings) {
  if (!sttSettings.apiUrl || !sttSettings.model) {
    const t = window.t || ((key) => key);
    throw new Error(t('errorSttSettingsMissing'));
  }

  const t = window.t || ((key) => key);
  const audioPayload = normalizeAudioPayload(audioBlob);
  if (!audioPayload.blob.size) {
    throw new Error(t('errorEmptyRecording'));
  }

  const formData = new FormData();
  formData.append('file', audioPayload.blob, `recording.${audioPayload.fileExtension}`);
  formData.append('model', sttSettings.model);
  
  if (sttSettings.language) {
    formData.append('language', sttSettings.language);
  }

  const headers = {};
  if (sttSettings.apiKey) {
    headers.Authorization = `Bearer ${sttSettings.apiKey}`;
  }

  try {
    const response = await fetch(sttSettings.apiUrl, {
      method: 'POST',
      headers,
      body: formData
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`${t('errorSttApi')} (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    const transcript = data.text || '';
    if (!transcript.trim()) {
      throw new Error(t('errorEmptyTranscription'));
    }
    
    console.log('STT: Transcription successful:', transcript);
    return transcript;
  } catch (error) {
    console.error('STT: Transcription failed:', error);
    throw error;
  }
}

/**
 * Get STT settings from storage
 */
export async function getSTTSettings() {
  const settings = await browser.storage.local.get('stt');
  return settings.stt || {};
}

const MIME_TYPE_CANDIDATES = [
  'audio/webm;codecs=opus',
  'audio/ogg;codecs=opus',
  'audio/webm',
  'audio/ogg'
];

function getSupportedMimeType() {
  if (typeof MediaRecorder === 'undefined' || typeof MediaRecorder.isTypeSupported !== 'function') {
    return '';
  }

  for (const mimeType of MIME_TYPE_CANDIDATES) {
    if (MediaRecorder.isTypeSupported(mimeType)) {
      return mimeType;
    }
  }

  return '';
}

function extensionFromMimeType(mimeType) {
  const normalized = (mimeType || '').toLowerCase();
  if (normalized.includes('ogg')) {
    return 'ogg';
  }
  if (normalized.includes('wav')) {
    return 'wav';
  }
  if (normalized.includes('mp4') || normalized.includes('m4a')) {
    return 'm4a';
  }
  return 'webm';
}

function normalizeAudioPayload(audioPayload) {
  if (audioPayload instanceof Blob) {
    return {
      blob: audioPayload,
      mimeType: audioPayload.type || 'audio/webm',
      fileExtension: extensionFromMimeType(audioPayload.type)
    };
  }

  if (audioPayload?.blob instanceof Blob) {
    const mimeType = audioPayload.mimeType || audioPayload.blob.type || 'audio/webm';
    return {
      blob: audioPayload.blob,
      mimeType,
      fileExtension: audioPayload.fileExtension || extensionFromMimeType(mimeType)
    };
  }

  const t = window.t || ((key) => key);
  throw new Error(t('errorInvalidAudioPayload'));
}

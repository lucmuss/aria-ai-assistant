/**
 * Speech-to-Text Recording Module
 * Handles audio recording and transcription
 */

export class STTRecorder {
  constructor() {
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.stream = null;
  }

  /**
   * Start recording audio from microphone
   */
  async startRecording() {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(this.stream);
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
      throw new Error(t('errorMicrophoneAccess'));
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
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });
        this.cleanup();
        console.log('STT: Recording stopped, blob size:', audioBlob.size);
        resolve(audioBlob);
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
  if (!sttSettings.apiUrl || !sttSettings.apiKey || !sttSettings.model) {
    const t = window.t || ((key) => key);
    throw new Error(t('errorSttSettingsMissing'));
  }

  const formData = new FormData();
  formData.append('file', audioBlob, 'recording.wav');
  formData.append('model', sttSettings.model);
  
  if (sttSettings.language) {
    formData.append('language', sttSettings.language);
  }

  try {
    const response = await fetch(sttSettings.apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${sttSettings.apiKey}`
      },
      body: formData
    });

    if (!response.ok) {
      const errorText = await response.text();
      const t = window.t || ((key) => key);
      throw new Error(`${t('errorSttApi')} (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    const transcript = data.text || '';
    
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

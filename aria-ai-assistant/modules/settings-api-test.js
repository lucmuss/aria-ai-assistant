/**
 * Settings API Testing Module
 */

/**
 * Test Chat API connection
 */
export async function testChatApi(t) {
  const statusElement = document.getElementById('status');
  
  const apiUrl = document.getElementById('chatApiUrl').value.trim();
  const apiKey = document.getElementById('chatApiKey').value.trim();
  const model = document.getElementById('chatModel').value.trim();
  
  if (!apiUrl || !apiKey || !model) {
    statusElement.textContent = t('testApiMissingSettings');
    statusElement.style.color = 'red';
    statusElement.style.display = 'block';
    return;
  }
  
  try {
    statusElement.textContent = t('testApiTesting');
    statusElement.style.color = 'blue';
    statusElement.style.display = 'block';

    const testBody = {
      model: model,
      messages: [
        { role: 'system', content: t('testApiSystemPrompt') },
        { role: 'user', content: t('testApiUserPrompt') }
      ],
      max_tokens: 50,
      temperature: 0.1
    };

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    statusElement.textContent = t('testApiSuccess');
    statusElement.style.color = 'green';
    console.log('API test successful:', data);

  } catch (error) {
    console.error('API test failed:', error);
    statusElement.textContent = t('testApiError') + error.message;
    statusElement.style.color = 'red';
    statusElement.style.display = 'block';
  }
}

/**
 * Test STT API connection
 */
export async function testSttApi(t) {
  const statusElement = document.getElementById('status');
  
  const apiUrl = document.getElementById('sttApiUrl').value.trim();
  const apiKey = document.getElementById('sttApiKey').value.trim();
  const model = document.getElementById('sttModel').value.trim();
  
  if (!apiUrl || !apiKey || !model) {
    statusElement.textContent = t('testSttMissingSettings');
    statusElement.style.color = 'red';
    statusElement.style.display = 'block';
    return;
  }

  try {
    statusElement.textContent = t('testSttTesting');
    statusElement.style.color = 'blue';
    statusElement.style.display = 'block';

    const testAudioUrl = browser.runtime.getURL('test.wav');
    const audioResponse = await fetch(testAudioUrl);
    if (!audioResponse.ok) {
      throw new Error(t('testSttFileNotFound'));
    }
    const audioBlob = await audioResponse.blob();

    const formData = new FormData();
    formData.append('file', audioBlob, 'test.wav');
    formData.append('model', model);
    const language = document.getElementById('sttLanguage').value;
    if (language) formData.append('language', language);

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`
      },
      body: formData
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    const transcript = data.text || t('testSttNoTranscription');

    statusElement.textContent = t('testSttSuccess') + transcript;
    statusElement.style.color = 'green';
    console.log('STT test successful:', data);

  } catch (error) {
    console.error('STT test failed:', error);
    statusElement.textContent = t('testSttError') + error.message;
    statusElement.style.color = 'red';
    statusElement.style.display = 'block';
  }
}

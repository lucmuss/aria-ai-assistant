/**
 * Settings Import/Export Module
 */

/**
 * Export settings to JSON file
 */
export async function exportSettings(t) {
  const settings = await browser.storage.local.get();
  
  const exportData = {
    ...settings,
    exportInfo: {
      version: '1.0',
      exportDate: new Date().toISOString(),
      extension: 'AI Mail Assistant',
      note: t('exportNote') || 'This file contains sensitive API keys. Please keep it safe!'
    }
  };
  
  const dataStr = JSON.stringify(exportData, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  
  const url = URL.createObjectURL(dataBlob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ai-mail-assistant-settings-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  const statusElement = document.getElementById('status');
  statusElement.innerText = t('exportSuccessMsg');
  statusElement.style.color = 'green';
}

/**
 * Import settings from JSON file
 */
export async function importSettings(file, t) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        const importedData = JSON.parse(e.target.result);
        
        if (!importedData.chat) {
          throw new Error(t('importErrorMsg') || 'Invalid file format: Chat settings missing');
        }
        
        const settingsToImport = {
          uiLanguage: importedData.uiLanguage || 'en',
          chat: {
            apiUrl: importedData.chat.apiUrl || '',
            apiKey: importedData.chat.apiKey || '',
            model: importedData.chat.model || 'gpt-4o-mini',
            temperature: importedData.chat.temperature || 1.0,
            maxTokens: importedData.chat.maxTokens || 2000,
            systemPrompt: importedData.chat.systemPrompt || ''
          },
          extension: {
            contextSize: importedData.extension?.contextSize || importedData.chat?.contextSize || 5,
            includeSender: importedData.extension?.includeSender || importedData.chat?.includeSender || false,
            clearEmailAfterSubmit: importedData.extension?.clearEmailAfterSubmit || false
          },
          stt: {
            apiUrl: importedData.stt?.apiUrl || '',
            apiKey: importedData.stt?.apiKey || '',
            model: importedData.stt?.model || 'whisper-1',
            language: importedData.stt?.language || ''
          },
          generatedEmails: importedData.generatedEmails || 0,
          tone: importedData.tone || 'none',
          length: importedData.length || 'none'
        };
        
        await browser.storage.local.set(settingsToImport);
        
        const statusElement = document.getElementById('status');
        statusElement.innerText = t('importSuccessMsg');
        statusElement.style.color = 'green';
        resolve();
      } catch (error) {
        console.error('Import error:', error);
        const statusElement = document.getElementById('status');
        statusElement.innerText = t('importErrorMsg') + error.message;
        statusElement.style.color = 'red';
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error(t('importErrorMsg') || 'Error reading file'));
    };
    
    reader.readAsText(file);
  });
}

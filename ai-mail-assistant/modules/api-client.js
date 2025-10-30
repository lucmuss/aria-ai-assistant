/**
 * API Client Module
 * Handles communication with OpenAI API
 */

/**
 * Get chat settings from storage
 */
export async function getChatSettings() {
  const settings = await browser.storage.local.get('chat');
  return settings.chat || {};
}

/**
 * Get extension settings from storage
 */
export async function getExtensionSettings() {
  const settings = await browser.storage.local.get('extension');
  return settings.extension || {};
}

/**
 * Calculate cost based on token usage
 */
function calculateCost(model, inputTokens, outputTokens) {
  const prices = {
    'gpt-4o-mini': { input: 0.00000015, output: 0.00000060 },
    'gpt-4o': { input: 0.0000025, output: 0.000010 },
    'gpt-4-turbo': { input: 0.000010, output: 0.000030 },
    'gpt-3.5-turbo': { input: 0.0000005, output: 0.0000015 }
  };
  
  const price = prices[model] || { input: 0, output: 0 };
  const inputCost = inputTokens * price.input;
  const outputCost = outputTokens * price.output;
  const totalCost = inputCost + outputCost;
  
  if (totalCost === 0) return '< $0.01';
  return `$${totalCost.toFixed(6)}`;
}

/**
 * Call OpenAI API
 */
export async function callOpenAI(prompt) {
  const settings = await getChatSettings();

  if (!settings.apiUrl || !settings.apiKey || !settings.model) {
    const t = window.t || ((key) => key);
    throw new Error(t('errorApiSettingsMissing'));
  }

  const startTime = performance.now();

  const body = {
    model: settings.model,
    messages: [
      { 
        role: 'system', 
        content: settings.systemPrompt || (window.t ? window.t('systemPromptDefault') : 'You are a helpful email assistant.')
      },
      { 
        role: 'user', 
        content: prompt 
      }
    ],
    temperature: settings.temperature || 1.0,
    max_tokens: settings.maxTokens || 2000
  };

  try {
    const response = await fetch(settings.apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${settings.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorText = await response.text();
      const t = window.t || ((key) => key);
      throw new Error(`${t('errorApiGeneral')} (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    const endTime = performance.now();
    const time = ((endTime - startTime) / 1000).toFixed(2);

    const content = data.choices[0].message.content.trim();
    const usage = data.usage || { prompt_tokens: 0, completion_tokens: 0 };
    const inputTokens = usage.prompt_tokens || 0;
    const outputTokens = usage.completion_tokens || 0;
    const cost = calculateCost(settings.model, inputTokens, outputTokens);

    return { 
      content, 
      usage: { input: inputTokens, output: outputTokens }, 
      model: settings.model, 
      time, 
      cost 
    };
  } catch (error) {
    console.error('OpenAI API call failed:', error);
    throw error;
  }
}

/**
 * Build full prompt from email context and user instructions
 */
export function buildPrompt(emailContext, userInstructions, stripHtmlFn) {
  const extensionSettings = emailContext.extensionSettings || {};
  const t = window.t || ((key) => key);
  
  let senderInfo = '';
  if (extensionSettings.includeSender && emailContext.sender) {
    senderInfo = `${t('promptContextSender')} ${emailContext.sender}\n`;
  }

  const emailBody = stripHtmlFn(emailContext.emailBody);

  return `${t('promptContextEmail')}
${t('promptContextSubject')} ${emailContext.subject}
${senderInfo}${t('promptContextName')} ${emailContext.userName}
${t('promptContextOrganization')} ${emailContext.userOrganization}
${t('promptContextMessage')} ${emailBody}
${t('promptContextLanguageDetect')}

${t('promptContextInstructions')} ${userInstructions}

${t('promptContextFormat')}`;
}

/**
 * Save API statistics
 */
export async function saveStats(stats) {
  await browser.storage.local.set({ lastStats: stats });
}

/**
 * Increment generation counter
 */
export async function incrementGenerationCounter() {
  const currentCount = await browser.storage.local.get('generatedEmails');
  const newCount = (currentCount.generatedEmails || 0) + 1;
  await browser.storage.local.set({ generatedEmails: newCount });
}

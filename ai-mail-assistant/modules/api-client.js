/**
 * API Client Module
 * Handles communication with OpenAI API
 */

import { createLogger } from './logger.js';
const logger = createLogger('API-Client');

/**
 * Get chat settings from storage
 */
export async function getChatSettings() {
  logger.logFunctionCall('getChatSettings');
  const settings = await browser.storage.local.get('chat');
  logger.logFunctionResult('getChatSettings', { hasSettings: !!settings.chat });
  return settings.chat || {};
}

/**
 * Get extension settings from storage
 */
export async function getExtensionSettings() {
  logger.logFunctionCall('getExtensionSettings');
  const settings = await browser.storage.local.get('extension');
  logger.logFunctionResult('getExtensionSettings', { hasSettings: !!settings.extension });
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
  logger.logFunctionCall('callOpenAI', { promptLength: prompt.length });
  const settings = await getChatSettings();
  
  logger.debug('API Settings loaded', {
    hasApiUrl: !!settings.apiUrl,
    hasApiKey: !!settings.apiKey,
    model: settings.model,
    temperature: settings.temperature,
    maxTokens: settings.maxTokens
  });

  if (!settings.apiUrl || !settings.apiKey || !settings.model) {
    const t = window.t || ((key) => key);
    const error = new Error(t('errorApiSettingsMissing'));
    logger.error('Missing API settings', error);
    throw error;
  }

  const startTime = performance.now();
  logger.info('Starting API call', { model: settings.model, promptLength: prompt.length });

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
    logger.debug('Sending request to API', { url: settings.apiUrl, model: settings.model });
    
    const response = await fetch(settings.apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${settings.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    logger.debug('API response received', { status: response.status, ok: response.ok });

    if (!response.ok) {
      const errorText = await response.text();
      logger.error('API request failed', { status: response.status, error: errorText });
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

    logger.info('API call successful', {
      model: settings.model,
      inputTokens,
      outputTokens,
      time: time + 's',
      cost,
      responseLength: content.length
    });

    return { 
      content, 
      usage: { input: inputTokens, output: outputTokens }, 
      model: settings.model, 
      time, 
      cost 
    };
  } catch (error) {
    logger.logError('callOpenAI', error);
    throw error;
  }
}

/**
 * Build full prompt from email context and user instructions
 */
export function buildPrompt(emailContext, userInstructions, stripHtmlFn) {
  logger.logFunctionCall('buildPrompt', {
    hasContext: !!emailContext,
    instructionsLength: userInstructions.length
  });
  
  const extensionSettings = emailContext.extensionSettings || {};
  const t = window.t || ((key) => key);
  
  let senderInfo = '';
  if (extensionSettings.includeSender && emailContext.sender) {
    senderInfo = `${t('promptContextSender')} ${emailContext.sender}\n`;
  }

  const emailBody = stripHtmlFn(emailContext.emailBody);

  const prompt = `${t('promptContextEmail')}
${t('promptContextSubject')} ${emailContext.subject}
${senderInfo}${t('promptContextReceiver')} ${emailContext.receiver}
${t('promptContextReceiverName')} ${emailContext.receiverName}
${t('promptContextReceiverOrganization')} ${emailContext.receiverOrganization}
${t('promptContextMessage')} ${emailBody}
${t('promptContextLanguageDetect')}

${t('promptContextInstructions')} ${userInstructions}

${t('promptContextFormat')}`;

  logger.debug('Prompt built', {
    promptLength: prompt.length,
    includedSender: !!senderInfo,
    emailBodyLength: emailBody.length
  });

  return prompt;
}

/**
 * Save API statistics
 */
export async function saveStats(stats) {
  logger.logFunctionCall('saveStats', stats);
  await browser.storage.local.set({ lastStats: stats });
  logger.info('Stats saved', stats);
}

/**
 * Increment generation counter
 */
export async function incrementGenerationCounter() {
  logger.logFunctionCall('incrementGenerationCounter');
  const currentCount = await browser.storage.local.get('generatedEmails');
  const newCount = (currentCount.generatedEmails || 0) + 1;
  await browser.storage.local.set({ generatedEmails: newCount });
  logger.info('Generation counter incremented', { newCount });
}

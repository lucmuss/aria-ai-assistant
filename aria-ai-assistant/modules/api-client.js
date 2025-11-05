/**
 * API Client Module
 * Handles communication with OpenAI API
 */

import { createLogger } from './logger.js';
const logger = createLogger('API-Client');

// Cache for app config
let appConfigCache = null;

/**
 * Load app configuration from app-config.json
 */
async function loadAppConfig() {
  if (appConfigCache) {
    return appConfigCache;
  }

  try {
    const configUrl = browser.runtime.getURL('app-config.json');
    const response = await fetch(configUrl);
    if (!response.ok) {
      throw new Error(`Failed to load app config: ${response.status}`);
    }
    appConfigCache = await response.json();
    logger.debug('App config loaded', appConfigCache);
    return appConfigCache;
  } catch (error) {
    logger.error('Failed to load app config, using defaults', error);
    // Return default config if loading fails
    appConfigCache = {
      system_prompt_template: "You are a helpful email assistant. {tone} {length}",
      user_prompt_template: `EMAIL CONTEXT:
• Subject: {subject}
{senderInfo}• To: {receiver} ({receiverName} at {receiverOrganization})
• Original Message: {message}

INSTRUCTIONS:
{userInstructions}

RESPONSE GUIDELINES:
• Write from {receiverName}'s perspective at {receiverOrganization}
• Respond in the same language as the original message
• Match the formality level of the original email
• Be professional, clear, and concise
• Address all key points from the original message
• Write ONLY the email body - no subject, greeting, or signature
• Use natural paragraph structure with line breaks between paragraphs`
    };
    return appConfigCache;
  }
}

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
 * Get current system prompt from storage with tone and length applied
 * Returns the content of the currently selected system prompt or a default with template applied
 */
export async function getCurrentSystemPrompt(tone = 'none', length = 'none') {
  logger.logFunctionCall('getCurrentSystemPrompt', { tone, length });

  // Load app config to get the template
  const appConfig = await loadAppConfig();
  const template = appConfig.system_prompt_template || "You are a helpful email assistant. {tone} {length}";

  // Get the stored system prompt
  const result = await browser.storage.local.get('currentSystemPrompt');
  let systemPrompt = result.currentSystemPrompt || 'You are a helpful email assistant.';

  // If using the default, apply the template with tone and length
  if (!result.currentSystemPrompt) {
    // Build tone and length strings
    let toneString = '';
    if (tone !== 'none') {
      switch (tone) {
        case 'formal':
          toneString = 'Respond in a formal, professional tone.';
          break;
        case 'casual':
          toneString = 'Respond in a casual, conversational tone.';
          break;
        case 'friendly':
          toneString = 'Respond in a friendly, approachable tone.';
          break;
        default:
          toneString = '';
      }
    }

    let lengthString = '';
    if (length !== 'none') {
      switch (length) {
        case 'short':
          lengthString = 'Keep the response concise and to the point (under 100 words).';
          break;
        case 'medium':
          lengthString = 'Provide a balanced response with sufficient detail (100-300 words).';
          break;
        case 'long':
          lengthString = 'Provide a comprehensive response with detailed explanations (300+ words).';
          break;
        default:
          lengthString = '';
      }
    }

    // Apply template
    systemPrompt = template
      .replace('{tone}', toneString)
      .replace('{length}', lengthString)
      .trim();
  }

  logger.logFunctionResult('getCurrentSystemPrompt', { promptLength: systemPrompt.length });
  return systemPrompt;
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
export async function callOpenAI(prompt, tone = 'none', length = 'none') {
  logger.logFunctionCall('callOpenAI', { promptLength: prompt.length, tone, length });
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

  // Get the current system prompt from System Prompt Settings with tone and length applied
  const systemPrompt = await getCurrentSystemPrompt(tone, length);

  const body = {
    model: settings.model,
    messages: [
      { 
        role: 'system', 
        content: systemPrompt
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
export async function buildPrompt(emailContext, userInstructions, stripHtmlFn) {
  logger.logFunctionCall('buildPrompt', {
    hasContext: !!emailContext,
    instructionsLength: userInstructions.length
  });

  // Load app config to get the template
  const appConfig = await loadAppConfig();
  const template = appConfig.user_prompt_template || `EMAIL CONTEXT:
• Subject: {subject}
{senderInfo}• To: {receiver} ({receiverName} at {receiverOrganization})
• Original Message: {message}

INSTRUCTIONS:
{userInstructions}

RESPONSE GUIDELINES:
• Write from {receiverName}'s perspective at {receiverOrganization}
• Respond in the same language as the original message
• Match the formality level of the original email
• Be professional, clear, and concise
• Address all key points from the original message
• Write ONLY the email body - no subject, greeting, or signature
• Use natural paragraph structure with line breaks between paragraphs`;

  const extensionSettings = emailContext.extensionSettings || {};

  let senderInfo = '';
  if (extensionSettings.includeSender && emailContext.sender) {
    senderInfo = `Sender: ${emailContext.sender}\n`;
  }

  const emailBody = stripHtmlFn(emailContext.emailBody);

  // Apply template
  const prompt = template
    .replace('{subject}', emailContext.subject)
    .replace('{senderInfo}', senderInfo)
    .replace('{receiver}', emailContext.receiver)
    .replace('{receiverName}', emailContext.receiverName)
    .replace('{receiverOrganization}', emailContext.receiverOrganization)
    .replace('{message}', emailBody)
    .replace('{userInstructions}', userInstructions);

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

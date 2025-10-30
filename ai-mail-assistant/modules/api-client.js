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
    throw new Error('API-Einstellungen fehlen. Bitte URL, API-Key und Modell in den Einstellungen konfigurieren.');
  }

  const startTime = performance.now();

  const body = {
    model: settings.model,
    messages: [
      { 
        role: 'system', 
        content: settings.systemPrompt || 'Du bist ein hilfreicher E-Mail-Assistent.' 
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
      throw new Error(`API-Fehler (${response.status}): ${errorText}`);
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
  
  let senderInfo = '';
  if (extensionSettings.includeSender && emailContext.sender) {
    senderInfo = `Absender: ${emailContext.sender}\n`;
  }

  const emailBody = stripHtmlFn(emailContext.emailBody);

  return `E-Mail-Kontext:
Betreff: ${emailContext.subject}
${senderInfo}Name: ${emailContext.userName}
Organisation: ${emailContext.userOrganization}
Nachricht: ${emailBody}
Erkenne die Sprache der Nachricht und antworte in derselben Sprache.

Benutzeranweisungen: ${userInstructions}

Bitte schreibe eine passende Antwort basierend auf dem E-Mail-Kontext und den Benutzeranweisungen. Formatiere die Antwort mit Zeilenumbrüchen und mehreren Absätzen, damit sie gut in Thunderbird als E-Mail-Körper eingefügt werden kann. Schreibe nur den Inhalt der E-Mail-Antwort, ohne den Betreff einzuschließen. Beginne die Antwort nicht mit 'AI response received:' oder ähnlichen Phrasen.`;
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

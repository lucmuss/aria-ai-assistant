/**
 * System Prompt Manager Module
 * Handles saving, loading, and deleting system prompts
 */

/**
 * Get all saved system prompts
 * @returns {Promise<Object>} Object containing all system prompts
 */
export async function getAllSystemPrompts() {
  const result = await browser.storage.local.get('systemPrompts');
  return result.systemPrompts || {};
}

/**
 * Save a system prompt
 * @param {string} name - Name of the system prompt
 * @param {string} content - Content of the system prompt
 * @returns {Promise<void>}
 */
export async function saveSystemPrompt(name, content) {
  if (!name || !name.trim()) {
    throw new Error('System prompt name cannot be empty');
  }
  
  const systemPrompts = await getAllSystemPrompts();
  systemPrompts[name] = content;
  
  await browser.storage.local.set({ systemPrompts });
}

/**
 * Load a system prompt by name
 * @param {string} name - Name of the system prompt to load
 * @returns {Promise<string|null>} Content of the system prompt or null if not found
 */
export async function loadSystemPrompt(name) {
  const systemPrompts = await getAllSystemPrompts();
  return systemPrompts[name] || null;
}

/**
 * Delete a system prompt
 * @param {string} name - Name of the system prompt to delete
 * @returns {Promise<void>}
 */
export async function deleteSystemPrompt(name) {
  const systemPrompts = await getAllSystemPrompts();
  delete systemPrompts[name];
  
  await browser.storage.local.set({ systemPrompts });
}

/**
 * Populate the system prompt library dropdown
 * @param {HTMLSelectElement} selectElement - The select element to populate
 * @returns {Promise<void>}
 */
export async function populateSystemPromptLibrary(selectElement) {
  const systemPrompts = await getAllSystemPrompts();
  
  // Clear existing options except the first one
  selectElement.innerHTML = '<option value="">-- Select a saved system prompt --</option>';
  
  // Add all saved system prompts
  Object.keys(systemPrompts).sort().forEach(name => {
    const option = document.createElement('option');
    option.value = name;
    option.textContent = name;
    selectElement.appendChild(option);
  });
}

/**
 * Load system prompt into form fields
 * @param {string} name - Name of the system prompt
 * @param {HTMLInputElement} nameInput - The name input field
 * @param {HTMLTextAreaElement} contentTextarea - The content textarea field
 * @returns {Promise<void>}
 */
export async function loadSystemPromptIntoForm(name, nameInput, contentTextarea) {
  const content = await loadSystemPrompt(name);
  
  if (content !== null) {
    nameInput.value = name;
    contentTextarea.value = content;
  }
}

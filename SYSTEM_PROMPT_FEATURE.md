# System Prompt Management Feature

## Overview
This feature allows users to save, load, and manage multiple system prompts in the ARIA AI Assistant extension.

## Features Implemented

### 1. User Interface (settings.html)
- **System Prompt Library dropdown**: Select from saved system prompts
- **System Prompt Name field**: Enter or view the name of the current prompt
- **System Prompt Content textarea**: Enter or edit the prompt content
- **Save System Prompt button**: Save the current prompt with a name
- **Delete System Prompt button**: Remove the selected prompt from the library

### 2. Backend Module (system-prompt-manager.js)
- `getAllSystemPrompts()`: Retrieve all saved prompts
- `saveSystemPrompt(name, content)`: Save a prompt with validation
- `loadSystemPrompt(name)`: Load a specific prompt
- `deleteSystemPrompt(name)`: Remove a prompt from storage
- `populateSystemPromptLibrary()`: Update the dropdown with saved prompts
- `loadSystemPromptIntoForm()`: Load a prompt into the form fields

### 3. Settings Integration (settings.js)
- Dropdown change handler: Loads selected prompt into form fields
- Save button handler: Saves prompt and updates UI with success message
- Delete button handler: Removes prompt after confirmation
- Automatic UI refresh after save/delete operations

### 4. Internationalization
Added translations for:
- German (de/messages.json)
- English (en/messages.json)

Translation keys:
- `systemPromptSettings`
- `systemPromptLibraryLabel`
- `systemPromptLibraryDesc`
- `systemPromptNameLabel`
- `systemPromptNameDesc`
- `systemPromptContentLabel`
- `systemPromptContentDesc`
- `saveSystemPromptBtn`
- `deleteSystemPromptBtn`
- `systemPromptNameRequired`
- `systemPromptSaved`
- `systemPromptSaveError`
- `systemPromptSelectToDelete`
- `systemPromptDeleteConfirm`
- `systemPromptDeleted`
- `systemPromptDeleteError`

## User Workflow

### Saving a System Prompt
1. Enter a name in the "System Prompt Name" field
2. Enter the prompt content in the "System Prompt" textarea
3. Click "💾 Save System Prompt"
4. The prompt is saved and appears in the dropdown
5. A success message is displayed for 3 seconds

### Loading a System Prompt
1. Open the "System Prompt Library" dropdown
2. Select a saved prompt from the list
3. The name and content fields are automatically populated

### Deleting a System Prompt
1. Select a prompt from the "System Prompt Library" dropdown
2. Click "🗑️ Delete System Prompt"
3. Confirm the deletion in the dialog
4. The prompt is removed and the form is cleared
5. A success message is displayed for 3 seconds

## Data Storage
System prompts are stored in the browser's local storage under the key `systemPrompts` as a JavaScript object:

```javascript
{
  "Default": "You are a helpful email assistant.",
  "Formal": "You are a formal, professional assistant.",
  "Friendly": "You are a friendly and approachable assistant."
}
```

## Testing Instructions

### Manual Testing
1. Load the extension in Thunderbird
2. Open Settings (⚙️)
3. Scroll to "System Prompt Settings" section
4. Test saving a new prompt:
   - Enter name: "Test Prompt"
   - Enter content: "This is a test system prompt"
   - Click Save
   - Verify it appears in the dropdown
5. Test loading a prompt:
   - Select "Test Prompt" from dropdown
   - Verify fields are populated correctly
6. Test deleting a prompt:
   - With "Test Prompt" selected
   - Click Delete
   - Confirm deletion
   - Verify it's removed from the dropdown

### Edge Cases to Test
- [ ] Save prompt with empty name (should show error)
- [ ] Save prompt with empty content (should succeed)
- [ ] Delete without selecting a prompt (should show error)
- [ ] Save duplicate name (should overwrite)
- [ ] UI updates correctly after save/delete
- [ ] Translations work in German and English

## Files Modified
1. `aria-ai-assistant/settings.html` - Added System Prompt Settings section, removed System Prompt from Chat API Settings
2. `aria-ai-assistant/modules/system-prompt-manager.js` - New module for managing system prompts
3. `aria-ai-assistant/settings.js` - Added event handlers for system prompt management
4. `aria-ai-assistant/modules/settings-data.js` - Removed chatSystemPrompt loading/saving, added currentSystemPrompt loading
5. `aria-ai-assistant/modules/api-client.js` - Added getCurrentSystemPrompt() function, updated callOpenAI() to use it
6. `aria-ai-assistant/locales/de/messages.json` - German translations
7. `aria-ai-assistant/locales/en/messages.json` - English translations

## Future Enhancements
- Export/import individual prompts
- Prompt categories or tags
- Default/favorite prompt marking
- Prompt preview before loading
- Prompt templates library

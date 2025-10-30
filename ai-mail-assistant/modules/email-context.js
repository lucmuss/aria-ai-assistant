/**
 * Email Context Module
 * Handles retrieving email context from Thunderbird
 */

/**
 * Get the active mail tab
 */
export async function getActiveMailTab() {
  try {
    const mailTab = await browser.mailTabs.getCurrent();
    if (mailTab) {
      console.log('MailTab found:', mailTab);
      return mailTab;
    }
  } catch (error) {
    console.log('No MailTab available:', error.message);
  }

  // Fallback: Query active tabs
  const tabs = await browser.tabs.query({ active: true, currentWindow: true });
  if (!tabs || tabs.length === 0) {
    console.log('No active tabs found');
    return null;
  }
  
  const tab = tabs[0];
  console.log('Active tab:', tab);
  
  if (tab.mailTab) {
    console.log('Tab is a MailTab');
    return tab;
  }
  
  return null;
}

/**
 * Strip HTML tags from text
 */
export function stripHtml(text) {
  // Remove <style> and <script> blocks
  let cleaned = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
  cleaned = cleaned.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  
  // Parse HTML
  const parser = new DOMParser();
  const doc = parser.parseFromString(cleaned, 'text/html');
  
  // Get plain text
  let plainText = doc.body.textContent || '';
  
  // Clean up whitespace
  const lines = plainText.split('\n');
  const cleanedLines = lines.map(line => line.replace(/^\s+/, ''));
  plainText = cleanedLines.join('\n');
  plainText = plainText.replace(/\n\s*\n/g, '\n\n').trim();
  
  return plainText;
}

/**
 * Get user identity from background
 */
async function getUserIdentity() {
  try {
    const response = await browser.runtime.sendMessage({ action: 'getUserIdentity' });
    return {
      userName: response.userName || '',
      userOrganization: response.userOrganization || ''
    };
  } catch (error) {
    console.error('Failed to get user identity:', error);
    return { userName: '', userOrganization: '' };
  }
}

/**
 * Get email context from composer window
 */
async function getComposerContext(windowInfo) {
  const tabs = await browser.tabs.query({ windowId: windowInfo.id, active: true });
  if (tabs.length === 0) return null;

  const composeTabId = tabs[0].id;
  const composeDetails = await browser.compose.getComposeDetails(composeTabId);
  console.log('Compose details:', composeDetails);

  let { userName, userOrganization } = await getUserIdentity();

  // Fallback: Extract from signature
  if (!userName && composeDetails.signature) {
    const sigText = stripHtml(composeDetails.signature);
    const nameMatch = sigText.match(/,\s*([A-ZÄÖÜ][a-zäöü]+(?:\s+[A-ZÄÖÜ][a-zäöü]+)*)/i);
    if (nameMatch) userName = nameMatch[1];
    
    const orgMatch = sigText.match(/([A-ZÄÖÜ][a-zäöü\s]+(?:GmbH|Inc|Corp|AG|LLC))/i);
    if (orgMatch) userOrganization = orgMatch[1];
  }

  // Fallback: Extract from 'from' field
  if (!userName && composeDetails.from) {
    const fromName = composeDetails.from.split('<')[0].trim();
    if (fromName) userName = fromName;
  }

  // Reply context
  if (composeDetails.inReplyTo) {
    try {
      const compMsg = await browser.messages.get(composeDetails.inReplyTo);
      const full = await browser.messages.getFull(compMsg.id);
      let body = '';
      
      for (let part of Object.values(full.parts)) {
        if (part.contentType === 'text/plain' && part.body) {
          body = part.body;
          break;
        }
      }
      
      return {
        messageId: compMsg.id,
        emailBody: body,
        subject: compMsg.subject,
        sender: compMsg.author,
        userName,
        userOrganization,
        context: 'composer',
        tabId: composeTabId,
        windowId: windowInfo.id
      };
    } catch (error) {
      console.error('Failed to load reply message:', error);
    }
  }

  // New email or draft
  return {
    messageId: null,
    emailBody: composeDetails.body || '',
    subject: composeDetails.subject || '',
    sender: composeDetails.to && composeDetails.to.length > 0 ? composeDetails.to[0] : '',
    userName,
    userOrganization,
    context: 'composer',
    tabId: composeTabId,
    windowId: windowInfo.id
  };
}

/**
 * Get email context from viewer window
 */
async function getViewerContext() {
  const mailTab = await getActiveMailTab();
  if (!mailTab) return null;

  try {
    const message = await browser.messageDisplay.getDisplayedMessage(mailTab.id);
    if (!message) return null;

    const full = await browser.messages.getFull(message.id);
    let body = '';
    
    for (let part of Object.values(full.parts)) {
      if (part.contentType === 'text/plain' && part.body) {
        body = part.body;
        break;
      }
    }

    const { userName, userOrganization } = await getUserIdentity();

    return {
      messageId: message.id,
      emailBody: body,
      subject: message.subject,
      sender: message.author,
      userName,
      userOrganization,
      context: 'viewer'
    };
  } catch (error) {
    console.log('Failed to get viewer context:', error);
    return null;
  }
}

/**
 * Get complete email context
 */
export async function getEmailContext() {
  console.log('Getting email context...');

  try {
    const windowInfo = await browser.windows.getCurrent();
    console.log('Current window:', windowInfo);

    // Check composer context
    if (windowInfo.type === 'messageCompose') {
      console.log('Composer context detected');
      const context = await getComposerContext(windowInfo);
      if (context) return context;
    }
  } catch (error) {
    console.error('Error checking composer context:', error);
  }

  // Fallback to viewer context
  console.log('Checking viewer context...');
  const context = await getViewerContext();
  
  if (!context) {
    throw new Error('No message or reply draft open. Please open an email or reply first.');
  }

  return context;
}

/**
 * Insert text into email
 */
export async function insertTextAtCursor(text, context = 'viewer', tabId = null) {
  console.log('Inserting text, context:', context, 'tabId:', tabId);

  if (context === 'composer') {
    try {
      let composeTabId = tabId;
      
      if (!composeTabId) {
        const windowInfo = await browser.windows.getCurrent();
        if (windowInfo.type === 'messageCompose') {
          const tabs = await browser.tabs.query({ windowId: windowInfo.id, active: true });
          if (tabs.length > 0) {
            composeTabId = tabs[0].id;
          }
        }
      }

      if (composeTabId) {
        const details = await browser.compose.getComposeDetails(composeTabId);
        const settings = await browser.storage.local.get('extension');
        const extensionSettings = settings.extension || {};
        
        let currentBody = details.body || '';
        let newBody;
        
        if (extensionSettings.clearEmailAfterSubmit) {
          newBody = text;
        } else {
          const separator = currentBody.trim() ? '\n\n' : '';
          newBody = currentBody + separator + text;
        }
        
        await browser.compose.setComposeDetails(composeTabId, { body: newBody });
        console.log('Text inserted to composer');
        return;
      }
      
      throw new Error('No compose tab found');
    } catch (error) {
      console.error('Failed to insert into composer:', error);
      throw error;
    }
  } else {
    // Viewer context: Create new reply
    const mailTab = await getActiveMailTab();
    if (!mailTab) {
      throw new Error('No message or reply draft open.');
    }

    const message = await browser.messageDisplay.getDisplayedMessage(mailTab.id);
    if (!message) {
      throw new Error('No message or reply draft open.');
    }

    await browser.compose.beginReply(message.id, { body: text });
  }
}

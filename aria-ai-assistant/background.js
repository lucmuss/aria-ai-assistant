browser.runtime.onInstalled.addListener(() => {
  console.log("AI Mail Assistant installiert.");
});

browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getUserIdentity') {
    (async () => {
      try {
        const accounts = await browser.accounts.getAll();
        let receiverName = '';
        let receiverEmail = '';
        let receiverOrganization = '';
        if (accounts.length > 0) {
          const defaultAccount = accounts[0];
          const identity = defaultAccount.defaultIdentity;
          if (identity) {
            receiverName = identity.name || '';
            receiverEmail = identity.email || '';
            receiverOrganization = identity.organization || '';
          }
        }
        sendResponse({ receiverName, receiverEmail, receiverOrganization });
      } catch (error) {
        console.error('Background: Error fetching accounts:', error);
        sendResponse({ receiverName: '', receiverEmail: '', receiverOrganization: '' });
      }
    })();
    return true; // Keep message channel open for async response
  }
});

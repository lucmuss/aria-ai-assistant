browser.runtime.onInstalled.addListener(() => {
  console.log("AI Mail Assistant installiert.");
});

browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getUserIdentity') {
    (async () => {
      try {
        const accounts = await browser.accounts.getAll();
        let userName = '';
        let userOrganization = '';
        if (accounts.length > 0) {
          const defaultAccount = accounts[0];
          const identity = defaultAccount.defaultIdentity;
          if (identity) {
            userName = identity.name || '';
            userOrganization = identity.organization || '';
          }
        }
        sendResponse({ userName, userOrganization });
      } catch (error) {
        console.error('Background: Error fetching accounts:', error);
        sendResponse({ userName: '', userOrganization: '' });
      }
    })();
    return true; // Keep message channel open for async response
  }
});

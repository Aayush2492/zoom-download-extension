// background.js - Service worker using declarativeNetRequest to allow CORS with credentials and Referer for Zoom media streams

function setupRules(originUrl = 'https://us06web.zoom.us') {
  // Ensure no trailing slash for Origin header match
  const cleanOrigin = originUrl.replace(/\/$/, '');
  const refererUrl = cleanOrigin + '/';

  return new Promise((resolve) => {
    chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: [1, 2],
      addRules: [
        {
          id: 1,
          priority: 1,
          action: {
            type: 'modifyHeaders',
            requestHeaders: [
              { header: 'Referer', operation: 'set', value: refererUrl },
              { header: 'Origin', operation: 'set', value: cleanOrigin }
            ]
          },
          condition: { urlFilter: 'zoom.us' }
        },
        {
          id: 2,
          priority: 1,
          action: {
            type: 'modifyHeaders',
            responseHeaders: [
              { header: 'Access-Control-Allow-Origin', operation: 'set', value: cleanOrigin },
              { header: 'Access-Control-Allow-Credentials', operation: 'set', value: 'true' }
            ]
          },
          condition: { urlFilter: 'zoom.us' }
        }
      ]
    }, () => {
      if (chrome.runtime.lastError) {
        console.error('Rule setup error:', chrome.runtime.lastError.message || chrome.runtime.lastError);
      } else {
        console.log('CORS & Referer rules confirmed active for origin:', cleanOrigin);
      }
      resolve();
    });
  });
}

chrome.runtime.onInstalled.addListener(() => setupRules());
chrome.runtime.onStartup.addListener(() => setupRules());

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'SETUP_CORS_ORIGIN' && message.origin) {
    setupRules(message.origin).then(() => {
      sendResponse({ success: true });
    });
    return true;
  }
});

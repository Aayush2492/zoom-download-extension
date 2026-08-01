// background.js - Service worker using declarativeNetRequest to allow CORS and Referer for Zoom media streams

function setupRules(refererUrl = 'https://us06web.zoom.us/') {
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
              { header: 'Referer', operation: 'set', value: refererUrl }
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
              { header: 'Access-Control-Allow-Origin', operation: 'set', value: '*' },
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
        console.log('CORS & Referer rules confirmed active.');
      }
      resolve();
    });
  });
}

chrome.runtime.onInstalled.addListener(() => setupRules());
chrome.runtime.onStartup.addListener(() => setupRules());

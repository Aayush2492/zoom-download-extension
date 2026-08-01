// background.js - Service worker using declarativeNetRequest to attach Referer header for Zoom downloads

function setupRefererRule(refererUrl = 'https://us06web.zoom.us/') {
  return new Promise((resolve) => {
    chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: [1],
      addRules: [
        {
          id: 1,
          priority: 1,
          action: {
            type: 'modifyHeaders',
            requestHeaders: [
              {
                header: 'Referer',
                operation: 'set',
                value: refererUrl
              }
            ]
          },
          condition: {
            urlFilter: 'zoom.us'
          }
        }
      ]
    }, () => {
      if (chrome.runtime.lastError) {
        console.error('Rule setup error:', chrome.runtime.lastError.message || chrome.runtime.lastError);
      } else {
        console.log('Referer header rule confirmed active for:', refererUrl);
      }
      resolve();
    });
  });
}

chrome.runtime.onInstalled.addListener(() => {
  setupRefererRule();
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'DOWNLOAD_VIDEO' && message.url) {
    const refererUrl = message.referer || 'https://us06web.zoom.us/';

    // Ensure declarative rule is active BEFORE calling chrome.downloads.download
    setupRefererRule(refererUrl).then(() => {
      console.log('Starting download for URL:', message.url);

      chrome.downloads.download({
        url: message.url,
        filename: message.filename || 'Zoom_Recording.mp4',
        saveAs: true
      }, (downloadId) => {
        if (chrome.runtime.lastError) {
          console.error('Download error:', chrome.runtime.lastError.message || chrome.runtime.lastError);
        } else {
          console.log('Download started successfully. ID:', downloadId);
        }
      });
      sendResponse({ success: true });
    });
    return true;
  }
});

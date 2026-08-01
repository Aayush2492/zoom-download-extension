// background.js - Service worker to execute downloads via chrome.downloads API with Referer header

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'DOWNLOAD_VIDEO' && message.url) {
    const refererUrl = message.referer || 'https://us06web.zoom.us/';
    console.log('Starting download for URL:', message.url, 'with Referer:', refererUrl);
    
    chrome.downloads.download({
      url: message.url,
      filename: message.filename || 'Zoom_Recording.mp4',
      saveAs: true,
      headers: [
        { name: 'Referer', value: refererUrl }
      ]
    }, (downloadId) => {
      if (chrome.runtime.lastError) {
        console.error('Zoom Recording Downloader error:', chrome.runtime.lastError);
      } else {
        console.log('Download started successfully. ID:', downloadId);
      }
    });
    sendResponse({ success: true });
  }
  return true;
});

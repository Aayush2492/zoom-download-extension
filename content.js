// content.js - Injects download UI button and streams MP4 file directly from Zoom using authenticated page session

async function getRecordingInfo() {
  try {
    let playId = window.location.pathname.split('/rec/play/')[1]?.split('?')[0];

    if (!playId && window.__data__ && window.__data__.meetingId) {
      const shareResp = await fetch(`/nws/recording/1.0/play/share-info/${window.__data__.meetingId}`, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Accept': 'application/json' }
      });
      const shareData = await shareResp.json();
      const redirectUrl = shareData?.result?.redirectUrl;
      if (redirectUrl && redirectUrl.includes('/rec/play/')) {
        playId = redirectUrl.split('/rec/play/')[1].split('?')[0];
      }
    }

    if (!playId) {
      console.warn('Zoom Download Extension: Could not resolve playId from current page.');
      return null;
    }

    const resp = await fetch(`/nws/recording/1.0/play/info/${playId}`, {
      method: 'GET',
      credentials: 'include',
      headers: { 'Accept': 'application/json' }
    });

    const data = await resp.json();
    const result = data?.result;

    if (result) {
      const mp4Url = result.viewMp4Url || result.mp4Url;
      const topic = result.recording?.meetingTopic || 'Zoom_Recording';
      const duration = result.duration;
      return { mp4Url, topic, duration };
    }
  } catch (err) {
    console.error('Zoom Download Extension error:', err);
  }
  return null;
}

function initButton() {
  if (document.getElementById('zoom-rec-dl-btn')) return;

  const btn = document.createElement('button');
  btn.id = 'zoom-rec-dl-btn';
  btn.innerText = '⬇ Download Recording';
  btn.style.cssText = 'position:fixed;bottom:24px;right:24px;z-index:999999;padding:12px 18px;background:#0E71EB;color:#fff;border:none;border-radius:8px;cursor:pointer;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;font-size:14px;font-weight:600;box-shadow:0 4px 14px rgba(14,113,235,0.35);transition:background 0.2s;';

  btn.addEventListener('mouseover', () => btn.style.background = '#0C5DC2');
  btn.addEventListener('mouseout', () => btn.style.background = '#0E71EB');

  btn.addEventListener('click', async () => {
    btn.innerText = '⏳ Resolving video URL...';
    btn.disabled = true;
    const info = await getRecordingInfo();

    if (info && info.mp4Url) {
      btn.innerText = '⬇ Downloading video (0%)...';
      const safeTitle = info.topic.replace(/[^a-zA-Z0-9_\-]/g, '_');

      try {
        const response = await fetch(info.mp4Url, {
          method: 'GET',
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error(`HTTP error ${response.status}`);
        }

        const reader = response.body.getReader();
        const contentLength = +response.headers.get('Content-Length') || 0;
        let receivedLength = 0;
        const chunks = [];

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          chunks.push(value);
          receivedLength += value.length;
          if (contentLength > 0) {
            const pct = Math.round((receivedLength / contentLength) * 100);
            btn.innerText = `⬇ Downloading video (${pct}%)...`;
          } else {
            const mb = (receivedLength / (1024 * 1024)).toFixed(1);
            btn.innerText = `⬇ Downloading (${mb} MB)...`;
          }
        }

        btn.innerText = '⏳ Saving MP4 file...';
        const blob = new Blob(chunks, { type: 'video/mp4' });
        const blobUrl = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = `${safeTitle}.mp4`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(blobUrl);

        btn.innerText = '✅ Saved to Downloads!';
      } catch (err) {
        console.error('Download stream error:', err);
        btn.innerText = '❌ Download failed (See Console)';
      }

      setTimeout(() => {
        btn.innerText = '⬇ Download Recording';
        btn.disabled = false;
      }, 4000);
    } else {
      btn.innerText = '❌ Stream not found (Authenticating needed?)';
      setTimeout(() => {
        btn.innerText = '⬇ Download Recording';
        btn.disabled = false;
      }, 3000);
    }
  });

  document.body.appendChild(btn);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initButton);
} else {
  initButton();
}

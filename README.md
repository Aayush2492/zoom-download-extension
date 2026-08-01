# Zoom Recording Downloader (Chrome Extension MV3)

A lightweight Manifest V3 Chrome Extension that enables downloading Zoom recordings directly from authenticated share and play pages (`https://*.zoom.us/rec/share/*` and `https://*.zoom.us/rec/play/*`).

## Why This Works (Technical Overview)
Modern Zoom recordings use a Single-Page Application (SPA) architecture where passcode validation occurs via `/nws/recording/1.0/validate-meeting-passwd` rather than legacy HTML forms (`/rec/validate_meet_passwd`).

By running inside the authenticated Chrome session, this extension:
1. Inherits active session cookies (`_zm_ssid`, `cred`, etc.) after passcode entry.
2. Queries Zoom's internal `/nws/recording/1.0/play/info/{playId}` API to retrieve the direct CDN video stream URL (`viewMp4Url` / `mp4Url`).
3. Passes the stream URL to Chrome's native `chrome.downloads` manager to handle large video downloads reliably.

## Installation (Developer Mode)

1. Clone or download this repository to your local machine:
   ```bash
   git clone git@github.com:Aayush2492/zoom-recording-downloader.git
   ```
2. Open Google Chrome and navigate to `chrome://extensions/`.
3. Enable **Developer mode** in the top-right corner.
4. Click **Load unpacked** in the top-left corner and select this folder (`zoom-recording-downloader`).
5. Open any authenticated Zoom recording link—a floating **"⬇ Download Recording"** button will appear in the bottom-right corner of the window.

## Usage

1. Open a Zoom recording share link (e.g., `https://*.zoom.us/rec/share/...`).
2. If the recording is passcode-protected, enter the passcode in the browser as prompted by Zoom.
3. Once the recording page is visible, click the **⬇ Download Recording** button in the bottom-right corner.
4. Choose your download location (or Chrome will save to your default Downloads directory).

## Disclaimer & Policy Notice

- **Terms of Service:** Meeting hosts have an administrative setting to restrict or disable downloading (`disableDownload: true`). Ensure you have authorization from the recording owner before downloading or distributing meeting recordings.
- **Chrome Web Store:** This project is provided as an open-source developer utility. Publishing tools that circumvent download prohibitions on third-party platforms to the official Chrome Web Store may be subject to review restrictions or removal under Web Store developer policies.

## License
MIT License

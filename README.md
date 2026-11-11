# X-Trans — On-Premise Edition

This branch is intended to run on a user's own Windows or macOS computer. The web UI and Express API run locally; the browser connects to `http://127.0.0.1:3000`.

## Current capabilities

- Resolve accessible X/Twitter video posts and direct video URLs
- Select available video qualities and stream/download video
- Translate post text and generate bilingual subtitle content with Google Gemini
- Export subtitle files (SRT/VTT) and Markdown reports from the UI
- Load bundled demonstration videos and upload a local video for analysis

## Requirements

- Node.js 22 LTS or later
- npm
- A Google Gemini API key for live AI translation
- A working yt-dlp executable for the fallback extraction path (the repository currently contains `bin/yt-dlp`; Windows users may need to provide a Windows `yt-dlp.exe`)

## Windows quick start

1. Install Node.js 22 LTS.
2. Copy `.env.example` to `.env` and add your Gemini API key.
3. Double-click `start-windows.bat`.
4. Open `http://127.0.0.1:3000` in your browser.

Or run manually:

```powershell
npm install
npm run dev
```

## Configuration

```env
GEMINI_API_KEY=your_gemini_api_key
PORT=3000
HOST=127.0.0.1
```

Keep `.env` private. Never commit API keys.

## Important implementation status

This is the local-running edition of the current web application, not yet the complete archival workflow originally planned. SQLite history, duplicate detection, configurable archive folders, and automatic per-post video/Markdown/JSON persistence are **not implemented in the current code**. They are planned enhancements for this branch.

The app currently calls Google's Gemini API for live translation, so the application runs locally but translation requests still require internet access and use the configured API key. X/Twitter extraction also depends on external services and the availability of the post.

## Local data and privacy

- The web application is intended to bind to loopback only.
- Video URLs and post content are sent to Gemini when translation is requested.
- Do not expose the local server to a public network.
- Respect the rights and access restrictions applicable to downloaded content.

## Development

```powershell
npm run dev
npm run build
npm run lint
```

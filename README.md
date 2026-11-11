# X-Trans — On-Premise Edition

This branch is intended to run on a user's own Windows or macOS computer. The web UI and Express API run locally; the browser connects to `http://127.0.0.1:3000`.

## Current capabilities

- Resolve accessible X/Twitter video posts and direct video URLs
- Select available video qualities and stream/download video
- Translate post text and generate bilingual subtitle content with Google Gemini
- Export subtitle files (SRT/VTT) and Markdown reports from the UI
- Load bundled demonstration videos and upload a local video for analysis

## Requirements

- Node.js 22.13 LTS or later
- npm
- A Google Gemini API key for live AI translation
- A working yt-dlp executable for the fallback extraction path. The repository includes a `bin/yt-dlp` file, but verify that it matches your operating system and CPU architecture. On macOS, install a native yt-dlp build if needed.

## Windows quick start

1. Install Node.js 22.13 LTS or later.
2. Copy `.env.example` to `.env` and add your Gemini API key.
3. Double-click `start-windows.bat`.
4. Open `http://127.0.0.1:3000` in your browser.

## macOS quick start (Apple Silicon and Intel)

1. Install Node.js 22.13 LTS or later from [nodejs.org](https://nodejs.org/en/download). For an M1/M2/M3/M4 Mac, choose the macOS ARM64 installer.
2. Open Terminal and navigate to the extracted project folder.
3. Make the startup script executable once:

   ```bash
   chmod +x start-mac.sh
   ```

4. Start the app:

   ```bash
   ./start-mac.sh
   ```

5. Open `http://127.0.0.1:3000` in your browser.

The script creates `.env` from `.env.example` if needed, installs npm dependencies on first run, and starts the local server. Add your Gemini API key to `.env` for live translation.

### Optional: install yt-dlp on macOS

The server first tries its bundled yt-dlp executable and then looks for `yt-dlp` on your system PATH. To install a native macOS version (recommended if X/Twitter extraction needs the fallback):

```bash
brew install yt-dlp
```

If Homebrew is not installed, see [brew.sh](https://brew.sh/). This is optional for starting the app, but may be needed for some video extraction cases.

If macOS blocks the script, run it from Terminal using the commands above rather than double-clicking it in Finder.

## Manual start (Windows PowerShell or macOS Terminal)

```bash
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

This is the local-running edition of the current web application, not yet the complete archival workflow originally planned. The on-premise branch now includes a local SQLite archive for resolved X/Twitter posts and their translation packages. Posts are automatically saved when resolved and updated when translation completes. Repeated saves use the post ID, so they update the existing record instead of creating duplicates. The archive API supports listing, retrieving, saving/updating, and deleting records. Automatic video-file storage, per-post export folders, and an archive browser in the UI are still planned.

The app currently calls Google's Gemini API for live translation, so the application runs locally but translation requests still require internet access and use the configured API key. X/Twitter extraction also depends on external services and the availability of the post.

## Local archive

- SQLite database: `data/xtrans-archive.sqlite` by default.
- The `data/` directory is created automatically and excluded from Git.
- Override the location with `ARCHIVE_DIR` in `.env`.
- API: `GET /api/archive`, `GET /api/archive/:tweetId`, `POST /api/archive`, and `DELETE /api/archive/:tweetId`.
- The current archive stores post metadata and translation JSON; it does not yet copy the video file into the archive.

## Local data and privacy

- The web application is intended to bind to loopback only.
- Video URLs and post content are sent to Gemini when translation is requested.
- Do not expose the local server to a public network.
- Respect the rights and access restrictions applicable to downloaded content.

## Development

```bash
npm run dev
npm run build
npm run lint
```

# X-Trans — Online Edition

This branch is intended for a future hosted deployment. It retains the React + Express application model and adds a container build suitable for a managed container platform such as Google Cloud Run.

## Current capabilities

The application currently supports X/Twitter video resolution, video quality selection, streaming/downloads, Gemini-based translation, bilingual subtitles, glossary content, and SRT/VTT/Markdown exports.

## Container build

```bash
docker build -t x-trans-online .
docker run --rm -p 8080:8080 -e GEMINI_API_KEY="$GEMINI_API_KEY" x-trans-online
```

Then open `http://localhost:8080`.

## Cloud deployment configuration

- Container listens on port `8080` by default.
- Set `NODE_ENV=production`.
- Supply `GEMINI_API_KEY` through the hosting platform's secret manager (for Google Cloud Run, use Secret Manager integration).
- Do not put secrets in the image, source code, or deployment manifest.
- Configure platform-appropriate request timeouts and resource limits for video streaming and AI calls.

## Before making this service public

The current server was originally structured for a controlled/demo environment. It is **not yet hardened for unrestricted public internet access**. In particular:

1. CORS currently allows every origin.
2. Video proxy and download endpoints accept caller-supplied URLs and need SSRF protections (allowlist expected media hosts, reject private/link-local IP ranges, validate redirects, and limit response size/time).
3. Download and translation endpoints need rate limiting, abuse controls, and request quotas to protect infrastructure and Gemini spend.
4. Authentication/authorization and per-user quotas are not implemented.
5. Temporary files, persistent storage, and retention policies need an explicit design before multi-user use.

Do not deploy this branch as a public production service until these controls are implemented and tested.

## Storage design

The current app does not yet implement durable user accounts, SQLite history, or persistent per-post archives. For an online multi-user service, persistent metadata and media storage should be externalised rather than relying on a container's local filesystem. The storage/database choice will be made before implementing the hosted archive workflow.

## Development

```bash
npm install
npm run dev
npm run build
npm run lint
```

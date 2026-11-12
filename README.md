# X-Trans — Online Edition

This branch runs the hosted React + Express application in a managed container.

## Current capabilities

The application supports X/Twitter video resolution, video quality selection, streaming/downloads, and free MyMemory text translation without an API key. The sample clips include prewritten transcripts that can be translated into subtitles. For other videos, this service translates the post text only; it does not transcribe audio or generate video summaries and glossaries.

## Container build

```bash
docker build -t x-trans-online .
docker run --rm -p 8080:8080 x-trans-online
```

Then open `http://localhost:8080`.

## Cloud deployment configuration

- Container listens on port `8080` by default.
- Set `NODE_ENV=production`.
- Translation calls MyMemory over HTTPS; no translation API key is required.
- Do not put secrets in the image, source code, or deployment manifest.
- Configure platform-appropriate request timeouts and resource limits for video streaming and AI calls.

## Before making this service public

The current server was originally structured for a controlled/demo environment. It is **not yet hardened for unrestricted public internet access**. Translation sends the post text to MyMemory; anonymous use is limited to 5,000 characters per day, and each request is limited to 500 bytes. In particular:

1. CORS currently allows every origin.
2. Video proxy and download endpoints accept caller-supplied URLs and need SSRF protections (allowlist expected media hosts, reject private/link-local IP ranges, validate redirects, and limit response size/time).
3. Download and translation endpoints need rate limiting, abuse controls, and request quotas to protect infrastructure and MyMemory's anonymous daily quota.
4. Authentication/authorization and per-user quotas are not implemented.
5. Temporary files, persistent storage, and retention policies need an explicit design before multi-user use.

Do not deploy this branch as a public production service until these controls are implemented and tested.


## Cloudflare Workers Free (frontend and API gateway)

The Cloudflare Workers Free plan can host the built React frontend as static assets and route `/api/*` requests to a separately hosted HTTPS API origin. It cannot run this Express/Node application or execute the bundled `yt-dlp` process directly.

### Deploy the frontend

1. Build the frontend: `npm ci && npm run build`.
2. Install Wrangler locally or use `npx wrangler`.
3. Authenticate: `npx wrangler login`.
4. Deploy: `npx wrangler deploy`.
5. In the Worker settings, add the secret/variable `BACKEND_ORIGIN` containing the HTTPS origin of the separately deployed API service (for example, your Render service URL). Do not include a path or credentials.
6. Redeploy after setting the variable if required by your configuration.

The Worker serves static assets and forwards only `/api/*` to the configured HTTPS backend. Until `BACKEND_ORIGIN` is configured, API requests return HTTP 503; the frontend itself can still be served.

### Important security gate

**Do not connect a public backend yet.** The existing Express API still needs server-side hardening before exposure: SSRF-safe media URL validation and redirect handling, bounded streaming/timeouts, rate limiting, request validation, and translation service quotas. The Worker gateway is not a substitute for backend security or authentication. Keep the backend private/restricted until those controls are implemented and tested.

Cloudflare Workers Free currently includes 100,000 Worker requests per day and a 10 ms CPU limit per invocation. Static asset responses have separate free/unlimited asset delivery treatment. Cloudflare Containers are not included on the Free Workers plan; they require Workers Paid. See the [Workers limits](https://developers.cloudflare.com/workers/platform/limits/), [Static Assets billing](https://developers.cloudflare.com/workers/static-assets/billing/), and [Containers pricing](https://developers.cloudflare.com/containers/platform/pricing/) documentation.

## Storage design

The current app does not yet implement durable user accounts, SQLite history, or persistent per-post archives. For an online multi-user service, persistent metadata and media storage should be externalised rather than relying on a container's local filesystem. The storage/database choice will be made before implementing the hosted archive workflow.

## Development

```bash
npm install
npm run dev
npm run build
npm run lint
```

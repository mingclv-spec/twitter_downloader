export interface Env {
  ASSETS: Fetcher;
  BACKEND_ORIGIN: string;
}

function getBackendOrigin(value: string | undefined): URL | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || url.username || url.password) return null;
    return url;
  } catch {
    return null;
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const incoming = new URL(request.url);

    if (incoming.pathname.startsWith("/api/")) {
      const backendOrigin = getBackendOrigin(env.BACKEND_ORIGIN);
      if (!backendOrigin) {
        return Response.json(
          { error: "The API service has not been configured yet." },
          { status: 503 }
        );
      }

      const destination = new URL(
        incoming.pathname + incoming.search,
        backendOrigin
      );

      if (destination.origin !== backendOrigin.origin) {
        return new Response("Invalid API destination", { status: 400 });
      }

      const headers = new Headers(request.headers);
      headers.delete("host");
      headers.delete("cf-connecting-ip");

      const upstreamRequest = new Request(destination.toString(), {
        method: request.method,
        headers,
        body: ["GET", "HEAD"].includes(request.method) ? undefined : request.body,
        redirect: "manual",
      });

      try {
        const upstream = await fetch(upstreamRequest);
        const responseHeaders = new Headers(upstream.headers);
        responseHeaders.set("X-Content-Type-Options", "nosniff");
        responseHeaders.set("Referrer-Policy", "strict-origin-when-cross-origin");
        responseHeaders.set("X-Frame-Options", "DENY");
        responseHeaders.delete("Access-Control-Allow-Origin");
        return new Response(upstream.body, {
          status: upstream.status,
          statusText: upstream.statusText,
          headers: responseHeaders,
        });
      } catch {
        return Response.json(
          { error: "The API service is temporarily unavailable." },
          { status: 502 }
        );
      }
    }

    const assetResponse = await env.ASSETS.fetch(request);
    const headers = new Headers(assetResponse.headers);
    headers.set("X-Content-Type-Options", "nosniff");
    headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    headers.set("X-Frame-Options", "DENY");
    headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
    return new Response(assetResponse.body, {
      status: assetResponse.status,
      statusText: assetResponse.statusText,
      headers,
    });
  },
};

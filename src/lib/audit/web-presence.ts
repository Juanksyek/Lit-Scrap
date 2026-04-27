import type { WebPresenceResult } from "./types";

const TIMEOUT_MS = 8000;

function isParkedDomain(html: string): boolean {
  const parkedSignals = [
    "parking",
    "domain for sale",
    "buy this domain",
    "sedoparking",
    "godaddy",
    "namecheap parking",
  ];
  const lower = html.toLowerCase();
  return parkedSignals.some((s) => lower.includes(s));
}

export async function checkWebPresence(
  websiteUri: string
): Promise<WebPresenceResult> {
  const start = Date.now();

  try {
    const httpUrl = websiteUri.replace(/^https?:\/\//, "http://");
    const httpsUrl = websiteUri.replace(/^https?:\/\//, "https://");

    const httpsResponse = await fetch(httpsUrl, {
      method: "GET",
      redirect: "follow",
      signal: AbortSignal.timeout(TIMEOUT_MS),
      headers: { "User-Agent": "Mozilla/5.0 LitScrap-Auditor/1.0" },
    });

    const responseTimeMs = Date.now() - start;
    const statusCode = httpsResponse.status;
    const text = await httpsResponse.text();

    let redirectsToHttps = false;
    try {
      const httpResponse = await fetch(httpUrl, {
        method: "HEAD",
        redirect: "follow",
        signal: AbortSignal.timeout(TIMEOUT_MS),
        headers: { "User-Agent": "Mozilla/5.0 LitScrap-Auditor/1.0" },
      });
      redirectsToHttps = httpResponse.url.startsWith("https://");
    } catch {
      redirectsToHttps = false;
    }

    const errorType =
      statusCode >= 400 && statusCode < 500
        ? "4xx"
        : statusCode >= 500
          ? "5xx"
          : null;

    return {
      responds: true,
      statusCode,
      redirectsToHttps,
      responseTimeMs,
      isParkedOrDown: isParkedDomain(text),
      errorType,
    };
  } catch {
    return {
      responds: false,
      statusCode: null,
      redirectsToHttps: false,
      responseTimeMs: null,
      isParkedOrDown: false,
      errorType: null,
    };
  }
}

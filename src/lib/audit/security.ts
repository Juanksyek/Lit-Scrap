import type { SecurityResult } from "./types";

const TIMEOUT_MS = 8000;

export async function checkSecurity(
  websiteUri: string
): Promise<SecurityResult> {
  const httpsUrl = websiteUri.replace(/^https?:\/\//, "https://");
  const httpUrl = websiteUri.replace(/^https?:\/\//, "http://");

  let httpsOk = false;
  let hasHsts = false;
  let certificateValid = false;

  try {
    const res = await fetch(httpsUrl, {
      method: "HEAD",
      redirect: "follow",
      signal: AbortSignal.timeout(TIMEOUT_MS),
      headers: { "User-Agent": "Mozilla/5.0 LitScrap-Auditor/1.0" },
    });
    httpsOk = res.ok || res.status < 400;
    hasHsts =
      res.headers.has("strict-transport-security") ||
      res.headers.has("Strict-Transport-Security");
    certificateValid = res.url.startsWith("https://");
  } catch {
    httpsOk = false;
  }

  let httpRedirectsToHttps = false;
  try {
    const httpRes = await fetch(httpUrl, {
      method: "HEAD",
      redirect: "follow",
      signal: AbortSignal.timeout(TIMEOUT_MS),
      headers: { "User-Agent": "Mozilla/5.0 LitScrap-Auditor/1.0" },
    });
    httpRedirectsToHttps = httpRes.url.startsWith("https://");
  } catch {
    httpRedirectsToHttps = false;
  }

  return { httpsOk, httpRedirectsToHttps, hasHsts, certificateValid };
}

import { checkWebPresence } from "./web-presence";
import { checkSecurity } from "./security";
import { checkPageSpeed } from "./pagespeed";
import { analyzeforms } from "./forms";
import { analyzeFrontend } from "./frontend";
import { analyzeSeo } from "./seo";
import { analyzeConversion } from "./conversion";
import { analyzeAbandonment } from "./abandonment";
import { detectTech } from "./tech-detection";
import { extractContact } from "./contact-extractor";
import type { AuditResult } from "./types";

const TIMEOUT_MS = 10000;
const USER_AGENT = "Mozilla/5.0 LitScrap-Auditor/1.0";

async function fetchHtml(
  url: string
): Promise<{ html: string; headers: Record<string, string> } | null> {
  try {
    const res = await fetch(url, {
      method: "GET",
      redirect: "follow",
      signal: AbortSignal.timeout(TIMEOUT_MS),
      headers: { "User-Agent": USER_AGENT },
    });
    const html = await res.text();
    const headers: Record<string, string> = {};
    res.headers.forEach((value, key) => {
      headers[key.toLowerCase()] = value;
    });
    return { html, headers };
  } catch {
    return null;
  }
}

export async function auditWebsite(
  placeId: string,
  websiteUri: string | null
): Promise<AuditResult> {
  if (!websiteUri) {
    return {
      placeId,
      websiteUri: null,
      auditedAt: new Date().toISOString(),
      webPresence: null,
      security: null,
      pageSpeed: null,
      forms: null,
      frontend: null,
      seo: null,
      conversion: null,
      abandonment: null,
      techDetection: null,
      contactExtraction: null,
      source: "website",
    };
  }

  const [webPresence, security, pageSpeed] = await Promise.all([
    checkWebPresence(websiteUri),
    checkSecurity(websiteUri),
    checkPageSpeed(websiteUri),
  ]);

  const page = await fetchHtml(websiteUri);

  const html = page?.html ?? "";
  const headers = page?.headers ?? {};

  return {
    placeId,
    websiteUri,
    auditedAt: new Date().toISOString(),
    webPresence,
    security,
    pageSpeed,
    forms: page ? analyzeforms(html) : null,
    frontend: page ? analyzeFrontend(html, headers) : null,
    seo: page ? analyzeSeo(html, websiteUri) : null,
    conversion: page ? analyzeConversion(html) : null,
    abandonment: page ? analyzeAbandonment(html) : null,
    techDetection: page ? detectTech(html, headers) : null,
    contactExtraction: page ? extractContact(html, websiteUri) : null,
    source: "website",
  };
}

import type { PageSpeedResult } from "./types";

const PSI_BASE = "https://www.googleapis.com/pagespeedonline/v5/runPagespeed";

function categorize(score: number | null): PageSpeedResult["speedCategory"] {
  if (score === null) return "unavailable";
  if (score >= 0.9) return "fast";
  if (score >= 0.5) return "acceptable";
  return "slow";
}

async function runPsi(
  url: string,
  strategy: "mobile" | "desktop",
  apiKey: string
): Promise<{ score: number | null; lcp: number | null; cls: number | null; inp: number | null; hasFieldData: boolean }> {
  try {
    const endpoint = `${PSI_BASE}?url=${encodeURIComponent(url)}&strategy=${strategy}&key=${apiKey}&category=PERFORMANCE`;
    const res = await fetch(endpoint, {
      signal: AbortSignal.timeout(30000),
    });
    if (!res.ok) return { score: null, lcp: null, cls: null, inp: null, hasFieldData: false };

    const data = await res.json();
    const categories = data.lighthouseResult?.categories;
    const score = categories?.performance?.score ?? null;

    const audits = data.lighthouseResult?.audits ?? {};
    const lcp = audits["largest-contentful-paint"]?.numericValue ?? null;
    const cls = audits["cumulative-layout-shift"]?.numericValue ?? null;
    const inp = audits["interaction-to-next-paint"]?.numericValue ?? null;
    const hasFieldData = !!data.loadingExperience?.metrics;

    return { score, lcp, cls, inp, hasFieldData };
  } catch {
    return { score: null, lcp: null, cls: null, inp: null, hasFieldData: false };
  }
}

export async function checkPageSpeed(
  websiteUri: string
): Promise<PageSpeedResult> {
  const apiKey = process.env.PAGESPEED_API_KEY ?? process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    return {
      mobileScore: null,
      desktopScore: null,
      lcp: null,
      cls: null,
      inp: null,
      hasFieldData: false,
      speedCategory: "unavailable",
    };
  }

  const [mobile, desktop] = await Promise.all([
    runPsi(websiteUri, "mobile", apiKey),
    runPsi(websiteUri, "desktop", apiKey),
  ]);

  return {
    mobileScore: mobile.score,
    desktopScore: desktop.score,
    lcp: mobile.lcp,
    cls: mobile.cls,
    inp: mobile.inp,
    hasFieldData: mobile.hasFieldData,
    speedCategory: categorize(mobile.score),
  };
}

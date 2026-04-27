import { parse } from "node-html-parser";
import type { SeoResult } from "./types";

export function analyzeSeo(html: string, baseUrl: string): SeoResult {
  const root = parse(html);

  const hasTitle = !!root.querySelector("title")?.text?.trim();
  const hasMetaDescription = !!root.querySelector("meta[name='description']");
  const hasCanonical = !!root.querySelector("link[rel='canonical']");
  const hasH1 = root.querySelectorAll("h1").length > 0;

  const scripts = root.querySelectorAll("script[type='application/ld+json']");
  const hasStructuredData = scripts.length > 0;

  const hasSitemap = html.includes("sitemap") || html.includes("sitemap.xml");

  let hasRobotsTxt = false;
  try {
    const robotsUrl = new URL("/robots.txt", baseUrl).href;
    hasRobotsTxt = html.includes("robots") || robotsUrl.length > 0;
  } catch {
    hasRobotsTxt = false;
  }

  return {
    hasTitle,
    hasMetaDescription,
    hasCanonical,
    hasH1,
    hasStructuredData,
    hasSitemap,
    hasRobotsTxt,
  };
}

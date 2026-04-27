import { parse } from "node-html-parser";
import type { FrontendResult } from "./types";

export function analyzeFrontend(
  html: string,
  headers: Record<string, string>
): FrontendResult {
  const root = parse(html);
  const lower = html.toLowerCase();

  const hasViewport = !!root.querySelector("meta[name='viewport']");
  const hasFavicon =
    !!root.querySelector("link[rel='icon']") ||
    !!root.querySelector("link[rel='shortcut icon']");
  const hasTitle = !!root.querySelector("title")?.text?.trim();
  const hasMetaDescription = !!root.querySelector("meta[name='description']");
  const hasPwaManifest =
    !!root.querySelector("link[rel='manifest']") ||
    lower.includes("manifest.json");
  const hasServiceWorker =
    lower.includes("serviceworker") || lower.includes("service-worker");

  let inferredFramework: string | null = null;
  const server = headers["x-powered-by"] ?? headers["server"] ?? "";

  if (lower.includes("/_next/")) inferredFramework = "Next.js";
  else if (lower.includes("wp-content") || lower.includes("wp-includes"))
    inferredFramework = "WordPress";
  else if (lower.includes("cdn.shopify.com") || lower.includes("myshopify"))
    inferredFramework = "Shopify";
  else if (lower.includes("wixstatic") || lower.includes("wix.com"))
    inferredFramework = "Wix";
  else if (lower.includes("squarespace"))
    inferredFramework = "Squarespace";
  else if (lower.includes("webflow"))
    inferredFramework = "Webflow";
  else if (lower.includes("nuxtjs") || lower.includes("__nuxt"))
    inferredFramework = "Nuxt.js";
  else if (server.toLowerCase().includes("wordpress"))
    inferredFramework = "WordPress";

  return {
    hasViewport,
    hasFavicon,
    hasTitle,
    hasMetaDescription,
    hasPwaManifest,
    hasServiceWorker,
    inferredFramework,
  };
}

import type { TechDetectionResult } from "./types";

export function detectTech(
  html: string,
  headers: Record<string, string>
): TechDetectionResult {
  const lower = html.toLowerCase();
  const inferredStack: string[] = [];

  if (lower.includes("/_next/")) inferredStack.push("Next.js");
  if (lower.includes("wp-content") || lower.includes("wp-includes"))
    inferredStack.push("WordPress");
  if (lower.includes("cdn.shopify.com") || lower.includes("myshopify"))
    inferredStack.push("Shopify");
  if (lower.includes("wixstatic") || lower.includes("wix.com"))
    inferredStack.push("Wix");
  if (lower.includes("squarespace")) inferredStack.push("Squarespace");
  if (lower.includes("webflow")) inferredStack.push("Webflow");
  if (lower.includes("__nuxt") || lower.includes("nuxtjs"))
    inferredStack.push("Nuxt.js");
  if (lower.includes("gatsby")) inferredStack.push("Gatsby");
  if (lower.includes("drupal")) inferredStack.push("Drupal");
  if (lower.includes("joomla")) inferredStack.push("Joomla");

  const server = headers["x-powered-by"] ?? "";
  if (server.toLowerCase().includes("php")) inferredStack.push("PHP");
  if (server.toLowerCase().includes("asp.net")) inferredStack.push("ASP.NET");
  if (server.toLowerCase().includes("express")) inferredStack.push("Express");

  const confidence: TechDetectionResult["confidence"] =
    inferredStack.length === 0
      ? "low"
      : inferredStack.length === 1
        ? "medium"
        : "high";

  return { inferredStack, confidence };
}

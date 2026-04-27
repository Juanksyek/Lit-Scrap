import { parse } from "node-html-parser";

const SOCIAL_PLATFORMS: Record<string, string> = {
  "facebook.com": "Facebook",
  "fb.com": "Facebook",
  "instagram.com": "Instagram",
  "twitter.com": "Twitter/X",
  "x.com": "Twitter/X",
  "linkedin.com": "LinkedIn",
  "tiktok.com": "TikTok",
  "youtube.com": "YouTube",
  "wa.me": "WhatsApp",
  "api.whatsapp.com": "WhatsApp",
  "pinterest.com": "Pinterest",
  "snapchat.com": "Snapchat",
};

export interface ContactExtractionResult {
  emails: string[];
  phonesFromHref: string[];
  socialLinks: { platform: string; url: string }[];
  isSocialNetworkOnly: boolean;
  siteType: "landing" | "multipage" | "social-only" | "ecommerce" | "unknown";
  wordCount: number;
  sectionCount: number;
}

function hostname(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

export function extractContact(
  html: string,
  baseUrl: string
): ContactExtractionResult {
  const root = parse(html);

  // Is the site itself a social network profile?
  const base = hostname(baseUrl);
  const isSocialNetworkOnly = Object.keys(SOCIAL_PLATFORMS).some(
    (d) => base === d || base.endsWith(`.${d}`)
  );

  // Emails from mailto: links
  const emailSet = new Set<string>();
  root.querySelectorAll('a[href^="mailto:"]').forEach((a) => {
    const href = a.getAttribute("href") ?? "";
    const email = href.replace(/^mailto:/i, "").split("?")[0].trim().toLowerCase();
    if (email.includes("@") && email.length < 100) emailSet.add(email);
  });

  // Phones from tel: links (complements the Places phone number)
  const phoneSet = new Set<string>();
  root.querySelectorAll('a[href^="tel:"]').forEach((a) => {
    const href = a.getAttribute("href") ?? "";
    const phone = href.replace(/^tel:/i, "").trim();
    if (phone) phoneSet.add(phone);
  });

  // Social links found in anchors
  const socialMap = new Map<string, string>();
  root.querySelectorAll("a[href]").forEach((a) => {
    const href = (a.getAttribute("href") ?? "").trim();
    if (!href.startsWith("http")) return;
    const h = hostname(href);
    for (const [domain, name] of Object.entries(SOCIAL_PLATFORMS)) {
      if (h === domain || h.endsWith(`.${domain}`)) {
        if (!socialMap.has(name)) socialMap.set(name, href);
        break;
      }
    }
  });

  // Site type detection
  const internalLinks = root
    .querySelectorAll("a[href]")
    .filter((a) => {
      const href = a.getAttribute("href") ?? "";
      return href.startsWith("/") || href.startsWith(baseUrl);
    });
  const bodyText = root.querySelector("body")?.text ?? html;
  const hasCart = /cart|carrito|checkout|tienda|shop|basket/i.test(bodyText);

  let siteType: ContactExtractionResult["siteType"];
  if (isSocialNetworkOnly) siteType = "social-only";
  else if (hasCart) siteType = "ecommerce";
  else if (internalLinks.length > 5) siteType = "multipage";
  else siteType = "landing";

  // Approximate word count
  const wordCount = bodyText
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 1).length;

  // Section depth indicator
  const sectionCount =
    root.querySelectorAll("section").length +
    root.querySelectorAll("h2").length +
    root.querySelectorAll("h3").length;

  return {
    emails: [...emailSet].slice(0, 5),
    phonesFromHref: [...phoneSet].slice(0, 5),
    socialLinks: [...socialMap.entries()].map(([platform, url]) => ({
      platform,
      url,
    })),
    isSocialNetworkOnly,
    siteType,
    wordCount,
    sectionCount,
  };
}

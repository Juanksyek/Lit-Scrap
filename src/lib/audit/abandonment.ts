import { parse } from "node-html-parser";
import type { AbandonmentResult } from "./types";

export function analyzeAbandonment(html: string): AbandonmentResult {
  const root = parse(html);
  const lower = html.toLowerCase();

  const currentYear = new Date().getFullYear();
  const oldYearPattern = /copyright[^<]{0,30}(20[0-1]\d|19\d{2})/i;
  const hasOldCopyright =
    oldYearPattern.test(html) &&
    !html.includes(String(currentYear)) &&
    !html.includes(String(currentYear - 1));

  const images = root.querySelectorAll("img");
  const hasBrokenImages = images.some((img) => {
    const src = img.getAttribute("src") ?? "";
    return src === "" || src === "#";
  });

  const hasMissingViewport = !root.querySelector("meta[name='viewport']");

  const forms = root.querySelectorAll("form");
  const hasFormsWithoutAction = forms.some((f) => {
    const action = f.getAttribute("action") ?? "";
    return action.trim() === "" || action === "#";
  });

  return {
    hasOldCopyright,
    hasBrokenImages,
    hasMissingViewport,
    hasFormsWithoutAction,
  };
}

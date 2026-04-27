import { parse } from "node-html-parser";
import type { ConversionResult } from "./types";

export function analyzeConversion(html: string): ConversionResult {
  const root = parse(html);
  const lower = html.toLowerCase();

  const links = root.querySelectorAll("a");
  const hrefs = links.map((a) => (a.getAttribute("href") ?? "").toLowerCase());

  const hasWhatsappLink = hrefs.some((h) => h.includes("wa.me") || h.includes("whatsapp"));
  const hasClickablePhone = hrefs.some((h) => h.startsWith("tel:"));
  const hasEmbeddedMap =
    lower.includes("maps.google") ||
    lower.includes("google.com/maps") ||
    lower.includes("iframe") && lower.includes("map");

  const hasBookingFlow =
    lower.includes("reserva") ||
    lower.includes("booking") ||
    lower.includes("appointment") ||
    lower.includes("cita") ||
    lower.includes("calendly");

  const hasEcommerce =
    lower.includes("tienda") ||
    lower.includes("carrito") ||
    lower.includes("cart") ||
    lower.includes("shopify") ||
    lower.includes("woocommerce");

  const hasTestimonials =
    lower.includes("testimonio") ||
    lower.includes("reseña") ||
    lower.includes("review") ||
    lower.includes("opinión");

  const ctaKeywords = [
    "contacta",
    "contáctanos",
    "llama",
    "escríbenos",
    "solicita",
    "pide",
    "cotiza",
    "presupuesto",
    "get started",
    "contact us",
  ];
  const hasCtaInHome = ctaKeywords.some((k) => lower.includes(k));

  const contactKeywords = ["contacto", "contact", "escribenos", "llámanos"];
  const hasContactButton = contactKeywords.some((k) => lower.includes(k));

  return {
    hasContactButton,
    hasCtaInHome,
    hasWhatsappLink,
    hasClickablePhone,
    hasEmbeddedMap,
    hasBookingFlow,
    hasEcommerce,
    hasTestimonials,
  };
}

import { parse } from "node-html-parser";
import type { FormsResult } from "./types";

export function analyzeforms(html: string): FormsResult {
  const root = parse(html);
  const forms = root.querySelectorAll("form");
  const formCount = forms.length;

  if (formCount === 0) {
    const hasWhatsapp = html.includes("wa.me") || html.includes("whatsapp");
    const hasPhone =
      html.includes("tel:") || root.querySelectorAll("[href^='tel:']").length > 0;

    return {
      formCount: 0,
      hasContactForm: false,
      collectsName: false,
      collectsEmail: false,
      collectsPhone: false,
      hasValidAction: false,
      onlyWhatsappOrPhone: hasWhatsapp || hasPhone,
    };
  }

  const allInputs = root.querySelectorAll("input, textarea");
  const types = allInputs.map((i) =>
    (i.getAttribute("type") ?? i.getAttribute("name") ?? "").toLowerCase()
  );

  const collectsName = types.some((t) => t.includes("name") || t === "text");
  const collectsEmail = types.some(
    (t) => t === "email" || t.includes("email") || t.includes("correo")
  );
  const collectsPhone = types.some(
    (t) => t === "tel" || t.includes("phone") || t.includes("telefono")
  );

  const hasValidAction = forms.some((f) => {
    const action = f.getAttribute("action") ?? "";
    return action.trim() !== "" && action !== "#";
  });

  return {
    formCount,
    hasContactForm: true,
    collectsName,
    collectsEmail,
    collectsPhone,
    hasValidAction,
    onlyWhatsappOrPhone: false,
  };
}

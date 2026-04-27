"use client";

import { Fragment, useState } from "react";
import type { ScoredBusiness } from "@/lib/scoring/types";
import { ScoreBadge } from "./ScoreBadge";

interface Props {
  businesses: ScoredBusiness[];
  onExport: () => void;
  isExporting: boolean;
  savedIds: Set<string>;
  onSave: (b: ScoredBusiness) => void;
  onUnsave: (placeId: string) => void;
  onRemove: (placeId: string) => void;
}

// ─── helpers ────────────────────────────────────────────────────────────────

function BoolCell({ value }: { value: boolean }) {
  return (
    <span className={value ? "text-emerald-400 font-bold" : "text-slate-500"}>
      {value ? "✓" : "✗"}
    </span>
  );
}

const SITE_TYPE_LABELS: Record<string, string> = {
  landing: "Landing",
  multipage: "Multipágina",
  ecommerce: "E-commerce",
  "social-only": "Red Social",
  unknown: "—",
};
const SITE_TYPE_COLORS: Record<string, string> = {
  landing: "bg-amber-900/40 text-amber-300",
  multipage: "bg-emerald-900/40 text-emerald-300",
  ecommerce: "bg-violet-900/40 text-violet-300",
  "social-only": "bg-pink-900/40 text-pink-300",
  unknown: "bg-slate-700 text-slate-400",
};

function SiteTypeBadge({ type, isSocial }: { type: string; isSocial: boolean }) {
  const key = isSocial ? "social-only" : (type || "unknown");
  return (
    <span
      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
        SITE_TYPE_COLORS[key] ?? SITE_TYPE_COLORS.unknown
      }`}
    >
      {SITE_TYPE_LABELS[key] ?? type}
    </span>
  );
}

// ─── tooltip ────────────────────────────────────────────────────────────────

function ColTooltip({ text }: { text: string }) {
  return (
    <span className="relative ml-1 inline-block align-middle group cursor-help">
      <span className="inline-flex h-3.5 w-3.5 items-center justify-center rounded-full bg-slate-500 group-hover:bg-blue-500 text-[9px] font-bold text-white leading-none transition-colors select-none">
        ?
      </span>
      <span
        className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 w-52 -translate-x-1/2 rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-xs font-normal normal-case leading-relaxed tracking-normal text-slate-100 opacity-0 shadow-2xl transition-opacity duration-150 group-hover:opacity-100"
        style={{ whiteSpace: "normal" }}
      >
        {text}
        <span className="absolute left-1/2 top-full h-0 w-0 -translate-x-1/2 border-x-4 border-t-4 border-x-transparent border-t-slate-900" />
      </span>
    </span>
  );
}

// ─── column definitions ──────────────────────────────────────────────────────

const COLUMNS: Array<{ label: string; tip: string }> = [
  {
    label: "Acciones",
    tip: "Guarda este negocio en tu sesión local para exportarlo después, o elimínalo de la tabla de resultados.",
  },
  {
    label: "Negocio",
    tip: "Nombre, categoría y ciudad según Google Places. Haz clic en la fila para ver el desglose completo.",
  },
  {
    label: "Web",
    tip: "Dominio del sitio web detectado. Rojo = el negocio no tiene sitio web propio.",
  },
  {
    label: "Emails",
    tip: "Correos encontrados en el sitio web del negocio (extraídos de enlaces mailto:).",
  },
  {
    label: "Redes",
    tip: "Perfiles en redes sociales detectados: Instagram, Facebook, LinkedIn, TikTok, etc.",
  },
  {
    label: "Tipo",
    tip: "Tipo de presencia web: Landing (página única), Multipágina, E-commerce (tienda online) o Solo Red Social.",
  },
  {
    label: "HTTPS",
    tip: "El sitio usa conexión cifrada HTTPS. Sin HTTPS, los navegadores muestran advertencias que ahuyentan a los clientes.",
  },
  {
    label: "HSTS",
    tip: "HTTP Strict Transport Security: cabecera que fuerza HTTPS y protege contra ataques man-in-the-middle.",
  },
  {
    label: "PSI Móvil",
    tip: "Puntuación de velocidad en móvil según Google PageSpeed Insights (0–100). Verde ≥ 90 · Amarillo ≥ 50 · Rojo < 50.",
  },
  {
    label: "Formulario",
    tip: "Se detectó un formulario de contacto. Sin él, los visitantes no pueden escribir directamente desde la web.",
  },
  {
    label: "WhatsApp",
    tip: "Hay un enlace o botón de WhatsApp visible. Facilita el contacto directo y aumenta la conversión.",
  },
  {
    label: "SEO",
    tip: "Se detectaron datos estructurados (Schema.org / JSON-LD). Ayudan a Google a entender el negocio y mejoran el posicionamiento.",
  },
  {
    label: "Stack",
    tip: "Tecnologías identificadas en el sitio: WordPress, Shopify, Wix, Next.js, etc.",
  },
  {
    label: "Rating",
    tip: "Puntuación media en Google (1–5 ★) y número total de reseñas.",
  },
  {
    label: "Tech",
    tip: "Puntuación técnica (máx. 7): suma buenas prácticas detectadas — HTTPS, velocidad, formulario, PWA manifest, datos estructurados…",
  },
  {
    label: "Oportunidad",
    tip: "Número de mejoras pendientes detectadas. A mayor puntuación, más carencias tiene la web — ideal para identificar clientes potenciales que necesitan ayuda digital.",
  },
];

// ─── opportunity labels ──────────────────────────────────────────────────────

const OPP_LABELS: Record<string, string> = {
  noWebsite: "Sin sitio web propio",
  slowWeb: "Sitio web lento",
  noForm: "Sin formulario de contacto",
  noCta: "Sin llamadas a la acción (CTA)",
  noBasicSeo: "Sin SEO básico",
  noWhatsapp: "Sin botón de WhatsApp",
  noBooking: "Sin sistema de reservas",
  highRatingPoorWeb: "Alta valoración con web deficiente",
};

// ─── expanded detail row ─────────────────────────────────────────────────────

function DetailRow({ b }: { b: ScoredBusiness }) {
  const oppItems = Object.entries(b.opportunityScore.breakdown)
    .filter(([, v]) => v)
    .map(([k]) => OPP_LABELS[k] ?? k);

  return (
    <tr className="bg-slate-900/60">
      <td colSpan={COLUMNS.length} className="px-6 py-5">
        <div className="grid gap-6 sm:grid-cols-3 text-xs">
          {/* Contacto */}
          <div>
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
              Contacto
            </p>
            <ul className="space-y-1.5 text-slate-300">
              {b.phone && <li>📞 {b.phone}</li>}
              {b.emails && <li className="break-all">✉️ {b.emails}</li>}
              {b.socialLinks && <li className="break-all">🔗 {b.socialLinks}</li>}
              {!b.phone && !b.emails && !b.socialLinks && (
                <li className="text-slate-500">Sin datos de contacto detectados</li>
              )}
            </ul>
          </div>

          {/* Desglose técnico */}
          <div>
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
              Desglose técnico
            </p>
            <ul className="space-y-1.5">
              {(
                [
                  ["siteAvailable", "Sitio disponible"],
                  ["https", "HTTPS activo"],
                  ["fastSpeed", "Velocidad óptima"],
                  ["mobileReady", "Optimizado para móvil"],
                  ["hasStructuredData", "Datos estructurados"],
                  ["hasPwaManifest", "Manifest PWA"],
                  ["hasContactForm", "Formulario de contacto"],
                ] as const
              ).map(([key, label]) => {
                const ok =
                  b.techScore.breakdown[
                    key as keyof typeof b.techScore.breakdown
                  ];
                return (
                  <li
                    key={key}
                    className={`flex items-center gap-2 ${
                      ok ? "text-emerald-400" : "text-slate-500"
                    }`}
                  >
                    <span className="w-3 shrink-0 text-center">
                      {ok ? "✓" : "✗"}
                    </span>
                    {label}
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Oportunidades */}
          <div>
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
              Oportunidades detectadas
            </p>
            {oppItems.length > 0 ? (
              <ul className="space-y-1.5">
                {oppItems.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-amber-400">
                    <span className="mt-0.5 shrink-0">⚠</span> {item}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="flex items-center gap-2 text-emerald-400">
                <span>✓</span> Sin oportunidades pendientes
              </p>
            )}
          </div>
        </div>
      </td>
    </tr>
  );
}

// ─── main component ──────────────────────────────────────────────────────────

export function AuditTable({
  businesses,
  onExport,
  isExporting,
  savedIds,
  onSave,
  onUnsave,
  onRemove,
}: Props) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  if (businesses.length === 0) return null;

  const toggleExpand = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <section className="mt-8">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-base font-semibold text-slate-100">
          Resultados auditados ({businesses.length})
        </h2>
        <button
          onClick={onExport}
          disabled={isExporting}
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isExporting ? "Exportando..." : "⬇ Exportar Excel"}
        </button>
      </div>

      <div className="overflow-x-auto overflow-y-visible rounded-xl border border-slate-700 shadow-sm">
        <table className="min-w-full divide-y divide-slate-700 text-sm">
          {/* head */}
          <thead className="bg-slate-800">
            <tr>
              {COLUMNS.map(({ label, tip }) => (
                <th
                  key={label}
                  className="whitespace-nowrap px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-300"
                >
                  <span className="inline-flex items-center">
                    {label}
                    <ColTooltip text={tip} />
                  </span>
                </th>
              ))}
            </tr>
          </thead>

          {/* body */}
          <tbody className="divide-y divide-slate-700/50 bg-slate-800/40">
            {businesses.map((b) => (
              <Fragment key={b.placeId}>
                <tr
                  className="cursor-pointer transition-colors hover:bg-slate-700/50"
                  onClick={() => toggleExpand(b.placeId)}
                  title="Clic para ver desglose detallado"
                >
                  {/* Acciones */}
                  <td
                    className="px-3 py-3"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center gap-1">
                      {savedIds.has(b.placeId) ? (
                        <button
                          onClick={() => onUnsave(b.placeId)}
                          title="Quitar de sesión"
                          className="rounded p-1 text-blue-400 transition hover:bg-slate-700 hover:text-yellow-400"
                        >
                          💾
                        </button>
                      ) : (
                        <button
                          onClick={() => onSave(b)}
                          title="Guardar en sesión"
                          className="rounded p-1 text-slate-400 transition hover:bg-slate-700 hover:text-blue-400"
                        >
                          🔖
                        </button>
                      )}
                      <button
                        onClick={() => onRemove(b.placeId)}
                        title="Eliminar de la tabla"
                        className="rounded p-1 text-slate-500 transition hover:bg-slate-700 hover:text-red-400"
                      >
                        🗑
                      </button>
                      <span className="ml-0.5 select-none text-xs text-slate-600">
                        {expanded.has(b.placeId) ? "▲" : "▼"}
                      </span>
                    </div>
                  </td>

                  {/* Negocio */}
                  <td className="max-w-[200px] px-3 py-3">
                    <p className="truncate font-medium text-slate-100">
                      {b.displayName}
                    </p>
                    <p className="truncate text-xs text-slate-400">{b.city}</p>
                    {b.category && (
                      <span className="mt-0.5 inline-block rounded-full bg-slate-700 px-1.5 py-0.5 text-[10px] text-slate-300">
                        {b.category}
                      </span>
                    )}
                  </td>

                  {/* Web */}
                  <td
                    className="px-3 py-3"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {b.websiteUri ? (
                      <a
                        href={b.websiteUri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-400 hover:text-blue-300 hover:underline"
                      >
                        {new URL(b.websiteUri).hostname}
                      </a>
                    ) : (
                      <span className="text-xs font-medium text-red-400">
                        Sin web
                      </span>
                    )}
                  </td>

                  {/* Emails */}
                  <td className="max-w-[140px] truncate px-3 py-3 text-xs text-slate-300">
                    {b.emails || <span className="text-slate-500">—</span>}
                  </td>

                  {/* Redes */}
                  <td className="max-w-[120px] truncate px-3 py-3 text-xs text-slate-300">
                    {b.socialLinks || <span className="text-slate-500">—</span>}
                  </td>

                  {/* Tipo */}
                  <td className="px-3 py-3">
                    <SiteTypeBadge
                      type={b.siteType}
                      isSocial={b.isSocialNetworkOnly}
                    />
                  </td>

                  {/* HTTPS */}
                  <td className="px-3 py-3 text-center">
                    <BoolCell value={b.httpsOk} />
                  </td>

                  {/* HSTS */}
                  <td className="px-3 py-3 text-center">
                    <BoolCell value={b.hasHsts} />
                  </td>

                  {/* PSI Móvil */}
                  <td className="px-3 py-3 text-center">
                    {b.pagespeedMobile !== null ? (
                      <span
                        className={`font-semibold tabular-nums ${
                          b.pagespeedMobile >= 0.9
                            ? "text-emerald-400"
                            : b.pagespeedMobile >= 0.5
                            ? "text-amber-400"
                            : "text-red-400"
                        }`}
                      >
                        {Math.round(b.pagespeedMobile * 100)}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-500">N/A</span>
                    )}
                  </td>

                  {/* Formulario */}
                  <td className="px-3 py-3 text-center">
                    <BoolCell value={b.hasContactForm} />
                  </td>

                  {/* WhatsApp */}
                  <td className="px-3 py-3 text-center">
                    <BoolCell value={b.hasWhatsappLink} />
                  </td>

                  {/* SEO */}
                  <td className="px-3 py-3 text-center">
                    <BoolCell value={b.hasStructuredData} />
                  </td>

                  {/* Stack */}
                  <td className="max-w-[110px] truncate px-3 py-3 text-xs text-slate-300">
                    {b.inferredStack || (
                      <span className="text-slate-500">—</span>
                    )}
                  </td>

                  {/* Rating */}
                  <td className="px-3 py-3 text-center">
                    {b.googleRating ? (
                      <div className="flex flex-col items-center gap-0.5">
                        <span className="text-xs font-semibold text-amber-400">
                          ⭐ {b.googleRating}
                        </span>
                        {b.googleReviews && (
                          <span className="text-[10px] text-slate-500">
                            {b.googleReviews.toLocaleString()} reseñas
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-slate-500">—</span>
                    )}
                  </td>

                  {/* Tech */}
                  <td className="px-3 py-3">
                    <ScoreBadge
                      score={b.techScore.total}
                      max={b.techScore.max}
                      type="tech"
                    />
                  </td>

                  {/* Oportunidad */}
                  <td className="px-3 py-3">
                    <ScoreBadge
                      score={b.opportunityScore.total}
                      max={b.opportunityScore.max}
                      type="opportunity"
                    />
                  </td>
                </tr>

                {/* expanded detail */}
                {expanded.has(b.placeId) && <DetailRow b={b} />}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-2 text-xs text-slate-500">
        Clic en una fila para ver el desglose completo · Datos: Google Places API · Auditoría: análisis técnico propio.
      </p>
    </section>
  );
}

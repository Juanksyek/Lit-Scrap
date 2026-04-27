"use client";

import type { ScoredBusiness } from "@/lib/scoring/types";

interface Props {
  items: ScoredBusiness[];
  onExport: () => void;
  onClear: () => void;
  isExporting: boolean;
}

export default function SessionBasket({
  items,
  onExport,
  onClear,
  isExporting,
}: Props) {
  if (items.length === 0) return null;

  return (
    <div className="border-b border-blue-200 bg-blue-50 px-4 py-2 dark:border-blue-900 dark:bg-blue-950">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm font-medium text-blue-800 dark:text-blue-300">
          <span>💾</span>
          <span>
            {items.length} negocio{items.length !== 1 ? "s" : ""} guardado
            {items.length !== 1 ? "s" : ""} en sesión
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onExport}
            disabled={isExporting}
            className="rounded-md bg-blue-600 px-3 py-1 text-xs font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
          >
            {isExporting ? "Exportando..." : "⬇ Exportar sesión"}
          </button>
          <button
            onClick={onClear}
            className="rounded-md border border-red-200 bg-white px-3 py-1 text-xs font-medium text-red-600 transition hover:bg-red-50 dark:border-red-900 dark:bg-slate-800 dark:text-red-400 dark:hover:bg-red-950"
          >
            🗑 Limpiar sesión
          </button>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { SearchForm } from "@/components/SearchForm";
import { BusinessList } from "@/components/BusinessList";
import { AuditTable } from "@/components/AuditTable";
import ThemeToggle from "./ThemeToggle";
import SessionBasket from "./SessionBasket";
import ImportPanel from "./ImportPanel";
import type { PlaceResult } from "@/lib/places/types";
import type { AuditResult } from "@/lib/audit/types";
import type { ScoredBusiness } from "@/lib/scoring/types";
import { scoreBusinesses } from "@/lib/scoring/scorer";
import {
  loadSession,
  upsertSession,
  removeFromSession,
  clearSession,
} from "@/lib/storage/session-store";

export default function HomePage() {
  const [places, setPlaces] = useState<PlaceResult[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [auditingIds, setAuditingIds] = useState<Set<string>>(new Set());
  const [audits, setAudits] = useState<Map<string, AuditResult>>(new Map());
  const [removedAuditIds, setRemovedAuditIds] = useState<Set<string>>(new Set());
  const [isSearching, setIsSearching] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isExportingSession, setIsExportingSession] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Session (persisted in localStorage, loaded after mount to avoid hydration mismatch)
  const [savedItems, setSavedItems] = useState<ScoredBusiness[]>([]);
  useEffect(() => {
    setSavedItems(loadSession());
  }, []);

  const savedIds = useMemo(
    () => new Set(savedItems.map((i) => i.placeId)),
    [savedItems]
  );

  const handleSearch = useCallback(async (query: string, city: string) => {
    setIsSearching(true);
    setError(null);
    setPlaces([]);
    setSelected(new Set());
    setAudits(new Map());
    setRemovedAuditIds(new Set());

    try {
      const res = await fetch("/api/places", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, city }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error en la búsqueda");
      setPlaces(data.places);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setIsSearching(false);
    }
  }, []);

  const handleToggle = useCallback((placeId: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(placeId)) next.delete(placeId);
      else next.add(placeId);
      return next;
    });
  }, []);

  const handleToggleAll = useCallback(() => {
    setSelected((prev) => {
      if (places.every((p) => prev.has(p.placeId))) return new Set();
      return new Set(places.map((p) => p.placeId));
    });
  }, [places]);

  const runAudit = useCallback(async (place: PlaceResult) => {
    setAuditingIds((prev) => new Set(prev).add(place.placeId));
    try {
      const res = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          placeId: place.placeId,
          websiteUri: place.websiteUri,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error en auditoría");

      setAudits((prev) => {
        const next = new Map(prev);
        next.set(place.placeId, data.audit);
        return next;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error en auditoría");
    } finally {
      setAuditingIds((prev) => {
        const next = new Set(prev);
        next.delete(place.placeId);
        return next;
      });
    }
  }, []);

  const handleAuditSelected = useCallback(async () => {
    const toAudit = places.filter((p) => selected.has(p.placeId));
    await Promise.all(toAudit.map((p) => runAudit(p)));
  }, [places, selected, runAudit]);

  const handleSaveItem = useCallback((item: ScoredBusiness) => {
    setSavedItems(upsertSession(item));
  }, []);

  const handleUnsaveItem = useCallback((placeId: string) => {
    setSavedItems(removeFromSession(placeId));
  }, []);

  const handleClearSession = useCallback(() => {
    clearSession();
    setSavedItems([]);
  }, []);

  const handleRemoveAudit = useCallback((placeId: string) => {
    setRemovedAuditIds((prev) => new Set(prev).add(placeId));
  }, []);

  const exportBlob = useCallback(
    async (businesses: ScoredBusiness[], filename: string) => {
      const res = await fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businesses }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Error exportando");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    },
    []
  );

  const handleExportSession = useCallback(async () => {
    if (savedItems.length === 0) return;
    setIsExportingSession(true);
    try {
      await exportBlob(
        savedItems,
        `litscrap-sesion-${Date.now()}.xlsx`
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error exportando sesión");
    } finally {
      setIsExportingSession(false);
    }
  }, [savedItems, exportBlob]);

  const handleExport = useCallback(async () => {
    const scored = scoreBusinesses(places, audits).filter((b) =>
      audits.has(b.placeId)
    );
    if (scored.length === 0) return;
    setIsExporting(true);
    try {
      await exportBlob(scored, `litscrap-${Date.now()}.xlsx`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error exportando");
    } finally {
      setIsExporting(false);
    }
  }, [places, audits, exportBlob]);
  

  const displayedScores: ScoredBusiness[] = scoreBusinesses(places, audits).filter(
    (b) => audits.has(b.placeId) && !removedAuditIds.has(b.placeId)
  );

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white px-4 py-4 shadow-sm dark:bg-slate-900 dark:border-slate-700">
        <div className="mx-auto flex max-w-7xl items-center gap-3 justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-lg font-bold text-white">
              L
            </div>
            <div>
              <h1 className="text-lg font-bold leading-tight text-gray-900 dark:text-slate-100">
                LitScrap
              </h1>
              <p className="text-xs text-gray-500 dark:text-slate-400">
                Auditoría digital de negocios locales
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8">
        <SessionBasket
          items={savedItems}
          onExport={handleExportSession}
          onClear={handleClearSession}
          isExporting={isExportingSession}
        />
        {/* Step 1: Search */}
        <div className="card">
          <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-slate-400">
            Paso 1 — Busca negocios con Google Places
          </p>
          <SearchForm onSearch={handleSearch} isLoading={isSearching} />
        </div>

        {/* Error banner */}
        {error && (
          <div className="mt-4 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              className="ml-4 font-semibold underline hover:no-underline"
            >
              Cerrar
            </button>
          </div>
        )}

        {/* Step 2: Business list */}
        {places.length > 0 && (
          <div className="mt-6 card">
            <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-slate-400">
              Paso 2 — Selecciona y audita
            </p>
            <BusinessList
              places={places}
              selected={selected}
              auditingIds={auditingIds}
              onToggle={handleToggle}
              onToggleAll={handleToggleAll}
              onAudit={runAudit}
              onAuditSelected={handleAuditSelected}
            />
          </div>
        )}

        {/* Step 3: Results table */}
        {displayedScores.length > 0 && (
          <div className="mt-6 card">
            <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-slate-400">
              Paso 3 — Resultados y exportación
            </p>
            <AuditTable
              businesses={displayedScores}
              onExport={handleExport}
              isExporting={isExporting}
              savedIds={savedIds}
              onSave={handleSaveItem}
              onUnsave={handleUnsaveItem}
              onRemove={handleRemoveAudit}
            />
          </div>
        )}

        <ImportPanel />

        {/* Empty state */}
        {!isSearching && places.length === 0 && !error && (
          <div className="mt-20 text-center">
            <p className="text-5xl">🔍</p>
            <p className="mt-3 text-sm text-gray-400 dark:text-slate-400">
              Busca un tipo de negocio para comenzar la auditoría
            </p>
          </div>
        )}
      </div>
    </main>
  );
}

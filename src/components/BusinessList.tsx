import type { PlaceResult } from "@/lib/places/types";
import { BusinessCard } from "./BusinessCard";

interface Props {
  places: PlaceResult[];
  selected: Set<string>;
  auditingIds: Set<string>;
  onToggle: (placeId: string) => void;
  onToggleAll: () => void;
  onAudit: (place: PlaceResult) => void;
  onAuditSelected: () => void;
}

export function BusinessList({
  places,
  selected,
  auditingIds,
  onToggle,
  onToggleAll,
  onAudit,
  onAuditSelected,
}: Props) {
  if (places.length === 0) return null;

  const allSelected = places.every((p) => selected.has(p.placeId));

  return (
    <section className="mt-6">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <h2 className="text-base font-semibold text-gray-900 dark:text-slate-100">
            {places.length} negocios encontrados
          </h2>
          <label className="flex cursor-pointer items-center gap-1.5 text-sm text-gray-600 dark:text-slate-400">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={onToggleAll}
              className="h-4 w-4 rounded border-gray-300 text-blue-600"
            />
            Seleccionar todos
          </label>
        </div>

        {selected.size > 0 && (
          <button
            onClick={onAuditSelected}
            disabled={auditingIds.size > 0}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50"
          >
            {auditingIds.size > 0
              ? `Auditando ${auditingIds.size}...`
              : `Auditar seleccionados (${selected.size})`}
          </button>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {places.map((place) => (
          <BusinessCard
            key={place.placeId}
            place={place}
            isSelected={selected.has(place.placeId)}
            isAuditing={auditingIds.has(place.placeId)}
            onToggle={onToggle}
            onAudit={onAudit}
          />
        ))}
      </div>
    </section>
  );
}

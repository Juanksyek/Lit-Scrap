import type { PlaceResult } from "@/lib/places/types";

interface Props {
  place: PlaceResult;
  isSelected: boolean;
  isAuditing: boolean;
  onToggle: (placeId: string) => void;
  onAudit: (place: PlaceResult) => void;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5" aria-label={`${rating} estrellas`}>
      {[1, 2, 3, 4, 5].map((s) => (
        <span
          key={s}
          className={s <= Math.round(rating) ? "text-amber-400" : "text-slate-600"}
          style={{ fontSize: "11px" }}
        >
          ★
        </span>
      ))}
    </span>
  );
}

export function BusinessCard({
  place,
  isSelected,
  isAuditing,
  onToggle,
  onAudit,
}: Props) {
  const hasWeb = Boolean(place.websiteUri);
  const mapsUrl = `https://www.google.com/maps/place/?q=place_id:${place.placeId}`;

  return (
    <div
      className={`rounded-xl border p-4 shadow-sm transition dark:bg-slate-800 ${
        isSelected
          ? "border-blue-400 ring-2 ring-blue-100 dark:ring-blue-900 bg-blue-50 dark:bg-slate-800"
          : "border-gray-200 dark:border-slate-700 bg-white"
      }`}
    >
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggle(place.placeId)}
          className="mt-1 h-4 w-4 cursor-pointer rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          aria-label={`Seleccionar ${place.displayName}`}
        />

        <div className="min-w-0 flex-1">
          {/* Name + category */}
          <div className="flex flex-wrap items-start gap-1.5">
            <h3 className="text-sm font-semibold leading-snug text-gray-900 dark:text-slate-100">
              {place.displayName}
            </h3>
            {place.category && (
              <span className="mt-0.5 rounded-full bg-blue-100 px-2 py-0.5 text-[10px] text-blue-700 dark:bg-slate-700 dark:text-slate-300">
                {place.category}
              </span>
            )}
          </div>

          {/* Address */}
          <p className="mt-1 text-xs leading-relaxed text-gray-500 dark:text-slate-400">
            📍 {place.address}
          </p>

          {/* Rating + reviews */}
          {place.rating && (
            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              <StarRating rating={place.rating} />
              <span className="text-xs font-semibold text-amber-500 dark:text-amber-400">
                {place.rating.toFixed(1)}
              </span>
              {place.reviewCount != null && (
                <span className="text-xs text-gray-400 dark:text-slate-500">
                  ({place.reviewCount.toLocaleString()} reseñas)
                </span>
              )}
            </div>
          )}

          {/* Contact row */}
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-600 dark:text-slate-300">
            {place.phone && <span>📞 {place.phone}</span>}
            {hasWeb ? (
              <a
                href={place.websiteUri!}
                target="_blank"
                rel="noopener noreferrer"
                className="max-w-[150px] truncate text-blue-600 hover:underline dark:text-blue-400"
              >
                🌐 {new URL(place.websiteUri!).hostname}
              </a>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-medium text-red-600 dark:bg-red-900/30 dark:text-red-400">
                ⚠ Sin sitio web
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="mt-3 flex items-center gap-2">
            <button
              onClick={() => onAudit(place)}
              disabled={isAuditing}
              className="rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isAuditing ? "Auditando..." : "🔍 Auditar"}
            </button>
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-md border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:bg-gray-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              Ver en Maps
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

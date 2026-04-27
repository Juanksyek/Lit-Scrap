import type { PlaceResult, PlacesSearchParams } from "./types";

const PLACES_API_BASE = "https://places.googleapis.com/v1";

const FIELD_MASK = [
  "places.id",
  "places.displayName",
  "places.formattedAddress",
  "places.nationalPhoneNumber",
  "places.websiteUri",
  "places.rating",
  "places.userRatingCount",
  "places.primaryTypeDisplayName",
].join(",");

function extractCity(address: string): string | null {
  const parts = address.split(",");
  return parts.length >= 2 ? parts[parts.length - 2].trim() : null;
}

export async function searchPlaces(
  params: PlacesSearchParams
): Promise<PlaceResult[]> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) throw new Error("GOOGLE_PLACES_API_KEY not set");

  const query = params.city
    ? `${params.query} en ${params.city}`
    : params.query;

  const response = await fetch(`${PLACES_API_BASE}/places:searchText`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": FIELD_MASK,
    },
    body: JSON.stringify({ textQuery: query, maxResultCount: 20 }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Places API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  const places = data.places ?? [];

  return places.map(
    (p: Record<string, unknown>): PlaceResult => ({
      placeId: p.id as string,
      displayName:
        (p.displayName as Record<string, string>)?.text ?? "Sin nombre",
      address: (p.formattedAddress as string) ?? "",
      phone: (p.nationalPhoneNumber as string) ?? null,
      websiteUri: (p.websiteUri as string) ?? null,
      rating: (p.rating as number) ?? null,
      reviewCount: (p.userRatingCount as number) ?? null,
      category:
        (p.primaryTypeDisplayName as Record<string, string>)?.text ?? null,
      city: extractCity((p.formattedAddress as string) ?? ""),
      source: "google",
    })
  );
}

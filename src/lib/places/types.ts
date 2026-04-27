export interface PlaceResult {
  placeId: string;
  displayName: string;
  address: string;
  phone: string | null;
  websiteUri: string | null;
  rating: number | null;
  reviewCount: number | null;
  category: string | null;
  city: string | null;
  source: "google";
}

export interface PlacesSearchParams {
  query: string;
  city?: string;
}

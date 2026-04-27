import { NextRequest, NextResponse } from "next/server";
import { searchPlaces } from "@/lib/places/client";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { query, city } = body as { query?: string; city?: string };

    if (!query || query.trim().length < 2) {
      return NextResponse.json(
        { error: "query es requerido y debe tener al menos 2 caracteres" },
        { status: 400 }
      );
    }

    const results = await searchPlaces({ query: query.trim(), city: city?.trim() });
    return NextResponse.json({ places: results });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error desconocido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

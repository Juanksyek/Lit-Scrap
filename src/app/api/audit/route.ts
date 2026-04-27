import { NextRequest, NextResponse } from "next/server";
import { auditWebsite } from "@/lib/audit/orchestrator";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { placeId, websiteUri } = body as {
      placeId?: string;
      websiteUri?: string | null;
    };

    if (!placeId) {
      return NextResponse.json(
        { error: "placeId es requerido" },
        { status: 400 }
      );
    }

    const result = await auditWebsite(placeId, websiteUri ?? null);
    return NextResponse.json({ audit: result });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error desconocido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { buildXlsx } from "@/lib/export/xlsx-builder";
import type { ScoredBusiness } from "@/lib/scoring/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { businesses } = body as { businesses?: ScoredBusiness[] };

    if (!businesses || !Array.isArray(businesses) || businesses.length === 0) {
      return NextResponse.json(
        { error: "Se requiere al menos un negocio para exportar" },
        { status: 400 }
      );
    }

    const buffer = await buildXlsx(businesses);

    return new NextResponse(buffer.buffer as ArrayBuffer, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="litscrap-auditoria-${Date.now()}.xlsx"`,
        "Content-Length": String(buffer.length),
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error desconocido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

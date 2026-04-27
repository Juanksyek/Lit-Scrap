import { NextRequest, NextResponse } from "next/server";
import ExcelJS from "exceljs";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No se recibió ningún archivo" },
        { status: 400 }
      );
    }

    // Validate content type loosely
    const allowed = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
      "application/octet-stream",
    ];
    if (!allowed.includes(file.type) && !file.name.match(/\.(xlsx|xls)$/i)) {
      return NextResponse.json(
        { error: "Tipo de archivo no permitido. Sube un .xlsx o .xls" },
        { status: 400 }
      );
    }

    const ab = await file.arrayBuffer();
    const buffer = Buffer.from(ab as ArrayBuffer);
    const workbook = new ExcelJS.Workbook();
    // exceljs typing can be picky in some environments; cast to any to avoid TS mismatch
    await workbook.xlsx.load(buffer as any);

    const sheet = workbook.worksheets[0];
    if (!sheet) {
      return NextResponse.json(
        { error: "El archivo no contiene hojas de cálculo" },
        { status: 400 }
      );
    }

    const headers: string[] = [];
    const rows: Record<string, string>[] = [];

    sheet.eachRow((row, rowIndex) => {
      if (rowIndex === 1) {
        row.eachCell((cell) => {
          headers.push(String(cell.value ?? "").trim());
        });
      } else {
        const record: Record<string, string> = {};
        row.eachCell({ includeEmpty: true }, (cell, colIndex) => {
          const header = headers[colIndex - 1];
          if (header) record[header] = String(cell.value ?? "");
        });
        // Skip completely empty rows
        if (Object.values(record).some((v) => v !== "")) {
          rows.push(record);
        }
      }
    });

    return NextResponse.json({ headers, rows });
  } catch (err) {
    return NextResponse.json(
      { error: `Error procesando archivo: ${String(err)}` },
      { status: 500 }
    );
  }
}

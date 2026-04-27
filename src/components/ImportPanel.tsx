"use client";

import { useState, useRef } from "react";

interface ImportedRow {
  [key: string]: string;
}

export default function ImportPanel() {
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<ImportedRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setIsLoading(true);
    setError(null);
    setFileName(file.name);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/import", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al importar");
      setHeaders(data.headers as string[]);
      setRows(data.rows as ImportedRow[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      setFileName(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="mt-6 card">
      <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-slate-400">
        Importar Excel — consulta datos previos
      </p>

      <div className="flex flex-wrap items-center gap-3">
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.xls"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
            // reset input so same file can be re-uploaded
            e.target.value = "";
          }}
        />
        <button
          onClick={() => inputRef.current?.click()}
          disabled={isLoading}
          className="btn-primary disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? "Procesando..." : "📂 Cargar Excel"}
        </button>
        {fileName && !isLoading && (
          <span className="text-sm text-gray-500 dark:text-slate-400">
            {fileName} — {rows.length} fila{rows.length !== 1 ? "s" : ""}
          </span>
        )}
        {rows.length > 0 && (
          <button
            onClick={() => {
              setHeaders([]);
              setRows([]);
              setFileName(null);
            }}
            className="text-xs text-red-500 hover:underline"
          >
            Limpiar
          </button>
        )}
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-500 dark:text-red-400">{error}</p>
      )}

      {rows.length > 0 && (
        <div className="mt-4 overflow-x-auto rounded-xl border border-gray-200 dark:border-slate-700">
          <table className="min-w-full divide-y divide-gray-200 text-xs">
            <thead className="bg-gray-50 dark:bg-slate-800">
              <tr>
                {headers.map((h) => (
                  <th
                    key={h}
                    className="whitespace-nowrap px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-300"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white dark:bg-slate-800">
              {rows.map((row, i) => (
                <tr
                  key={i}
                  className="hover:bg-gray-50 dark:hover:bg-slate-700"
                >
                  {headers.map((h) => (
                    <td
                      key={h}
                      className="max-w-[200px] truncate px-3 py-2 text-gray-700 dark:text-slate-300"
                    >
                      {row[h] ?? ""}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <p className="px-3 py-2 text-xs text-gray-400 dark:text-slate-500">
            {rows.length} fila{rows.length !== 1 ? "s" : ""} · {headers.length} columna{headers.length !== 1 ? "s" : ""}
          </p>
        </div>
      )}
    </section>
  );
}

"use client";

import { useState } from "react";

interface Props {
  onSearch: (query: string, city: string) => void;
  isLoading: boolean;
}

export function SearchForm({ onSearch, isLoading }: Props) {
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim().length < 2) return;
    onSearch(query.trim(), city.trim());
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Ej: restaurantes, dentistas, gimnasios..."
        className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:ring-blue-800"
        required
        minLength={2}
      />
      <input
        type="text"
        value={city}
        onChange={(e) => setCity(e.target.value)}
        placeholder="Ciudad (opcional)"
        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 sm:w-48 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:ring-blue-800"
      />
      <button
        type="submit"
        disabled={isLoading || query.trim().length < 2}
        className="btn-primary disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isLoading ? "Buscando..." : "Buscar"}
      </button>
    </form>
  );
}

import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { GenreFilter } from "../components/movies/GenreFilter";
import { MovieGrid } from "../components/movies/MovieGrid";
import { useMovies } from "../hooks/useMovies";

export function BrowsePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [q, setQ] = useState(searchParams.get("q") ?? "");
  const [debouncedQ, setDebouncedQ] = useState(q);
  const [selectedGenres, setSelectedGenres] = useState<string[]>(
    searchParams.get("genres") ? searchParams.get("genres")!.split(",") : []
  );
  const [page, setPage] = useState(1);

  useEffect(() => {
    const t = setTimeout(() => { setDebouncedQ(q); setPage(1); }, 300);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => {
    setPage(1);
  }, [selectedGenres]);

  useEffect(() => {
    const p: Record<string, string> = {};
    if (debouncedQ) p.q = debouncedQ;
    if (selectedGenres.length) p.genres = selectedGenres.join(",");
    setSearchParams(p, { replace: true });
  }, [debouncedQ, selectedGenres]);

  const { data, loading } = useMovies(debouncedQ, selectedGenres, page);
  const totalPages = data ? Math.ceil(data.total / data.page_size) : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-white mb-4">Browse Movies</h1>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by title..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="w-full max-w-md bg-gray-800 text-white border border-gray-600 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-purple-500 placeholder-gray-500"
        />
      </div>

      <div className="mb-6">
        <GenreFilter selected={selectedGenres} onChange={setSelectedGenres} />
      </div>

      {data && (
        <p className="text-sm text-gray-400 mb-4">
          {data.total.toLocaleString()} movies
        </p>
      )}

      <MovieGrid movies={data?.movies ?? []} loading={loading} />

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 text-sm bg-gray-800 border border-gray-600 rounded disabled:opacity-40 hover:bg-gray-700 text-white"
          >
            Prev
          </button>
          <span className="text-sm text-gray-400">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1.5 text-sm bg-gray-800 border border-gray-600 rounded disabled:opacity-40 hover:bg-gray-700 text-white"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

import { useEffect, useState } from "react";
import { api, type MoviesResponse } from "../api/client";

export function useMovies(q: string, genres: string[], page: number, pageSize = 20) {
  const [data, setData] = useState<MoviesResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const params: Record<string, string | number> = { page, page_size: pageSize };
    if (q) params.q = q;
    if (genres.length) params.genres = genres.join(",");

    api
      .getMovies(params)
      .then((res) => { if (!cancelled) setData(res); })
      .catch((e) => { if (!cancelled) setError(String(e)); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [q, genres.join(","), page, pageSize]);

  return { data, loading, error };
}

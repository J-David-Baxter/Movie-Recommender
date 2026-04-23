const API_KEY = import.meta.env.VITE_TMDB_API_KEY as string;
const IMG_BASE = "https://image.tmdb.org/t/p";

const cache = new Map<number, string | null>();

export async function fetchPosterUrl(tmdbId: number, size: "w342" | "w500" = "w342"): Promise<string | null> {
  if (cache.has(tmdbId)) {
    const path = cache.get(tmdbId)!;
    return path ? `${IMG_BASE}/${size}${path}` : null;
  }

  try {
    const res = await fetch(
      `https://api.themoviedb.org/3/movie/${tmdbId}?api_key=${API_KEY}&fields=poster_path`
    );
    if (!res.ok) {
      cache.set(tmdbId, null);
      return null;
    }
    const data = await res.json();
    const path: string | null = data.poster_path ?? null;
    cache.set(tmdbId, path);
    return path ? `${IMG_BASE}/${size}${path}` : null;
  } catch {
    cache.set(tmdbId, null);
    return null;
  }
}

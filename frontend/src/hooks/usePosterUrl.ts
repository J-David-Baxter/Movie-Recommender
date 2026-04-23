import { useEffect, useState } from "react";
import { fetchPosterUrl } from "../lib/tmdb";

export function usePosterUrl(
  tmdbId: number | null | undefined,
  size: "w342" | "w500" = "w342"
): string | null {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!tmdbId) return;
    fetchPosterUrl(tmdbId, size).then(setUrl);
  }, [tmdbId, size]);

  return url;
}

import { useEffect, useState } from "react";
import { api, type RecommendationItem } from "../api/client";

export function useRecommendations(userId: string) {
  const [data, setData] = useState<RecommendationItem[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function refresh() {
    setLoading(true);
    setError(null);
    api
      .getRecommendations(userId)
      .then(setData)
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    refresh();
  }, [userId]);

  return { data, loading, error, refresh };
}

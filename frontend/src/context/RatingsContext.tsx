import { createContext, useContext, useEffect, useState } from "react";
import { api } from "../api/client";
import { useAuth } from "./AuthContext";

interface RatingsContextValue {
  ratings: Map<number, number>;
  rateMovie: (movieId: number, rating: number) => Promise<void>;
  getRating: (movieId: number) => number | null;
}

const RatingsContext = createContext<RatingsContextValue | null>(null);

export function RatingsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [ratings, setRatings] = useState<Map<number, number>>(new Map());

  useEffect(() => {
    if (!user) {
      setRatings(new Map());
      return;
    }
    api.getUserRatings()
      .then((items) => setRatings(new Map(items.map((i) => [i.movie_id, i.rating]))))
      .catch(() => {});
  }, [user]);

  async function rateMovie(movieId: number, rating: number) {
    await api.submitRating({ movie_id: movieId, rating });
    setRatings((prev) => new Map(prev).set(movieId, rating));
  }

  function getRating(movieId: number): number | null {
    return ratings.get(movieId) ?? null;
  }

  return (
    <RatingsContext.Provider value={{ ratings, rateMovie, getRating }}>
      {children}
    </RatingsContext.Provider>
  );
}

export function useRatings() {
  const ctx = useContext(RatingsContext);
  if (!ctx) throw new Error("useRatings must be used inside RatingsProvider");
  return ctx;
}

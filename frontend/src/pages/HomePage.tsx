import { useEffect, useState } from "react";
import { api, type MovieSummary } from "../api/client";
import { GenreFilter } from "../components/movies/GenreFilter";
import { MovieGrid } from "../components/movies/MovieGrid";
import { useMovies } from "../hooks/useMovies";

export function HomePage() {
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const { data, loading } = useMovies("", selectedGenres, 1, 40);

  const [popular, setPopular] = useState<MovieSummary[]>([]);
  const [popularLoading, setPopularLoading] = useState(false);

  useEffect(() => {
    if (selectedGenres.length > 0) return;
    setPopularLoading(true);
    api.getPopular(40).then(setPopular).catch(console.error).finally(() => setPopularLoading(false));
  }, []);

  const movies = selectedGenres.length > 0 ? (data?.movies ?? []) : popular;
  const isLoading = selectedGenres.length > 0 ? loading : popularLoading;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-1">
          {selectedGenres.length > 0 ? "Browse by Genre" : "Popular Movies"}
        </h1>
        <p className="text-gray-400 text-sm mb-4">
          Rate movies you've seen to get personalized recommendations.
        </p>
        <GenreFilter selected={selectedGenres} onChange={setSelectedGenres} />
      </div>
      <MovieGrid movies={movies} loading={isLoading} />
    </div>
  );
}

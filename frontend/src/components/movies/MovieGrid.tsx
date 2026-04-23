import type { MovieSummary } from "../../api/client";
import { MovieCard } from "./MovieCard";

interface Props {
  movies: MovieSummary[];
  loading?: boolean;
}

export function MovieGrid({ movies, loading }: Props) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="bg-gray-800 rounded-lg h-56 animate-pulse" />
        ))}
      </div>
    );
  }
  if (!movies.length) {
    return <p className="text-gray-400 py-8 text-center">No movies found.</p>;
  }
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {movies.map((m) => (
        <MovieCard key={m.movie_id} movie={m} />
      ))}
    </div>
  );
}

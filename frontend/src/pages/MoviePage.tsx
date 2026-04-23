import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api, type MovieDetail } from "../api/client";
import { MovieCard } from "../components/movies/MovieCard";
import { StarRating } from "../components/movies/StarRating";
import { useRatings } from "../context/RatingsContext";
import { usePosterUrl } from "../hooks/usePosterUrl";

interface Props {
  userId: string;
}

export function MoviePage({ userId }: Props) {
  const { id } = useParams<{ id: string }>();
  const movieId = parseInt(id ?? "0", 10);

  const { getRating, rateMovie } = useRatings();
  const [movie, setMovie] = useState<MovieDetail | null>(null);
  const posterUrl = usePosterUrl(movie?.tmdb_id, "w500");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ratingSaved, setRatingSaved] = useState(false);

  const userRating = movie ? getRating(movie.movie_id) : null;

  useEffect(() => {
    if (!movieId) return;
    setLoading(true);
    api.getMovie(movieId)
      .then(setMovie)
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
  }, [movieId]);

  async function handleRate(rating: number) {
    setRatingSaved(false);
    try {
      await rateMovie(movieId, rating);
      setRatingSaved(true);
      setTimeout(() => setRatingSaved(false), 2000);
    } catch (e) {
      console.error(e);
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-64 bg-gray-700 rounded" />
          <div className="h-64 bg-gray-700 rounded" />
        </div>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-10 text-red-400">
        {error ?? "Movie not found"}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <Link to="/browse" className="text-sm text-purple-400 hover:text-purple-300 mb-4 inline-block">
        ← Back to Browse
      </Link>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Left: poster placeholder + metadata */}
        <div className="shrink-0 w-full md:w-56">
          <div className="rounded-lg h-80 overflow-hidden bg-gray-700 flex items-center justify-center">
            {posterUrl ? (
              <img src={posterUrl} alt={movie.title} className="w-full h-full object-cover" />
            ) : (
              <span className="text-gray-400 text-sm p-4 text-center">{movie.title}</span>
            )}
          </div>
          <div className="mt-3">
            {movie.avg_rating != null && (
              <p className="text-yellow-400 text-sm font-medium">
                ★ {movie.avg_rating.toFixed(1)}{" "}
                <span className="text-gray-400 font-normal">({movie.num_ratings.toLocaleString()} ratings)</span>
              </p>
            )}
          </div>
        </div>

        {/* Right: details */}
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-white mb-1">{movie.title}</h1>
          {movie.year && <p className="text-gray-400 text-sm mb-3">{movie.year}</p>}

          <div className="flex flex-wrap gap-2 mb-4">
            {movie.genres.map((g) => (
              <span key={g} className="text-sm bg-gray-700 text-gray-300 rounded-full px-3 py-1">
                {g}
              </span>
            ))}
          </div>

          {movie.tags.length > 0 && (
            <div className="mb-6">
              <p className="text-xs text-gray-500 mb-2 uppercase tracking-wider">Tags</p>
              <div className="flex flex-wrap gap-1.5">
                {movie.tags.slice(0, 15).map((t) => (
                  <span key={t} className="text-xs bg-gray-800 border border-gray-600 text-gray-400 rounded px-2 py-0.5">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="bg-gray-800 rounded-lg p-4 mb-6 inline-block">
            <p className="text-sm text-gray-300 mb-2">Your Rating</p>
            <StarRating value={userRating} onChange={handleRate} />
            {ratingSaved && (
              <p className="text-xs text-green-400 mt-2">Rating saved!</p>
            )}
          </div>

          {movie.similar_movies.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-white mb-3">Similar Movies</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {movie.similar_movies.map((m) => (
                  <MovieCard key={m.movie_id} movie={m} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

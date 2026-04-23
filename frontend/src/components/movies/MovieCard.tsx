import { useState } from "react";
import { Link } from "react-router-dom";
import type { MovieSummary } from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import { useRatings } from "../../context/RatingsContext";
import { usePosterUrl } from "../../hooks/usePosterUrl";

interface Props {
  movie: MovieSummary;
  badge?: string;
}

export function MovieCard({ movie, badge }: Props) {
  const posterUrl = usePosterUrl(movie.tmdb_id);
  const [posterLoaded, setPosterLoaded] = useState(false);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [saved, setSaved] = useState(false);
  const { user } = useAuth();
  const { getRating, rateMovie } = useRatings();
  const existingRating = getRating(movie.movie_id);

  async function handleRate(e: React.MouseEvent, rating: number) {
    e.preventDefault();
    await rateMovie(movie.movie_id, rating);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  const displayRating = hoverRating ?? existingRating ?? 0;

  return (
    <Link
      to={`/movies/${movie.movie_id}`}
      className="block bg-gray-800 rounded-lg overflow-hidden hover:bg-gray-700 transition-colors group"
    >
      {/* Poster */}
      <div className="h-52 bg-gray-700 relative overflow-hidden">
        {!posterLoaded && (
          <div className="absolute inset-0 animate-pulse bg-gray-700" />
        )}
        {posterUrl && (
          <img
            src={posterUrl}
            alt={movie.title}
            loading="lazy"
            onLoad={() => setPosterLoaded(true)}
            className={`w-full h-full object-cover transition-opacity duration-300 ${posterLoaded ? "opacity-100" : "opacity-0"}`}
          />
        )}
        {!posterUrl && posterLoaded === false && (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm p-3 text-center">
            <span className="font-medium text-gray-300">{movie.title}</span>
          </div>
        )}

        {/* Badges */}
        {badge && (
          <span className="absolute top-2 right-2 text-xs bg-purple-700 text-purple-100 rounded px-1.5 py-0.5">
            {badge}
          </span>
        )}
        {existingRating && !badge && (
          <span className="absolute top-2 right-2 text-xs bg-yellow-500 text-gray-900 font-semibold rounded px-1.5 py-0.5">
            ★ {existingRating.toFixed(1)}
          </span>
        )}

        {/* Inline rating overlay (logged-in users only) */}
        {user && (
          <div
            className="absolute bottom-0 inset-x-0 bg-black/70 py-1.5 px-2 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => e.preventDefault()}
          >
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(null)}
                  onClick={(e) => handleRate(e, star)}
                  className="text-lg leading-none focus:outline-none"
                >
                  <span className={displayRating >= star ? "text-yellow-400" : "text-gray-500"}>
                    ★
                  </span>
                </button>
              ))}
            </div>
            {saved && <span className="text-xs text-green-400">Saved!</span>}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="text-sm font-medium text-white line-clamp-2">{movie.title}</p>
        {movie.year && <p className="text-xs text-gray-400 mt-0.5">{movie.year}</p>}
        <div className="flex flex-wrap gap-1 mt-2">
          {movie.genres.slice(0, 3).map((g) => (
            <span key={g} className="text-xs bg-gray-600 text-gray-300 rounded px-1.5 py-0.5">
              {g}
            </span>
          ))}
        </div>
        {movie.avg_rating != null && (
          <p className="text-xs text-yellow-400 mt-2">
            ★ {movie.avg_rating.toFixed(1)} ({movie.num_ratings.toLocaleString()})
          </p>
        )}
      </div>
    </Link>
  );
}

import type { RecommendationItem } from "../../api/client";
import { MovieCard } from "../movies/MovieCard";

interface Props {
  items: RecommendationItem[];
}

export function RecommendationList({ items }: Props) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {items.map(({ movie, score, reason }) => (
        <div key={movie.movie_id} className="relative">
          <MovieCard
            movie={movie}
            badge={reason === "hybrid" ? `${Math.round(score * 100)}%` : "Popular"}
          />
        </div>
      ))}
    </div>
  );
}

import { Link } from "react-router-dom";

interface Props {
  rated: number;
  threshold: number;
}

export function ColdStartBanner({ rated, threshold }: Props) {
  return (
    <div className="bg-purple-900/40 border border-purple-700 rounded-lg p-6 text-center">
      <p className="text-lg font-medium text-purple-200 mb-1">Rate more movies to unlock personalized recommendations</p>
      <p className="text-sm text-purple-400 mb-4">
        You've rated {rated} movie{rated !== 1 ? "s" : ""}. Rate at least {threshold} to get hybrid recommendations.
      </p>
      <Link
        to="/browse"
        className="inline-block bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
      >
        Browse &amp; Rate Movies
      </Link>
    </div>
  );
}

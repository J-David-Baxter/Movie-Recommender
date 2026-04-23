import { ColdStartBanner } from "../components/recommendations/ColdStartBanner";
import { RecommendationList } from "../components/recommendations/RecommendationList";
import { useRecommendations } from "../hooks/useRecommendations";

const COLD_START_THRESHOLD = 5;

interface Props {
  userId: string;
}

export function RecommendationsPage({ userId }: Props) {
  const { data, loading, error, refresh } = useRecommendations(userId);

  const hybridCount = data?.filter((i) => i.reason === "hybrid").length ?? 0;
  const isColdStart = data != null && data.length > 0 && data[0].reason === "popular";

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Your Recommendations</h1>
          {!loading && data && !isColdStart && (
            <p className="text-sm text-gray-400">
              Hybrid recommendations — {hybridCount} personalized picks
            </p>
          )}
        </div>
        <button
          onClick={refresh}
          disabled={loading}
          className="text-sm bg-gray-800 border border-gray-600 text-gray-300 hover:bg-gray-700 rounded-lg px-3 py-1.5 transition-colors disabled:opacity-50"
        >
          Refresh
        </button>
      </div>

      {loading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="bg-gray-800 rounded-lg h-56 animate-pulse" />
          ))}
        </div>
      )}

      {error && <p className="text-red-400">{error}</p>}

      {!loading && data && (
        <>
          {isColdStart && (
            <div className="mb-6">
              <ColdStartBanner rated={0} threshold={COLD_START_THRESHOLD} />
            </div>
          )}
          <RecommendationList items={data} />
        </>
      )}
    </div>
  );
}

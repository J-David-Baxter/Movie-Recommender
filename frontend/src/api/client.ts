const BASE_URL = (import.meta.env.VITE_API_URL as string) ?? "http://localhost:8000";

let _authToken: string | null = null;

export function setAuthToken(token: string | null) {
  _authToken = token;
}

function authHeaders(): Record<string, string> {
  return _authToken ? { Authorization: `Bearer ${_authToken}` } : {};
}

export interface MovieSummary {
  movie_id: number;
  title: string;
  year: number | null;
  genres: string[];
  avg_rating: number | null;
  num_ratings: number;
  tmdb_id: number | null;
}

export interface MovieDetail extends MovieSummary {
  tags: string[];
  similar_movies: MovieSummary[];
}

export interface MoviesResponse {
  movies: MovieSummary[];
  total: number;
  page: number;
  page_size: number;
}

export interface RecommendationItem {
  movie: MovieSummary;
  score: number;
  reason: "hybrid" | "popular";
}

async function get<T>(path: string, params?: Record<string, string | number>): Promise<T> {
  const url = new URL(BASE_URL + path);
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
    }
  }
  const res = await fetch(url.toString(), { headers: authHeaders() });
  if (!res.ok) throw new Error(`API error ${res.status}: ${await res.text()}`);
  return res.json();
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(BASE_URL + path, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`API error ${res.status}: ${await res.text()}`);
  return res.json();
}

export const api = {
  getMovies(params: { q?: string; genres?: string; page?: number; page_size?: number }) {
    return get<MoviesResponse>("/movies", params as Record<string, string | number>);
  },
  getMovie(id: number) {
    return get<MovieDetail>(`/movies/${id}`);
  },
  getPopular(n = 20) {
    return get<MovieSummary[]>("/popular", { n });
  },
  getGenres() {
    return get<string[]>("/genres");
  },
  getUserRatings() {
    return get<{ movie_id: number; rating: number }[]>("/ratings");
  },
  submitRating(req: { movie_id: number; rating: number }) {
    return post<{ status: string }>("/ratings", req);
  },
  getRecommendations(userId: string, n = 20) {
    return get<RecommendationItem[]>(`/recommendations/${userId}`, { n });
  },
};

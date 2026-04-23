from pydantic import BaseModel, Field


class MovieSummary(BaseModel):
    movie_id: int
    title: str
    year: int | None
    genres: list[str]
    avg_rating: float | None
    num_ratings: int
    tmdb_id: int | None = None


class MovieDetail(MovieSummary):
    tags: list[str]
    similar_movies: list[MovieSummary]


class RatingRequest(BaseModel):
    movie_id: int = Field(..., gt=0)
    rating: float = Field(..., ge=0.5, le=5.0)


class RatingResponse(BaseModel):
    status: str


class RatingItem(BaseModel):
    movie_id: int
    rating: float


class RecommendationItem(BaseModel):
    movie: MovieSummary
    score: float
    reason: str  # "hybrid" | "popular"


class MoviesResponse(BaseModel):
    movies: list[MovieSummary]
    total: int
    page: int
    page_size: int


class HealthResponse(BaseModel):
    status: str
    model_trained: bool
    num_movies: int
    num_ratings: int

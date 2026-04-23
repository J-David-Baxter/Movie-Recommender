import re

from fastapi import APIRouter, HTTPException, Query

from models.content import get_similar_movies
from schemas.models import MovieDetail, MovieSummary, MoviesResponse
from services.model_store import model_store

_YEAR_RE = re.compile(r"\s*\(\d{4}\)\s*$")

router = APIRouter(prefix="/movies", tags=["movies"])


def _row_to_summary(movie_id: int, row) -> MovieSummary:
    tmdb_raw = row.get("tmdb_id") if hasattr(row, "get") else getattr(row, "tmdb_id", None)
    try:
        tmdb_id = int(tmdb_raw) if tmdb_raw is not None and str(tmdb_raw) not in ("nan", "<NA>") else None
    except (ValueError, TypeError):
        tmdb_id = None
    return MovieSummary(
        movie_id=int(movie_id),
        title=_YEAR_RE.sub("", str(row["title"])),
        year=int(row["year"]) if row["year"] is not None and str(row["year"]) != "nan" else None,
        genres=row["genres_list"] if isinstance(row["genres_list"], list) else [],
        avg_rating=round(float(row["avg_rating"]), 2) if row["avg_rating"] is not None and str(row["avg_rating"]) != "nan" else None,
        num_ratings=int(row["num_ratings"]),
        tmdb_id=tmdb_id,
    )


@router.get("", response_model=MoviesResponse)
def browse_movies(
    q: str | None = Query(None, description="Search query on title"),
    genres: str | None = Query(None, description="Comma-separated genres to filter"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
):
    df = model_store.movies_df.copy()

    if q:
        df = df[df["title"].str.contains(q, case=False, na=False)]

    if genres:
        requested = [g.strip() for g in genres.split(",") if g.strip()]
        for g in requested:
            df = df[df["genres_list"].apply(lambda gs: g in gs)]

    total = len(df)
    start = (page - 1) * page_size
    page_df = df.iloc[start : start + page_size]

    movies = [_row_to_summary(mid, row) for mid, row in page_df.iterrows()]
    return MoviesResponse(movies=movies, total=total, page=page, page_size=page_size)


@router.get("/{movie_id}", response_model=MovieDetail)
def get_movie(movie_id: int):
    df = model_store.movies_df
    if movie_id not in df.index:
        raise HTTPException(status_code=404, detail="Movie not found")

    row = df.loc[movie_id]
    tags = [t for t in row["tags_str"].split() if t] if row["tags_str"] else []
    # De-duplicate while preserving order
    seen = set()
    unique_tags = []
    for t in tags:
        if t not in seen:
            seen.add(t)
            unique_tags.append(t)

    similar_pairs = get_similar_movies(movie_id, model_store.tfidf_matrix, model_store.movie_to_idx, model_store.idx_to_movie)
    similar = []
    for sim_id, _ in similar_pairs:
        if sim_id in df.index:
            similar.append(_row_to_summary(sim_id, df.loc[sim_id]))

    return MovieDetail(
        movie_id=int(movie_id),
        title=_YEAR_RE.sub("", str(row["title"])),
        year=int(row["year"]) if row["year"] is not None and str(row["year"]) != "nan" else None,
        genres=row["genres_list"] if isinstance(row["genres_list"], list) else [],
        avg_rating=round(float(row["avg_rating"]), 2) if row["avg_rating"] is not None and str(row["avg_rating"]) != "nan" else None,
        num_ratings=int(row["num_ratings"]),
        tags=unique_tags[:20],
        similar_movies=similar,
    )

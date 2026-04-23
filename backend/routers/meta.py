from fastapi import APIRouter, Query

from routers.movies import _row_to_summary
from schemas.models import MovieSummary
from services.model_store import model_store

router = APIRouter(tags=["meta"])


@router.get("/popular", response_model=list[MovieSummary])
def get_popular(n: int = Query(default=20, ge=1, le=100)):
    df = model_store.movies_df
    top = df.nlargest(n, "popularity_score")
    return [_row_to_summary(mid, row) for mid, row in top.iterrows()]


@router.get("/genres", response_model=list[str])
def get_genres():
    df = model_store.movies_df
    all_genres: set[str] = set()
    for genres in df["genres_list"]:
        all_genres.update(genres)
    return sorted(all_genres)

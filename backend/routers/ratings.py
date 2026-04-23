from fastapi import APIRouter, Depends, HTTPException

from schemas.models import RatingItem, RatingRequest, RatingResponse
from services.auth import AuthUser, get_current_user
from services.model_store import model_store
from services.ratings_store import RatingsStore

router = APIRouter(tags=["ratings"])

_store: RatingsStore | None = None


def set_ratings_store(store: RatingsStore):
    global _store
    _store = store


@router.get("/ratings", response_model=list[RatingItem])
def get_ratings(current_user: AuthUser = Depends(get_current_user)):
    if _store is None:
        return []
    return [RatingItem(movie_id=mid, rating=r) for mid, r in _store.get_user_ratings(current_user.id)]


@router.post("/ratings", response_model=RatingResponse)
def submit_rating(req: RatingRequest, current_user: AuthUser = Depends(get_current_user)):
    if _store is None:
        raise HTTPException(status_code=503, detail="Service not ready")
    if model_store.movies_df is not None and req.movie_id not in model_store.movies_df.index:
        raise HTTPException(status_code=404, detail="Movie not found")
    _store.add_rating(current_user.id, req.movie_id, req.rating)
    return RatingResponse(status="ok")

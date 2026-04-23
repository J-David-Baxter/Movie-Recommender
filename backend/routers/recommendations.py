from fastapi import APIRouter, Depends, HTTPException, Query

from config import settings
from models.collaborative import predict_ratings_batch
from models.content import cb_scores_batch
from routers.movies import _row_to_summary
from schemas.models import RecommendationItem
from services.auth import AuthUser, get_current_user
from services.model_store import model_store
from services.ratings_store import RatingsStore

router = APIRouter(tags=["recommendations"])

_store: RatingsStore | None = None


def set_ratings_store(store: RatingsStore):
    global _store
    _store = store


@router.get("/recommendations/{user_id}", response_model=list[RecommendationItem])
def get_recommendations(
    user_id: str,
    n: int = Query(default=20, ge=1, le=100),
    current_user: AuthUser = Depends(get_current_user),
):
    if user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Cannot fetch recommendations for another user")
    if not model_store.trained:
        raise HTTPException(status_code=503, detail="Model not ready")

    df = model_store.movies_df
    user_rated = _store.get_user_ratings(user_id) if _store else []
    rated_ids = {mid for mid, _ in user_rated}

    candidates = [mid for mid in df.index if mid not in rated_ids]
    is_cold_start = len(user_rated) < settings.COLD_START_THRESHOLD

    if is_cold_start:
        ranked = sorted(candidates, key=lambda m: float(df.loc[m, "popularity_score"]), reverse=True)[:n]
        return [
            RecommendationItem(
                movie=_row_to_summary(mid, df.loc[mid]),
                score=round(float(df.loc[mid, "popularity_score"]), 4),
                reason="popular",
            )
            for mid in ranked
        ]

    cf_scores = predict_ratings_batch(model_store.cf_model, user_id, candidates)
    cb_scores = cb_scores_batch(candidates, user_rated, model_store.tfidf_matrix, model_store.movie_to_idx)

    scored = []
    for mid in candidates:
        cf_norm = (cf_scores[mid] - 0.5) / 4.5
        score = settings.ALPHA * cf_norm + (1 - settings.ALPHA) * cb_scores[mid]
        scored.append((mid, score))
    scored.sort(key=lambda x: x[1], reverse=True)

    return [
        RecommendationItem(
            movie=_row_to_summary(mid, df.loc[mid]),
            score=round(score, 4),
            reason="hybrid",
        )
        for mid, score in scored[:n]
    ]

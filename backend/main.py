import pandas as pd
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import settings
from routers import movies, ratings, recommendations, meta
from services.data_loader import load_dataset
from services.model_store import model_store
from services.ratings_store import RatingsStore
from schemas.models import HealthResponse

ratings_store = RatingsStore(settings.DATABASE_URL)


@asynccontextmanager
async def lifespan(app: FastAPI):
    bundle = load_dataset(settings.DATA_DIR)
    new_ratings = ratings_store.get_all_as_dataframe()
    combined = pd.concat([bundle.ratings_df, new_ratings], ignore_index=True).drop_duplicates(
        subset=["userId", "movieId"], keep="last"
    )
    model_store.initialize(bundle, combined, settings)

    ratings.set_ratings_store(ratings_store)
    recommendations.set_ratings_store(ratings_store)
    yield


app = FastAPI(title="Movie Recommender API", version="0.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(movies.router)
app.include_router(ratings.router)
app.include_router(recommendations.router)
app.include_router(meta.router)


@app.get("/health", response_model=HealthResponse, tags=["health"])
def health():
    return HealthResponse(
        status="ready" if model_store.trained else "loading",
        model_trained=model_store.trained,
        num_movies=len(model_store.movies_df) if model_store.movies_df is not None else 0,
        num_ratings=ratings_store.total_count(),
    )

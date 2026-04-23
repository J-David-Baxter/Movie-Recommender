import pandas as pd
from scipy.sparse import csr_matrix
from sklearn.feature_extraction.text import TfidfVectorizer
from surprise import SVD

from models.collaborative import train_svd
from models.content import build_tfidf
from services.data_loader import DataBundle


class ModelStore:
    def __init__(self):
        self.cf_model: SVD | None = None
        self.tfidf_matrix: csr_matrix | None = None
        self.vectorizer: TfidfVectorizer | None = None
        self.movie_to_idx: dict[int, int] = {}
        self.idx_to_movie: dict[int, int] = {}
        self.movies_df: pd.DataFrame | None = None
        self.trained = False

    def initialize(self, bundle: DataBundle, combined_ratings: pd.DataFrame, cfg):
        self.movies_df = bundle.movies_df.copy()
        tmdb_ids = bundle.links_df["tmdbId"].where(bundle.links_df["tmdbId"].notna())
        self.movies_df["tmdb_id"] = tmdb_ids.astype("Int64")

        print("Training SVD model...")
        self.cf_model = train_svd(combined_ratings, cfg.SVD_N_FACTORS, cfg.SVD_N_EPOCHS)

        print("Building TF-IDF matrix...")
        self.vectorizer, self.tfidf_matrix, self.movie_to_idx, self.idx_to_movie = build_tfidf(bundle.movies_df)

        self.trained = True
        print(f"Models ready. {len(self.movies_df)} movies, {len(combined_ratings)} ratings.")


model_store = ModelStore()

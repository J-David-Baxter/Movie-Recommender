import numpy as np
import pandas as pd
from scipy.sparse import csr_matrix
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


def build_tfidf(movies_df: pd.DataFrame) -> tuple[TfidfVectorizer, csr_matrix, dict[int, int], dict[int, int]]:
    vectorizer = TfidfVectorizer(
        analyzer="word",
        ngram_range=(1, 2),
        min_df=2,
        max_features=5000,
        stop_words="english",
    )
    tfidf_matrix = vectorizer.fit_transform(movies_df["content_str"])

    movie_ids = list(movies_df.index)
    movie_to_idx = {mid: i for i, mid in enumerate(movie_ids)}
    idx_to_movie = {i: mid for i, mid in enumerate(movie_ids)}

    return vectorizer, tfidf_matrix, movie_to_idx, idx_to_movie


def get_similar_movies(
    movie_id: int,
    tfidf_matrix: csr_matrix,
    movie_to_idx: dict[int, int],
    idx_to_movie: dict[int, int],
    top_n: int = 10,
) -> list[tuple[int, float]]:
    idx = movie_to_idx.get(movie_id)
    if idx is None:
        return []
    query = tfidf_matrix[idx]
    scores = cosine_similarity(query, tfidf_matrix).flatten()
    scores[idx] = 0.0
    top_indices = scores.argsort()[::-1][:top_n]
    return [(idx_to_movie[i], float(scores[i])) for i in top_indices]


def cb_score_for_user(
    movie_id: int,
    user_rated: list[tuple[int, float]],
    tfidf_matrix: csr_matrix,
    movie_to_idx: dict[int, int],
) -> float:
    """Weighted mean cosine similarity from candidate to user's rated movies."""
    scores = cb_scores_batch([movie_id], user_rated, tfidf_matrix, movie_to_idx)
    return scores.get(movie_id, 0.0)


def cb_scores_batch(
    candidate_ids: list[int],
    user_rated: list[tuple[int, float]],
    tfidf_matrix: csr_matrix,
    movie_to_idx: dict[int, int],
) -> dict[int, float]:
    """Batch CB scores using a weighted user profile vector — one cosine_similarity call total."""
    if not user_rated or not candidate_ids:
        return {mid: 0.0 for mid in candidate_ids}

    rated_indices, weights = [], []
    for rated_mid, user_rating in user_rated:
        idx = movie_to_idx.get(rated_mid)
        if idx is not None:
            rated_indices.append(idx)
            weights.append(user_rating / 5.0)

    if not rated_indices:
        return {mid: 0.0 for mid in candidate_ids}

    weights_arr = np.array(weights, dtype=np.float32)
    user_profile = tfidf_matrix[rated_indices].T.dot(weights_arr) / weights_arr.sum()
    user_profile = np.asarray(user_profile).reshape(1, -1)

    valid = [(mid, movie_to_idx[mid]) for mid in candidate_ids if mid in movie_to_idx]
    if not valid:
        return {mid: 0.0 for mid in candidate_ids}

    valid_mids, valid_indices = zip(*valid)
    sims = cosine_similarity(user_profile, tfidf_matrix[list(valid_indices)]).flatten()

    result = {mid: 0.0 for mid in candidate_ids}
    for mid, sim in zip(valid_mids, sims):
        result[mid] = float(sim)
    return result

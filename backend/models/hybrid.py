from scipy.sparse import csr_matrix
from surprise import SVD

from models.collaborative import predict_rating
from models.content import cb_score_for_user


def hybrid_score(
    user_id: int,
    movie_id: int,
    cf_model: SVD,
    tfidf_matrix: csr_matrix,
    movie_to_idx: dict[int, int],
    user_rated: list[tuple[int, float]],
    alpha: float,
) -> float:
    cf_raw = predict_rating(cf_model, user_id, movie_id)
    cf_norm = (cf_raw - 0.5) / 4.5

    cb = cb_score_for_user(movie_id, user_rated, tfidf_matrix, movie_to_idx)

    return alpha * cf_norm + (1 - alpha) * cb

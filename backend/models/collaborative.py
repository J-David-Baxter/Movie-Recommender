import numpy as np
import pandas as pd
from surprise import SVD, Dataset, Reader


def train_svd(ratings_df: pd.DataFrame, n_factors: int = 50, n_epochs: int = 20) -> SVD:
    reader = Reader(rating_scale=(0.5, 5.0))
    data = Dataset.load_from_df(ratings_df[["userId", "movieId", "rating"]], reader)
    trainset = data.build_full_trainset()
    algo = SVD(n_factors=n_factors, n_epochs=n_epochs, lr_all=0.005, reg_all=0.02, random_state=42)
    algo.fit(trainset)
    return algo


def predict_rating(algo: SVD, user_id: str, movie_id: int) -> float:
    pred = algo.predict(str(user_id), str(movie_id))
    return float(pred.est)


def predict_ratings_batch(algo: SVD, user_id: str, movie_ids: list[int]) -> dict[int, float]:
    """Batch SVD predictions using matrix ops — O(n*k) instead of O(n) individual calls."""
    ts = algo.trainset
    global_mean = ts.global_mean

    try:
        inner_uid = ts.to_inner_uid(str(user_id))
        p_u = algo.pu[inner_uid]
        bu = float(algo.bu[inner_uid])
        known_user = True
    except ValueError:
        known_user = False

    known_mids, known_inner, unknown_mids = [], [], []
    for mid in movie_ids:
        try:
            known_inner.append(ts.to_inner_iid(str(mid)))
            known_mids.append(mid)
        except ValueError:
            unknown_mids.append(mid)

    results: dict[int, float] = {mid: float(global_mean) for mid in unknown_mids}

    if known_mids:
        inner_arr = np.array(known_inner)
        bi = algo.bi[inner_arr]
        if known_user:
            preds = global_mean + bu + bi + algo.qi[inner_arr] @ p_u
        else:
            preds = global_mean + bi
        preds = np.clip(preds, 0.5, 5.0)
        for mid, pred in zip(known_mids, preds):
            results[mid] = float(pred)

    return results

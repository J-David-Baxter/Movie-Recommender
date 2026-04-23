import re
from dataclasses import dataclass
from pathlib import Path

import numpy as np
import pandas as pd


@dataclass
class DataBundle:
    ratings_df: pd.DataFrame   # userId, movieId, rating
    movies_df: pd.DataFrame    # movieId, title, year, genres (list), genres_str, content_str, tags_str
    links_df: pd.DataFrame     # movieId, tmdbId


def _parse_year(title: str) -> int | None:
    m = re.search(r"\((\d{4})\)\s*$", title)
    return int(m.group(1)) if m else None


def load_dataset(data_dir: Path) -> DataBundle:
    ratings_df = pd.read_csv(data_dir / "ratings.csv", dtype={"userId": int, "movieId": int})
    movies_df = pd.read_csv(data_dir / "movies.csv", dtype={"movieId": int})
    tags_df = pd.read_csv(data_dir / "tags.csv", dtype={"userId": int, "movieId": int})
    links_df = pd.read_csv(data_dir / "links.csv", dtype={"movieId": int})

    # Aggregate tags per movie into a single string
    tags_agg = (
        tags_df.groupby("movieId")["tag"]
        .apply(lambda ts: " ".join(str(t).lower() for t in ts))
        .reset_index()
        .rename(columns={"tag": "tags_str"})
    )

    # Enrich movies
    movies_df = movies_df.merge(tags_agg, on="movieId", how="left")
    movies_df["tags_str"] = movies_df["tags_str"].fillna("")
    movies_df["year"] = movies_df["title"].apply(_parse_year)
    movies_df["genres_list"] = movies_df["genres"].apply(
        lambda g: [] if g == "(no genres listed)" else g.split("|")
    )
    movies_df["genres_str"] = movies_df["genres_list"].apply(lambda gs: " ".join(gs))
    movies_df["content_str"] = movies_df["genres_str"] + " " + movies_df["tags_str"]

    # Compute stats for each movie
    stats = (
        ratings_df.groupby("movieId")["rating"]
        .agg(avg_rating="mean", num_ratings="count")
        .reset_index()
    )
    movies_df = movies_df.merge(stats, on="movieId", how="left")
    movies_df["avg_rating"] = movies_df["avg_rating"].where(movies_df["avg_rating"].notna(), None)
    movies_df["num_ratings"] = movies_df["num_ratings"].fillna(0).astype(int)

    # Bayesian popularity score (for cold-start ranking)
    global_mean = ratings_df["rating"].mean()
    m = 10  # minimum votes threshold
    movies_df["popularity_score"] = (
        movies_df["num_ratings"] / (movies_df["num_ratings"] + m) * movies_df["avg_rating"].fillna(0)
        + m / (movies_df["num_ratings"] + m) * global_mean
    )

    movies_df = movies_df.set_index("movieId")

    links_df = links_df.set_index("movieId")

    return DataBundle(ratings_df=ratings_df, movies_df=movies_df, links_df=links_df)

import pandas as pd
import psycopg2.pool


class RatingsStore:
    def __init__(self, database_url: str):
        self._pool = psycopg2.pool.ThreadedConnectionPool(1, 5, dsn=database_url)

    def add_rating(self, user_id: str, movie_id: int, rating: float):
        conn = self._pool.getconn()
        try:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    INSERT INTO ratings (user_id, movie_id, rating)
                    VALUES (%s, %s, %s)
                    ON CONFLICT (user_id, movie_id) DO UPDATE SET rating = EXCLUDED.rating
                    """,
                    (user_id, movie_id, rating),
                )
            conn.commit()
        finally:
            self._pool.putconn(conn)

    def get_user_ratings(self, user_id: str) -> list[tuple[int, float]]:
        conn = self._pool.getconn()
        try:
            with conn.cursor() as cur:
                cur.execute(
                    "SELECT movie_id, rating FROM ratings WHERE user_id = %s",
                    (user_id,),
                )
                return cur.fetchall()
        finally:
            self._pool.putconn(conn)

    def get_all_as_dataframe(self) -> pd.DataFrame:
        conn = self._pool.getconn()
        try:
            df = pd.read_sql(
                'SELECT user_id AS "userId", movie_id AS "movieId", rating FROM ratings',
                conn,
            )
            return df
        finally:
            self._pool.putconn(conn)

    def total_count(self) -> int:
        conn = self._pool.getconn()
        try:
            with conn.cursor() as cur:
                cur.execute("SELECT COUNT(*) FROM ratings")
                return cur.fetchone()[0]
        finally:
            self._pool.putconn(conn)

# Movie Recommender

A full-stack movie recommendation app. Browse movies, rate them, and get personalized recommendations powered by a hybrid SVD + TF-IDF model.

**Live site:** https://movie-recommender-puce-one.vercel.app

---

## Features

- Browse and search ~9,000 movies with posters (via TMDB)
- Rate movies inline and track your ratings
- Personalized recommendations using collaborative filtering (SVD) + content-based (TF-IDF) hybrid model
- Email/password authentication via Supabase
- Movie detail pages with similar movie suggestions

## Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS |
| Backend | FastAPI, Python 3.11 |
| Recommendations | scikit-surprise (SVD) + scikit-learn (TF-IDF cosine similarity) |
| Database / Auth | Supabase (PostgreSQL + Auth) |
| Movie metadata | MovieLens dataset + TMDB API for posters |
| Hosting | Vercel (frontend) + Render (backend) |

## Local Development

### Backend

```bash
cd backend
pip install uv
uv sync
uv run uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`. Interactive docs at `http://localhost:8000/docs`.

Required environment variables (create `backend/.env`):

```
SUPABASE_URL=...
SUPABASE_ANON_KEY=...
SUPABASE_JWT_SECRET=...
DATABASE_URL=...                  # Supabase transaction pooler (port 6543)
CORS_ORIGINS=["http://localhost:5173"]
TMDB_API_KEY=...
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The app will be available at `http://localhost:5173`.

Required environment variables (create `frontend/.env.local`):

```
VITE_API_URL=http://localhost:8000
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
VITE_TMDB_API_KEY=...
```

## Deployment

- **Backend**: Render — auto-deploys on push to `main` via `backend/render.yaml`. Set environment variables in the Render dashboard.
- **Frontend**: Vercel — auto-deploys on push to `main`. Set environment variables in the Vercel dashboard.

> Note: The Render backend is on the free tier and sleeps after 15 minutes of inactivity. The first request after a sleep period may take ~30 seconds.

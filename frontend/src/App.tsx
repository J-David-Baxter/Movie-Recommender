import { useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { setAuthToken } from "./api/client";
import { Header } from "./components/layout/Header";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { RatingsProvider } from "./context/RatingsContext";
import { useUser } from "./hooks/useUser";
import { AuthPage } from "./pages/AuthPage";
import { BrowsePage } from "./pages/BrowsePage";
import { HomePage } from "./pages/HomePage";
import { MoviePage } from "./pages/MoviePage";
import { RecommendationsPage } from "./pages/RecommendationsPage";

function TokenSync() {
  const { session } = useAuth();
  useEffect(() => {
    setAuthToken(session?.access_token ?? null);
  }, [session]);
  return null;
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="text-gray-400 p-8 text-sm">Loading…</div>;
  if (!user) return <Navigate to="/auth" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  const { userId } = useUser();

  return (
    <>
      <TokenSync />
      <Header />
      <main>
        <Routes>
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/" element={<HomePage />} />
          <Route path="/browse" element={<BrowsePage />} />
          <Route
            path="/movies/:id"
            element={
              <ProtectedRoute>
                <MoviePage userId={userId!} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/recommendations"
            element={
              <ProtectedRoute>
                <RecommendationsPage userId={userId!} />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <RatingsProvider>
        <BrowserRouter>
          <div className="min-h-screen bg-gray-900">
            <AppRoutes />
          </div>
        </BrowserRouter>
      </RatingsProvider>
    </AuthProvider>
  );
}

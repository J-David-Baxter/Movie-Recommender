import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export function Header() {
  const { user, signOut } = useAuth();
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = search.trim();
    if (q) navigate(`/browse?q=${encodeURIComponent(q)}`);
    setSearch("");
  }

  const navClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-medium transition-colors ${isActive ? "text-purple-400" : "text-gray-300 hover:text-white"}`;

  return (
    <header className="bg-gray-900 border-b border-gray-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center gap-4">
        <Link to="/" className="text-white font-bold text-lg shrink-0">
          🎬 CineRec
        </Link>

        <nav className="flex items-center gap-5 shrink-0">
          <NavLink to="/" end className={navClass}>Home</NavLink>
          <NavLink to="/browse" className={navClass}>Browse</NavLink>
          <NavLink to="/recommendations" className={navClass}>For You</NavLink>
        </nav>

        <form onSubmit={handleSearch} className="flex-1 max-w-sm">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search movies…"
            className="w-full bg-gray-800 text-white text-sm rounded-lg px-3 py-1.5 border border-gray-600 focus:outline-none focus:border-purple-500 placeholder-gray-500"
          />
        </form>

        <div className="flex items-center gap-2 text-sm shrink-0 ml-auto">
          {user ? (
            <>
              <span className="text-gray-400 hidden sm:inline truncate max-w-[160px]">{user.email}</span>
              <button
                onClick={() => signOut()}
                className="text-gray-400 hover:text-white text-xs bg-gray-700 hover:bg-gray-600 rounded px-2 py-1 transition-colors"
              >
                Sign out
              </button>
            </>
          ) : (
            <Link
              to="/auth"
              className="text-xs bg-purple-600 hover:bg-purple-500 text-white rounded px-3 py-1 transition-colors"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

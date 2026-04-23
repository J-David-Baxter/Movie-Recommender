import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function AuthPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [signupDone, setSignupDone] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (mode === "login") {
      const { error } = await signIn(email, password);
      if (error) setError(error.message);
      else navigate("/");
    } else {
      const { error } = await signUp(email, password);
      if (error) setError(error.message);
      else setSignupDone(true);
    }

    setLoading(false);
  }

  if (signupDone) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="bg-gray-800 rounded-xl p-8 w-full max-w-sm text-center">
          <p className="text-2xl mb-2">✅</p>
          <h2 className="text-white font-semibold text-lg mb-2">Account created!</h2>
          <p className="text-gray-400 text-sm mb-4">
            Check your email to confirm your account, then{" "}
            <button
              className="text-purple-400 hover:underline"
              onClick={() => { setSignupDone(false); setMode("login"); }}
            >
              sign in
            </button>
            .
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="bg-gray-800 rounded-xl p-8 w-full max-w-sm">
        <h1 className="text-white font-bold text-xl mb-6 text-center">
          {mode === "login" ? "Sign in to CineRec" : "Create an account"}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 text-sm border border-gray-600 focus:outline-none focus:border-purple-500"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 text-sm border border-gray-600 focus:outline-none focus:border-purple-500"
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white rounded-lg py-2 text-sm font-medium transition-colors"
          >
            {loading ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          {mode === "login" ? (
            <>
              No account?{" "}
              <button className="text-purple-400 hover:underline" onClick={() => { setMode("signup"); setError(null); }}>
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button className="text-purple-400 hover:underline" onClick={() => { setMode("login"); setError(null); }}>
                Sign in
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}

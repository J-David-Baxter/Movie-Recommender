import { useAuth } from "../context/AuthContext";

export function useUser() {
  const { user, session, signOut } = useAuth();
  return {
    userId: user?.id ?? null,
    userEmail: user?.email ?? null,
    accessToken: session?.access_token ?? null,
    signOut,
  };
}

import { Navigate, useLocation } from "react-router-dom";
import { useAuthUser } from "../../hooks/useAuthUser";

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuthUser();
  const loc = useLocation();

  if (loading) return <div style={{ padding: 16 }}>Завантаження…</div>;
  if (!user) return <Navigate to="/profile" replace state={{ from: loc.pathname }} />;

  return <>{children}</>;
}

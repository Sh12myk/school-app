import { createBrowserRouter, Navigate, useLocation } from "react-router-dom";
import AppLayout from "./layout/AppLayout";
import Today from "./pages/Today";
import Announcements from "./pages/Announcements";
import Substitutions from "./pages/Substitutions";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import { useAuthUser } from "./hooks/useAuthUser";

function ProtectedApp() {
  const { user, loading } = useAuthUser();
  const loc = useLocation();

  if (loading) return <div style={{ padding: 16 }}>Завантаження…</div>;

  if (!user) {
    return <Navigate to="/login" replace state={{ from: loc.pathname }} />;
  }

  return <AppLayout />;
}

export const router = createBrowserRouter([
  { path: "/login", element: <Login /> },
  {
    path: "/",
    element: <ProtectedApp />,
    children: [
      { index: true, element: <Navigate to="/today" replace /> },
      { path: "today", element: <Today /> },
      { path: "announcements", element: <Announcements /> },
      { path: "substitutions", element: <Substitutions /> },
      { path: "profile", element: <Profile /> },
    ],
  },
]);

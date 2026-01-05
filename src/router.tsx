import { createBrowserRouter, Navigate } from "react-router-dom";
import AppLayout from "./layout/AppLayout";

import Today from "./pages/Today";
import Announcements from "./pages/Announcements";
import Substitutions from "./pages/Substitutions";
import Profile from "./pages/Profile";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      
          { path: "/substitutions", element: <Substitutions /> },
{ index: true, element: <Navigate to="/today" replace /> },
      { path: "today", element: <Today /> },
      { path: "announcements", element: <Announcements /> },
      { path: "substitutions", element: <Substitutions /> },
      { path: "profile", element: <Profile /> },
    ],
  },
]);

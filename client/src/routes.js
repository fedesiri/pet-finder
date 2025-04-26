import { createBrowserRouter } from "react-router-dom";
import AuthLayout from "./components/layout/AuthLayout";
import MainLayout from "./components/layout/MainLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import HomePage from "./pages/Home/HomePage";
import LandingPage from "./pages/Home/LandingPage";
import LoginPage from "./pages/Login/LoginPage";
import RegisterUserPage from "./pages/Login/RegisterUserPage";
import ProfilePage from "./pages/Profile/ProfilePage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />, // Layout con fondo de perro
    children: [
      {
        index: true,
        element: <LandingPage />,
      },
    ],
  },
  {
    path: "/",
    element: <AuthLayout />, // Layout con fondo plano para auth
    children: [
      {
        path: "/login",
        element: <LoginPage />,
      },
      {
        path: "/register-user",
        element: <RegisterUserPage />,
      },
      {
        path: "/profile",
        element: (
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/home",
        element: (
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        ),
      },
    ],
  },
]);

export default router;

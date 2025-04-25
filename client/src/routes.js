import { createBrowserRouter } from "react-router-dom";
import AuthLayout from "./components/layout/AuthLayout";
import MainLayout from "./components/layout/MainLayout";
import LandingPage from "./pages/Home/LandingPage";
import LoginPage from "./pages/Login/LoginPage";
import RegisterPage from "./pages/Login/RegisterPage";
import ProtectedRoute from "./components/ProtectedRoute";
import HomePage from "./pages/Home/HomePage";


const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />, // Layout con fondo de perro
    children: [
      {
        index: true,
        element: (
            <LandingPage />
        )
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
        path: "/register",
        element: <RegisterPage />,
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

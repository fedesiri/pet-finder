import { createBrowserRouter } from "react-router-dom";
import AuthLayout from "./components/layout/AuthLayout";
import MainLayout from "./components/layout/MainLayout";
import HomePage from "./pages/Home/HomePage";
import LoginPage from "./pages/Login/LoginPage";
import RegisterPage from "./pages/Login/RegisterPage";
import ProtectedRoute from "./components/ProtectedRoute";


const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />, // Layout con fondo de perro
    children: [
      {
        index: true,
        element: (
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
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
    ],
  },
]);

export default router;

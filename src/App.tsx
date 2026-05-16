import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import LoginPage from "./pages/login/LoginPage";
import DashboardLayout from "./layouts/DashboardLayout";
import ChildrenPage from "./pages/children/ChildrenPage";
import AvisosPage from "./pages/avisos/AvisosPage";
import AvisoDetailPage from "./pages/avisos/AvisoDetailPage";
import NotificacionesPage from "./pages/notificaciones/NotificacionesPage";
import { BottomNavigation } from "./components/BottomNavigation";
import { Loader2 } from "lucide-react";

function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-pink-600" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route path="/" element={<Navigate to="/children" replace />} />
              <Route path="/children" element={<ChildrenPage />} />
              <Route path="/avisos" element={<AvisosPage />} />
              <Route path="/avisos/:type" element={<AvisoDetailPage />} />
              <Route path="/notificaciones" element={<NotificacionesPage />} />
            </Route>
          </Route>
        </Routes>
        <BottomNavigation />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

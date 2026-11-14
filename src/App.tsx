import { lazy, Suspense } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { Loader2 } from "lucide-react";

const LoginPage = lazy(() => import("./pages/login/LoginPage"));
const DashboardLayout = lazy(() => import("./layouts/DashboardLayout"));
const ChildrenPage = lazy(() => import("./pages/children/ChildrenPage"));
const AvisosPage = lazy(() => import("./pages/avisos/AvisosPage"));
const AvisoDetailPage = lazy(() => import("./pages/avisos/AvisoDetailPage"));
const NotificacionesPage = lazy(
  () => import("./pages/notificaciones/NotificacionesPage"),
);
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));

function RouteLoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
    </div>
  );
}

function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <RouteLoadingFallback />;
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
        <Suspense fallback={<RouteLoadingFallback />}>
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
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

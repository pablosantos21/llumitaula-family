import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Heart } from "lucide-react";
import { ProfileMenu } from "../components/ProfileMenu";

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 px-4 py-3 md:px-8 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-pink-100 p-1.5 rounded-lg">
            <Heart className="h-5 w-5 text-pink-600" />
          </div>
          <span className="font-bold text-gray-900">Llum i Taula</span>
        </div>

        {user && <ProfileMenu user={user} onLogout={handleLogout} />}
      </header>

      <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-32">
        <Outlet />
      </main>
    </div>
  );
}
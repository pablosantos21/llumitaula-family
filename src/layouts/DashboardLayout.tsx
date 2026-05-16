import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "../components/ui/button";
import { LogOut, Menu as MenuIcon, X, Heart } from "lucide-react";
import { useState } from "react";
import { cn } from "../lib/utils";

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col bg-white border-r border-gray-200 sticky top-0 h-screen">
        <div className="p-6 flex items-center gap-2 border-b border-gray-100">
          <div className="bg-pink-100 p-1.5 rounded-lg">
            <Heart className="h-5 w-5 text-pink-600" />
          </div>
          <span className="font-bold text-gray-900">Llum i Taula</span>
        </div>

        <nav className="flex-1 p-4 overflow-y-auto" />

        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="h-8 w-8 rounded-full bg-pink-100 flex items-center justify-center text-pink-700 font-bold text-xs">
              {user?.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.name}
              </p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full mt-2 justify-start text-gray-500 hover:text-red-600 hover:bg-red-50"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Tancar sessió
          </Button>
        </div>
      </aside>

      {/* Mobile Menu Overlay */}
      <div
        className={cn(
          "fixed inset-0 z-40 md:hidden bg-gray-600 bg-opacity-75 transition-opacity ease-linear duration-300",
          isMobileMenuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none",
        )}
        onClick={() => setIsMobileMenuOpen(false)}
      />

      {/* Mobile Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-white transform transition ease-in-out duration-300 md:hidden flex flex-col",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="p-6 flex items-center justify-between border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Heart className="h-6 w-6 text-pink-600" />
            <span className="font-bold text-gray-900">Família</span>
          </div>
          <button onClick={() => setIsMobileMenuOpen(false)}>
            <X className="h-6 w-6 text-gray-400" />
          </button>
        </div>
        <nav className="flex-1 p-4 overflow-y-auto" />
        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="h-8 w-8 rounded-full bg-pink-100 flex items-center justify-center text-pink-700 font-bold text-xs">
              {user?.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.name}
              </p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full mt-2 justify-start text-gray-500 hover:text-red-600 hover:bg-red-50"
            onClick={() => {
              handleLogout();
              setIsMobileMenuOpen(false);
            }}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Tancar sessió
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="md:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <button onClick={() => setIsMobileMenuOpen(true)}>
            <MenuIcon className="h-6 w-6 text-gray-500" />
          </button>
          <span className="font-bold text-gray-900">Llum i Taula</span>
          <div className="w-6" />
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-32">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

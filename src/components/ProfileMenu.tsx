import { useEffect, useRef, useState } from "react";
import { LogOut } from "lucide-react";
import type { User } from "../services/auth.service";

interface ProfileMenuProps {
  user: User;
  onLogout: () => void;
}

export function ProfileMenu({ user, onLogout }: ProfileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  const initial =
    user.name.trim().charAt(0).toUpperCase() ||
    user.email.trim().charAt(0).toUpperCase() ||
    "?";

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-label="Menú de perfil"
        aria-expanded={isOpen}
        aria-haspopup="menu"
        onClick={() => setIsOpen((open) => !open)}
        className="flex items-center gap-2 rounded-full p-1 hover:bg-gray-100 transition-colors"
      >
        <div className="h-9 w-9 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-sm">
          {initial}
        </div>
      </button>

      {isOpen && (
        <div
          role="menu"
          aria-label="Opciones de cuenta"
          className="absolute right-0 top-full z-50 mt-2 w-64 rounded-xl border border-gray-200 bg-white shadow-lg"
        >
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user.name}
            </p>
            <p className="text-xs text-gray-500 truncate">{user.email}</p>
          </div>
          <button
            type="button"
            role="menuitem"
            onClick={onLogout}
            className="w-full flex items-center gap-2 px-4 py-3 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-b-xl transition-colors"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            Cerrar sesión
          </button>
        </div>
      )}
    </div>
  );
}
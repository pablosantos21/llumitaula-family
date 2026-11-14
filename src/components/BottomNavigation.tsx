import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Bell, MessageSquare, Home } from 'lucide-react';

export function BottomNavigation() {
    const navigate = useNavigate();
    const location = useLocation();

    const isActive = (path: string) => location.pathname.startsWith(path);

    const navItems = [
        { path: '/avisos', label: 'Avisos', icon: MessageSquare },
        { path: '/children', label: 'Inicio', icon: Home },
        { path: '/notificaciones', label: 'Notificaciones', icon: Bell },
    ] as const;

    return (
        <nav
            aria-label="Navegación principal"
            className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white px-4 pb-4 pt-2 md:py-3"
        >
            <div className="mx-auto flex max-w-md gap-2">
                {navItems.map(({ path, label, icon: Icon }) => {
                    const active = isActive(path);
                    return (
                        <button
                            key={path}
                            type="button"
                            onClick={() => navigate(path)}
                            aria-label={label}
                            aria-current={active ? 'page' : undefined}
                            className={cn(
                                'flex flex-1 flex-col items-center justify-center gap-1 rounded-lg px-3 py-2 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
                                active
                                    ? 'bg-primary-50 text-primary-600'
                                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                            )}
                        >
                            <Icon className="h-5 w-5" aria-hidden="true" />
                            <span>{label}</span>
                        </button>
                    );
                })}
            </div>
        </nav>
    );
}

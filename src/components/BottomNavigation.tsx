import { useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Bell, MessageSquare, Home } from 'lucide-react';

export function BottomNavigation() {
    const navigate = useNavigate();
    const location = useLocation();

    if (location.pathname === '/login') {
        return null;
    }

    const isActive = (path: string) => location.pathname.startsWith(path);

    const navItems = [
        { path: '/avisos', icon: Bell },
        { path: '/children', icon: Home },
        { path: '/notificaciones', icon: MessageSquare },
    ];

    return (
        <>
            {/* Desktop */}
            <div className="hidden md:block fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
                <div className="max-w-md mx-auto flex gap-2">
                    {navItems.map(({ path, icon: Icon }) => {
                        const active = isActive(path);
                        return (
                            <button
                                key={path}
                                onClick={() => navigate(path)}
                                className={cn(
                                    "flex-1 flex items-center justify-center py-3 px-4 rounded-lg transition-colors",
                                    active
                                        ? "bg-pink-100 text-pink-600"
                                        : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                                )}
                            >
                                <Icon className="h-6 w-6" />
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Mobile */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 pb-6 pt-3">
                <div className="flex gap-2">
                    {navItems.map(({ path, icon: Icon }) => {
                        const active = isActive(path);
                        return (
                            <button
                                key={path}
                                onClick={() => navigate(path)}
                                className={cn(
                                    "flex-1 flex items-center justify-center py-3 px-4 rounded-lg transition-colors",
                                    active
                                        ? "bg-pink-100 text-pink-600"
                                        : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                                )}
                            >
                                <Icon className="h-6 w-6" />
                            </button>
                        );
                    })}
                </div>
            </div>
        </>
    );
}

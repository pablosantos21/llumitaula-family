import { Card, CardContent } from '@/components/ui/card';
import type { Menu } from '@/services/menus.service';
import { Loader2 } from 'lucide-react';

interface NightMenuSectionProps {
    menu: Menu | null;
    isLoading: boolean;
}

export function NightMenuSection({ menu, isLoading }: NightMenuSectionProps) {
    if (isLoading) {
        return (
            <Card className="mb-4">
                <CardContent className="p-6 flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-primary-600" />
                </CardContent>
            </Card>
        );
    }

    if (!menu) {
        return (
            <Card className="mb-4">
                <CardContent className="p-6 text-center">
                    <p className="text-gray-500 text-sm">
                        No hay menú complementario disponible
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="mb-4">
            <CardContent className="p-0">
                <div className="bg-gradient-to-r from-primary-50 to-primary-100 p-4 border-b border-primary-200">
                    <h2 className="font-bold text-lg text-gray-900">
                        Menú complementario nocturno
                    </h2>
                </div>
                <div className="p-4 space-y-4">
                    {menu.first_course && (
                        <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                Primer plato
                            </p>
                            <p className="text-gray-900 font-medium mt-1">
                                {menu.first_course}
                            </p>
                        </div>
                    )}

                    {menu.second_course && (
                        <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                Segundo plato
                            </p>
                            <p className="text-gray-900 font-medium mt-1">
                                {menu.second_course}
                            </p>
                        </div>
                    )}

                    {menu.side && (
                        <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                Guarnición
                            </p>
                            <p className="text-gray-900 font-medium mt-1">
                                {menu.side}
                            </p>
                        </div>
                    )}

                    {menu.salad && (
                        <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                Ensalada
                            </p>
                            <p className="text-gray-900 font-medium mt-1">
                                {menu.salad}
                            </p>
                        </div>
                    )}

                    {menu.dessert && (
                        <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                Postre
                            </p>
                            <p className="text-gray-900 font-medium mt-1">
                                {menu.dessert}
                            </p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

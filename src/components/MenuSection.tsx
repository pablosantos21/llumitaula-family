import { Card, CardContent } from '@/components/ui/card';
import { hasMenuDishes } from '@/lib/menu-selection';
import type { Menu } from '@/services/menus.service';
import { Loader2 } from 'lucide-react';

interface MenuSectionProps {
    title: string;
    emptyMessage: string;
    menu: Menu | null;
    isLoading: boolean;
}

const MENU_FIELDS: Array<{ key: keyof Pick<Menu, 'first_course' | 'second_course' | 'side' | 'salad' | 'dessert'>; label: string }> = [
    { key: 'first_course', label: 'Primer plato' },
    { key: 'second_course', label: 'Segundo plato' },
    { key: 'side', label: 'Guarnición' },
    { key: 'salad', label: 'Ensalada' },
    { key: 'dessert', label: 'Postre' },
];

export function MenuSection({
    title,
    emptyMessage,
    menu,
    isLoading,
}: MenuSectionProps) {
    if (isLoading) {
        return (
            <Card className="mb-4">
                <CardContent className="p-6 flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-primary-600" />
                </CardContent>
            </Card>
        );
    }

    if (!hasMenuDishes(menu)) {
        return (
            <Card className="mb-4">
                <CardContent className="p-6 text-center">
                    <p className="text-gray-500 text-sm">{emptyMessage}</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="mb-4">
            <CardContent className="p-0">
                <div className="bg-gradient-to-r from-primary-50 to-primary-100 p-4 border-b border-primary-200">
                    <h2 className="font-bold text-lg text-gray-900">{title}</h2>
                </div>
                <div className="p-4 space-y-4">
                    {MENU_FIELDS.map(({ key, label }) => {
                        const dish = menu[key];
                        if (!dish) return null;
                        return (
                            <div key={key}>
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                    {label}
                                </p>
                                <p className="text-gray-900 font-medium mt-1">
                                    {dish}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}

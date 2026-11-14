import { MenuSection } from '@/components/MenuSection';
import type { Menu } from '@/services/menus.service';

interface DailyMenuSectionProps {
    menu: Menu | null;
    isLoading: boolean;
}

export function DailyMenuSection({ menu, isLoading }: DailyMenuSectionProps) {
    return (
        <MenuSection
            title="Menú del día"
            emptyMessage="No hay menú disponible para este día"
            menu={menu}
            isLoading={isLoading}
        />
    );
}

import { MenuSection } from '@/components/MenuSection';
import type { Menu } from '@/services/menus.service';

interface NightMenuSectionProps {
    menu: Menu | null;
    isLoading: boolean;
}

export function NightMenuSection({ menu, isLoading }: NightMenuSectionProps) {
    return (
        <MenuSection
            title="Menú complementario nocturno"
            emptyMessage="No hay menú complementario disponible"
            menu={menu}
            isLoading={isLoading}
        />
    );
}

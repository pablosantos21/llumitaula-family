import type { Menu, MenuAssignment } from '@/services/menus.service';

const NIGHT_MENU_TYPES = new Set([
    'night',
    'nocturno',
    'dinner',
    'cena',
    'complementario',
    'complementary',
]);

const DAILY_MENU_TYPES = new Set([
    'daily',
    'day',
    'diario',
    'lunch',
    'mediodia',
    'mediodía',
    'comida',
    'normal',
    'standard',
]);

/** Comprueba si el menú tiene al menos un plato con contenido visible. */
export function hasMenuDishes(menu: Menu | null | undefined): menu is Menu {
    if (!menu) return false;

    const courses = [
        menu.first_course,
        menu.second_course,
        menu.side,
        menu.salad,
        menu.dessert,
    ];

    return courses.some(
        (course) => typeof course === 'string' && course.trim().length > 0,
    );
}

/** Indica si `menu.type` corresponde al menú complementario nocturno. */
export function isNightMenuType(type: string | null | undefined): boolean {
    if (!type) return false;
    return NIGHT_MENU_TYPES.has(type.trim().toLowerCase());
}

/** Indica si `menu.type` corresponde al menú principal del día (o no especifica tipo). */
export function isDailyMenuType(type: string | null | undefined): boolean {
    if (!type) return true;
    const normalized = type.trim().toLowerCase();
    if (!normalized) return true;
    return DAILY_MENU_TYPES.has(normalized);
}

/** Selecciona el menú del día y el menú nocturno desde las asignaciones del colegio. */
export function selectMenusByType(assignments: MenuAssignment[]): {
    dailyMenu: Menu | null;
    nightMenu: Menu | null;
} {
    let dailyMenu: Menu | null = null;
    let nightMenu: Menu | null = null;

    for (const assignment of assignments) {
        const candidate = assignment.menus;
        if (!hasMenuDishes(candidate)) continue;

        if (!nightMenu && isNightMenuType(candidate.type)) {
            nightMenu = candidate;
            continue;
        }

        if (!dailyMenu && isDailyMenuType(candidate.type)) {
            dailyMenu = candidate;
        }
    }

    return { dailyMenu, nightMenu };
}

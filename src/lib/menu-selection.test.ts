import { describe, expect, it } from 'vitest';
import type { Menu, MenuAssignment } from '@/services/menus.service';
import {
    hasMenuDishes,
    isDailyMenuType,
    isNightMenuType,
    selectMenusByType,
} from './menu-selection';

function makeMenu(overrides: Partial<Menu> = {}): Menu {
    return {
        id: 'menu-1',
        first_course: 'Sopa de verduras',
        second_course: 'Pollo asado',
        side: null,
        salad: null,
        dessert: 'Fruta',
        type: 'daily',
        ...overrides,
    };
}

function makeAssignment(menu: Menu | undefined): MenuAssignment {
    return {
        menu_id: menu?.id ?? 'missing',
        school_id: 'school-1',
        date: '2026-10-06',
        menus: menu,
    };
}

describe('hasMenuDishes', () => {
    it('devuelve false si el menú es null o tiene todos los platos vacíos', () => {
        expect(hasMenuDishes(null)).toBe(false);
        expect(hasMenuDishes(undefined)).toBe(false);
        expect(
            hasMenuDishes(
                makeMenu({
                    first_course: null,
                    second_course: null,
                    side: '   ',
                    salad: '',
                    dessert: null,
                }),
            ),
        ).toBe(false);
    });

    it('devuelve true cuando al menos un plato tiene texto', () => {
        expect(
            hasMenuDishes(
                makeMenu({
                    first_course: null,
                    second_course: null,
                    side: null,
                    salad: null,
                    dessert: 'Yogur',
                }),
            ),
        ).toBe(true);
    });
});

describe('isNightMenuType e isDailyMenuType', () => {
    it('reconoce variantes canónicas de menú nocturno y diario', () => {
        expect(isNightMenuType('night')).toBe(true);
        expect(isNightMenuType('Nocturno')).toBe(true);
        expect(isNightMenuType('dinner')).toBe(true);
        expect(isNightMenuType('complementario')).toBe(true);
        expect(isNightMenuType('daily')).toBe(false);

        expect(isDailyMenuType(null)).toBe(true);
        expect(isDailyMenuType('')).toBe(true);
        expect(isDailyMenuType('daily')).toBe(true);
        expect(isDailyMenuType('lunch')).toBe(true);
        expect(isDailyMenuType('normal')).toBe(true);
        expect(isDailyMenuType('night')).toBe(false);
    });
});

describe('selectMenusByType', () => {
    it('no confunde un menú nocturno con el menú del día cuando llega en primera posición', () => {
        const night = makeMenu({
            id: 'night-1',
            type: 'night',
            first_course: 'Crema de calabacín',
        });
        const daily = makeMenu({
            id: 'daily-1',
            type: 'daily',
            first_course: 'Macarrones',
        });

        const selected = selectMenusByType([
            makeAssignment(night),
            makeAssignment(daily),
        ]);

        expect(selected.dailyMenu).toEqual(daily);
        expect(selected.nightMenu).toEqual(night);
    });

    it('devuelve dailyMenu como null si solo hay un menú nocturno asignado', () => {
        const night = makeMenu({ id: 'night-1', type: 'nocturno' });
        const selected = selectMenusByType([makeAssignment(night)]);

        expect(selected.dailyMenu).toBeNull();
        expect(selected.nightMenu).toEqual(night);
    });

    it('descarta menús sin platos informados aunque existan registros asignados', () => {
        const emptyDaily = makeMenu({
            id: 'empty-1',
            type: 'daily',
            first_course: null,
            second_course: null,
            side: null,
            salad: null,
            dessert: null,
        });
        const emptyNight = makeMenu({
            id: 'empty-2',
            type: 'night',
            first_course: '  ',
            second_course: null,
            side: null,
            salad: null,
            dessert: null,
        });

        const selected = selectMenusByType([
            makeAssignment(emptyDaily),
            makeAssignment(emptyNight),
        ]);

        expect(selected.dailyMenu).toBeNull();
        expect(selected.nightMenu).toBeNull();
    });
});

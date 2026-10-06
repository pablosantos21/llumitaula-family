import { describe, expect, it } from 'vitest';
import { mapMealStatusToEatingType } from './meal-records-mapping';

describe('mapMealStatusToEatingType', () => {
    it('mapea bien a good, regular a normal y mal a poor', () => {
        expect(mapMealStatusToEatingType('bien')).toBe('good');
        expect(mapMealStatusToEatingType('regular')).toBe('normal');
        expect(mapMealStatusToEatingType('mal')).toBe('poor');
    });
});

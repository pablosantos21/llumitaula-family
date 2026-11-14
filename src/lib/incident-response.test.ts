import { describe, expect, it } from 'vitest';
import {
    buildFamilyResponse,
    DEFAULT_FAMILY_RESPONSE,
    getUnseenIncidentIds,
    INCIDENT_RESPONSE_MAX_LENGTH,
    isFamilyResponseValid,
} from './incident-response';

describe('buildFamilyResponse', () => {
    it('usa el literal por defecto cuando está vacío o solo contiene espacios', () => {
        expect(buildFamilyResponse()).toBe(DEFAULT_FAMILY_RESPONSE);
        expect(buildFamilyResponse('')).toBe(DEFAULT_FAMILY_RESPONSE);
        expect(buildFamilyResponse('   \n\t  ')).toBe(DEFAULT_FAMILY_RESPONSE);
    });

    it('recorta espacios externos y conserva el comentario de la familia', () => {
        expect(buildFamilyResponse('  Enterado, gracias  ')).toBe('Enterado, gracias');
    });
});

describe('isFamilyResponseValid', () => {
    it('acepta comentario vacío y hasta el máximo permitido', () => {
        expect(isFamilyResponseValid('')).toBe(true);
        expect(isFamilyResponseValid('x'.repeat(INCIDENT_RESPONSE_MAX_LENGTH))).toBe(true);
        expect(isFamilyResponseValid(`  ${'x'.repeat(INCIDENT_RESPONSE_MAX_LENGTH)}  `)).toBe(true);
    });

    it('rechaza comentarios que superen el límite', () => {
        expect(isFamilyResponseValid('x'.repeat(INCIDENT_RESPONSE_MAX_LENGTH + 1))).toBe(false);
    });
});

describe('getUnseenIncidentIds', () => {
    it('devuelve únicamente los IDs con family_seen false o null', () => {
        expect(
            getUnseenIncidentIds([
                { id: '1', family_seen: false },
                { id: '2', family_seen: true },
                { id: '3', family_seen: null },
            ]),
        ).toEqual(['1', '3']);
    });
});

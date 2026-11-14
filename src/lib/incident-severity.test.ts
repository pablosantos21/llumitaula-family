import { describe, expect, it } from 'vitest';
import { getIncidentSeverity, getSeverityColor } from './incident-severity';

describe('getIncidentSeverity', () => {
    it('detecta severidad crítica para alergias, urgencias y emergencias', () => {
        expect(getIncidentSeverity('Reacción por alergia al huevo')).toBe('critical');
        expect(getIncidentSeverity('Urgencia médica en el patio')).toBe('critical');
        expect(getIncidentSeverity('Emergencia sanitaria')).toBe('critical');
    });

    it('detecta severidad warning para problemas, conflictos o comportamiento', () => {
        expect(getIncidentSeverity('Problema de comportamiento en el comedor')).toBe('warning');
        expect(getIncidentSeverity('Conflicto con un compañero')).toBe('warning');
    });

    it('devuelve info cuando no hay palabras clave de alerta', () => {
        expect(getIncidentSeverity('Se quedó dormido unos minutos')).toBe('info');
    });

    it('evita falsos positivos en frases con negaciones', () => {
        expect(getIncidentSeverity('Ha comido todo sin problemas')).toBe('info');
        expect(getIncidentSeverity('Sin ningún problema durante el comedor')).toBe('info');
        expect(getIncidentSeverity('Sin reacción de alergia')).toBe('info');
        expect(getIncidentSeverity('No presenta alergia')).toBe('info');
        expect(getIncidentSeverity('Sense problemes al menjador')).toBe('info');
    });

    it('mantiene la severidad si coexiste una negación con un evento real', () => {
        expect(
            getIncidentSeverity('Tuvo alergia por la mañana aunque luego estuvo sin problemas')
        ).toBe('critical');
    });
});

describe('getSeverityColor', () => {
    it('devuelve las clases esperadas para cada nivel de severidad', () => {
        expect(getSeverityColor('critical')).toBe('bg-red-50 border-red-200');
        expect(getSeverityColor('warning')).toBe('bg-amber-50 border-amber-200');
        expect(getSeverityColor('info')).toBe('bg-blue-50 border-blue-200');
    });
});

import { useCallback, useEffect, useState } from 'react';
import { CapabilityService } from '@/services/capabilities.service';

export interface MealCapabilityState {
    enabled: boolean;
    isLoading: boolean;
    error: string | null;
    retry: () => void;
}

/** Resuelve la capacidad efectiva de comidas para el hijo seleccionado, recalculando al cambiar de hijo. */
export function useMealCapability(childId: string | null, dateISO = ''): MealCapabilityState {
    const [enabled, setEnabled] = useState(true);
    // Arranca cargando para no mostrar la sección antes de resolver (evita flash habilitado).
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [attempt, setAttempt] = useState(0);

    const retry = useCallback(() => {
        setAttempt((value) => value + 1);
    }, []);

    useEffect(() => {
        if (!childId) return;

        let cancelled = false;

        const resolve = async () => {
            try {
                setIsLoading(true);
                setError(null);
                const value = await CapabilityService.getMealCapabilityForChild(childId);
                if (!cancelled) setEnabled(value);
            } catch (err) {
                if (!cancelled) {
                    // Fail-closed: ante error se ocultan los registros hasta reintentar.
                    // Se fuerza enabled a false para que cualquier consumidor de `.enabled` también cierre.
                    setEnabled(false);
                    setError(err instanceof Error ? err.message : 'No se pudo cargar la configuración');
                }
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        };

        resolve();

        return () => {
            cancelled = true;
        };
    }, [childId, attempt, dateISO]);

    if (!childId) {
        return { enabled: true, isLoading: false, error: null, retry };
    }

    return { enabled, isLoading, error, retry };
}

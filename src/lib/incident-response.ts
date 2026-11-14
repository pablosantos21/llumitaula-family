export const DEFAULT_FAMILY_RESPONSE = 'Enterado / Firmado';
export const INCIDENT_RESPONSE_MAX_LENGTH = 1000;

/** Normaliza la respuesta familiar usando el texto por defecto cuando no hay comentario. */
export function buildFamilyResponse(text = ''): string {
    const trimmed = text.trim();
    return trimmed || DEFAULT_FAMILY_RESPONSE;
}

/** Valida que el comentario opcional no supere la longitud máxima permitida. */
export function isFamilyResponseValid(text: string): boolean {
    return text.trim().length <= INCIDENT_RESPONSE_MAX_LENGTH;
}

/** Devuelve los IDs de incidencias que aún no constan como vistas por la familia. */
export function getUnseenIncidentIds(
    incidents: ReadonlyArray<{ id: string; family_seen: boolean | null }>,
): string[] {
    return incidents
        .filter((incident) => !incident.family_seen)
        .map((incident) => incident.id);
}

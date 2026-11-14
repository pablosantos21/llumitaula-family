export type IncidentSeverity = 'critical' | 'warning' | 'info';

const NEGATED_PATTERNS: RegExp[] = [
    /(?<![\p{L}\p{N}])sin\s+(?:ning[uú]n(?:a)?\s+)?(?:problema|problemas|incidencia|incidencias|reacci[oó]n(?:es)?(?:\s+de\s+alergia|\s+al[eé]rgica)?|alergia|alergias|al·lèrgia|conflicto|conflictos|conflicte|urg[eè]ncia|urgencia|emergencia|s[ií]ntomas?)(?![\p{L}\p{N}])/giu,
    /(?<![\p{L}\p{N}])no\s+(?:presenta|tiene|hubo|muestra|hay|tuvo)\s+(?:ning[uú]n(?:a)?\s+)?(?:problema|problemas|alergia|alergias|al·lèrgia|reacci[oó]n(?:es)?(?:\s+de\s+alergia|\s+al[eé]rgica)?|incidencia|incidencias|conflicto|conflictos|urg[eè]ncia|urgencia|emergencia)(?![\p{L}\p{N}])/giu,
    /(?<![\p{L}\p{N}])sense\s+(?:cap\s+)?(?:problema|problemes|al·lèrgia|incid[eè]ncia|incid[eè]ncies|conflicte|conflictes)(?![\p{L}\p{N}])/giu,
];

const CRITICAL_KEYWORDS = [
    'al·lèrgia',
    'alergia',
    'urgència',
    'urgencia',
    'emergencia',
] as const;

const WARNING_KEYWORDS = [
    'comportament',
    'comportamiento',
    'problema',
    'conflicte',
    'conflicto',
] as const;

function stripNegatedClauses(description: string): string {
    let cleaned = description.toLowerCase();
    for (const pattern of NEGATED_PATTERNS) {
        cleaned = cleaned.replace(pattern, ' ');
    }
    return cleaned;
}

/** Clasifica la severidad de una incidencia ignorando frases en forma negativa. */
export function getIncidentSeverity(description: string): IncidentSeverity {
    const cleaned = stripNegatedClauses(description);

    if (CRITICAL_KEYWORDS.some((keyword) => cleaned.includes(keyword))) {
        return 'critical';
    }
    if (WARNING_KEYWORDS.some((keyword) => cleaned.includes(keyword))) {
        return 'warning';
    }
    return 'info';
}

/** Clases Tailwind de fondo y borde según severidad de la incidencia. */
export function getSeverityColor(severity: IncidentSeverity): string {
    switch (severity) {
        case 'critical':
            return 'bg-red-50 border-red-200';
        case 'warning':
            return 'bg-amber-50 border-amber-200';
        default:
            return 'bg-blue-50 border-blue-200';
    }
}

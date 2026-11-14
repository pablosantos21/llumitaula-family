import { Baby, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import type { Child } from '@/services/children.service';

interface ChildrenLoadStateProps {
    children: Child[] | null;
    loadError: boolean;
}

/** Muestra el estado de error, carga o ausencia de hijos en formularios de avisos. */
export function ChildrenLoadState({
    children,
    loadError,
}: ChildrenLoadStateProps) {
    if (loadError) {
        return (
            <Card>
                <CardContent className="py-12 text-center">
                    <p className="text-gray-700 font-medium">
                        No se han podido cargar tus hijos
                    </p>
                    <p className="text-gray-500 text-sm mt-1">
                        Inténtalo de nuevo más tarde.
                    </p>
                </CardContent>
            </Card>
        );
    }

    if (children === null) {
        return (
            <Card>
                <CardContent className="py-12 flex justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardContent className="py-12 text-center">
                <Baby className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No hay hijos asignados
                </h3>
                <p className="text-gray-500">
                    Contacta con el centro para vincular a tus hijos.
                </p>
            </CardContent>
        </Card>
    );
}

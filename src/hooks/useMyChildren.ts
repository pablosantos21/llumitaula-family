import { useCallback, useEffect, useState } from 'react';
import { ChildService, type Child } from '@/services/children.service';

export interface UseMyChildrenResult {
    children: Child[] | null;
    loadError: boolean;
    childId: string;
    setChildId: (id: string) => void;
    resetChildId: () => void;
}

/** Carga los hijos asociados a la familia y autoselecciona cuando hay un único hijo. */
export function useMyChildren(): UseMyChildrenResult {
    const [children, setChildren] = useState<Child[] | null>(null);
    const [loadError, setLoadError] = useState(false);
    const [childId, setChildId] = useState('');

    useEffect(() => {
        let cancelled = false;

        ChildService.getMyChildren()
            .then((rows) => {
                if (cancelled) return;
                setChildren(rows);
                if (rows.length === 1) {
                    setChildId(rows[0].id);
                }
            })
            .catch((error) => {
                console.error('Error fetching children:', error);
                if (!cancelled) {
                    setLoadError(true);
                }
            });

        return () => {
            cancelled = true;
        };
    }, []);

    const resetChildId = useCallback(() => {
        setChildId(children?.length === 1 ? children[0].id : '');
    }, [children]);

    return {
        children,
        loadError,
        childId,
        setChildId,
        resetChildId,
    };
}

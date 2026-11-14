import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import type { Child } from '@/services/children.service';

interface ChildSelectorFieldProps {
    childrenList: Child[];
    childId: string;
    onChange: (childId: string) => void;
    error?: string;
    errorId?: string;
    required?: boolean;
    disabled?: boolean;
}

/** Selector de hijo reutilizable para formularios de avisos (solo lectura si hay uno). */
export function ChildSelectorField({
    childrenList,
    childId,
    onChange,
    error,
    errorId = 'aviso-child-error',
    required = false,
    disabled = false,
}: ChildSelectorFieldProps) {
    const isSingle = childrenList.length === 1;
    const hasError = error !== undefined;

    return (
        <div>
            <Label htmlFor={isSingle ? undefined : 'child'} className="block mb-2">
                Hijo
            </Label>
            {isSingle ? (
                <div className="flex h-10 items-center rounded-md border border-gray-300 bg-gray-50 px-3 text-sm text-gray-900">
                    {childrenList[0].first_name} {childrenList[0].last_name}
                </div>
            ) : (
                <Select
                    id="child"
                    value={childId}
                    onChange={(e) => onChange(e.target.value)}
                    required={required}
                    disabled={disabled}
                    aria-invalid={hasError}
                    aria-describedby={hasError ? errorId : undefined}
                >
                    <option value="">Selecciona un hijo</option>
                    {childrenList.map((child) => (
                        <option key={child.id} value={child.id}>
                            {child.first_name} {child.last_name}
                        </option>
                    ))}
                </Select>
            )}
            {hasError && (
                <p id={errorId} role="alert" className="mt-1 text-xs text-red-600">
                    {error}
                </p>
            )}
        </div>
    );
}

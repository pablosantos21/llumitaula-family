import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { ChildService, type Child } from '@/services/children.service';
import {
    FamilyRequestService,
    type FamilyRequestType,
    type FueraDeHoraDirection,
} from '@/services/family-requests.service';
import {
    FUERA_DE_HORA_DIRECTIONS,
    FUERA_DE_HORA_DUPLICATE_ERROR,
    buildFueraDeHoraMessage,
    formatFueraDeHoraDateLong,
    getFueraDeHoraFormErrors,
    isFueraDeHoraDuplicateError,
    isFueraDeHoraFormValid,
    todayISODate,
} from '@/lib/fuera-de-hora-validation';
import { Baby, CheckCircle2, Loader2 } from 'lucide-react';

interface FueraDeHoraRequestFormProps {
    requestType: FamilyRequestType;
}

export default function FueraDeHoraRequestForm({ requestType }: FueraDeHoraRequestFormProps) {
    const navigate = useNavigate();

    const [children, setChildren] = useState<Child[] | null>(null);
    const [loadError, setLoadError] = useState(false);

    const [childId, setChildId] = useState('');
    const [date, setDate] = useState(todayISODate);
    const [direction, setDirection] = useState<FueraDeHoraDirection | ''>('');
    const [submitAttempted, setSubmitAttempted] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [sent, setSent] = useState(false);

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
                if (!cancelled) setLoadError(true);
            });

        return () => {
            cancelled = true;
        };
    }, []);

    const formErrors = getFueraDeHoraFormErrors({ childId, dateISO: date, direction });
    const showChildError = submitAttempted && formErrors.childId !== undefined;
    const showDateError = submitAttempted && formErrors.dateISO !== undefined;
    const showDirectionError = submitAttempted && formErrors.direction !== undefined;
    const isValid = isFueraDeHoraFormValid({ childId, dateISO: date, direction });

    const resetForm = () => {
        setChildId(children?.length === 1 ? children[0].id : '');
        setDate(todayISODate());
        setDirection('');
        setSubmitAttempted(false);
        setSubmitError('');
    };

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        if (isSubmitting) return;
        setSubmitAttempted(true);
        setSubmitError('');
        if (!isValid) return;

        setIsSubmitting(true);
        try {
            await FamilyRequestService.create({
                child_id: childId,
                request_type: requestType,
                date,
                message: buildFueraDeHoraMessage(direction as FueraDeHoraDirection),
                contact_method: null,
                contact_detail: null,
                payload: { direction },
            });
            setSent(true);
        } catch (error) {
            setSubmitError(
                isFueraDeHoraDuplicateError(error)
                    ? FUERA_DE_HORA_DUPLICATE_ERROR
                    : 'No se ha podido enviar el aviso. Inténtalo de nuevo.',
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    if (sent) {
        const directionLabel =
            FUERA_DE_HORA_DIRECTIONS.find((d) => d.value === direction)?.label.toLowerCase() ??
            '';
        return (
            <Card>
                <CardContent className="p-8 text-center">
                    <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto mb-3" />
                    <p className="text-gray-700 font-medium">Aviso enviado</p>
                    <p className="text-gray-500 text-sm mt-1">
                        Hemos recibido tu aviso de salida {directionLabel} para el{' '}
                        {formatFueraDeHoraDateLong(date)}. Una persona del centro lo revisará.
                    </p>
                    <Button className="mt-6" onClick={() => navigate('/avisos')}>
                        Volver a Avisos
                    </Button>
                </CardContent>
            </Card>
        );
    }

    if (loadError) {
        return (
            <Card>
                <CardContent className="py-12 text-center">
                    <p className="text-gray-700 font-medium">No se han podido cargar tus hijos</p>
                    <p className="text-gray-500 text-sm mt-1">Inténtalo de nuevo más tarde.</p>
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

    if (children.length === 0) {
        return (
            <Card>
                <CardContent className="py-12 text-center">
                    <Baby className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No tienes hijos asociados</h3>
                    <p className="text-gray-500">Contacta con el centro para asociar tus hijos a tu cuenta.</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Nuevo aviso</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor={children.length === 1 ? undefined : 'child'} className="block mb-2">Hijo</Label>
                        {children.length === 1 ? (
                            <div className="flex h-10 items-center rounded-md border border-gray-300 bg-gray-50 px-3 text-sm text-gray-900">
                                {children[0].first_name} {children[0].last_name}
                            </div>
                        ) : (
                            <Select
                                id="child"
                                value={childId}
                                onChange={(e) => setChildId(e.target.value)}
                                required
                                aria-invalid={showChildError}
                                aria-describedby={showChildError ? 'fuera-de-hora-child-error' : undefined}
                            >
                                <option value="">Selecciona un hijo</option>
                                {children.map((child) => (
                                    <option key={child.id} value={child.id}>
                                        {child.first_name} {child.last_name}
                                    </option>
                                ))}
                            </Select>
                        )}
                        {showChildError && (
                            <p
                                id="fuera-de-hora-child-error"
                                role="alert"
                                className="mt-1 text-sm text-red-600"
                            >
                                {formErrors.childId}
                            </p>
                        )}
                    </div>

                    <div>
                        <Label htmlFor="date" className="block mb-2">Fecha</Label>
                        <Input
                            id="date"
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            required
                            aria-invalid={showDateError}
                            aria-describedby={showDateError ? 'fuera-de-hora-date-error' : undefined}
                        />
                        {showDateError && (
                            <p
                                id="fuera-de-hora-date-error"
                                role="alert"
                                className="mt-1 text-sm text-red-600"
                            >
                                {formErrors.dateISO}
                            </p>
                        )}
                    </div>

                    <fieldset>
                        <legend className="block text-sm font-medium text-gray-700 mb-2">
                            La salida será
                        </legend>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {FUERA_DE_HORA_DIRECTIONS.map((option) => (
                                <label
                                    key={option.value}
                                    className={`flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2.5 text-sm transition-colors ${
                                        direction === option.value
                                            ? 'border-primary-600 bg-primary-50 text-gray-900'
                                            : 'border-gray-300 text-gray-700 hover:border-gray-400'
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        name="direction"
                                        value={option.value}
                                        checked={direction === option.value}
                                        onChange={() => setDirection(option.value)}
                                        className="accent-primary-600"
                                    />
                                    {option.label}
                                </label>
                            ))}
                        </div>
                        {showDirectionError && (
                            <p role="alert" className="mt-1 text-sm text-red-600">
                                {formErrors.direction}
                            </p>
                        )}
                    </fieldset>

                    {submitError && (
                        <div
                            role="alert"
                            className="bg-red-50 text-red-600 text-sm p-3 rounded-md border border-red-100"
                        >
                            {submitError}
                        </div>
                    )}

                    <div className="flex gap-3 pt-4">
                        <Button type="submit" className="flex-1" disabled={isSubmitting}>
                            {isSubmitting ? 'Enviando...' : 'Enviar aviso'}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            className="flex-1"
                            onClick={resetForm}
                            disabled={isSubmitting}
                        >
                            Cancelar
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}

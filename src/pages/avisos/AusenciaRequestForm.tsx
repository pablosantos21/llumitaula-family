import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Baby, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
    buildAusenciaMessage,
    getAusenciaFormErrors,
    isAusenciaFormValid,
    todayISODate,
    AUSENCIA_MESSAGE_MAX_LENGTH,
} from '@/lib/ausencia-validation';
import { ChildService, type Child } from '@/services/children.service';
import {
    FamilyRequestService,
    type FamilyRequestType,
} from '@/services/family-requests.service';

interface AusenciaRequestFormProps {
    requestType: FamilyRequestType;
}

export default function AusenciaRequestForm({ requestType }: AusenciaRequestFormProps) {
    const navigate = useNavigate();
    const [children, setChildren] = useState<Child[] | null>(null);
    const [loadError, setLoadError] = useState(false);
    const [childId, setChildId] = useState('');
    const [date, setDate] = useState(todayISODate());
    const [message, setMessage] = useState('');
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
                if (rows.length === 1) setChildId(rows[0].id);
            })
            .catch((error) => {
                console.error('Error fetching children:', error);
                if (!cancelled) setLoadError(true);
            });

        return () => {
            cancelled = true;
        };
    }, []);

    const today = todayISODate();
    const value = { childId, dateISO: date, message };
    const errors = getAusenciaFormErrors(value, today);
    const showChildError = submitAttempted && errors.childId !== undefined;
    const showDateError = submitAttempted && errors.dateISO !== undefined;
    const showMessageError = submitAttempted && errors.message !== undefined;
    const isValid = isAusenciaFormValid(value, today);

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
                message: buildAusenciaMessage(message),
                contact_method: null,
                contact_detail: null,
                payload: {},
            });
            setSent(true);
        } catch (error) {
            console.error('Error creating absence notice:', error);
            setSubmitError('No se ha podido enviar el aviso. Inténtalo de nuevo.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (sent) {
        return (
            <Card>
                <CardContent className="p-8 text-center">
                    <CheckCircle2 className="mx-auto mb-3 h-12 w-12 text-green-600" />
                    <p className="font-medium text-gray-700">Aviso enviado</p>
                    <p className="mt-1 text-sm text-gray-500">
                        Hemos recibido el aviso de ausencia para el {formatAusenciaDateLong(date)}.
                        Una persona del centro lo revisará.
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
                    <p className="font-medium text-gray-700">No se han podido cargar tus hijos</p>
                    <p className="mt-1 text-sm text-gray-500">Inténtalo de nuevo más tarde.</p>
                </CardContent>
            </Card>
        );
    }

    if (children === null) {
        return (
            <Card>
                <CardContent className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
                </CardContent>
            </Card>
        );
    }

    if (children.length === 0) {
        return (
            <Card>
                <CardContent className="py-12 text-center">
                    <Baby className="mx-auto mb-4 h-16 w-16 text-gray-300" />
                    <h3 className="mb-2 text-lg font-medium text-gray-900">No tienes hijos asociados</h3>
                    <p className="text-gray-500">Contacta con el centro para asociar tus hijos a tu cuenta.</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Nuevo aviso de ausencia</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor={children.length === 1 ? undefined : 'child'} className="mb-2 block">
                            Hijo
                        </Label>
                        {children.length === 1 ? (
                            <div className="flex h-10 items-center rounded-md border border-gray-300 bg-gray-50 px-3 text-sm text-gray-900">
                                {children[0].first_name} {children[0].last_name}
                            </div>
                        ) : (
                            <Select
                                id="child"
                                value={childId}
                                onChange={(event) => setChildId(event.target.value)}
                                required
                                aria-invalid={showChildError}
                                aria-describedby={showChildError ? 'ausencia-child-error' : undefined}
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
                            <p id="ausencia-child-error" role="alert" className="mt-1 text-sm text-red-600">
                                {errors.childId}
                            </p>
                        )}
                    </div>

                    <div>
                        <Label htmlFor="absence-date" className="mb-2 block">Fecha de ausencia</Label>
                        <Input
                            id="absence-date"
                            type="date"
                            value={date}
                            min={today}
                            onChange={(event) => setDate(event.target.value)}
                            required
                            aria-invalid={showDateError}
                            aria-describedby={showDateError ? 'ausencia-date-error' : undefined}
                        />
                        {showDateError && (
                            <p id="ausencia-date-error" role="alert" className="mt-1 text-sm text-red-600">
                                {errors.dateISO}
                            </p>
                        )}
                    </div>

                    <div>
                        <Label htmlFor="absence-message" className="mb-2 block">
                            Motivo <span className="font-normal text-gray-500">(opcional)</span>
                        </Label>
                        <Textarea
                            id="absence-message"
                            rows={4}
                            className="resize-none"
                            placeholder="Añade un motivo si lo deseas…"
                            value={message}
                            maxLength={AUSENCIA_MESSAGE_MAX_LENGTH}
                            onChange={(event) => setMessage(event.target.value)}
                            aria-invalid={showMessageError}
                            aria-describedby={showMessageError ? 'ausencia-message-error' : undefined}
                        />
                        <div className="mt-1 flex justify-end">
                            <span className="text-xs text-gray-500">
                                {message.length}/{AUSENCIA_MESSAGE_MAX_LENGTH}
                            </span>
                        </div>
                        {showMessageError && (
                            <p id="ausencia-message-error" role="alert" className="mt-1 text-sm text-red-600">
                                {errors.message}
                            </p>
                        )}
                    </div>

                    {submitError && (
                        <div role="alert" className="rounded-md border border-red-100 bg-red-50 p-3 text-sm text-red-600">
                            {submitError}
                        </div>
                    )}

                    <Button type="submit" className="w-full" disabled={!isValid || isSubmitting}>
                        {isSubmitting ? 'Enviando...' : 'Enviar aviso'}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}

function formatAusenciaDateLong(dateISO: string): string {
    const [year, month, day] = dateISO.split('-').map(Number);
    return new Intl.DateTimeFormat('es-ES', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    }).format(new Date(year, month - 1, day));
}

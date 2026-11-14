import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { MonthlyDatePicker } from '@/components/avisos/MonthlyDatePicker';
import { ChildService, type Child } from '@/services/children.service';
import {
    FamilyRequestService,
    type FamilyRequestType,
} from '@/services/family-requests.service';
import {
    DIET_DESCRIPTION_MAX_LENGTH,
    DIET_DUPLICATE_ERROR,
    DIET_MAX_DATES,
    DIET_MAX_MONTH_OFFSET,
    formatDietDateLong,
    getDietFormErrors,
    isDietDuplicateError,
    todayISODate,
    tomorrowISODate,
} from '@/lib/diet-validation';
import { Baby, CheckCircle2, Loader2 } from 'lucide-react';

interface DietRequestFormProps {
    requestType: FamilyRequestType;
}

interface FailedDietDate {
    dateISO: string;
    message: string;
}

export default function DietRequestForm({ requestType }: DietRequestFormProps) {
    const navigate = useNavigate();

    const [children, setChildren] = useState<Child[] | null>(null);
    const [loadError, setLoadError] = useState(false);

    const [childId, setChildId] = useState('');
    const [selectedDates, setSelectedDates] = useState<string[]>([]);
    const [message, setMessage] = useState('');
    const [submitAttempted, setSubmitAttempted] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const [failedDateErrors, setFailedDateErrors] = useState<FailedDietDate[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [sentDates, setSentDates] = useState<string[]>([]);

    useEffect(() => {
        let cancelled = false;
        async function loadChildren() {
            try {
                const data = await ChildService.getMyChildren();
                if (cancelled) return;
                setChildren(data);
                if (data.length === 1) {
                    setChildId(data[0].id);
                }
            } catch (error) {
                console.error('Error fetching children:', error);
                if (!cancelled) setLoadError(true);
            }
        }
        loadChildren();
        return () => {
            cancelled = true;
        };
    }, []);

    const today = todayISODate();
    const minDate = tomorrowISODate();
    const errors = getDietFormErrors(
        { childId, dates: selectedDates, message },
        today
    );
    const showChildError = submitAttempted && errors.childId !== undefined;
    const showDatesError = submitAttempted && errors.dates !== undefined;
    const showMessageError =
        (submitAttempted || message.length > DIET_DESCRIPTION_MAX_LENGTH) &&
        errors.message !== undefined;

    const resetForm = () => {
        setSelectedDates([]);
        setMessage('');
        setSubmitAttempted(false);
        setSubmitError('');
        setFailedDateErrors([]);
        setSentDates([]);
    };

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        setSubmitAttempted(true);
        setSubmitError('');
        setFailedDateErrors([]);

        if (Object.keys(errors).length > 0) {
            return;
        }

        const targetDates = [...selectedDates].sort();
        const trimmedMessage = message.trim();
        setIsSubmitting(true);

        try {
            const results = await Promise.allSettled(
                targetDates.map((dateISO) =>
                    FamilyRequestService.create({
                        child_id: childId,
                        request_type: requestType,
                        date: dateISO,
                        message: trimmedMessage,
                        contact_method: null,
                        contact_detail: null,
                    })
                )
            );

            const succeeded: string[] = [];
            const failed: FailedDietDate[] = [];

            results.forEach((result, index) => {
                const dateISO = targetDates[index];
                if (result.status === 'fulfilled') {
                    succeeded.push(dateISO);
                    return;
                }

                console.error(`Error creating diet request for ${dateISO}:`, result.reason);
                failed.push({
                    dateISO,
                    message: isDietDuplicateError(result.reason)
                        ? DIET_DUPLICATE_ERROR
                        : 'No se pudo enviar este día',
                });
            });

            if (failed.length === 0) {
                setSentDates(succeeded);
                return;
            }

            setSelectedDates(failed.map((item) => item.dateISO));
            setFailedDateErrors(failed);

            if (succeeded.length > 0) {
                setSubmitError(
                    `Se enviaron ${succeeded.length} de ${targetDates.length} días. Revisa los días pendientes e inténtalo de nuevo.`
                );
            } else if (failed.every((item) => item.message === DIET_DUPLICATE_ERROR)) {
                setSubmitError(DIET_DUPLICATE_ERROR);
            } else {
                setSubmitError('No se ha podido enviar la solicitud. Inténtalo de nuevo.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    if (sentDates.length > 0) {
        return (
            <Card>
                <CardContent className="p-8 text-center">
                    <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto mb-3" />
                    <p className="text-gray-800 font-semibold text-lg">
                        {sentDates.length === 1
                            ? 'Solicitud de dieta enviada'
                            : `Se han enviado ${sentDates.length} solicitudes de dieta`}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                        Tu aviso ha sido registrado para los siguientes días:
                    </p>
                    <ul className="mt-3 space-y-1 text-sm text-gray-700">
                        {sentDates.map((dateISO) => (
                            <li key={dateISO} className="capitalize">
                                {formatDietDateLong(dateISO)}
                            </li>
                        ))}
                    </ul>
                    <div className="mt-6 flex flex-wrap justify-center gap-3">
                        <Button variant="secondary" onClick={resetForm}>
                            Nueva solicitud
                        </Button>
                        <Button onClick={() => navigate('/avisos')}>
                            Volver a Avisos
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (loadError) {
        return (
            <Card>
                <CardContent className="py-12 text-center">
                    <p className="text-sm text-red-600">
                        No se pudieron cargar los datos. Inténtalo de nuevo más tarde.
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

    if (children.length === 0) {
        return (
            <Card>
                <CardContent className="py-12 text-center">
                    <Baby className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay hijos asignados</h3>
                    <p className="text-gray-500">Contacta con el centro para vincular a tus hijos.</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Nueva solicitud de dieta</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} noValidate className="space-y-4">
                    <div>
                        <Label htmlFor={children.length === 1 ? undefined : 'child'} className="block mb-2">
                            Hijo
                        </Label>
                        {children.length === 1 ? (
                            <div className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900">
                                {children[0].first_name} {children[0].last_name}
                            </div>
                        ) : (
                            <Select
                                id="child"
                                value={childId}
                                onChange={(e) => setChildId(e.target.value)}
                                aria-invalid={showChildError}
                                aria-describedby={showChildError ? 'diet-child-error' : undefined}
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
                            <p id="diet-child-error" className="text-xs text-red-600 mt-1">
                                {errors.childId}
                            </p>
                        )}
                    </div>

                    <div>
                        <Label htmlFor="diet-dates" className="block mb-2">
                            Días de dieta especial
                        </Label>
                        <MonthlyDatePicker
                            id="diet-dates"
                            selectedDates={selectedDates}
                            onChange={setSelectedDates}
                            minDateISO={minDate}
                            maxMonthOffset={DIET_MAX_MONTH_OFFSET}
                            maxDates={DIET_MAX_DATES}
                            todayISO={today}
                            disabled={isSubmitting}
                        />
                        {showDatesError && (
                            <p id="diet-dates-error" className="text-xs text-red-600 mt-1">
                                {errors.dates}
                            </p>
                        )}
                    </div>

                    <div>
                        <Label htmlFor="message" className="block mb-2">Dieta</Label>
                        <Textarea
                            id="message"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            maxLength={DIET_DESCRIPTION_MAX_LENGTH}
                            rows={4}
                            placeholder="Describe la dieta especial necesaria..."
                            aria-invalid={showMessageError}
                            aria-describedby={showMessageError ? 'diet-message-error' : undefined}
                        />
                        <div className="mt-1 flex items-center justify-between gap-2 text-xs">
                            <span id="diet-message-error" className={showMessageError ? 'text-red-600' : 'text-transparent'}>
                                {showMessageError ? errors.message : '\u00A0'}
                            </span>
                            <span className="text-gray-500">
                                {message.length}/{DIET_DESCRIPTION_MAX_LENGTH}
                            </span>
                        </div>
                    </div>

                    {submitError && (
                        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                            <p>{submitError}</p>
                            {failedDateErrors.length > 0 && (
                                <ul className="mt-1.5 list-disc pl-5 text-xs space-y-0.5">
                                    {failedDateErrors.map((item) => (
                                        <li key={item.dateISO}>
                                            <span className="capitalize">{formatDietDateLong(item.dateISO)}</span>: {item.message}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    )}

                    <div className="flex gap-3 pt-2">
                        <Button type="submit" className="flex-1" disabled={isSubmitting}>
                            {isSubmitting ? 'Enviando...' : 'Enviar solicitud'}
                        </Button>
                        <Button
                            type="button"
                            variant="secondary"
                            disabled={isSubmitting}
                            onClick={() => navigate('/avisos')}
                        >
                            Cancelar
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}

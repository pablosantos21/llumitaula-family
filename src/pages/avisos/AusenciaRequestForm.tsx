import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ChildSelectorField } from '@/components/avisos/ChildSelectorField';
import { ChildrenLoadState } from '@/components/avisos/ChildrenLoadState';
import { MonthlyDatePicker } from '@/components/avisos/MonthlyDatePicker';
import { useMyChildren } from '@/hooks/useMyChildren';
import {
    FamilyRequestService,
    type FamilyRequestType,
} from '@/services/family-requests.service';
import {
    AUSENCIA_MESSAGE_MAX_LENGTH,
    buildAusenciaMessage,
    formatAusenciaDateLong,
    getAusenciaFormErrors,
    todayISODate,
} from '@/lib/ausencia-validation';

interface AusenciaRequestFormProps {
    requestType: FamilyRequestType;
}

export default function AusenciaRequestForm({ requestType }: AusenciaRequestFormProps) {
    const navigate = useNavigate();
    const { children, loadError, childId, setChildId } = useMyChildren();

    const [selectedDates, setSelectedDates] = useState<string[]>([]);
    const [message, setMessage] = useState('');
    const [submitAttempted, setSubmitAttempted] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const [failedDates, setFailedDates] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [sentDates, setSentDates] = useState<string[]>([]);

    const today = todayISODate();
    const errors = getAusenciaFormErrors(
        { childId, dates: selectedDates, message },
        today
    );
    const showChildError = submitAttempted && errors.childId !== undefined;
    const showDatesError = submitAttempted && errors.dates !== undefined;
    const showMessageError = submitAttempted && errors.message !== undefined;

    const resetForm = () => {
        setSelectedDates([]);
        setMessage('');
        setSubmitAttempted(false);
        setSubmitError('');
        setFailedDates([]);
        setSentDates([]);
    };

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        setSubmitAttempted(true);
        setSubmitError('');
        setFailedDates([]);

        if (Object.keys(errors).length > 0) {
            return;
        }

        const targetDates = [...selectedDates].sort();
        const finalMessage = buildAusenciaMessage(message);
        setIsSubmitting(true);

        try {
            const results = await Promise.allSettled(
                targetDates.map((dateISO) =>
                    FamilyRequestService.create({
                        child_id: childId,
                        request_type: requestType,
                        date: dateISO,
                        message: finalMessage,
                        contact_method: null,
                        contact_detail: null,
                        payload: {},
                    })
                )
            );

            const succeeded: string[] = [];
            const failed: string[] = [];

            results.forEach((result, index) => {
                const dateISO = targetDates[index];
                if (result.status === 'fulfilled') {
                    succeeded.push(dateISO);
                } else {
                    console.error(`Error creating absence notice for ${dateISO}:`, result.reason);
                    failed.push(dateISO);
                }
            });

            if (failed.length === 0) {
                setSentDates(succeeded);
                return;
            }

            setSelectedDates(failed);
            setFailedDates(failed);

            if (succeeded.length > 0) {
                setSubmitError(
                    `Se enviaron ${succeeded.length} de ${targetDates.length} días. Revisa los días pendientes e inténtalo de nuevo.`
                );
            } else {
                setSubmitError('No se ha podido enviar el aviso. Inténtalo de nuevo.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    if (sentDates.length > 0) {
        return (
            <Card>
                <CardContent className="p-8 text-center">
                    <CheckCircle2 className="mx-auto mb-3 h-12 w-12 text-green-600" />
                    <p className="font-semibold text-lg text-gray-800">
                        {sentDates.length === 1
                            ? 'Aviso de ausencia enviado'
                            : `Se han enviado ${sentDates.length} avisos de ausencia`}
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                        Hemos recibido el aviso de ausencia para:
                    </p>
                    <ul className="mt-3 space-y-1 text-sm text-gray-700">
                        {sentDates.map((dateISO) => (
                            <li key={dateISO} className="capitalize">
                                {formatAusenciaDateLong(dateISO)}
                            </li>
                        ))}
                    </ul>
                    <div className="mt-6 flex flex-wrap justify-center gap-3">
                        <Button variant="secondary" onClick={resetForm}>
                            Nuevo aviso
                        </Button>
                        <Button onClick={() => navigate('/avisos')}>
                            Volver a Avisos
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (loadError || children === null || children.length === 0) {
        return <ChildrenLoadState children={children} loadError={loadError} />;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Nuevo aviso de ausencia</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} noValidate className="space-y-4">
                    <ChildSelectorField
                        childrenList={children}
                        childId={childId}
                        onChange={setChildId}
                        error={showChildError ? errors.childId : undefined}
                        errorId="ausencia-child-error"
                        disabled={isSubmitting}
                    />

                    <div>
                        <Label htmlFor="absence-dates" className="mb-2 block">
                            Días de ausencia
                        </Label>
                        <MonthlyDatePicker
                            id="absence-dates"
                            selectedDates={selectedDates}
                            onChange={setSelectedDates}
                            minDateISO={today}
                            todayISO={today}
                            disabled={isSubmitting}
                        />
                        {showDatesError && (
                            <p id="ausencia-dates-error" className="mt-1 text-xs text-red-600">
                                {errors.dates}
                            </p>
                        )}
                    </div>

                    <div>
                        <Label htmlFor="absence-message" className="mb-2 block">
                            Motivo o nota (opcional)
                        </Label>
                        <Textarea
                            id="absence-message"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            maxLength={AUSENCIA_MESSAGE_MAX_LENGTH}
                            rows={4}
                            placeholder="Ej. Visita médica o asunto familiar..."
                            aria-invalid={showMessageError}
                            aria-describedby={showMessageError ? 'ausencia-message-error' : undefined}
                        />
                        <div className="mt-1 flex items-center justify-between gap-2 text-xs">
                            <span
                                id="ausencia-message-error"
                                className={showMessageError ? 'text-red-600' : 'text-transparent'}
                            >
                                {showMessageError ? errors.message : '\u00A0'}
                            </span>
                            <span className="text-gray-500">
                                {message.length}/{AUSENCIA_MESSAGE_MAX_LENGTH}
                            </span>
                        </div>
                    </div>

                    {submitError && (
                        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                            <p>{submitError}</p>
                            {failedDates.length > 0 && (
                                <ul className="mt-1.5 list-disc pl-5 text-xs space-y-0.5">
                                    {failedDates.map((dateISO) => (
                                        <li key={dateISO} className="capitalize">
                                            {formatAusenciaDateLong(dateISO)}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    )}

                    <div className="flex gap-3 pt-2">
                        <Button type="submit" className="flex-1" disabled={isSubmitting}>
                            {isSubmitting ? 'Enviando...' : 'Enviar aviso'}
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

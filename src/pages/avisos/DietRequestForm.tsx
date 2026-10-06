import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ChildService, type Child } from '@/services/children.service';
import {
    FamilyRequestService,
    type FamilyRequestType,
} from '@/services/family-requests.service';
import {
    DIET_DESCRIPTION_MAX_LENGTH,
    isDietFormValid,
    todayISODate,
    tomorrowISODate,
} from '@/lib/diet-validation';
import { Baby, CheckCircle2, Loader2 } from 'lucide-react';

interface DietRequestFormProps {
    requestType: FamilyRequestType;
}

export default function DietRequestForm({ requestType }: DietRequestFormProps) {
    const navigate = useNavigate();

    const [children, setChildren] = useState<Child[] | null>(null);
    const [loadError, setLoadError] = useState(false);

    const [childId, setChildId] = useState('');
    const [date, setDate] = useState(() => tomorrowISODate());
    const [message, setMessage] = useState('');
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

    const today = todayISODate();
    const minDate = tomorrowISODate();
    const messageTooLong = message.length > DIET_DESCRIPTION_MAX_LENGTH;
    const isValid =
        children !== null &&
        isDietFormValid({ childId, message, dateISO: date }, today) &&
        !messageTooLong;

    const resetForm = () => {
        setChildId(children?.length === 1 ? children[0].id : '');
        setDate(tomorrowISODate());
        setMessage('');
        setSubmitError('');
    };

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        if (isSubmitting || !isValid) return;

        setSubmitError('');
        setIsSubmitting(true);
        try {
            await FamilyRequestService.create({
                child_id: childId,
                request_type: requestType,
                date,
                message,
                contact_method: null,
                contact_detail: null,
            });
            setSent(true);
        } catch {
            setSubmitError('No se ha podido enviar la solicitud. Inténtalo de nuevo.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (sent) {
        return (
            <Card>
                <CardContent className="p-8 text-center">
                    <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto mb-3" />
                    <p className="text-gray-700 font-medium">Solicitud enviada</p>
                    <p className="text-gray-500 text-sm mt-1">
                        Hemos recibido tu solicitud de dieta. Una persona del centro la revisará.
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
                <CardTitle>Nueva solicitud</CardTitle>
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
                            <Select id="child" value={childId} onChange={(e) => setChildId(e.target.value)} required>
                                <option value="">Selecciona un hijo</option>
                                {children.map((child) => (
                                    <option key={child.id} value={child.id}>
                                        {child.first_name} {child.last_name}
                                    </option>
                                ))}
                            </Select>
                        )}
                    </div>

                    <div>
                        <Label htmlFor="date" className="block mb-2">Fecha</Label>
                        <Input
                            id="date"
                            type="date"
                            value={date}
                            min={minDate}
                            onChange={(e) => setDate(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <Label htmlFor="message" className="block mb-2">Dieta</Label>
                        <Textarea
                            id="message"
                            rows={6}
                            className="resize-none"
                            placeholder="Ej: dieta blanda, arroz blanco y pollo, sin fritos…"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            required
                        />
                        <div className="flex justify-end mt-1">
                            <span
                                className={`text-xs ${messageTooLong ? 'text-red-600' : 'text-gray-500'}`}
                            >
                                {message.length}/{DIET_DESCRIPTION_MAX_LENGTH}
                            </span>
                        </div>
                    </div>

                    {submitError && (
                        <div className="bg-red-50 text-red-600 text-sm p-3 rounded-md border border-red-100">
                            {submitError}
                        </div>
                    )}

                    <div className="flex gap-3 pt-4">
                        <Button type="submit" className="flex-1" disabled={!isValid || isSubmitting}>
                            {isSubmitting ? 'Enviando...' : 'Enviar solicitud'}
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

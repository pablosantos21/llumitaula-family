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
    MESSAGE_MAX_LENGTH,
    CONTACT_DETAIL_MAX_LENGTH,
    type ContactMethod,
    type FamilyRequestType,
} from '@/services/family-requests.service';
import { useAuth } from '@/contexts/AuthContext';
import { Baby, CheckCircle2, Loader2 } from 'lucide-react';

const CONTACT_METHODS: { value: ContactMethod; label: string }[] = [
    { value: 'email', label: 'Email' },
    { value: 'telefono', label: 'Teléfono' },
    { value: 'otro', label: 'Otro' },
];

function todayISO(): string {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${now.getFullYear()}-${month}-${day}`;
}

interface SpecialMenuRequestFormProps {
    requestType: FamilyRequestType;
}

export default function SpecialMenuRequestForm({ requestType }: SpecialMenuRequestFormProps) {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [children, setChildren] = useState<Child[] | null>(null);
    const [loadError, setLoadError] = useState(false);

    const [childId, setChildId] = useState('');
    const [date, setDate] = useState(todayISO);
    const [message, setMessage] = useState('');
    const [contactMethod, setContactMethod] = useState<ContactMethod | ''>('');
    const [contactDetail, setContactDetail] = useState('');
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

    const handleContactMethodChange = (value: string) => {
        if (value === '') {
            setContactMethod('');
            setContactDetail('');
            return;
        }
        const method = value as ContactMethod;
        setContactMethod(method);
        setContactDetail(method === 'email' && user?.email ? user.email : '');
    };

    const trimmedMessage = message.trim();
    const trimmedContactDetail = contactDetail.trim();
    const messageTooLong = message.length > MESSAGE_MAX_LENGTH;
    const contactDetailTooLong = contactDetail.length > CONTACT_DETAIL_MAX_LENGTH;
    const isValid =
        childId !== '' &&
        date !== '' &&
        contactMethod !== '' &&
        trimmedMessage.length > 0 &&
        !messageTooLong &&
        trimmedContactDetail.length > 0 &&
        !contactDetailTooLong;

    const resetForm = () => {
        setChildId(children?.length === 1 ? children[0].id : '');
        setDate(todayISO());
        setMessage('');
        setContactMethod('');
        setContactDetail('');
        setSubmitError('');
    };

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        if (isSubmitting || contactMethod === '' || !isValid) return;

        setSubmitError('');
        setIsSubmitting(true);
        try {
            await FamilyRequestService.create({
                child_id: childId,
                request_type: requestType,
                date,
                message,
                contact_method: contactMethod,
                contact_detail: contactDetail,
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
                        Hemos recibido tu solicitud de menú especial. Una persona del centro la revisará.
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

    const contactDetailPlaceholder =
        contactMethod === 'email'
            ? 'nombre@correo.com'
            : contactMethod === 'telefono'
                ? '600 000 000'
                : 'Indica cómo podemos contactarte';

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
                            onChange={(e) => setDate(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <Label htmlFor="message" className="block mb-2">Mensaje</Label>
                        <Textarea
                            id="message"
                            rows={6}
                            className="resize-none"
                            placeholder="Describe las necesidades del menú especial..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            required
                        />
                        <div className="flex justify-end mt-1">
                            <span
                                className={`text-xs ${messageTooLong ? 'text-red-600' : 'text-gray-500'}`}
                            >
                                {message.length}/{MESSAGE_MAX_LENGTH}
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="contact-method" className="block mb-2">Canal de contacto</Label>
                            <Select
                                id="contact-method"
                                value={contactMethod}
                                onChange={(e) => handleContactMethodChange(e.target.value)}
                                required
                            >
                                <option value="">Selecciona un canal</option>
                                {CONTACT_METHODS.map((method) => (
                                    <option key={method.value} value={method.value}>
                                        {method.label}
                                    </option>
                                ))}
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="contact-detail" className="block mb-2">Dato de contacto</Label>
                            <Input
                                id="contact-detail"
                                value={contactDetail}
                                onChange={(e) => setContactDetail(e.target.value)}
                                placeholder={contactDetailPlaceholder}
                                required
                            />
                            <div className="flex justify-end mt-1">
                                <span
                                    className={`text-xs ${contactDetailTooLong ? 'text-red-600' : 'text-gray-500'}`}
                                >
                                    {contactDetail.length}/{CONTACT_DETAIL_MAX_LENGTH}
                                </span>
                            </div>
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

import { useParams, useNavigate } from 'react-router-dom';
import type { ComponentType } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import SpecialMenuRequestForm from './SpecialMenuRequestForm';
import DietRequestForm from './DietRequestForm';
import type { FamilyRequestType } from '@/services/family-requests.service';

interface AvisoForm {
    requestType: FamilyRequestType;
    Component: ComponentType<{ requestType: FamilyRequestType }>;
}

interface AvisoInfo {
    name: string;
    description: string;
    placeholder: string;
    form?: AvisoForm;
}

const avisoInfo: Record<string, AvisoInfo> = {
    dieta: {
        name: 'Dieta',
        description: 'Informa de dietas especiales o intolerancias',
        placeholder: 'Ej: Sin gluten, alergia a frutos secos, vegetariano...',
        form: {
            requestType: 'dieta',
            Component: DietRequestForm,
        },
    },
    ausencia: {
        name: 'Ausencia',
        description: 'Comunica a los monitores que el niño no vendrá',
        placeholder: 'Especifica las fechas y el motivo de la ausencia...',
    },
    'menu-especial': {
        name: 'Menú Especial',
        description: 'Solicita menús adaptados a necesidades especiales',
        placeholder: 'Describe las necesidades del menú especial...',
        form: {
            requestType: 'special_menu',
            Component: SpecialMenuRequestForm,
        },
    },
    'fuera-de-hora': {
        name: 'Fuera de Hora',
        description: 'Controla las franjas horarias',
        placeholder: 'Especifica las horas fuera del horario habitual...',
    },
};

export default function AvisoDetailPage() {
    const { type } = useParams<{ type: string }>();
    const navigate = useNavigate();

    const aviso = type ? avisoInfo[type] : null;

    if (!aviso) {
        return (
            <div className="p-4 md:p-8">
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => navigate('/avisos')}
                    className="mb-6"
                    aria-label="Volver"
                >
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div className="text-center">
                    <p className="text-gray-500">Aviso no encontrado</p>
                </div>
            </div>
        );
    }

    const RequestForm = aviso.form?.Component;

    return (
        <div className="bg-gray-50 p-4 md:p-8">
            <div className="flex items-center gap-3 mb-6">
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => navigate('/avisos')}
                    className="flex-shrink-0"
                    aria-label="Volver"
                >
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <h1 className="text-2xl font-bold text-gray-900">
                    {aviso.name}
                </h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        {RequestForm && aviso.form ? (
                            <RequestForm requestType={aviso.form.requestType} />
                        ) : (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Nuevo aviso</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Detalles
                                        </label>
                                        <textarea
                                            placeholder={aviso.placeholder}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                                            rows={6}
                                        />
                                    </div>

                                    <div className="flex gap-3 pt-4">
                                        <Button
                                            className="flex-1"
                                            onClick={() => navigate('/avisos')}
                                        >
                                            Enviar
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="flex-1"
                                            onClick={() => navigate('/avisos')}
                                        >
                                            Cancelar
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>


                </div>
        </div>
    );
}

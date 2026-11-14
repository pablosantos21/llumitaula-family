import { useParams, useNavigate } from 'react-router-dom';
import type { ComponentType } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import SpecialMenuRequestForm from './SpecialMenuRequestForm';
import DietRequestForm from './DietRequestForm';
import FueraDeHoraRequestForm from './FueraDeHoraRequestForm';
import AusenciaRequestForm from './AusenciaRequestForm';
import type { FamilyRequestType } from '@/services/family-requests.service';

interface AvisoForm {
    requestType: FamilyRequestType;
    Component: ComponentType<{ requestType: FamilyRequestType }>;
}

interface AvisoInfo {
    name: string;
    description: string;
    form: AvisoForm;
}

const avisoInfo: Record<string, AvisoInfo> = {
    dieta: {
        name: 'Dieta',
        description: 'Informa de dietas especiales o intolerancias',
        form: {
            requestType: 'dieta',
            Component: DietRequestForm,
        },
    },
    ausencia: {
        name: 'Ausencia',
        description: 'Comunica a los monitores que el niño no vendrá',
        form: {
            requestType: 'ausencia',
            Component: AusenciaRequestForm,
        },
    },
    'menu-especial': {
        name: 'Menú Especial',
        description: 'Solicita menús adaptados a necesidades especiales',
        form: {
            requestType: 'special_menu',
            Component: SpecialMenuRequestForm,
        },
    },
    'fuera-de-hora': {
        name: 'Fuera de Hora',
        description: 'Avisa de una salida antes o después del horario habitual',
        form: {
            requestType: 'fuera_de_hora',
            Component: FueraDeHoraRequestForm,
        },
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
                    type="button"
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

    const RequestForm = aviso.form.Component;

    return (
        <div className="bg-gray-50 p-4 md:p-8">
            <div className="flex items-center gap-3 mb-6">
                <Button
                    type="button"
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
                    <RequestForm requestType={aviso.form.requestType} />
                </div>
            </div>
        </div>
    );
}

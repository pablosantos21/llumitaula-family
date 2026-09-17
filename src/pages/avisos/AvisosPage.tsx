import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import {
    Utensils,
    CalendarX,
    Ticket,
    Apple,
    Clock,
} from 'lucide-react';

export default function AvisosPage() {
    const navigate = useNavigate();

    const avisos = [
        {
            id: 'dieta',
            name: 'Dieta',
            description: 'Gestiona las dietas especiales',
            icon: Utensils,
            color: 'bg-green-100 text-green-600',
        },
        {
            id: 'ausencia',
            name: 'Ausencia',
            description: 'Comunica ausencias',
            icon: CalendarX,
            color: 'bg-blue-100 text-blue-600',
        },
        {
            id: 'bono',
            name: 'Bono',
            description: 'Gestiona los bonos',
            icon: Ticket,
            color: 'bg-purple-100 text-purple-600',
        },
        {
            id: 'menu-especial',
            name: 'Menú Especial',
            description: 'Solicita menús especiales',
            icon: Apple,
            color: 'bg-orange-100 text-orange-600',
        },
        {
            id: 'fuera-de-hora',
            name: 'Fuera de Hora',
            description: 'Controla las franjas horarias',
            icon: Clock,
            color: 'bg-pink-100 text-pink-600',
        },
    ];

    return (
        <div className=" bg-gray-50 p-4 md:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {avisos.map((aviso) => {
                    const Icon = aviso.icon;
                    return (
                        <button
                            key={aviso.id}
                            onClick={() => navigate(`/avisos/${aviso.id}`)}
                            className="text-left"
                        >
                            <Card className="hover:shadow-lg transition-shadow h-full">
                                <CardContent className="p-6">
                                    <div className="flex items-start gap-4">
                                        <div className={`p-3 rounded-lg ${aviso.color}`}>
                                            <Icon className="h-6 w-6" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-gray-900 text-lg">
                                                {aviso.name}
                                            </h3>
                                            <p className="text-sm text-gray-500 mt-1">
                                                {aviso.description}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

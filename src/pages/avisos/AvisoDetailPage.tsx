import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface AvisoInfo {
    name: string;
    description: string;
    placeholder: string;
}

const avisoInfo: Record<string, AvisoInfo> = {
    dieta: {
        name: 'Dieta',
        description: 'Informa de dietes especials o intoleràncies',
        placeholder: 'Ex: Sense gluten, al·lèrgia a nous, vegetarià...',
    },
    ausencia: {
        name: 'Ausencia',
        description: 'Comunica als monitors que el nen no vindrà',
        placeholder: 'Especifica les dates i motiu de l\'absència...',
    },
    bono: {
        name: 'Bono',
        description: 'Gestiona els bonos de menjar',
        placeholder: 'Detalla informació del bono...',
    },
    'menu-especial': {
        name: 'Menú Especial',
        description: 'Sol·licita menús adaptats a necessitats especials',
        placeholder: 'Descriu les necessitats de menú especial...',
    },
    'fuera-de-hora': {
        name: 'Fuera de Hora',
        description: 'Controla les franges horaris',
        placeholder: 'Especifica les hores fora de l\'horari habitual...',
    },
    historial: {
        name: 'Historial de Avisos',
        description: 'Consulta l\'historial complet d\'avisos',
        placeholder: 'Visualitzant historial...',
    },
};

export default function AvisoDetailPage() {
    const { type } = useParams<{ type: string }>();
    const navigate = useNavigate();

    const aviso = type ? avisoInfo[type] : null;

    if (!aviso) {
        return (
            <div className="p-4 md:p-8 text-center">
                <p className="text-gray-500">Aviso no trobat</p>
            </div>
        );
    }

    const isHistorial = type === 'historial';

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8 pb-32">

            {isHistorial ? (
                // Historial view
                <div className="space-y-4">
                    <Card>
                        <CardContent className="p-6 text-center text-gray-500">
                            <p>No hi ha avisos registrats</p>
                        </CardContent>
                    </Card>
                </div>
            ) : (
                // Form view for other avisos
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Nou aviso</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Detalls
                                    </label>
                                    <textarea
                                        placeholder={aviso.placeholder}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none"
                                        rows={6}
                                    />
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <Button
                                        className="flex-1 bg-pink-600 hover:bg-pink-700"
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
                    </div>

                    <div>
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Informació</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4 text-sm text-gray-600">
                                    <div>
                                        <p className="font-medium text-gray-900 mb-1">Destinatari</p>
                                        <p>Els monitors del centre</p>
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900 mb-1">Urgència</p>
                                        <p>Normal</p>
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900 mb-1">Confidencialitat</p>
                                        <p>Solo per al personal del centre</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}
        </div>
    );
}

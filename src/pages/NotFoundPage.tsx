import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function NotFoundPage() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <Card className="w-full max-w-md text-center">
                <CardContent className="p-8 space-y-4">
                    <p className="text-4xl font-bold text-primary-600">404</p>
                    <h1 className="text-xl font-semibold text-gray-900">
                        Página no encontrada
                    </h1>
                    <p className="text-sm text-gray-600">
                        La ruta que buscas no existe o ya no está disponible.
                    </p>
                    <Button
                        type="button"
                        onClick={() => navigate('/children')}
                        className="w-full"
                    >
                        Volver a Inicio
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}

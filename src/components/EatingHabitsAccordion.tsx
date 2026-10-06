import { AccordionItem } from "@/components/ui/accordion";
import { Utensils, Check, AlertCircle, Loader2 } from "lucide-react";
import type { EatingType } from "@/lib/meal-records-mapping";

export interface EatingHabitItem {
  id: string;
  eatingType: EatingType;
  mealTypeName?: string | null;
  notes?: string | null;
}

interface EatingHabitsAccordionProps {
  records: EatingHabitItem[];
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  observations?: string;
}

export function EatingHabitsAccordion({
  records,
  isLoading = false,
  error = null,
  onRetry,
  observations,
}: EatingHabitsAccordionProps) {
  const getEatingTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      good: "Ha comido muy bien",
      normal: "Ha comido normal",
      poor: "Ha comido poco",
      allergic: "Reacción alérgica",
    };
    return labels[type] || type;
  };

  const getEatingTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      good: "bg-green-50 border-green-200",
      normal: "bg-blue-50 border-blue-200",
      poor: "bg-amber-50 border-amber-200",
      allergic: "bg-red-50 border-red-200",
    };
    return colors[type] || "bg-gray-50 border-gray-200";
  };

  const getEatingTypeIcon = (type: string) => {
    const iconProps = "h-5 w-5";
    switch (type) {
      case "good":
        return <Check className={`${iconProps} text-green-600`} />;
      case "allergic":
        return <AlertCircle className={`${iconProps} text-red-600`} />;
      default:
        return <Utensils className={`${iconProps} text-gray-600`} />;
    }
  };

  return (
    <div className="mb-4">
      <AccordionItem title="¿Cómo ha comido?">
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-6 w-6 animate-spin text-primary-600" />
            </div>
          ) : error ? (
            <div className="text-center py-6 space-y-3">
              <p className="text-gray-500 text-sm">
                No se pudo cargar la información de comidas
              </p>
              {onRetry && (
                <button
                  type="button"
                  onClick={onRetry}
                  className="text-sm font-medium text-primary-600 hover:text-primary-700"
                >
                  Reintentar
                </button>
              )}
            </div>
          ) : records.length > 0 ? (
            <>
              {records.map((record) => (
                <div key={record.id} className="space-y-4">
                  <div
                    className={`p-4 rounded-lg border-2 ${getEatingTypeColor(
                      record.eatingType,
                    )}`}
                  >
                    <div className="flex items-center gap-3">
                      {getEatingTypeIcon(record.eatingType)}
                      <span className="font-semibold text-gray-900">
                        {getEatingTypeLabel(record.eatingType)}
                      </span>
                    </div>
                    {record.mealTypeName && (
                      <p className="text-gray-500 text-sm mt-1">
                        {record.mealTypeName}
                      </p>
                    )}
                  </div>

                  {record.notes && (
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                        Notes addicionals
                      </p>
                      <p className="text-gray-700 text-sm">{record.notes}</p>
                    </div>
                  )}
                </div>
              ))}

              {observations && (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-2">
                    Observaciones del monitor
                  </p>
                  <p className="text-blue-900 text-sm">{observations}</p>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-6">
              <p className="text-gray-500 text-sm">
                No hay información disponible sobre cómo ha comido
              </p>
            </div>
          )}
        </div>
      </AccordionItem>
    </div>
  );
}

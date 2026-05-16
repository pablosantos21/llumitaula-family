import { AccordionItem } from "@/components/ui/accordion";
import { Utensils, Check, AlertCircle } from "lucide-react";

interface EatingRecord {
  type: "good" | "normal" | "poor" | "allergic";
  notes?: string;
}

interface EatingHabitsAccordionProps {
  eatingRecord: EatingRecord | null;
  observations?: string;
}

export function EatingHabitsAccordion({
  eatingRecord,
  observations,
}: EatingHabitsAccordionProps) {
  const getEatingTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      good: "Ha menjat molt bé",
      normal: "Ha menjat normal",
      poor: "Ha menjat poc",
      allergic: "Reacció al·lèrgica",
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
      <AccordionItem title="Com ha menjat?">
        <div className="space-y-4">
          {eatingRecord ? (
            <>
              <div
                className={`p-4 rounded-lg border-2 ${getEatingTypeColor(
                  eatingRecord.type,
                )}`}
              >
                <div className="flex items-center gap-3">
                  {getEatingTypeIcon(eatingRecord.type)}
                  <span className="font-semibold text-gray-900">
                    {getEatingTypeLabel(eatingRecord.type)}
                  </span>
                </div>
              </div>

              {eatingRecord.notes && (
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Notes addicionals
                  </p>
                  <p className="text-gray-700 text-sm">{eatingRecord.notes}</p>
                </div>
              )}

              {observations && (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-2">
                    Observacions del monitor
                  </p>
                  <p className="text-blue-900 text-sm">{observations}</p>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-6">
              <p className="text-gray-500 text-sm">
                No hi ha informació disponible sobre com ha menjat
              </p>
            </div>
          )}
        </div>
      </AccordionItem>
    </div>
  );
}

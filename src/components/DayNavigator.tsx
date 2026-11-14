import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { isSameLocalDay } from "@/lib/date";

interface DayNavigatorProps {
  currentDate: Date;
  onPreviousDay: () => void;
  onNextDay: () => void;
  onToday: () => void;
}

export function DayNavigator({
  currentDate,
  onPreviousDay,
  onNextDay,
  onToday,
}: DayNavigatorProps) {
  const isToday = isSameLocalDay(currentDate);

  const dayName = currentDate.toLocaleDateString("es-ES", {
    weekday: "long",
  });

  const dayMonth = currentDate.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
  });

  return (
    <div className="bg-white rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between gap-4">
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label="Día anterior"
          onClick={onPreviousDay}
          className="flex-shrink-0"
        >
          <ChevronLeft className="h-5 w-5" aria-hidden="true" />
        </Button>

        <button
          type="button"
          onClick={onToday}
          aria-label={isToday ? "Hoy" : "Volver a hoy"}
          className="flex-1 text-center"
        >
          {isToday ? (
            <p className="text-sm text-gray-500">Hoy</p>
          ) : (
            <p className="text-xs font-medium text-primary-600">Volver a hoy</p>
          )}
          <p className="text-lg font-bold text-gray-900 capitalize">
            {dayName}
          </p>
          <p className="text-sm text-gray-600">{dayMonth}</p>
        </button>

        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label="Día siguiente"
          onClick={onNextDay}
          className="flex-shrink-0"
        >
          <ChevronRight className="h-5 w-5" aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}

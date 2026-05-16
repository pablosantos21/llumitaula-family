import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  const dayName = currentDate.toLocaleDateString("ca-ES", {
    weekday: "long",
  });

  const dayMonth = currentDate.toLocaleDateString("ca-ES", {
    day: "numeric",
    month: "short",
  });

  return (
    <div className="bg-white rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={onPreviousDay}
          className="flex-shrink-0"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>

        <button onClick={onToday} className="flex-1 text-center">
          <p className="text-sm text-gray-500">Avui</p>
          <p className="text-lg font-bold text-gray-900 capitalize">
            {dayName}
          </p>
          <p className="text-sm text-gray-600">{dayMonth}</p>
        </button>

        <Button
          variant="outline"
          size="icon"
          onClick={onNextDay}
          className="flex-shrink-0"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}

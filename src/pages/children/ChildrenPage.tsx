import { useEffect, useState } from "react";
import { ChildService, type Child } from "@/services/children.service";
import { MenuService, type Menu } from "@/services/menus.service";
import { IncidentService, type Incident } from "@/services/incidents.service";
import {
  MealRecordService,
  type MealRecord,
} from "@/services/meal-records.service";
import { mapMealStatusToEatingType } from "@/lib/meal-records-mapping";
import { useMealCapability } from "@/hooks/useMealCapability";
import { Tabs } from "@/components/ui/tabs";
import { DayNavigator } from "@/components/DayNavigator";
import { DailyMenuSection } from "@/components/DailyMenuSection";
import { NightMenuSection } from "@/components/NightMenuSection";
import {
  EatingHabitsAccordion,
  type EatingHabitItem,
} from "@/components/EatingHabitsAccordion";
import { NotificationsAccordion } from "@/components/NotificationsAccordion";
import { Card, CardContent } from "@/components/ui/card";
import { Baby, Loader2 } from "lucide-react";

export default function ChildrenPage() {
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string>("");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [menu, setMenu] = useState<Menu | null>(null);
  const [todayIncidents, setTodayIncidents] = useState<Incident[]>([]);
  const [mealRecords, setMealRecords] = useState<MealRecord[]>([]);
  const [isLoadingRecords, setIsLoadingRecords] = useState(false);
  const [recordsError, setRecordsError] = useState<string | null>(null);
  const [recordsAttempt, setRecordsAttempt] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMenu, setIsLoadingMenu] = useState(false);

  const dateStr = currentDate.toISOString().split("T")[0];
  const mealCapability = useMealCapability(
    selectedChildId || null,
    dateStr,
  );

  // Fetch children on mount
  useEffect(() => {
    const fetchChildren = async () => {
      try {
        const data = await ChildService.getMyChildren();
        setChildren(data);
        if (data.length > 0) {
          setSelectedChildId(data[0].id);
        }
      } catch (err) {
        console.error("Error fetching children:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChildren();
  }, []);

  // Fetch menu and incidents when child or date changes (menu always visible)
  useEffect(() => {
    if (!selectedChildId) return;

    const fetchData = async () => {
      try {
        setIsLoadingMenu(true);

        const selectedChild = children.find((c) => c.id === selectedChildId);
        if (!selectedChild) return;

        // Fetch menu
        const schoolId = selectedChild.classes?.school_id;
        if (!schoolId) {
          setMenu(null);
        } else {
          const menus = await MenuService.getMenusBySchoolAndDate(
            schoolId,
            dateStr,
          );
          setMenu(menus.length > 0 ? menus[0].menus || null : null);
        }

        // Fetch incidents for this child
        const allIncidents = await IncidentService.getIncidentsForMyChildren();
        const childIncidents = allIncidents.filter(
          (incident) =>
            incident.child_id === selectedChildId &&
            new Date(incident.date).toDateString() ===
              currentDate.toDateString(),
        );
        setTodayIncidents(childIncidents);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setIsLoadingMenu(false);
      }
    };

    fetchData();
  }, [selectedChildId, currentDate, children, dateStr]);

  // Fetch meal records only when capability is enabled (fail-closed otherwise).
  // Disabled or loading or error states never emit a records query.
  useEffect(() => {
    if (!selectedChildId) return;
    if (mealCapability.isLoading || mealCapability.error) return;
    if (!mealCapability.enabled) return;

    let cancelled = false;

    const fetchRecords = async () => {
      try {
        setIsLoadingRecords(true);
        setRecordsError(null);
        const data = await MealRecordService.getByChildAndDate(
          selectedChildId,
          dateStr,
        );
        if (!cancelled) setMealRecords(data);
      } catch (err) {
        if (!cancelled) {
          setRecordsError(
            err instanceof Error ? err.message : "No se pudieron cargar los registros",
          );
        }
      } finally {
        if (!cancelled) setIsLoadingRecords(false);
      }
    };

    fetchRecords();

    return () => {
      cancelled = true;
    };
  }, [
    selectedChildId,
    dateStr,
    mealCapability.isLoading,
    mealCapability.error,
    mealCapability.enabled,
    recordsAttempt,
  ]);

  const eatingItems: EatingHabitItem[] = mealRecords.map((record) => ({
    id: record.id,
    eatingType: mapMealStatusToEatingType(record.status),
    mealTypeName: record.meal_types?.name ?? null,
    notes: record.notes,
  }));

  const handlePreviousDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 1);
    setCurrentDate(newDate);
  };

  const handleNextDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 1);
    setCurrentDate(newDate);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (children.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Baby className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No tienes hijos asociados
          </h3>
          <p className="text-gray-500">
            Contacta con el centro para asociar tus hijos a tu cuenta.
          </p>
        </CardContent>
      </Card>
    );
  }

  const selectedChild = children.find((c) => c.id === selectedChildId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {selectedChild ? selectedChild.first_name : "Mis hijos"}
        </h1>
        {selectedChild && (
          <p className="text-gray-500 mt-1">
            {selectedChild.classes?.name} ·{" "}
            {selectedChild.classes?.schools?.name}
          </p>
        )}
      </div>

      {/* Tab navigation for multiple children */}
      {children.length > 1 && (
        <Tabs
          tabs={children.map((child) => ({
            id: child.id,
            label: child.first_name,
          }))}
          activeTab={selectedChildId}
          onTabChange={setSelectedChildId}
        />
      )}

      {/* Daily Dashboard */}
      <div className="space-y-4">
        <DayNavigator
          currentDate={currentDate}
          onPreviousDay={handlePreviousDay}
          onNextDay={handleNextDay}
          onToday={handleToday}
        />

        <DailyMenuSection menu={menu} isLoading={isLoadingMenu} />

        <NightMenuSection menu={null} isLoading={isLoadingMenu} />

        {mealCapability.isLoading ? (
          <Card className="mb-4">
            <CardContent className="p-6 flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-primary-600" />
            </CardContent>
          </Card>
        ) : mealCapability.error ? (
          <Card className="mb-4">
            <CardContent className="p-6 text-center space-y-3">
              <p className="text-gray-500 text-sm">
                No se pudo cargar la configuración de comidas
              </p>
              <button
                type="button"
                onClick={mealCapability.retry}
                className="text-sm font-medium text-primary-600 hover:text-primary-700"
              >
                Reintentar
              </button>
            </CardContent>
          </Card>
        ) : mealCapability.enabled ? (
          <EatingHabitsAccordion
            records={eatingItems}
            isLoading={isLoadingRecords}
            error={recordsError}
            onRetry={() => setRecordsAttempt((value) => value + 1)}
          />
        ) : null}

        <NotificationsAccordion incidents={todayIncidents} />
      </div>
    </div>
  );
}

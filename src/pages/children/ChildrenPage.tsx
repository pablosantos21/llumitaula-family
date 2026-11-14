import { useCallback, useEffect, useState } from "react";
import { ChildService, type Child } from "@/services/children.service";
import { MenuService, type Menu } from "@/services/menus.service";
import { IncidentService, type Incident } from "@/services/incidents.service";
import {
  MealRecordService,
  type MealRecord,
} from "@/services/meal-records.service";
import { mapMealStatusToEatingType } from "@/lib/meal-records-mapping";
import { extractISODate, toLocalISODate } from "@/lib/date";
import { selectMenusByType } from "@/lib/menu-selection";
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
import { Button } from "@/components/ui/button";
import { AlertCircle, Baby, Loader2 } from "lucide-react";

export default function ChildrenPage() {
  const [children, setChildren] = useState<Child[]>([]);
  const [childrenError, setChildrenError] = useState<string | null>(null);
  const [childrenAttempt, setChildrenAttempt] = useState(0);
  const [selectedChildId, setSelectedChildId] = useState<string>("");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [menu, setMenu] = useState<Menu | null>(null);
  const [nightMenu, setNightMenu] = useState<Menu | null>(null);
  const [menuError, setMenuError] = useState<string | null>(null);
  const [todayIncidents, setTodayIncidents] = useState<Incident[]>([]);
  const [incidentsError, setIncidentsError] = useState<string | null>(null);
  const [dataAttempt, setDataAttempt] = useState(0);
  const [mealRecords, setMealRecords] = useState<MealRecord[]>([]);
  const [isLoadingRecords, setIsLoadingRecords] = useState(false);
  const [recordsError, setRecordsError] = useState<string | null>(null);
  const [recordsAttempt, setRecordsAttempt] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMenu, setIsLoadingMenu] = useState(false);

  const dateStr = toLocalISODate(currentDate);
  const mealCapability = useMealCapability(
    selectedChildId || null,
    dateStr,
  );

  // Fetch children on mount (or retry)
  useEffect(() => {
    let cancelled = false;

    const fetchChildren = async () => {
      try {
        setIsLoading(true);
        setChildrenError(null);
        const data = await ChildService.getMyChildren();
        if (cancelled) return;
        setChildren(data);
        if (data.length > 0) {
          setSelectedChildId((prev) =>
            data.some((child) => child.id === prev) ? prev : data[0].id,
          );
        }
      } catch (err) {
        console.error("Error fetching children:", err);
        if (!cancelled) {
          setChildrenError(
            err instanceof Error
              ? err.message
              : "No se pudieron cargar los datos de tus hijos",
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void fetchChildren();

    return () => {
      cancelled = true;
    };
  }, [childrenAttempt]);

  // Fetch menu and incidents when child or date changes (menu always visible)
  useEffect(() => {
    if (!selectedChildId) return;

    const selectedChild = children.find((c) => c.id === selectedChildId);
    if (!selectedChild) return;

    let cancelled = false;

    const fetchData = async () => {
      setIsLoadingMenu(true);
      setMenu(null);
      setNightMenu(null);
      setTodayIncidents([]);
      setMenuError(null);
      setIncidentsError(null);

      const fetchMenu = async () => {
        try {
          const schoolId = selectedChild.classes?.school_id;
          if (!schoolId) {
            if (!cancelled) {
              setMenu(null);
              setNightMenu(null);
            }
            return;
          }
          const menus = await MenuService.getMenusBySchoolAndDate(
            schoolId,
            dateStr,
          );
          if (!cancelled) {
            const { dailyMenu, nightMenu: complementaryMenu } =
              selectMenusByType(menus);
            setMenu(dailyMenu);
            setNightMenu(complementaryMenu);
          }
        } catch (err) {
          console.error("Error fetching menu:", err);
          if (!cancelled) {
            setMenu(null);
            setNightMenu(null);
            setMenuError("No se pudo cargar el menú de este día");
          }
        }
      };

      const fetchIncidents = async () => {
        try {
          const allIncidents = await IncidentService.getIncidentsForMyChildren();
          if (!cancelled) {
            const childIncidents = allIncidents.filter(
              (incident) =>
                incident.child_id === selectedChildId &&
                extractISODate(incident.date) === dateStr,
            );
            setTodayIncidents(childIncidents);
          }
        } catch (err) {
          console.error("Error fetching incidents:", err);
          if (!cancelled) {
            setTodayIncidents([]);
            setIncidentsError("No se pudieron cargar las notificaciones");
          }
        }
      };

      await Promise.all([fetchMenu(), fetchIncidents()]);
      if (!cancelled) {
        setIsLoadingMenu(false);
      }
    };

    void fetchData();

    return () => {
      cancelled = true;
    };
  }, [selectedChildId, children, dateStr, dataAttempt]);

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
        setMealRecords([]);
        setRecordsError(null);
        const data = await MealRecordService.getByChildAndDate(
          selectedChildId,
          dateStr,
        );
        if (!cancelled) setMealRecords(data);
      } catch (err) {
        if (!cancelled) {
          setMealRecords([]);
          setRecordsError(
            err instanceof Error ? err.message : "No se pudieron cargar los registros",
          );
        }
      } finally {
        if (!cancelled) setIsLoadingRecords(false);
      }
    };

    void fetchRecords();

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

  const resetDayAndChildState = () => {
    setMenu(null);
    setNightMenu(null);
    setTodayIncidents([]);
    setMenuError(null);
    setIncidentsError(null);
    setMealRecords([]);
    setRecordsError(null);
  };

  const handleSelectChild = (childId: string) => {
    if (childId === selectedChildId) return;
    resetDayAndChildState();
    setSelectedChildId(childId);
  };

  const handlePreviousDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 1);
    resetDayAndChildState();
    setCurrentDate(newDate);
  };

  const handleNextDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 1);
    resetDayAndChildState();
    setCurrentDate(newDate);
  };

  const handleToday = () => {
    const today = new Date();
    if (toLocalISODate(today) !== dateStr) {
      resetDayAndChildState();
    }
    setCurrentDate(today);
  };

  const handleIncidentsSeen = useCallback((seenIds: string[]) => {
    const seenSet = new Set(seenIds);
    setTodayIncidents((prev) =>
      prev.map((incident) =>
        seenSet.has(incident.id) ? { ...incident, family_seen: true } : incident,
      ),
    );
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (childrenError) {
    return (
      <Card>
        <CardContent className="py-12 text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              No se pudieron cargar los datos de tus hijos
            </h3>
            <p className="text-sm text-gray-500">
              Comprueba tu conexión e inténtalo de nuevo.
            </p>
          </div>
          <Button
            type="button"
            onClick={() => setChildrenAttempt((value) => value + 1)}
          >
            Reintentar
          </Button>
        </CardContent>
      </Card>
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
          onTabChange={handleSelectChild}
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

        {menuError ? (
          <Card className="mb-4">
            <CardContent className="p-6 text-center space-y-3">
              <p className="text-gray-500 text-sm">{menuError}</p>
              <button
                type="button"
                onClick={() => setDataAttempt((value) => value + 1)}
                className="text-sm font-medium text-primary-600 hover:text-primary-700"
              >
                Reintentar
              </button>
            </CardContent>
          </Card>
        ) : (
          <>
            <DailyMenuSection menu={menu} isLoading={isLoadingMenu} />

            <NightMenuSection menu={nightMenu} isLoading={isLoadingMenu} />
          </>
        )}

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

        {incidentsError ? (
          <Card className="mb-4">
            <CardContent className="p-6 text-center space-y-3">
              <p className="text-gray-500 text-sm">{incidentsError}</p>
              <button
                type="button"
                onClick={() => setDataAttempt((value) => value + 1)}
                className="text-sm font-medium text-primary-600 hover:text-primary-700"
              >
                Reintentar
              </button>
            </CardContent>
          </Card>
        ) : (
          <NotificationsAccordion
            incidents={todayIncidents}
            onIncidentsSeen={handleIncidentsSeen}
          />
        )}
      </div>
    </div>
  );
}

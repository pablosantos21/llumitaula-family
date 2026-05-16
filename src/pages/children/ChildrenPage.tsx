import { useEffect, useState } from 'react';
import { ChildService, type Child } from '@/services/children.service';
import { MenuService, type Menu } from '@/services/menus.service';
import { IncidentService, type Incident } from '@/services/incidents.service';
import { Tabs } from '@/components/ui/tabs';
import { DayNavigator } from '@/components/DayNavigator';
import { DailyMenuSection } from '@/components/DailyMenuSection';
import { NightMenuSection } from '@/components/NightMenuSection';
import { EatingHabitsAccordion } from '@/components/EatingHabitsAccordion';
import { NotificationsAccordion } from '@/components/NotificationsAccordion';
import { Card, CardContent } from '@/components/ui/card';
import { Baby, Loader2 } from 'lucide-react';

export default function ChildrenPage() {
    const [children, setChildren] = useState<Child[]>([]);
    const [selectedChildId, setSelectedChildId] = useState<string>('');
    const [currentDate, setCurrentDate] = useState(new Date());
    const [menu, setMenu] = useState<Menu | null>(null);
    const [nightMenu, setNightMenu] = useState<Menu | null>(null);
    const [todayIncidents, setTodayIncidents] = useState<Incident[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMenu, setIsLoadingMenu] = useState(false);

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
                console.error('Error fetching children:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchChildren();
    }, []);

    // Fetch menu and incidents when child or date changes
    useEffect(() => {
        if (!selectedChildId) return;

        const fetchData = async () => {
            try {
                setIsLoadingMenu(true);

                const selectedChild = children.find((c) => c.id === selectedChildId);
                if (!selectedChild) return;

                const dateStr = currentDate.toISOString().split('T')[0];

                // Fetch menu
                const menus = await MenuService.getMenusBySchoolAndDate(
                    selectedChild.classes?.school_id || '',
                    dateStr
                );
                setMenu(menus.length > 0 ? menus[0].menus || null : null);

                // Fetch incidents for this child
                const allIncidents =
                    await IncidentService.getIncidentsForMyChildren();
                const childIncidents = allIncidents.filter(
                    (incident) =>
                        incident.child_id === selectedChildId &&
                        new Date(incident.date).toDateString() ===
                            currentDate.toDateString()
                );
                setTodayIncidents(childIncidents);
            } catch (err) {
                console.error('Error fetching data:', err);
            } finally {
                setIsLoadingMenu(false);
            }
        };

        fetchData();
    }, [selectedChildId, currentDate, children]);

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
                <Loader2 className="h-8 w-8 animate-spin text-pink-600" />
            </div>
        );
    }

    if (children.length === 0) {
        return (
            <Card>
                <CardContent className="py-12 text-center">
                    <Baby className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No tens fills associats
                    </h3>
                    <p className="text-gray-500">
                        Contacta amb el centre per associar els teus fills al teu compte.
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
                    {selectedChild ? selectedChild.first_name : 'Els meus fills'}
                </h1>
                {selectedChild && (
                    <p className="text-gray-500 mt-1">
                        {selectedChild.classes?.name} · {selectedChild.classes?.schools?.name}
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
                >
                    {/* Content is rendered below */}
                </Tabs>
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

                <NightMenuSection menu={nightMenu} isLoading={isLoadingMenu} />

                <EatingHabitsAccordion
                    eatingRecord={null}
                    observations={undefined}
                />

                <NotificationsAccordion incidents={todayIncidents} />
            </div>
        </div>
    );
}

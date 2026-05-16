import { useEffect, useState } from "react";
import { IncidentService, type Incident } from "@/services/incidents.service";
import { Tabs } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Eye,
  EyeOff,
  Signature,
} from "lucide-react";

export default function NotificacionesPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [activeTab, setActiveTab] = useState<string>("pending");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchIncidents = async () => {
      try {
        const data = await IncidentService.getIncidentsForMyChildren();
        setIncidents(data);
      } catch (err) {
        console.error("Error fetching incidents:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchIncidents();
  }, []);

  const getIncidentSeverity = (description: string) => {
    const lower = description.toLowerCase();
    if (
      lower.includes("al·lèrgia") ||
      lower.includes("alergia") ||
      lower.includes("urgència") ||
      lower.includes("emergencia")
    ) {
      return "critical";
    }
    if (
      lower.includes("comportament") ||
      lower.includes("problema") ||
      lower.includes("conflicte")
    ) {
      return "warning";
    }
    return "info";
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-50 border-red-200";
      case "warning":
        return "bg-amber-50 border-amber-200";
      default:
        return "bg-blue-50 border-blue-200";
    }
  };

  const getSeverityIcon = (severity: string) => {
    const iconProps = "h-5 w-5";
    switch (severity) {
      case "critical":
        return <AlertTriangle className={`${iconProps} text-red-600`} />;
      case "warning":
        return <AlertCircle className={`${iconProps} text-amber-600`} />;
      default:
        return <AlertCircle className={`${iconProps} text-blue-600`} />;
    }
  };

  const pendingIncidents = incidents.filter(
    (incident) =>
      incident.requires_family_signature && !incident.family_responded_at,
  );
  const pastIncidents = incidents.filter(
    (incident) =>
      !incident.requires_family_signature || incident.family_responded_at,
  );

  const tabs = [
    { id: "pending", label: `Pendientes (${pendingIncidents.length})` },
    { id: "past", label: `Pasadas (${pastIncidents.length})` },
  ];

  const displayIncidents =
    activeTab === "pending" ? pendingIncidents : pastIncidents;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 pb-32">
      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab}>
        <div className="space-y-4">
          {isLoading ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-gray-500">Carregant...</p>
              </CardContent>
            </Card>
          ) : displayIncidents.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                {activeTab === "pending" ? (
                  <>
                    <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto mb-3" />
                    <p className="text-gray-700 font-medium">
                      No hi ha notificacions pendents
                    </p>
                    <p className="text-gray-500 text-sm mt-1">
                      Tots els avisos han estat respondits
                    </p>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-700 font-medium">
                      No hi ha historial
                    </p>
                    <p className="text-gray-500 text-sm mt-1">
                      No hi ha notificacions antigues per mostrar
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          ) : (
            displayIncidents.map((incident) => {
              const severity = getIncidentSeverity(incident.description);
              return (
                <Card
                  key={incident.id}
                  className={`border-2 ${getSeverityColor(severity)}`}
                >
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 mt-1">
                        {getSeverityIcon(severity)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {incident.children?.first_name}{" "}
                              {incident.children?.last_name}
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">
                              {new Date(incident.date).toLocaleDateString(
                                "ca-ES",
                                {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                },
                              )}
                            </p>
                          </div>
                        </div>

                        <p className="text-gray-700 mb-4">
                          {incident.description}
                        </p>

                        <div className="flex flex-wrap gap-2 mb-4">
                          {incident.requires_family_signature && (
                            <Badge
                              variant="warning"
                              className="flex items-center gap-1"
                            >
                              <Signature className="h-3 w-3" />
                              Requereix signatura
                            </Badge>
                          )}
                          {incident.family_seen ? (
                            <Badge
                              variant="default"
                              className="flex items-center gap-1"
                            >
                              <Eye className="h-3 w-3" />
                              Vist
                            </Badge>
                          ) : (
                            <Badge
                              variant="warning"
                              className="flex items-center gap-1"
                            >
                              <EyeOff className="h-3 w-3" />
                              No vist
                            </Badge>
                          )}
                        </div>

                        {incident.family_response && (
                          <div className="bg-white p-4 rounded border border-gray-200 mb-4">
                            <p className="text-xs font-semibold text-gray-700 mb-2">
                              La teva resposta:
                            </p>
                            <p className="text-sm text-gray-600">
                              {incident.family_response}
                            </p>
                          </div>
                        )}

                        {activeTab === "pending" &&
                          incident.requires_family_signature && (
                            <Button className="w-full bg-pink-600 hover:bg-pink-700">
                              Responder
                            </Button>
                          )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </Tabs>
    </div>
  );
}

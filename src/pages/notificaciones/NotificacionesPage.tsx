import { type FormEvent, useEffect, useState } from "react";
import { IncidentService, type Incident } from "@/services/incidents.service";
import { formatIncidentDateEs } from "@/lib/date";
import {
  getUnseenIncidentIds,
  INCIDENT_RESPONSE_MAX_LENGTH,
  isFamilyResponseValid,
} from "@/lib/incident-response";
import { Tabs } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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
  const [respondingId, setRespondingId] = useState<string | null>(null);
  const [responseText, setResponseText] = useState("");
  const [isSubmittingResponse, setIsSubmittingResponse] = useState(false);
  const [responseError, setResponseError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchIncidents = async () => {
      try {
        const data = await IncidentService.getIncidentsForMyChildren();
        if (cancelled) return;
        setIncidents(data);

        const unseenIds = getUnseenIncidentIds(data);
        if (unseenIds.length > 0) {
          const unseenSet = new Set(unseenIds);
          IncidentService.markIncidentsAsSeen(unseenIds)
            .then(() => {
              if (!cancelled) {
                setIncidents((prev) =>
                  prev.map((incident) =>
                    unseenSet.has(incident.id)
                      ? { ...incident, family_seen: true }
                      : incident,
                  ),
                );
              }
            })
            .catch((err) => {
              console.error("Error marking incidents as seen:", err);
            });
        }
      } catch (err) {
        console.error("Error fetching incidents:", err);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchIncidents();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleOpenResponseForm = (incidentId: string) => {
    setRespondingId(incidentId);
    setResponseText("");
    setResponseError(null);
  };

  const handleCancelResponse = () => {
    setRespondingId(null);
    setResponseText("");
    setResponseError(null);
  };

  const handleSubmitResponse = async (
    event: FormEvent<HTMLFormElement>,
    incidentId: string,
  ) => {
    event.preventDefault();
    if (!isFamilyResponseValid(responseText)) {
      setResponseError(
        `La respuesta no puede superar los ${INCIDENT_RESPONSE_MAX_LENGTH} caracteres`,
      );
      return;
    }

    try {
      setIsSubmittingResponse(true);
      setResponseError(null);
      const updated = await IncidentService.respondToIncident(
        incidentId,
        responseText,
      );
      setIncidents((prev) =>
        prev.map((incident) =>
          incident.id === incidentId ? { ...incident, ...updated } : incident,
        ),
      );
      setRespondingId(null);
      setResponseText("");
    } catch (err) {
      setResponseError(
        err instanceof Error
          ? err.message
          : "No se pudo enviar la respuesta. Inténtalo de nuevo.",
      );
    } finally {
      setIsSubmittingResponse(false);
    }
  };

  const getIncidentSeverity = (description: string) => {
    const lower = description.toLowerCase();
    if (
      lower.includes("al·lèrgia") ||
      lower.includes("alergia") ||
      lower.includes("urgència") ||
      lower.includes("urgencia") ||
      lower.includes("emergencia")
    ) {
      return "critical";
    }
    if (
      lower.includes("comportament") ||
      lower.includes("comportamiento") ||
      lower.includes("problema") ||
      lower.includes("conflicte") ||
      lower.includes("conflicto")
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
    <div className="bg-gray-50 p-4 md:p-8">
      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab}>
        <div className="space-y-4">
          {isLoading ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-gray-500">Cargando...</p>
              </CardContent>
            </Card>
          ) : displayIncidents.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                {activeTab === "pending" ? (
                  <>
                    <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto mb-3" />
                    <p className="text-gray-700 font-medium">
                      No hay notificaciones pendientes
                    </p>
                    <p className="text-gray-500 text-sm mt-1">
                      Todos los avisos han sido respondidos
                    </p>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-700 font-medium">
                      No hay historial
                    </p>
                    <p className="text-gray-500 text-sm mt-1">
                      No hay notificaciones antiguas para mostrar
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
                              {formatIncidentDateEs(incident.date)}
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
                              Requiere firma
                            </Badge>
                          )}
                          {incident.family_seen ? (
                            <Badge
                              variant="default"
                              className="flex items-center gap-1"
                            >
                              <Eye className="h-3 w-3" />
                              Visto
                            </Badge>
                          ) : (
                            <Badge
                              variant="warning"
                              className="flex items-center gap-1"
                            >
                              <EyeOff className="h-3 w-3" />
                              No visto
                            </Badge>
                          )}
                        </div>

                        {incident.family_response && (
                          <div className="bg-white p-4 rounded border border-gray-200 mb-4">
                            <p className="text-xs font-semibold text-gray-700 mb-2">
                              Tu respuesta:
                            </p>
                            <p className="text-sm text-gray-600">
                              {incident.family_response}
                            </p>
                          </div>
                        )}

                        {activeTab === "pending" &&
                          incident.requires_family_signature &&
                          (respondingId === incident.id ? (
                            <form
                              onSubmit={(e) =>
                                void handleSubmitResponse(e, incident.id)
                              }
                              className="space-y-3 bg-white p-4 rounded-lg border border-gray-200"
                            >
                              <div>
                                <Textarea
                                  value={responseText}
                                  onChange={(e) => {
                                    setResponseText(e.target.value);
                                    if (responseError) setResponseError(null);
                                  }}
                                  placeholder="Escribe un comentario opcional (si lo dejas vacío se registrará como «Enterado / Firmado»)"
                                  rows={3}
                                  disabled={isSubmittingResponse}
                                  aria-label="Respuesta de la familia"
                                />
                                <div className="flex justify-end mt-1">
                                  <span
                                    className={`text-xs ${
                                      !isFamilyResponseValid(responseText)
                                        ? "text-red-600"
                                        : "text-gray-500"
                                    }`}
                                  >
                                    {responseText.trim().length}/
                                    {INCIDENT_RESPONSE_MAX_LENGTH}
                                  </span>
                                </div>
                              </div>

                              {responseError && (
                                <div className="bg-red-50 text-red-600 text-sm p-3 rounded-md border border-red-100">
                                  {responseError}
                                </div>
                              )}

                              <div className="flex gap-2">
                                <Button
                                  type="submit"
                                  className="flex-1"
                                  disabled={
                                    isSubmittingResponse ||
                                    !isFamilyResponseValid(responseText)
                                  }
                                >
                                  {isSubmittingResponse
                                    ? "Enviando..."
                                    : "Firmar y enviar"}
                                </Button>
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={handleCancelResponse}
                                  disabled={isSubmittingResponse}
                                >
                                  Cancelar
                                </Button>
                              </div>
                            </form>
                          ) : (
                            <Button
                              type="button"
                              className="w-full"
                              onClick={() =>
                                handleOpenResponseForm(incident.id)
                              }
                            >
                              Responder
                            </Button>
                          ))}
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

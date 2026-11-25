import { useEffect, useRef, useState } from "react";
import { AccordionItem } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { getUnseenIncidentIds } from "@/lib/incident-response";
import {
  getIncidentSeverity,
  getSeverityColor,
  type IncidentSeverity,
} from "@/lib/incident-severity";
import { IncidentService, type Incident } from "@/services/incidents.service";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Eye,
  EyeOff,
  Signature,
} from "lucide-react";

interface NotificationsAccordionProps {
  incidents: Incident[];
  onIncidentsSeen?: (ids: string[]) => void;
}

export function NotificationsAccordion({
  incidents,
  onIncidentsSeen,
}: NotificationsAccordionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const markedIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!isOpen) return;

    const unseenIds = getUnseenIncidentIds(incidents).filter(
      (id) => !markedIdsRef.current.has(id),
    );
    if (unseenIds.length === 0) return;

    for (const id of unseenIds) {
      markedIdsRef.current.add(id);
    }

    let cancelled = false;
    IncidentService.markIncidentsAsSeen(unseenIds)
      .then(() => {
        if (!cancelled) {
          onIncidentsSeen?.(unseenIds);
        }
      })
      .catch((err) => {
        console.error("Error marking incidents as seen:", err);
        for (const id of unseenIds) {
          markedIdsRef.current.delete(id);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen, incidents, onIncidentsSeen]);
  const getSeverityIcon = (severity: IncidentSeverity) => {
    const iconProps = "h-5 w-5";
    switch (severity) {
      case "critical":
        return <AlertTriangle className={`${iconProps} text-red-600`} />;
      case "warning":
        return <AlertCircle className={`${iconProps} text-amber-600`} />;
      default:
        return <Clock className={`${iconProps} text-blue-600`} />;
    }
  };

  return (
    <div className="mb-4">
      <AccordionItem
        title={`Notificaciones (${incidents.length})`}
        onOpenChange={setIsOpen}
      >
        {incidents.length === 0 ? (
          <div className="text-center py-6">
            <CheckCircle2 className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-gray-700 font-medium">¡Todo va bien!</p>
            <p className="text-gray-500 text-sm mt-1">No hay notificaciones</p>
          </div>
        ) : (
          <div className="space-y-3">
            {incidents.map((incident) => {
              const severity = getIncidentSeverity(incident.description);
              return (
                <div
                  key={incident.id}
                  className={`p-4 rounded-lg border-2 ${getSeverityColor(
                    severity,
                  )}`}
                >
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {getSeverityIcon(severity)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm">
                        {incident.description}
                      </p>

                      <div className="flex flex-wrap gap-2 mt-3">
                        {incident.requires_family_signature && (
                          <Badge
                            variant="warning"
                            className="flex items-center gap-1 text-xs"
                          >
                            <Signature className="h-3 w-3" />
                            Firma
                          </Badge>
                        )}
                        {incident.family_seen ? (
                          <Badge
                            variant="default"
                            className="flex items-center gap-1 text-xs"
                          >
                            <Eye className="h-3 w-3" />
                            Visto
                          </Badge>
                        ) : (
                          <Badge
                            variant="warning"
                            className="flex items-center gap-1 text-xs"
                          >
                            <EyeOff className="h-3 w-3" />
                            No visto
                          </Badge>
                        )}
                      </div>

                      {incident.family_response && (
                        <div className="mt-3 bg-white p-2 rounded border border-gray-200">
                          <p className="text-xs font-semibold text-gray-700 mb-1">
                            Respuesta de la familia:
                          </p>
                          <p className="text-xs text-gray-600">
                            {incident.family_response}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </AccordionItem>
    </div>
  );
}

import { AccordionItem } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import type { Incident } from "@/services/incidents.service";
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
}

export function NotificationsAccordion({
  incidents,
}: NotificationsAccordionProps) {
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
        return <Clock className={`${iconProps} text-blue-600`} />;
    }
  };

  const today = new Date().toDateString();
  const todayIncidents = incidents.filter(
    (incident) => new Date(incident.date).toDateString() === today,
  );

  return (
    <div className="mb-4">
      <AccordionItem title={`Notificacions (${todayIncidents.length})`}>
        {todayIncidents.length === 0 ? (
          <div className="text-center py-6">
            <CheckCircle2 className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-gray-700 font-medium">Tot va bé avui!</p>
            <p className="text-gray-500 text-sm mt-1">No hi ha notificacions</p>
          </div>
        ) : (
          <div className="space-y-3">
            {todayIncidents.map((incident) => {
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
                            Signatura
                          </Badge>
                        )}
                        {incident.family_seen ? (
                          <Badge
                            variant="default"
                            className="flex items-center gap-1 text-xs"
                          >
                            <Eye className="h-3 w-3" />
                            Vist
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="flex items-center gap-1 text-xs"
                          >
                            <EyeOff className="h-3 w-3" />
                            No vist
                          </Badge>
                        )}
                      </div>

                      {incident.family_response && (
                        <div className="mt-3 bg-white p-2 rounded border border-gray-200">
                          <p className="text-xs font-semibold text-gray-700 mb-1">
                            Resposta de la família:
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

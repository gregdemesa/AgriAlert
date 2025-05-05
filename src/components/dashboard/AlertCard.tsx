
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

export type AlertLevel = "warning" | "severe" | "emergency";

interface Alert {
  id: string;
  title: string;
  description: string;
  level: AlertLevel;
  time: string;
}

interface AlertCardProps {
  alerts: Alert[];
}

export function AlertCard({ alerts }: AlertCardProps) {
  // Function to get appropriate CSS classes based on the alert level
  const getLevelClasses = (level: AlertLevel) => {
    switch (level) {
      case "warning":
        return "alert-badge-warning";
      case "severe":
        return "alert-badge-severe";
      case "emergency":
        return "alert-badge-emergency";
      default:
        return "alert-badge-warning";
    }
  };

  // Function to get the background gradient based on highest alert level
  const getBackgroundGradient = () => {
    if (alerts.some(alert => alert.level === "emergency")) {
      return "from-alert-emergency/20 to-alert-emergency/5";
    } else if (alerts.some(alert => alert.level === "severe")) {
      return "from-alert-severe/20 to-alert-severe/5";
    } else {
      return "from-alert-warning/20 to-alert-warning/5";
    }
  };

  return (
    <Card>
      <CardHeader className={cn("bg-gradient-to-r pb-2", getBackgroundGradient())}>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Active Alerts
        </CardTitle>
      </CardHeader>
      <CardContent className="px-0 pb-0">
        {alerts.length === 0 ? (
          <div className="px-6 py-4 text-center text-muted-foreground">
            No active alerts at the moment.
          </div>
        ) : (
          <div className="divide-y">
            {alerts.map((alert) => (
              <div key={alert.id} className="px-6 py-4">
                <div className="flex items-start justify-between mb-1">
                  <div className="font-medium">{alert.title}</div>
                  <div className={getLevelClasses(alert.level)}>
                    {alert.level}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-1">
                  {alert.description}
                </p>
                <div className="text-xs text-muted-foreground">
                  {alert.time}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

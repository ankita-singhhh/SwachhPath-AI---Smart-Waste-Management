import { AlertTriangle, X, Eye } from "lucide-react";
import { cn } from "@/react-app/lib/utils";
import { Button } from "@/react-app/components/ui/button";
import { Card } from "@/react-app/components/ui/card";
import { useIoTSimulation } from "@/react-app/context/IoTSimulationContext";

interface AlertPanelProps {
  onViewDetails?: (pin: string, binId: string) => void;
}

export default function AlertPanel({ onViewDetails }: AlertPanelProps) {
  const { alerts, dismissAlert, manuallyEmptyBin, postcodes } =
    useIoTSimulation();

  if (alerts.length === 0) {
    return (
      <Card className="rounded-2xl p-6 border-border/50 bg-card/50 backdrop-blur">
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="w-6 h-6 text-green-400" />
            </div>
            <p className="text-muted-foreground text-sm">
              No active alerts. All bins are operating normally.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  const sortedAlerts = [...alerts].sort((a, b) => {
    if (a.severity === "high" && b.severity !== "high") return -1;
    if (a.severity !== "high" && b.severity === "high") return 1;
    return b.timestamp.getTime() - a.timestamp.getTime();
  });

  return (
    <Card className="rounded-2xl border-border/50 bg-card/50 backdrop-blur overflow-hidden">
      <div className="p-6 border-b border-border/30">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-red-500/20">
            <AlertTriangle className="w-5 h-5 text-red-400 animate-pulse" />
          </div>
          <div>
            <h2 className="font-semibold text-foreground">Active Alerts</h2>
            <p className="text-xs text-muted-foreground">
              {alerts.length} bin{alerts.length !== 1 ? "s" : ""} require attention
            </p>
          </div>
        </div>
      </div>

      <div className="max-h-[600px] overflow-y-auto">
        {sortedAlerts.map((alert, index) => {
          const bin = postcodes
            .find((p) => p.pin === alert.pin)
            ?.dustbins.find((d) => d.id === alert.binId);

          if (!bin) return null;

          return (
            <div
              key={alert.id}
              className={cn(
                "px-6 py-4 border-b border-border/20 hover:bg-accent/30 transition-colors",
                alert.severity === "high" && "bg-red-500/5",
                index === 0 && "border-t border-border/20"
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={cn(
                        "text-xs font-semibold px-2.5 py-1 rounded-md",
                        alert.severity === "high"
                          ? "bg-red-500/20 text-red-400"
                          : "bg-yellow-500/20 text-yellow-400"
                      )}
                    >
                      {alert.severity === "high" ? "Critical" : "Medium"}
                    </span>
                    {bin.fillLevel > 95 && (
                      <span className="text-[10px] font-semibold text-red-400 animate-blink">
                        ● CRITICAL
                      </span>
                    )}
                  </div>
                  <p className="font-semibold text-foreground text-sm mb-1">
                    Bin {alert.binId}
                  </p>
                  <p className="text-xs text-muted-foreground mb-2">
                    Area: {alert.area} (PIN: {alert.pin})
                  </p>
                  <div className="flex items-center gap-2 text-xs">
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden flex-1">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all duration-300",
                          bin.fillLevel > 95
                            ? "bg-red-500"
                            : bin.fillLevel > 80
                            ? "bg-yellow-500"
                            : "bg-orange-500"
                        )}
                        style={{ width: `${Math.min(100, bin.fillLevel)}%` }}
                      />
                    </div>
                    <span className="font-semibold text-foreground">
                      {Math.round(bin.fillLevel)}%
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs gap-1"
                    onClick={() => {
                      if (onViewDetails) {
                        onViewDetails(alert.pin, alert.binId);
                      }
                    }}
                  >
                    <Eye className="w-3 h-3" />
                    View
                  </Button>
                  <Button
                    size="sm"
                    className="h-7 text-xs bg-primary hover:bg-primary/90"
                    onClick={() =>
                      manuallyEmptyBin(alert.pin, alert.binId)
                    }
                  >
                    Empty
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0"
                    onClick={() => dismissAlert(alert.id)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

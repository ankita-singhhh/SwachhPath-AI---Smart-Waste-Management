import React from "react";
import { Battery, BatteryLow, AlertTriangle } from "lucide-react";
import { cn } from "@/react-app/lib/utils";

interface BatteryIndicatorProps {
  level: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

export const BatteryIndicator: React.FC<BatteryIndicatorProps> = ({
  level,
  size = "md",
  showLabel = true,
}) => {
  const getBatteryColor = () => {
    if (level < 20) return "text-red-500";
    if (level < 40) return "text-yellow-500";
    return "text-green-500";
  };

  const getBatteryIcon = () => {
    if (level < 20) return BatteryLow;
    return Battery;
  };

  const Icon = getBatteryIcon();
  const sizeClass = size === "sm" ? "w-4 h-4" : size === "lg" ? "w-6 h-6" : "w-5 h-5";

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <Icon className={cn(sizeClass, getBatteryColor(), "transition-colors")} />
        {level < 20 && (
          <AlertTriangle className="absolute -top-1 -right-1 w-3 h-3 text-red-500 animate-pulse" />
        )}
      </div>
      {showLabel && <span className="text-xs font-medium text-muted-foreground">{level}%</span>}
    </div>
  );
};

import React from "react";
import { CircleDot, AlertCircle, WifiOff, CheckCircle2 } from "lucide-react";
import { DeviceHealthStatus } from "@/react-app/types";
import { cn } from "@/react-app/lib/utils";

interface DeviceStatusBadgeProps {
  status: DeviceHealthStatus;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

export const DeviceStatusBadge: React.FC<DeviceStatusBadgeProps> = ({
  status,
  size = "md",
  showLabel = true,
}) => {
  const getStatusColor = () => {
    switch (status) {
      case "healthy":
        return "text-green-500";
      case "warning":
        return "text-yellow-500";
      case "critical":
        return "text-red-500";
      case "offline":
        return "text-gray-500";
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case "healthy":
        return CheckCircle2;
      case "warning":
        return AlertCircle;
      case "critical":
        return AlertCircle;
      case "offline":
        return WifiOff;
    }
  };

  const getStatusLabel = () => {
    switch (status) {
      case "healthy":
        return "Healthy";
      case "warning":
        return "Warning";
      case "critical":
        return "Critical";
      case "offline":
        return "Offline";
    }
  };

  const Icon = getStatusIcon();
  const sizeClass = size === "sm" ? "w-4 h-4" : size === "lg" ? "w-6 h-6" : "w-5 h-5";
  const pulseClass = (status === "critical" || status === "offline") ? "animate-pulse" : "";

  return (
    <div className="flex items-center gap-2">
      <Icon className={cn(sizeClass, getStatusColor(), "transition-colors", pulseClass)} />
      {showLabel && <span className="text-xs font-medium text-muted-foreground">{getStatusLabel()}</span>}
    </div>
  );
};

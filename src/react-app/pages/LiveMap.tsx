import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import DashboardLayout from "@/react-app/components/layout/DashboardLayout";
import { useIoTDevice } from "@/react-app/context/IoTDeviceContext";
import { BatteryIndicator } from "@/react-app/components/BatteryIndicator";
import { DeviceStatusBadge } from "@/react-app/components/DeviceStatusBadge";
import { Button } from "@/react-app/components/ui/button";
import { MapPin, AlertTriangle, Activity, Filter } from "lucide-react";
import { getDeviceHealth } from "@/react-app/types";

export default function LiveMapPage() {
  const navigate = useNavigate();
  const { devices } = useIoTDevice();
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
  const [filterHealth, setFilterHealth] = useState<"all" | "critical" | "warning" | "healthy">("all");

  const stats = useMemo(() => {
    const online = devices.filter((d) => d.status === "online").length;
    const critical = devices.filter((d) => d.fillLevel > 80 && d.status === "online").length;
    const warning = devices.filter((d) => d.fillLevel >= 60 && d.fillLevel <= 80 && d.status === "online").length;
    const healthy = devices.filter((d) => getDeviceHealth(d) === "healthy").length;

    return { online, critical, warning, healthy, total: devices.length };
  }, [devices]);

  const filteredDevices = useMemo(() => {
    return devices.filter((device) => {
      if (filterHealth === "all") return true;
      return getDeviceHealth(device) === filterHealth;
    });
  }, [devices, filterHealth]);

  const selectedDeviceData = useMemo(() => {
    return devices.find((d) => d.deviceId === selectedDevice);
  }, [selectedDevice, devices]);

  const getStatusColor = (health: string) => {
    switch (health) {
      case "healthy":
        return "bg-green-500/20 border-green-500/30";
      case "warning":
        return "bg-yellow-500/20 border-yellow-500/30";
      case "critical":
        return "bg-red-500/20 border-red-500/30";
      default:
        return "bg-gray-500/20 border-gray-500/30";
    }
  };

  return (
    <DashboardLayout>
      <div className="w-full h-full flex flex-col bg-background">
        {/* Header */}
        <div className="p-6 border-b border-border bg-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <MapPin className="w-6 h-6" />
                Real-Time Bin Tracking
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Live GPS tracking with device status monitoring
              </p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20">
              <Activity className="w-4 h-4 text-primary animate-pulse" />
              <span className="text-xs font-medium text-primary">Live Tracking</span>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className="bg-background rounded-lg p-3 border border-border">
              <div className="text-2xl font-bold text-blue-500">{stats.total}</div>
              <div className="text-xs text-muted-foreground">Total Bins</div>
            </div>
            <div className="bg-background rounded-lg p-3 border border-border">
              <div className="text-2xl font-bold text-green-500">{stats.online}</div>
              <div className="text-xs text-muted-foreground">Online</div>
            </div>
            <div className="bg-background rounded-lg p-3 border border-border">
              <div className="text-2xl font-bold text-green-500">{stats.healthy}</div>
              <div className="text-xs text-muted-foreground">Healthy</div>
            </div>
            <div className="bg-background rounded-lg p-3 border border-border">
              <div className="text-2xl font-bold text-yellow-500">{stats.warning}</div>
              <div className="text-xs text-muted-foreground">Warning</div>
            </div>
            <div className="bg-background rounded-lg p-3 border border-border">
              <div className="text-2xl font-bold text-red-500">{stats.critical}</div>
              <div className="text-xs text-muted-foreground">Critical</div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden flex gap-4 p-6">
          {/* Grid Map Visualization */}
          <div className="flex-1 flex flex-col">
            <div className="mb-4 flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <div className="flex gap-2 text-sm">
                {(["all", "healthy", "warning", "critical"] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilterHealth(status)}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      filterHealth === status
                        ? "bg-primary text-primary-foreground"
                        : "bg-background border border-border hover:border-primary/50"
                    }`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 bg-card rounded-lg border border-border p-6 overflow-auto">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-4">
                {filteredDevices.map((device) => {
                  const health = getDeviceHealth(device);
                  const isSelected = selectedDevice === device.deviceId;

                  return (
                    <button
                      key={device.deviceId}
                      onClick={() => setSelectedDevice(device.deviceId)}
                      className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                        isSelected
                          ? "border-primary bg-primary/5 scale-105"
                          : `border-border ${getStatusColor(health)} hover:border-primary`
                      }`}
                    >
                      <div className="text-left">
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-semibold text-sm text-foreground truncate">
                            {device.name}
                          </div>
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{
                              backgroundColor:
                                device.status === "online"
                                  ? health === "healthy"
                                    ? "#22c55e"
                                    : health === "warning"
                                      ? "#eab308"
                                      : "#ef4444"
                                  : "#888888",
                            }}
                          />
                        </div>

                        <div className="space-y-1 text-xs text-muted-foreground">
                          <div className="flex justify-between">
                            <span>Fill:</span>
                            <span className="font-medium text-foreground">{device.fillLevel}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Temp:</span>
                            <span className="font-medium text-foreground">{device.temperature}°C</span>
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <span>Battery:</span>
                            <span className="font-medium text-foreground">{device.batteryLevel}%</span>
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Details Panel */}
          <div className="w-96 bg-card rounded-lg border border-border p-6 overflow-y-auto">
            {selectedDeviceData ? (
              <>
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-foreground">{selectedDeviceData.name}</h3>
                    <DeviceStatusBadge status={getDeviceHealth(selectedDeviceData)} size="sm" />
                  </div>

                  <div className="space-y-4">
                    {/* Status Info */}
                    <div className="bg-background rounded-lg p-4 border border-border">
                      <h4 className="font-semibold text-sm text-foreground mb-3">Status</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Device Status:</span>
                          <span
                            className={`font-medium ${
                              selectedDeviceData.status === "online"
                                ? "text-green-500"
                                : "text-red-500"
                            }`}
                          >
                            {selectedDeviceData.status === "online" ? "Online" : "Offline"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Location:</span>
                          <span className="font-medium text-foreground">
                            {selectedDeviceData.latitude.toFixed(4)}, {selectedDeviceData.longitude.toFixed(4)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Last Heartbeat:</span>
                          <span className="font-medium text-foreground text-xs">
                            {new Date(selectedDeviceData.lastHeartbeat).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Bin Data */}
                    <div className="bg-background rounded-lg p-4 border border-border">
                      <h4 className="font-semibold text-sm text-foreground mb-3">Bin Status</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Fill Level:</span>
                          <span className="font-medium text-foreground">{selectedDeviceData.fillLevel}%</span>
                        </div>
                        <div className="w-full bg-background rounded-full h-2 border border-border overflow-hidden">
                          <div
                            className={`h-full transition-all ${
                              selectedDeviceData.fillLevel > 80
                                ? "bg-red-500"
                                : selectedDeviceData.fillLevel > 60
                                  ? "bg-yellow-500"
                                  : "bg-green-500"
                            }`}
                            style={{ width: `${selectedDeviceData.fillLevel}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Environmental Data */}
                    <div className="bg-background rounded-lg p-4 border border-border">
                      <h4 className="font-semibold text-sm text-foreground mb-3">Environment</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Temperature:</span>
                          <span className="font-medium text-foreground">{selectedDeviceData.temperature}°C</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Humidity:</span>
                          <span className="font-medium text-foreground">{selectedDeviceData.humidity}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">GPS Accuracy:</span>
                          <span className="font-medium text-foreground">{selectedDeviceData.gpsAccuracy}m</span>
                        </div>
                      </div>
                    </div>

                    {/* Device Health */}
                    <div className="bg-background rounded-lg p-4 border border-border">
                      <h4 className="font-semibold text-sm text-foreground mb-3">Device Health</h4>
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm text-muted-foreground">Battery</span>
                            <span className="text-sm font-medium text-foreground">
                              {selectedDeviceData.batteryLevel}%
                            </span>
                          </div>
                          <BatteryIndicator level={selectedDeviceData.batteryLevel} />
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Signal Strength:</span>
                          <span className="font-medium text-foreground">{selectedDeviceData.signal}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Sensor Errors:</span>
                          <span className="font-medium text-foreground">{selectedDeviceData.sensorErrors}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Uptime:</span>
                          <span className="font-medium text-foreground">
                            {Math.floor(selectedDeviceData.uptime / 3600)}h
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={() =>
                    navigate(`/dustbin/${selectedDeviceData.pin}/${selectedDeviceData.binId}`)
                  }
                  className="w-full gap-2"
                >
                  <MapPin className="w-4 h-4" />
                  View Full Details
                </Button>
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <MapPin className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
                <p className="text-muted-foreground">Select a bin from the grid to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

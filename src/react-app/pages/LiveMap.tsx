import React, { useMemo, useRef, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { useNavigate } from "react-router";
import DashboardLayout from "@/react-app/components/layout/DashboardLayout";
import { useIoTDevice } from "@/react-app/context/IoTDeviceContext";
import { BatteryIndicator } from "@/react-app/components/BatteryIndicator";
import { DeviceStatusBadge } from "@/react-app/components/DeviceStatusBadge";
import { Button } from "@/react-app/components/ui/button";
import { MapPin, AlertTriangle, Activity } from "lucide-react";
import { getDeviceHealth } from "@/react-app/types";
import "leaflet/dist/leaflet.css";

// Custom marker icons
const createMarkerIcon = (priority: string, online: boolean) => {
  const colors: Record<string, string> = {
    Critical: "#ef4444",
    Medium: "#eab308",
    Normal: "#22c55e",
  };

  const color = colors[priority] || "#22c55e";
  const opacity = online ? 1 : 0.5;

  return L.divIcon({
    html: `
      <div class="flex items-center justify-center w-10 h-10 rounded-full border-2 border-white shadow-lg" style="background-color: ${color}; opacity: ${opacity};">
        <div class="w-3 h-3 bg-white rounded-full"></div>
      </div>
    `,
    className: "custom-marker",
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20],
  });
};

// Map center component to animate to active marker
const MapRecenter: React.FC<{ center: [number, number] }> = ({ center }) => {
  const map = useMap();

  useEffect(() => {
    map.setView(center, 14, { animate: true, duration: 1 });
  }, [center, map]);

  return null;
};

export default function LiveMapPage() {
  const navigate = useNavigate();
  const { devices } = useIoTDevice();
  const mapRef = useRef(null);
  const [selectedDevice, setSelectedDevice] = React.useState<string | null>(null);

  // Gorakhpur coordinates
  const mapCenter: [number, number] = [26.7606, 83.1831];

  const stats = useMemo(() => {
    const online = devices.filter((d) => d.status === "online").length;
    const critical = devices.filter((d) => d.fillLevel > 80).length;
    const healthy = devices.filter((d) => getDeviceHealth(d) === "healthy").length;

    return { online, critical, healthy, total: devices.length };
  }, [devices]);

  const selectedDeviceLocation = useMemo(() => {
    if (!selectedDevice) return mapCenter;
    const device = devices.find((d) => d.deviceId === selectedDevice);
    return device ? ([device.latitude, device.longitude] as [number, number]) : mapCenter;
  }, [selectedDevice, devices]);

  return (
    <DashboardLayout>
      <div ref={mapRef} className="w-full h-full flex flex-col bg-background">
        {/* Header */}
        <div className="p-6 border-b border-border bg-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <MapPin className="w-6 h-6" />
                Real-Time Bin Tracking
              </h1>
              <p className="text-sm text-muted-foreground mt-1">Live GPS tracking with device status monitoring</p>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-background rounded-lg p-3 border border-border">
              <div className="text-2xl font-bold text-green-500">{stats.online}</div>
              <div className="text-xs text-muted-foreground">Online Devices</div>
            </div>
            <div className="bg-background rounded-lg p-3 border border-border">
              <div className="text-2xl font-bold text-green-500">{stats.healthy}</div>
              <div className="text-xs text-muted-foreground">Healthy</div>
            </div>
            <div className="bg-background rounded-lg p-3 border border-border">
              <div className="text-2xl font-bold text-yellow-500">{stats.critical}</div>
              <div className="text-xs text-muted-foreground">Needing Attention</div>
            </div>
            <div className="bg-background rounded-lg p-3 border border-border">
              <div className="text-2xl font-bold text-blue-500">{stats.total}</div>
              <div className="text-xs text-muted-foreground">Total Bins</div>
            </div>
          </div>
        </div>

        {/* Map Container */}
        <div className="flex-1 relative overflow-hidden">
          <MapContainer
            center={mapCenter}
            zoom={14}
            style={{ height: "100%", width: "100%" }}
            className="leaflet-container"
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            />

            {selectedDevice && <MapRecenter center={selectedDeviceLocation} />}

            {devices.map((device) => (
              <Marker
                key={device.deviceId}
                position={[device.latitude, device.longitude]}
                icon={createMarkerIcon(device.status === "online" ? (device.fillLevel > 80 ? "Critical" : device.fillLevel > 60 ? "Medium" : "Normal") : "Normal", device.status === "online")}
                eventHandlers={{
                  click: () => setSelectedDevice(device.deviceId),
                }}
              >
                <Popup>
                  <div className="min-w-80 p-3">
                    <div className="font-semibold mb-3 text-foreground flex items-center justify-between">
                      <span>{device.name}</span>
                      <DeviceStatusBadge status={getDeviceHealth(device)} size="sm" showLabel={false} />
                    </div>

                    <div className="space-y-2 text-sm mb-4">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Fill Level:</span>
                        <span className="font-medium">{device.fillLevel}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Temperature:</span>
                        <span className="font-medium">{device.temperature}°C</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Humidity:</span>
                        <span className="font-medium">{device.humidity}%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Battery:</span>
                        <BatteryIndicator level={device.batteryLevel} size="sm" />
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Signal:</span>
                        <span className="font-medium">{device.signal}%</span>
                      </div>
                    </div>

                    <Button
                      className="w-full"
                      onClick={() => navigate(`/dustbin/${device.pin}/${device.binId}`)}
                    >
                      View Details
                    </Button>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {/* Device List Panel */}
        <div className="border-t border-border bg-card max-h-64 overflow-y-auto">
          <div className="p-4">
            <h3 className="font-semibold mb-3 text-foreground text-sm">Tracked Devices ({devices.length})</h3>
            <div className="space-y-2">
              {devices.map((device) => (
                <div
                  key={device.deviceId}
                  onClick={() => setSelectedDevice(device.deviceId)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    selectedDevice === device.deviceId
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="font-medium text-sm text-foreground flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: device.status === "online" ? "#22c55e" : "#888" }} />
                      {device.name}
                    </div>
                    <DeviceStatusBadge status={getDeviceHealth(device)} size="sm" showLabel={false} />
                  </div>
                  <div className="text-xs text-muted-foreground flex justify-between">
                    <span>{device.fillLevel}% • {device.temperature}°C</span>
                    <BatteryIndicator level={device.batteryLevel} size="sm" showLabel={true} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

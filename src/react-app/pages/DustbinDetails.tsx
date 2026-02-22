import { useParams, useNavigate } from "react-router";
import {
  ArrowLeft,
  Trash2,
  Thermometer,
  Droplets,
  Clock,
  MapPin,
} from "lucide-react";
import { Button } from "@/react-app/components/ui/button";
import { Card } from "@/react-app/components/ui/card";
import { useIoTSimulation } from "@/react-app/context/IoTSimulationContext";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { cn } from "@/react-app/lib/utils";

export default function DustbinDetailsPage() {
  const { pin, id } = useParams<{ pin: string; id: string }>();
  const navigate = useNavigate();
  const { postcodes, manuallyEmptyBin } = useIoTSimulation();

  const postcode = postcodes.find((p) => p.pin === pin);
  const dustbin = postcode?.dustbins.find((d) => d.id === id);

  if (!postcode || !dustbin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center">
          <p className="text-muted-foreground mb-4">Dustbin not found</p>
          <Button onClick={() => navigate("/dashboard")}>
            Back to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  // Simulated historical data
  const historicalData = [
    { time: "00:00", fill: 25, temp: 18, humidity: 45 },
    { time: "04:00", fill: 32, temp: 16, humidity: 52 },
    { time: "08:00", fill: 48, temp: 20, humidity: 48 },
    { time: "12:00", fill: 62, temp: 25, humidity: 42 },
    { time: "16:00", fill: 75, temp: 28, humidity: 38 },
    { time: "20:00", fill: Math.round(dustbin.fillLevel), temp: dustbin.temperatureC || 22, humidity: dustbin.humidityPercent || 45 },
  ];

  const statusColor = {
    Normal:
      "bg-green-500/20 text-green-400 border-green-500/30",
    Medium:
      "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    Critical:
      "bg-red-500/20 text-red-400 border-red-500/30",
  }[dustbin.priority || "Normal"];

  const progressColor = {
    Normal: "bg-green-500",
    Medium: "bg-yellow-500",
    Critical: "bg-red-500",
  }[dustbin.priority || "Normal"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/dashboard")}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Bin {dustbin.id}
            </h1>
            <p className="text-muted-foreground">
              Detailed monitoring and analytics
            </p>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* Fill Level */}
          <Card className="rounded-2xl p-6 border-border/50 bg-card/50 backdrop-blur">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-muted-foreground text-sm mb-1">Fill Level</p>
                <p className="text-4xl font-bold text-foreground">
                  {Math.round(dustbin.fillLevel)}%
                </p>
              </div>
              <div
                className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center",
                  dustbin.priority === "Normal"
                    ? "bg-green-500/20"
                    : dustbin.priority === "Medium"
                    ? "bg-yellow-500/20"
                    : "bg-red-500/20"
                )}
              >
                <Trash2
                  className={cn(
                    "w-6 h-6",
                    dustbin.priority === "Normal"
                      ? "text-green-400"
                      : dustbin.priority === "Medium"
                      ? "text-yellow-400"
                      : "text-red-400"
                  )}
                />
              </div>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div
                className={cn("h-full rounded-full transition-all duration-300", progressColor)}
                style={{ width: `${Math.min(100, dustbin.fillLevel)}%` }}
              />
            </div>
            <p className={cn("text-xs mt-3 font-semibold px-2.5 py-1 rounded-lg border w-fit", statusColor)}>
              {dustbin.priority || "Normal"}
            </p>
          </Card>

          {/* Temperature */}
          <Card className="rounded-2xl p-6 border-border/50 bg-card/50 backdrop-blur">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-muted-foreground text-sm mb-1">
                  Temperature
                </p>
                <p className="text-4xl font-bold text-foreground">
                  {Math.round(dustbin.temperatureC || 22)}°C
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-orange-500/20">
                <Thermometer className="w-6 h-6 text-orange-400" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Ambient sensor reading
            </p>
          </Card>

          {/* Humidity */}
          <Card className="rounded-2xl p-6 border-border/50 bg-card/50 backdrop-blur">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-muted-foreground text-sm mb-1">Humidity</p>
                <p className="text-4xl font-bold text-foreground">
                  {Math.round(dustbin.humidityPercent || 45)}%
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-blue-500/20">
                <Droplets className="w-6 h-6 text-blue-400" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Environmental humidity
            </p>
          </Card>
        </div>

        {/* Location and Metadata */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Location Info */}
          <Card className="rounded-2xl p-6 border-border/50 bg-card/50 backdrop-blur">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Location Information
            </h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Location</p>
                  <p className="font-medium text-foreground">
                    {dustbin.location}
                  </p>
                </div>
              </div>
              <div className="pt-4 border-t border-border/20">
                <p className="text-xs text-muted-foreground mb-2">Area</p>
                <p className="font-semibold text-foreground">{postcode.area}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  PIN Code: {postcode.pin}
                </p>
              </div>
            </div>
          </Card>

          {/* Status & Actions */}
          <Card className="rounded-2xl p-6 border-border/50 bg-card/50 backdrop-blur">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Quick Actions
            </h2>
            <div className="space-y-3">
              <Button
                onClick={() => manuallyEmptyBin(pin, id)}
                className="w-full gap-2 bg-primary hover:bg-primary/90"
              >
                <Trash2 className="w-4 h-4" />
                Empty Bin Now
              </Button>
              <Button variant="outline" className="w-full">
                Schedule Emptying
              </Button>
              <Button variant="outline" className="w-full">
                Report Issue
              </Button>
            </div>
            {dustbin.lastUpdate && (
              <div className="mt-4 pt-4 border-t border-border/20 flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>
                  Last updated:{" "}
                  {dustbin.lastUpdate.toLocaleTimeString()}
                </span>
              </div>
            )}
          </Card>
        </div>

        {/* Historical Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Fill Level History */}
          <Card className="rounded-2xl p-6 border-border/50 bg-card/50 backdrop-blur">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Fill Level History
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={historicalData}>
                <defs>
                  <linearGradient
                    id="colorFill"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor="#3b82f6"
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor="#3b82f6"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(100, 100, 100, 0.1)"
                />
                <XAxis
                  dataKey="time"
                  stroke="rgba(100, 100, 100, 0.5)"
                  style={{ fontSize: "12px" }}
                />
                <YAxis
                  stroke="rgba(100, 100, 100, 0.5)"
                  style={{ fontSize: "12px" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(30, 30, 30, 0.95)",
                    border: "1px solid rgba(100, 100, 100, 0.2)",
                    borderRadius: "8px",
                  }}
                  labelStyle={{ color: "#fff" }}
                />
                <Area
                  type="monotone"
                  dataKey="fill"
                  stroke="#3b82f6"
                  fillOpacity={1}
                  fill="url(#colorFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>

          {/* Environmental Data */}
          <Card className="rounded-2xl p-6 border-border/50 bg-card/50 backdrop-blur">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Environmental Conditions
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={historicalData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(100, 100, 100, 0.1)"
                />
                <XAxis
                  dataKey="time"
                  stroke="rgba(100, 100, 100, 0.5)"
                  style={{ fontSize: "12px" }}
                />
                <YAxis
                  yAxisId="left"
                  stroke="rgba(100, 100, 100, 0.5)"
                  style={{ fontSize: "12px" }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  stroke="rgba(100, 100, 100, 0.5)"
                  style={{ fontSize: "12px" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(30, 30, 30, 0.95)",
                    border: "1px solid rgba(100, 100, 100, 0.2)",
                    borderRadius: "8px",
                  }}
                  labelStyle={{ color: "#fff" }}
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="temp"
                  stroke="#f97316"
                  name="Temperature (°C)"
                  strokeWidth={2}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="humidity"
                  stroke="#0ea5e9"
                  name="Humidity (%)"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </div>
      </div>
    </div>
  );
}

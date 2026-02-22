import { useNavigate } from "react-router";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/react-app/components/ui/button";
import { Card } from "@/react-app/components/ui/card";
import { useIoTSimulation } from "@/react-app/context/IoTSimulationContext";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function AnalyticsPage() {
  const navigate = useNavigate();
  const { postcodes } = useIoTSimulation();

  // Calculate metrics
  const totalBins = postcodes.reduce((sum, p) => sum + p.dustbins.length, 0);
  const binsNeedingAttention = postcodes.reduce(
    (sum, p) =>
      sum + p.dustbins.filter((d) => d.fillLevel > 80).length,
    0
  );
  const avgFillLevel =
    postcodes.reduce(
      (sum, p) =>
        sum + p.dustbins.reduce((s, d) => s + d.fillLevel, 0),
      0
    ) / totalBins || 0;

  // Data for area chart (simulated 24-hour data)
  const utilizationData = [
    { time: "00:00", fill: 25, capacity: 100 },
    { time: "02:00", fill: 32, capacity: 100 },
    { time: "04:00", fill: 28, capacity: 100 },
    { time: "06:00", fill: 45, capacity: 100 },
    { time: "08:00", fill: 58, capacity: 100 },
    { time: "10:00", fill: 68, capacity: 100 },
    { time: "12:00", fill: 72, capacity: 100 },
    { time: "14:00", fill: 75, capacity: 100 },
    { time: "16:00", fill: 78, capacity: 100 },
    { time: "18:00", fill: 82, capacity: 100 },
    { time: "20:00", fill: 85, capacity: 100 },
    { time: "22:00", fill: 89, capacity: 100 },
  ];

  // Data for distribution by area
  const areaDistributionData = postcodes.map((p) => ({
    area: p.area.slice(0, 20), // Truncate long names
    avgFill:
      p.dustbins.reduce((sum, d) => sum + d.fillLevel, 0) /
      p.dustbins.length,
    binCount: p.dustbins.length,
  }));

  // Priority breakdown
  const priorityCount = {
    Normal: postcodes.reduce(
      (sum, p) =>
        sum +
        p.dustbins.filter((d) => d.priority === "Normal").length,
      0
    ),
    Medium: postcodes.reduce(
      (sum, p) =>
        sum +
        p.dustbins.filter((d) => d.priority === "Medium").length,
      0
    ),
    Critical: postcodes.reduce(
      (sum, p) =>
        sum +
        p.dustbins.filter((d) => d.priority === "Critical").length,
      0
    ),
  };

  const priorityData = [
    { name: "Normal", value: priorityCount.Normal, color: "#22c55e" },
    { name: "Medium", value: priorityCount.Medium, color: "#eab308" },
    { name: "Critical", value: priorityCount.Critical, color: "#ef4444" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-6">
      <div className="max-w-7xl mx-auto">
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
            <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
            <p className="text-muted-foreground">
              Real-time monitoring and utilization insights
            </p>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="rounded-2xl p-6 border-border/50 bg-gradient-to-br from-blue-500/5 to-blue-500/0">
            <p className="text-muted-foreground text-sm mb-2">Total Bins</p>
            <p className="text-4xl font-bold text-foreground">{totalBins}</p>
            <p className="text-xs text-muted-foreground mt-2">
              Being monitored
            </p>
          </Card>
          <Card className="rounded-2xl p-6 border-border/50 bg-gradient-to-br from-red-500/5 to-red-500/0">
            <p className="text-muted-foreground text-sm mb-2">
              Needing Attention
            </p>
            <p className="text-4xl font-bold text-red-400">{binsNeedingAttention}</p>
            <p className="text-xs text-muted-foreground mt-2">
              Fill level {">"}80%
            </p>
          </Card>
          <Card className="rounded-2xl p-6 border-border/50 bg-gradient-to-br from-yellow-500/5 to-yellow-500/0">
            <p className="text-muted-foreground text-sm mb-2">
              Average Fill Level
            </p>
            <p className="text-4xl font-bold text-yellow-400">
              {Math.round(avgFillLevel)}%
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Across all bins
            </p>
          </Card>
          <Card className="rounded-2xl p-6 border-border/50 bg-gradient-to-br from-green-500/5 to-green-500/0">
            <p className="text-muted-foreground text-sm mb-2">
              System Status
            </p>
            <p className="text-4xl font-bold text-green-400">Active</p>
            <p className="text-xs text-muted-foreground mt-2">
              IoT simulation running
            </p>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Utilization Chart */}
          <Card className="rounded-2xl p-6 border-border/50 bg-card/50 backdrop-blur">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              24-Hour Utilization Trend
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={utilizationData}>
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

          {/* Distribution by Area */}
          <Card className="rounded-2xl p-6 border-border/50 bg-card/50 backdrop-blur">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Distribution by Area
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={areaDistributionData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(100, 100, 100, 0.1)"
                />
                <XAxis
                  dataKey="area"
                  stroke="rgba(100, 100, 100, 0.5)"
                  style={{ fontSize: "11px" }}
                  angle={-15}
                  textAnchor="end"
                  height={80}
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
                <Bar
                  dataKey="avgFill"
                  fill="#eab308"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Priority Breakdown */}
        <Card className="rounded-2xl p-6 border-border/50 bg-card/50 backdrop-blur">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Priority Breakdown
          </h2>
          <div className="flex flex-col lg:flex-row items-center gap-8">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={priorityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {priorityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(30, 30, 30, 0.95)",
                    border: "1px solid rgba(100, 100, 100, 0.2)",
                    borderRadius: "8px",
                  }}
                  labelStyle={{ color: "#fff" }}
                />
              </PieChart>
            </ResponsiveContainer>

            <div className="space-y-4">
              {priorityData.map((item) => (
                <div key={item.name} className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <div>
                    <p className="font-semibold text-foreground">
                      {item.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {item.value} bins
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

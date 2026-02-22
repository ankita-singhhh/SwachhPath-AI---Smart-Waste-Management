import { useNavigate } from "react-router";
import { ArrowLeft, RotateCcw, Brain, Trash2 } from "lucide-react";
import { Button } from "@/react-app/components/ui/button";
import { Card } from "@/react-app/components/ui/card";
import { Slider } from "@/react-app/components/ui/slider";
import { Switch } from "@/react-app/components/ui/switch";
import { Label } from "@/react-app/components/ui/label";
import { useIoTSimulation } from "@/react-app/context/IoTSimulationContext";
import { useAIInsights } from "@/react-app/context/AIInsightsContext";
import { useState } from "react";

export default function SettingsPage() {
  const navigate = useNavigate();
  const { settings, updateSettings, resetAllData, isSimulating } =
    useIoTSimulation();
  const { generateInsights, clearInsights } = useAIInsights();

  const [fillRateMin, setFillRateMin] = useState(settings.fillRateMin);
  const [fillRateMax, setFillRateMax] = useState(settings.fillRateMax);
  const [alertThreshold, setAlertThreshold] = useState(settings.alertThreshold);
  const [refreshInterval, setRefreshInterval] = useState(
    settings.refreshInterval / 1000
  );
  const [simulationEnabled, setSimulationEnabled] = useState(settings.enabled);
  const [aiEnabled, setAiEnabled] = useState(() => {
    return localStorage.getItem("ai_enabled") !== "false";
  });

  const handleSaveSettings = () => {
    updateSettings({
      fillRateMin,
      fillRateMax,
      alertThreshold,
      refreshInterval: refreshInterval * 1000,
      enabled: simulationEnabled,
    });
    localStorage.setItem("ai_enabled", String(aiEnabled));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-6">
      <div className="max-w-3xl mx-auto">
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
            <h1 className="text-3xl font-bold text-foreground">Settings</h1>
            <p className="text-muted-foreground">
              Configure IoT simulation and monitoring parameters
            </p>
          </div>
        </div>

        {/* IoT Simulation Settings */}
        <Card className="rounded-2xl p-8 border-border/50 bg-card/50 backdrop-blur mb-6">
          <h2 className="text-xl font-semibold text-foreground mb-6">
            IoT Simulation Configuration
          </h2>

          {/* Simulation Toggle */}
          <div className="mb-8 pb-8 border-b border-border/30">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base font-semibold text-foreground">
                  Enable IoT Simulation
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  {isSimulating
                    ? "Simulation is currently running"
                    : "Simulation is paused"}
                </p>
              </div>
              <Switch
                checked={simulationEnabled}
                onCheckedChange={setSimulationEnabled}
              />
            </div>
          </div>

          {/* Fill Rate Min */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <Label className="text-base font-semibold text-foreground">
                Minimum Fill Rate
              </Label>
              <span className="text-lg font-bold text-primary">
                {fillRateMin.toFixed(1)}%
              </span>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Minimum percentage increase per update cycle
            </p>
            <Slider
              value={[fillRateMin]}
              onValueChange={(value) => setFillRateMin(value[0])}
              min={0.5}
              max={10}
              step={0.5}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Range: 0.5% - 10%
            </p>
          </div>

          {/* Fill Rate Max */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <Label className="text-base font-semibold text-foreground">
                Maximum Fill Rate
              </Label>
              <span className="text-lg font-bold text-primary">
                {fillRateMax.toFixed(1)}%
              </span>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Maximum percentage increase per update cycle
            </p>
            <Slider
              value={[fillRateMax]}
              onValueChange={(value) => setFillRateMax(value[0])}
              min={fillRateMin + 0.5}
              max={15}
              step={0.5}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Range: {(fillRateMin + 0.5).toFixed(1)}% - 15%
            </p>
          </div>

          {/* Alert Threshold */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <Label className="text-base font-semibold text-foreground">
                Alert Threshold
              </Label>
              <span className="text-lg font-bold text-red-400">
                {alertThreshold}%
              </span>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Fill level at which alerts are triggered
            </p>
            <Slider
              value={[alertThreshold]}
              onValueChange={(value) => setAlertThreshold(value[0])}
              min={50}
              max={95}
              step={5}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Range: 50% - 95%
            </p>
          </div>

          {/* Refresh Interval */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <Label className="text-base font-semibold text-foreground">
                Update Interval
              </Label>
              <span className="text-lg font-bold text-primary">
                {refreshInterval}s
              </span>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              How often fill levels are updated (in seconds)
            </p>
            <Slider
              value={[refreshInterval]}
              onValueChange={(value) => setRefreshInterval(value[0])}
              min={1}
              max={30}
              step={1}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Range: 1s - 30s
            </p>
          </div>

          {/* Save Button */}
          <Button
            onClick={handleSaveSettings}
            className="w-full h-10 bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            Save Settings
          </Button>
        </Card>

        {/* AI Settings */}
        <Card className="rounded-2xl p-8 border-border/50 bg-card/50 backdrop-blur mb-6">
          <h2 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            AI Insights Configuration
          </h2>

          {/* AI Toggle */}
          <div className="mb-8 pb-8 border-b border-border/30">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base font-semibold text-foreground">
                  Enable AI Insights
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Generate Gemini AI-powered predictions and recommendations
                </p>
              </div>
              <Switch
                checked={aiEnabled}
                onCheckedChange={setAiEnabled}
              />
            </div>
          </div>

          {/* AI Actions */}
          {aiEnabled && (
            <div className="space-y-3">
              <Button
                onClick={() => generateInsights()}
                className="w-full gap-2"
              >
                <Brain className="w-4 h-4" />
                Generate New Insights
              </Button>
              <Button
                onClick={() => clearInsights()}
                variant="outline"
                className="w-full gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Clear All Insights
              </Button>
            </div>
          )}
        </Card>

        {/* Data Management */}
        <Card className="rounded-2xl p-8 border-border/50 bg-card/50 backdrop-blur mb-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Data Management
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            Reset all simulated data and restore default bin states
          </p>
          <Button
            onClick={resetAllData}
            variant="destructive"
            className="w-full gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Reset All Data
          </Button>
        </Card>

        {/* Status Information */}
        <Card className="rounded-2xl p-8 border-border/50 bg-card/50 backdrop-blur">
          <h2 className="text-xl font-semibold text-foreground mb-4">
            System Status
          </h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-border/20">
              <span className="text-muted-foreground">Simulation Status</span>
              <span
                className={`font-semibold ${
                  isSimulating ? "text-green-400" : "text-yellow-400"
                }`}
              >
                {isSimulating ? "Running" : "Paused"}
              </span>
            </div>
            <div className="flex items-center justify-between pb-3 border-b border-border/20">
              <span className="text-muted-foreground">Current Fill Rate</span>
              <span className="font-semibold text-foreground">
                {fillRateMin.toFixed(1)}% - {fillRateMax.toFixed(1)}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Update Frequency</span>
              <span className="font-semibold text-foreground">
                Every {refreshInterval}s
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

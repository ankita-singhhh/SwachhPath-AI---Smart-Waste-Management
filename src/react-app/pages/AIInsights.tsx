import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import DashboardLayout from "@/react-app/components/layout/DashboardLayout";
import { useAIInsights } from "@/react-app/context/AIInsightsContext";
import { Button } from "@/react-app/components/ui/button";
import {
  Zap,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  X,
  Brain,
  Lightbulb,
  BarChart3,
} from "lucide-react";

const getImpactColor = (impact: string) => {
  switch (impact) {
    case "high":
      return "text-red-500 bg-red-500/10";
    case "medium":
      return "text-yellow-500 bg-yellow-500/10";
    case "low":
      return "text-blue-500 bg-blue-500/10";
    default:
      return "text-gray-500 bg-gray-500/10";
  }
};

const getTypeIcon = (type: string) => {
  switch (type) {
    case "prediction":
      return TrendingUp;
    case "recommendation":
      return Lightbulb;
    case "alert":
      return AlertTriangle;
    case "analysis":
      return BarChart3;
    default:
      return Zap;
  }
};

const getTypeLabel = (type: string) => {
  switch (type) {
    case "prediction":
      return "Prediction";
    case "recommendation":
      return "Recommendation";
    case "alert":
      return "Alert";
    case "analysis":
      return "Analysis";
    default:
      return "Insight";
  }
};

export default function AIInsightsPage() {
  const navigate = useNavigate();
  const { insights, loading, error, generateInsights, dismissInsight, clearInsights } = useAIInsights();
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    if (insights.length === 0) {
      generateInsights();
    }
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      generateInsights();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [autoRefresh, generateInsights]);

  const sortedInsights = [...insights].sort((a, b) => {
    const impactOrder = { high: 0, medium: 1, low: 2 };
    return impactOrder[a.impact as keyof typeof impactOrder] - impactOrder[b.impact as keyof typeof impactOrder];
  });

  const highImpactCount = insights.filter((i) => i.impact === "high").length;
  const averageConfidence =
    insights.length > 0
      ? (insights.reduce((sum, i) => sum + i.confidence, 0) / insights.length * 100).toFixed(0)
      : 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Brain className="w-8 h-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold text-foreground">AI-Powered Insights</h1>
                <p className="text-sm text-muted-foreground">Gemini-powered predictions and recommendations</p>
              </div>
            </div>
            <Button
              onClick={() => generateInsights()}
              disabled={loading}
              className="gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              {loading ? "Generating..." : "Refresh"}
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-background rounded-lg p-4 border border-border">
              <div className="text-2xl font-bold text-red-500">{highImpactCount}</div>
              <div className="text-xs text-muted-foreground">High Impact</div>
            </div>
            <div className="bg-background rounded-lg p-4 border border-border">
              <div className="text-2xl font-bold text-blue-500">{insights.length}</div>
              <div className="text-xs text-muted-foreground">Total Insights</div>
            </div>
            <div className="bg-background rounded-lg p-4 border border-border">
              <div className="text-2xl font-bold text-green-500">{averageConfidence}%</div>
              <div className="text-xs text-muted-foreground">Avg Confidence</div>
            </div>
            <div className="bg-background rounded-lg p-4 border border-border">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-xs text-muted-foreground">Auto Refresh</span>
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Insights Grid */}
        <div className="grid grid-cols-1 gap-4">
          {sortedInsights.length > 0 ? (
            sortedInsights.map((insight) => {
              const Icon = getTypeIcon(insight.type);
              return (
                <div
                  key={insight.id}
                  className="bg-card border border-border rounded-lg p-6 hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className={`p-3 rounded-lg ${getImpactColor(insight.impact)}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-foreground">{insight.title}</h3>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getImpactColor(insight.impact)}`}>
                            {getTypeLabel(insight.type)}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{insight.description}</p>

                        {/* Confidence Bar */}
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">Confidence:</span>
                          <div className="flex-1 max-w-xs bg-background rounded-full h-2 overflow-hidden">
                            <div
                              className="h-full bg-green-500 transition-all"
                              style={{ width: `${insight.confidence * 100}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium text-muted-foreground">
                            {(insight.confidence * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => dismissInsight(insight.id)}
                      className="ml-4 p-2 hover:bg-background rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                    </button>
                  </div>

                  {/* Action Items */}
                  {insight.actionable && insight.type !== "analysis" && (
                    <div className="flex gap-2 pt-4 border-t border-border">
                      {insight.type === "prediction" && insight.deviceId && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/dustbin/${insight.binId || ""}/device`)}
                        >
                          View Device
                        </Button>
                      )}
                      {insight.type === "recommendation" && (
                        <Button variant="outline" size="sm" onClick={() => navigate("/analytics")}>
                          View Analytics
                        </Button>
                      )}
                      {insight.type === "alert" && insight.deviceId && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate("/live-map")}
                        >
                          Check on Map
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="bg-card border border-border rounded-lg p-12 text-center">
              <Brain className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">No insights generated yet</p>
              <Button onClick={() => generateInsights()}>Generate First Insights</Button>
            </div>
          )}
        </div>

        {/* Clear All Button */}
        {insights.length > 0 && (
          <div className="flex justify-center">
            <Button variant="outline" onClick={clearInsights}>
              Clear All Insights
            </Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

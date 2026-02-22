import React from "react";
import { useNavigate } from "react-router";
import { Brain, ArrowRight, Lightbulb, AlertCircle, TrendingUp } from "lucide-react";
import { Button } from "@/react-app/components/ui/button";
import { useAIInsights } from "@/react-app/context/AIInsightsContext";
import { AIInsight } from "@/react-app/types";

const getTypeIcon = (type: string) => {
  switch (type) {
    case "prediction":
      return TrendingUp;
    case "recommendation":
      return Lightbulb;
    case "alert":
      return AlertCircle;
    default:
      return Brain;
  }
};

export const AISuggestionsCard: React.FC = () => {
  const navigate = useNavigate();
  const { insights, generateInsights, loading } = useAIInsights();

  const topInsights = insights.slice(0, 3);
  const highImpactCount = insights.filter((i) => i.impact === "high").length;

  if (insights.length === 0) {
    return (
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">AI Insights</h3>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => generateInsights()}
            disabled={loading}
          >
            Generate
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">No insights yet. Generate AI recommendations for your waste management system.</p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">Top AI Insights</h3>
          {highImpactCount > 0 && (
            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-red-500/20 text-red-500">
              {highImpactCount} High Impact
            </span>
          )}
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => navigate("/ai-insights")}
        >
          View All
        </Button>
      </div>

      <div className="space-y-3">
        {topInsights.map((insight) => {
          const Icon = getTypeIcon(insight.type);
          return (
            <div
              key={insight.id}
              className="p-3 rounded-lg bg-background border border-border/50 hover:border-primary/50 transition-colors cursor-pointer"
              onClick={() => navigate("/ai-insights")}
            >
              <div className="flex items-start gap-3">
                <Icon className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-foreground truncate">{insight.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{insight.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`px-1.5 py-0.5 text-xs rounded-full font-medium ${
                      insight.impact === "high" ? "bg-red-500/20 text-red-500" :
                      insight.impact === "medium" ? "bg-yellow-500/20 text-yellow-500" :
                      "bg-blue-500/20 text-blue-500"
                    }`}>
                      {insight.impact}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {(insight.confidence * 100).toFixed(0)}% confidence
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <Button
        className="w-full mt-4 gap-2"
        onClick={() => navigate("/ai-insights")}
      >
        View All Insights
        <ArrowRight className="w-4 h-4" />
      </Button>
    </div>
  );
};

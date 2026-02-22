import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { AIInsight } from "@/react-app/types";
import { geminiService } from "@/react-app/services/geminiService";
import { useIoTDevice } from "./IoTDeviceContext";

interface AIInsightsContextType {
  insights: AIInsight[];
  loading: boolean;
  error: string | null;
  generateInsights: () => Promise<void>;
  dismissInsight: (id: string) => void;
  clearInsights: () => void;
}

const AIInsightsContext = createContext<AIInsightsContextType | undefined>(undefined);

export const AIInsightsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [insights, setInsights] = useState<AIInsight[]>(() => {
    const stored = localStorage.getItem("ai_insights");
    return stored ? JSON.parse(stored) : [];
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { devices } = useIoTDevice();

  const generateInsights = useCallback(async () => {
    if (devices.length === 0 || !process.env.REACT_APP_GEMINI_API_KEY) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const newInsights: AIInsight[] = [];

      // Generate fill predictions for critical bins
      const criticalDevices = devices.filter((d) => d.fillLevel > 70);
      for (const device of criticalDevices.slice(0, 2)) {
        const prediction = await geminiService.generateFillPrediction(device);
        newInsights.push({
          id: `pred_${device.deviceId}_${Date.now()}`,
          type: prediction.type,
          title: prediction.title,
          description: prediction.description,
          impact: prediction.impact,
          confidence: prediction.confidence,
          deviceId: device.deviceId,
          createdAt: new Date().toISOString(),
          actionable: true,
        });
      }

      // Generate maintenance recommendation
      const maintenance = await geminiService.generateMaintenanceRecommendation(devices);
      newInsights.push({
        id: `maint_${Date.now()}`,
        type: maintenance.type,
        title: maintenance.title,
        description: maintenance.description,
        impact: maintenance.impact,
        confidence: maintenance.confidence,
        createdAt: new Date().toISOString(),
        actionable: true,
      });

      // Generate optimization strategy
      const strategy = await geminiService.generateOptimizationStrategy(devices);
      newInsights.push({
        id: `strat_${Date.now()}`,
        type: strategy.type,
        title: strategy.title,
        description: strategy.description,
        impact: strategy.impact,
        confidence: strategy.confidence,
        createdAt: new Date().toISOString(),
        actionable: true,
      });

      // Check for anomalies
      for (const device of devices) {
        const anomaly = await geminiService.analyzeAnomalies(device);
        if (anomaly) {
          newInsights.push({
            id: `anom_${device.deviceId}_${Date.now()}`,
            type: anomaly.type,
            title: anomaly.title,
            description: anomaly.description,
            impact: anomaly.impact,
            confidence: anomaly.confidence,
            deviceId: device.deviceId,
            createdAt: new Date().toISOString(),
            actionable: true,
          });
        }
      }

      setInsights(newInsights);
      localStorage.setItem("ai_insights", JSON.stringify(newInsights));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to generate insights";
      setError(message);
      console.error("[v0] AI Insights generation error:", err);
    } finally {
      setLoading(false);
    }
  }, [devices]);

  const dismissInsight = useCallback((id: string) => {
    setInsights((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const clearInsights = useCallback(() => {
    setInsights([]);
    localStorage.removeItem("ai_insights");
  }, []);

  // Auto-generate insights every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      generateInsights();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [generateInsights]);

  return (
    <AIInsightsContext.Provider
      value={{
        insights,
        loading,
        error,
        generateInsights,
        dismissInsight,
        clearInsights,
      }}
    >
      {children}
    </AIInsightsContext.Provider>
  );
};

export const useAIInsights = () => {
  const context = useContext(AIInsightsContext);
  if (!context) {
    throw new Error("useAIInsights must be used within AIInsightsProvider");
  }
  return context;
};

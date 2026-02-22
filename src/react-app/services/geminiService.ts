import { IoTDevice } from "@/react-app/types";

const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY || "";
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

export interface AIInsightResponse {
  type: "prediction" | "recommendation" | "alert" | "analysis";
  title: string;
  description: string;
  impact: "high" | "medium" | "low";
  confidence: number;
  actionItems?: string[];
}

class GeminiService {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async callGeminiAPI(prompt: string): Promise<string> {
    try {
      const response = await fetch(`${GEMINI_API_URL}?key=${this.apiKey}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 500,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const data = await response.json();
      const text =
        data.candidates?.[0]?.content?.parts?.[0]?.text || "No response";
      return text;
    } catch (error) {
      console.error("[v0] Gemini API error:", error);
      throw error;
    }
  }

  async generateFillPrediction(device: IoTDevice): Promise<AIInsightResponse> {
    const prompt = `As a smart waste management AI, analyze this bin data and provide a prediction:
    
Device: ${device.name}
Current Fill: ${device.fillLevel}%
Location: ${device.location}
Battery: ${device.batteryLevel}%
Signal: ${device.signal}%

Based on typical usage patterns, predict when this bin will be full and provide recommendations.
Respond in JSON format: {"type": "prediction", "title": "...", "description": "...", "impact": "high|medium|low", "confidence": 0.0-1.0, "actionItems": [...]}`;

    const response = await this.callGeminiAPI(prompt);
    try {
      const parsed = JSON.parse(response);
      return parsed as AIInsightResponse;
    } catch {
      return {
        type: "prediction",
        title: "Fill Level Prediction",
        description: response,
        impact: "medium",
        confidence: 0.8,
      };
    }
  }

  async generateMaintenanceRecommendation(
    devices: IoTDevice[]
  ): Promise<AIInsightResponse> {
    const offlineCount = devices.filter((d) => d.status === "offline").length;
    const lowBatteryCount = devices.filter((d) => d.batteryLevel < 30).length;

    const prompt = `As a smart waste management AI, analyze fleet health and provide maintenance recommendations:

Total Devices: ${devices.length}
Offline: ${offlineCount}
Low Battery: ${lowBatteryCount}
Average Fill: ${(devices.reduce((sum, d) => sum + d.fillLevel, 0) / devices.length).toFixed(1)}%
Average Signal: ${(devices.reduce((sum, d) => sum + d.signal, 0) / devices.length).toFixed(1)}%

Provide one key maintenance recommendation prioritized by impact.
Respond in JSON format: {"type": "recommendation", "title": "...", "description": "...", "impact": "high|medium|low", "confidence": 0.0-1.0, "actionItems": [...]}`;

    const response = await this.callGeminiAPI(prompt);
    try {
      const parsed = JSON.parse(response);
      return parsed as AIInsightResponse;
    } catch {
      return {
        type: "recommendation",
        title: "Fleet Maintenance Suggested",
        description: response,
        impact: lowBatteryCount > 0 ? "high" : "medium",
        confidence: 0.85,
      };
    }
  }

  async generateOptimizationStrategy(
    devices: IoTDevice[]
  ): Promise<AIInsightResponse> {
    const criticalBins = devices.filter((d) => d.fillLevel > 80).length;
    const averageFill =
      devices.reduce((sum, d) => sum + d.fillLevel, 0) / devices.length;

    const prompt = `As a smart waste management AI, analyze collection patterns and provide optimization strategy:

Total Bins: ${devices.length}
Critical (>80%): ${criticalBins}
Average Fill: ${averageFill.toFixed(1)}%
Areas Covered: Multiple zones in Gorakhpur

Provide one strategic optimization recommendation for route planning and resource allocation.
Respond in JSON format: {"type": "analysis", "title": "...", "description": "...", "impact": "high|medium|low", "confidence": 0.0-1.0, "actionItems": [...]}`;

    const response = await this.callGeminiAPI(prompt);
    try {
      const parsed = JSON.parse(response);
      return parsed as AIInsightResponse;
    } catch {
      return {
        type: "analysis",
        title: "Collection Optimization",
        description: response,
        impact: "medium",
        confidence: 0.8,
      };
    }
  }

  async analyzeAnomalies(device: IoTDevice): Promise<AIInsightResponse | null> {
    if (device.sensorErrors === 0 && device.batteryLevel > 30) {
      return null;
    }

    const issues = [];
    if (device.sensorErrors > 0) issues.push(`${device.sensorErrors} sensor errors`);
    if (device.batteryLevel < 30) issues.push(`Low battery: ${device.batteryLevel}%`);
    if (device.status === "offline") issues.push("Device offline");

    const prompt = `As a smart waste management AI, analyze these device anomalies and provide alert:
    
Device: ${device.name}
Issues: ${issues.join(", ")}
Status: ${device.status}

Provide a critical alert about the device issue.
Respond in JSON format: {"type": "alert", "title": "...", "description": "...", "impact": "high|medium|low", "confidence": 0.0-1.0, "actionItems": [...]}`;

    const response = await this.callGeminiAPI(prompt);
    try {
      const parsed = JSON.parse(response);
      return parsed as AIInsightResponse;
    } catch {
      return {
        type: "alert",
        title: "Device Alert",
        description: response,
        impact: device.status === "offline" ? "high" : "medium",
        confidence: 0.9,
      };
    }
  }
}

export const geminiService = new GeminiService(GEMINI_API_KEY);

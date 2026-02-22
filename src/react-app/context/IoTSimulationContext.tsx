import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
  useRef,
} from "react";
import { Postcode, Dustbin } from "@/react-app/types";
import postcodesData from "@/react-app/data/postcodes.json";

export interface EnhancedDustbin extends Dustbin {
  lastUpdate?: Date;
  priority: "Normal" | "Medium" | "Critical";
  alerted: boolean;
  temperatureC?: number;
  humidityPercent?: number;
}

export interface Alert {
  id: string;
  binId: string;
  area: string;
  pin: string;
  type: "overflow" | "maintenance";
  timestamp: Date;
  severity: "high" | "medium" | "low";
}

export interface EnhancedPostcode extends Postcode {
  dustbins: EnhancedDustbin[];
}

interface IoTSimulationSettings {
  fillRateMin: number;
  fillRateMax: number;
  alertThreshold: number;
  refreshInterval: number;
  enabled: boolean;
}

interface IoTContextType {
  postcodes: EnhancedPostcode[];
  alerts: Alert[];
  settings: IoTSimulationSettings;
  isSimulating: boolean;
  updateDustbinLevel: (
    postcodePin: string,
    dustbinId: string,
    newLevel: number
  ) => void;
  markDustbinEmptied: (postcodePin: string, dustbinId: string) => void;
  dismissAlert: (alertId: string) => void;
  updateSettings: (newSettings: Partial<IoTSimulationSettings>) => void;
  resetAllData: () => void;
  manuallyEmptyBin: (postcodePin: string, dustbinId: string) => void;
}

const IoTContext = createContext<IoTContextType | undefined>(undefined);

export function IoTSimulationProvider({ children }: { children: ReactNode }) {
  const [postcodes, setPostcodes] = useState<EnhancedPostcode[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [settings, setSettings] = useState<IoTSimulationSettings>({
    fillRateMin: 2,
    fillRateMax: 6,
    alertThreshold: 80,
    refreshInterval: 5000,
    enabled: true,
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastEmptyTimeRef = useRef<Record<string, number>>({});

  // Initialize data from localStorage or JSON
  useEffect(() => {
    const storedData = localStorage.getItem("swachhpath_iot_postcodes");
    const storedSettings = localStorage.getItem("swachhpath_iot_settings");
    const storedAlerts = localStorage.getItem("swachhpath_iot_alerts");

    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        setPostcodes(
          parsedData.map((pc: any) => ({
            ...pc,
            dustbins: pc.dustbins.map((db: any) => ({
              ...db,
              priority: calculatePriority(db.fillLevel || 0, 80),
              alerted: db.alerted || false,
              lastUpdate: db.lastUpdate ? new Date(db.lastUpdate) : new Date(),
            })),
          }))
        );
      } catch {
        initializeDefaultData();
      }
    } else {
      initializeDefaultData();
    }

    if (storedSettings) {
      try {
        setSettings(JSON.parse(storedSettings));
      } catch {
        console.error("Failed to parse settings");
      }
    }

    if (storedAlerts) {
      try {
        const parsed = JSON.parse(storedAlerts);
        setAlerts(
          parsed.map((a: any) => ({
            ...a,
            timestamp: new Date(a.timestamp),
          }))
        );
      } catch {
        console.error("Failed to parse alerts");
      }
    }
  }, []);

  const initializeDefaultData = useCallback(() => {
    const initializedData: EnhancedPostcode[] = (
      postcodesData.postcodes as Postcode[]
    ).map((postcode) => ({
      ...postcode,
      dustbins: postcode.dustbins.map((dustbin) => ({
        ...dustbin,
        fillLevel: Math.floor(Math.random() * 60) + 10,
        priority: "Normal" as const,
        alerted: false,
        lastUpdate: new Date(),
        temperatureC: 20 + Math.random() * 20,
        humidityPercent: 40 + Math.random() * 30,
      })),
    }));
    setPostcodes(initializedData);
  }, []);

  const calculatePriority = (
    fillLevel: number,
    threshold: number
  ): "Normal" | "Medium" | "Critical" => {
    if (fillLevel < 60) return "Normal";
    if (fillLevel < threshold) return "Medium";
    return "Critical";
  };

  // Save to localStorage whenever postcodes change
  useEffect(() => {
    if (postcodes.length > 0) {
      localStorage.setItem("swachhpath_iot_postcodes", JSON.stringify(postcodes));
    }
  }, [postcodes]);

  // Save alerts to localStorage
  useEffect(() => {
    localStorage.setItem("swachhpath_iot_alerts", JSON.stringify(alerts));
  }, [alerts]);

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem("swachhpath_iot_settings", JSON.stringify(settings));
  }, [settings]);

  // IoT Simulation Loop
  useEffect(() => {
    if (!settings.enabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setIsSimulating(false);
      return;
    }

    setIsSimulating(true);

    intervalRef.current = setInterval(() => {
      setPostcodes((prevPostcodes) => {
        const updatedPostcodes = prevPostcodes.map((postcode) => ({
          ...postcode,
          dustbins: postcode.dustbins.map((dustbin) => {
            // Calculate random fill increase (2-6%)
            const fillIncrease =
              Math.random() * (settings.fillRateMax - settings.fillRateMin) +
              settings.fillRateMin;
            const newFillLevel = Math.min(100, dustbin.fillLevel + fillIncrease);

            // Calculate priority based on new fill level
            const priority = calculatePriority(newFillLevel, settings.alertThreshold);

            // Add sensor data
            const temperatureC = 18 + Math.random() * 25;
            const humidityPercent = 35 + Math.random() * 50;

            return {
              ...dustbin,
              fillLevel: newFillLevel,
              priority,
              lastUpdate: new Date(),
              temperatureC,
              humidityPercent,
              alerted:
                newFillLevel > settings.alertThreshold
                  ? true
                  : dustbin.alerted,
            };
          }),
        }));

        // Check for overflow conditions and create alerts
        setAlerts((prevAlerts) => {
          const newAlerts = [...prevAlerts];
          updatedPostcodes.forEach((postcode) => {
            postcode.dustbins.forEach((dustbin) => {
              if (
                dustbin.fillLevel > settings.alertThreshold &&
                !newAlerts.some((a) => a.binId === dustbin.id)
              ) {
                const alertId = `alert_${dustbin.id}_${Date.now()}`;
                newAlerts.push({
                  id: alertId,
                  binId: dustbin.id,
                  area: postcode.area,
                  pin: postcode.pin,
                  type: "overflow",
                  timestamp: new Date(),
                  severity: dustbin.fillLevel > 95 ? "high" : "medium",
                });
              }
            });
          });
          return newAlerts;
        });

        return updatedPostcodes;
      });
    }, settings.refreshInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setIsSimulating(false);
    };
  }, [settings]);

  const updateDustbinLevel = useCallback(
    (postcodePin: string, dustbinId: string, newLevel: number) => {
      setPostcodes((prev) =>
        prev.map((postcode) =>
          postcode.pin === postcodePin
            ? {
                ...postcode,
                dustbins: postcode.dustbins.map((dustbin) =>
                  dustbin.id === dustbinId
                    ? {
                        ...dustbin,
                        fillLevel: Math.min(100, Math.max(0, newLevel)),
                        priority: calculatePriority(
                          Math.min(100, Math.max(0, newLevel)),
                          settings.alertThreshold
                        ),
                        lastUpdate: new Date(),
                        alerted: false,
                      }
                    : dustbin
                ),
              }
            : postcode
        )
      );
    },
    [settings.alertThreshold]
  );

  const markDustbinEmptied = useCallback(
    (postcodePin: string, dustbinId: string) => {
      updateDustbinLevel(postcodePin, dustbinId, 0);
      lastEmptyTimeRef.current[dustbinId] = Date.now();
    },
    [updateDustbinLevel]
  );

  const manuallyEmptyBin = useCallback(
    (postcodePin: string, dustbinId: string) => {
      markDustbinEmptied(postcodePin, dustbinId);
      // Remove related alerts
      setAlerts((prev) => prev.filter((alert) => alert.binId !== dustbinId));
    },
    [markDustbinEmptied]
  );

  const dismissAlert = useCallback((alertId: string) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== alertId));
  }, []);

  const updateSettings = useCallback(
    (newSettings: Partial<IoTSimulationSettings>) => {
      setSettings((prev) => ({ ...prev, ...newSettings }));
    },
    []
  );

  const resetAllData = useCallback(() => {
    localStorage.removeItem("swachhpath_iot_postcodes");
    localStorage.removeItem("swachhpath_iot_alerts");
    initializeDefaultData();
    setAlerts([]);
  }, [initializeDefaultData]);

  return (
    <IoTContext.Provider
      value={{
        postcodes,
        alerts,
        settings,
        isSimulating,
        updateDustbinLevel,
        markDustbinEmptied,
        dismissAlert,
        updateSettings,
        resetAllData,
        manuallyEmptyBin,
      }}
    >
      {children}
    </IoTContext.Provider>
  );
}

export function useIoTSimulation() {
  const context = useContext(IoTContext);
  if (context === undefined) {
    throw new Error(
      "useIoTSimulation must be used within an IoTSimulationProvider"
    );
  }
  return context;
}

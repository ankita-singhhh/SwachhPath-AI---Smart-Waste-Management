import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
  useRef,
} from "react";
import { IoTDevice, IoTStreamData, getDeviceHealth } from "@/react-app/types";
import iotStreamData from "@/react-app/data/iot_stream.json";

interface IoTDeviceContextType {
  devices: IoTDevice[];
  getDeviceById: (deviceId: string) => IoTDevice | undefined;
  getDevicesByPin: (pin: string) => IoTDevice[];
  updateDeviceStatus: (deviceId: string, status: "online" | "offline") => void;
  updateBattery: (deviceId: string, batteryLevel: number) => void;
  updateSignal: (deviceId: string, signal: number) => void;
  updateSensorData: (deviceId: string, fillLevel: number, temp: number, humidity: number) => void;
  simulateDeviceFailure: (deviceId: string) => void;
  resetDeviceData: () => void;
}

const IoTDeviceContext = createContext<IoTDeviceContextType | undefined>(undefined);

export function IoTDeviceProvider({ children }: { children: ReactNode }) {
  const [devices, setDevices] = useState<IoTDevice[]>([]);
  const deviceSimulationRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize devices from localStorage or JSON
  useEffect(() => {
    const storedDevices = localStorage.getItem("swachhpath_iot_devices");

    if (storedDevices) {
      try {
        const parsedDevices = JSON.parse(storedDevices);
        setDevices(parsedDevices);
      } catch {
        initializeDefaultDevices();
      }
    } else {
      initializeDefaultDevices();
    }
  }, []);

  const initializeDefaultDevices = useCallback(() => {
    const devicesData = (iotStreamData as IoTStreamData).devices;
    setDevices(devicesData);
  }, []);

  // Save devices to localStorage whenever they change
  useEffect(() => {
    if (devices.length > 0) {
      localStorage.setItem("swachhpath_iot_devices", JSON.stringify(devices));
    }
  }, [devices]);

  // Device simulation loop for realistic data updates
  useEffect(() => {
    deviceSimulationRef.current = setInterval(() => {
      setDevices((prevDevices) =>
        prevDevices.map((device) => {
          // Simulate battery drain
          const batteryDrain = Math.random() * 0.5;
          const newBattery = Math.max(0, device.batteryLevel - batteryDrain);

          // Simulate signal fluctuation
          const signalChange = (Math.random() - 0.5) * 10;
          const newSignal = Math.max(0, Math.min(100, device.signal + signalChange));

          // Simulate fill level changes
          let newFillLevel = device.fillLevel;
          if (device.status === "online") {
            const fillChange = (Math.random() - 0.3) * 2;
            newFillLevel = Math.max(0, Math.min(100, device.fillLevel + fillChange));
          }

          // Simulate temperature and humidity changes
          const tempChange = (Math.random() - 0.5) * 0.5;
          const humidityChange = (Math.random() - 0.5) * 1;
          const newTemp = Math.max(15, Math.min(45, device.temperature + tempChange));
          const newHumidity = Math.max(30, Math.min(95, device.humidity + humidityChange));

          // Simulate device going offline if battery is critical
          let newStatus = device.status;
          if (newBattery < 3 && Math.random() > 0.7) {
            newStatus = "offline";
          }

          // Simulate sensor errors
          let newSensorErrors = device.sensorErrors;
          if (newBattery < 10 && Math.random() > 0.8) {
            newSensorErrors = Math.min(5, newSensorErrors + 1);
          }

          // Simulate GPS accuracy degradation
          let newGpsAccuracy = device.gpsAccuracy;
          if (newSignal < 50) {
            newGpsAccuracy = Math.min(20, device.gpsAccuracy + (Math.random() * 2));
          } else {
            newGpsAccuracy = Math.max(5, device.gpsAccuracy - (Math.random() * 0.5));
          }

          return {
            ...device,
            batteryLevel: newBattery,
            signal: newSignal,
            fillLevel: newFillLevel,
            temperature: newTemp,
            humidity: newHumidity,
            status: newStatus,
            lastHeartbeat: new Date().toISOString(),
            sensorErrors: newSensorErrors,
            gpsAccuracy: newGpsAccuracy,
            uptime: device.uptime + 5000,
          };
        })
      );
    }, 5000); // Update every 5 seconds

    return () => {
      if (deviceSimulationRef.current) {
        clearInterval(deviceSimulationRef.current);
      }
    };
  }, []);

  const getDeviceById = useCallback(
    (deviceId: string) => {
      return devices.find((d) => d.deviceId === deviceId);
    },
    [devices]
  );

  const getDevicesByPin = useCallback(
    (pin: string) => {
      return devices.filter((d) => d.pin === pin);
    },
    [devices]
  );

  const updateDeviceStatus = useCallback(
    (deviceId: string, status: "online" | "offline") => {
      setDevices((prev) =>
        prev.map((device) =>
          device.deviceId === deviceId
            ? { ...device, status, lastHeartbeat: new Date().toISOString() }
            : device
        )
      );
    },
    []
  );

  const updateBattery = useCallback((deviceId: string, batteryLevel: number) => {
    setDevices((prev) =>
      prev.map((device) =>
        device.deviceId === deviceId
          ? { ...device, batteryLevel: Math.min(100, Math.max(0, batteryLevel)) }
          : device
      )
    );
  }, []);

  const updateSignal = useCallback((deviceId: string, signal: number) => {
    setDevices((prev) =>
      prev.map((device) =>
        device.deviceId === deviceId
          ? { ...device, signal: Math.min(100, Math.max(0, signal)) }
          : device
      )
    );
  }, []);

  const updateSensorData = useCallback(
    (deviceId: string, fillLevel: number, temp: number, humidity: number) => {
      setDevices((prev) =>
        prev.map((device) =>
          device.deviceId === deviceId
            ? {
                ...device,
                fillLevel: Math.min(100, Math.max(0, fillLevel)),
                temperature: temp,
                humidity: humidity,
                lastHeartbeat: new Date().toISOString(),
              }
            : device
        )
      );
    },
    []
  );

  const simulateDeviceFailure = useCallback((deviceId: string) => {
    setDevices((prev) =>
      prev.map((device) =>
        device.deviceId === deviceId
          ? {
              ...device,
              status: "offline",
              batteryLevel: 2,
              signal: 5,
              sensorErrors: 5,
              maintenanceScheduled: true,
            }
          : device
      )
    );
  }, []);

  const resetDeviceData = useCallback(() => {
    localStorage.removeItem("swachhpath_iot_devices");
    initializeDefaultDevices();
  }, [initializeDefaultDevices]);

  return (
    <IoTDeviceContext.Provider
      value={{
        devices,
        getDeviceById,
        getDevicesByPin,
        updateDeviceStatus,
        updateBattery,
        updateSignal,
        updateSensorData,
        simulateDeviceFailure,
        resetDeviceData,
      }}
    >
      {children}
    </IoTDeviceContext.Provider>
  );
}

export function useIoTDevices() {
  const context = useContext(IoTDeviceContext);
  if (context === undefined) {
    throw new Error("useIoTDevices must be used within an IoTDeviceProvider");
  }
  return context;
}

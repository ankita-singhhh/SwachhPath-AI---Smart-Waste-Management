import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router";
import { AuthProvider } from "@/react-app/context/AuthContext";
import { DataProvider } from "@/react-app/context/DataContext";
import { IoTSimulationProvider } from "@/react-app/context/IoTSimulationContext";
import LoginPage from "@/react-app/pages/Login";
import DashboardPage from "@/react-app/pages/Dashboard";
import LocalitiesPage from "@/react-app/pages/Localities";
import DustbinsPage from "@/react-app/pages/Dustbins";
import ComplaintsPage from "@/react-app/pages/Complaints";
import AnalyticsPage from "@/react-app/pages/Analytics";
import SettingsPage from "@/react-app/pages/Settings";
import DustbinDetailsPage from "@/react-app/pages/DustbinDetails";

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <IoTSimulationProvider>
          <Router>
            <Routes>
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/localities" element={<LocalitiesPage />} />
              <Route path="/dustbins" element={<DustbinsPage />} />
              <Route path="/dustbin/:pin/:id" element={<DustbinDetailsPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/complaints" element={<ComplaintsPage />} />
            </Routes>
          </Router>
        </IoTSimulationProvider>
      </DataProvider>
    </AuthProvider>
  );
}

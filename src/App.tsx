
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { AuthProvider } from "./lib/AuthContext";
import { LocationProvider } from "./lib/LocationContext";
import { WeatherProvider } from "./lib/WeatherContext";
import { GeminiProvider } from "./lib/GeminiContext";
import { LocationInitializer } from "./components/location/LocationInitializer";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { AppLayout } from "./components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import Alerts from "./pages/Alerts";
import Weather from "./pages/Weather";
import PlantingSchedule from "./pages/PlantingSchedule";
import AIAdvisor from "./pages/AIAdvisor";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <LocationProvider>
        {/* This component automatically requests location permission when the app loads */}
        <LocationInitializer />
        <WeatherProvider>
          <GeminiProvider>
            <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                {/* Public routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />

                {/* Protected routes */}
                <Route element={<ProtectedRoute />}>
                  <Route element={<AppLayout />}>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/alerts" element={<Alerts />} />
                    <Route path="/weather" element={<Weather />} />
                    <Route path="/planting" element={<PlantingSchedule />} />
                    <Route path="/advisor" element={<AIAdvisor />} />
                    <Route path="/settings" element={<Settings />} />
                  </Route>
                </Route>

                {/* Fallback routes */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
          </GeminiProvider>
        </WeatherProvider>
      </LocationProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;


import { WeatherCard } from "@/components/dashboard/WeatherCard";
import { AlertCard } from "@/components/dashboard/AlertCard";
import { RecommendationsCard } from "@/components/dashboard/RecommendationsCard";
import { ForecastCard } from "@/components/dashboard/ForecastCard";
import { PlantingCard } from "@/components/dashboard/PlantingCard";
import { RecommendationsProvider } from "@/lib/RecommendationsContext";
import { usePlanting } from "@/lib/PlantingContext";

const Dashboard = () => {
  // Mock data for alerts
  const alertsData = [
    {
      id: "1",
      title: "Heavy Rainfall Expected",
      description: "Expect 15-20mm of rainfall in the next 24 hours, which may affect lowland crops.",
      level: "severe" as const,
      time: "Today, 10:30 AM",
    },
    {
      id: "2",
      title: "Weather Warning",
      description: "High temperatures forecasted for the next week; ensure adequate irrigation.",
      level: "warning" as const,
      time: "Yesterday, 3:15 PM",
    },
  ];

  // Get crops data from context
  const { activeCrops } = usePlanting();

  return (
    <RecommendationsProvider>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AgriAlert Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor weather conditions, receive alerts, and get AI-powered recommendations for your crops.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <WeatherCard />
          <AlertCard alerts={alertsData} />
          <RecommendationsCard />
          <ForecastCard />
          <PlantingCard />
        </div>
      </div>
    </RecommendationsProvider>
  );
};

export default Dashboard;


import { WeatherCard } from "@/components/dashboard/WeatherCard";
import { AlertCard } from "@/components/dashboard/AlertCard";
import { RecommendationsCard } from "@/components/dashboard/RecommendationsCard";
import { ForecastCard } from "@/components/dashboard/ForecastCard";
import { PlantingCard } from "@/components/dashboard/PlantingCard";
import { RecommendationsProvider } from "@/lib/RecommendationsContext";
import { usePlanting } from "@/lib/PlantingContext";
import { useAlerts } from "@/lib/AlertContext";
import { Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const Dashboard = () => {
  // Get alerts from context
  const { currentAlerts, isLoading } = useAlerts();

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
          {isLoading ? (
            <Card>
              <CardContent className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <span className="ml-2 text-muted-foreground">Loading alerts...</span>
              </CardContent>
            </Card>
          ) : (
            <AlertCard alerts={currentAlerts} />
          )}
          <RecommendationsCard />
          <ForecastCard />
          <PlantingCard />
        </div>
      </div>
    </RecommendationsProvider>
  );
};

export default Dashboard;

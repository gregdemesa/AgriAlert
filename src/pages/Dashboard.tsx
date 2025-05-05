
import { WeatherCard } from "@/components/dashboard/WeatherCard";
import { AlertCard } from "@/components/dashboard/AlertCard";
import { RecommendationsCard } from "@/components/dashboard/RecommendationsCard";
import { ForecastCard } from "@/components/dashboard/ForecastCard";
import { PlantingCard } from "@/components/dashboard/PlantingCard";

const Dashboard = () => {
  // Mock data for weather
  const weatherData = {
    temperature: 28,
    condition: "sunny" as const,
    humidity: 65,
    windSpeed: 12,
    location: "Manila, Philippines",
  };

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

  // Mock data for recommendations
  const recommendationsData = [
    {
      id: "1",
      title: "Early Rice Harvest Recommended",
      description: "Based on rainfall forecast, consider harvesting your rice crop 3-5 days early to avoid flooding damage.",
      priority: "high" as const,
    },
    {
      id: "2",
      title: "Drainage System Check",
      description: "Inspect and clear drainage systems before expected heavy rainfall to prevent waterlogging in your fields.",
      priority: "medium" as const,
    },
    {
      id: "3",
      title: "Apply Protective Measures",
      description: "Cover young seedlings with appropriate coverings to protect from upcoming heavy rainfall.",
      priority: "medium" as const,
    },
  ];

  // Mock data for forecast
  const forecastData = [
    {
      day: "Mon",
      temperature: { high: 30, low: 24 },
      condition: "sunny" as const,
      precipitation: 0,
    },
    {
      day: "Tue",
      temperature: { high: 29, low: 24 },
      condition: "cloudy" as const,
      precipitation: 20,
    },
    {
      day: "Wed",
      temperature: { high: 26, low: 23 },
      condition: "rainy" as const,
      precipitation: 80,
    },
    {
      day: "Thu",
      temperature: { high: 25, low: 22 },
      condition: "rainy" as const,
      precipitation: 70,
    },
    {
      day: "Fri",
      temperature: { high: 27, low: 23 },
      condition: "cloudy" as const,
      precipitation: 30,
    },
  ];

  // Mock data for crops
  const cropsData = [
    {
      id: "1",
      name: "Lowland Rice",
      plantingDate: "Jun 15",
      harvestDate: "Sep 30",
      status: "delayed" as const,
    },
    {
      id: "2",
      name: "Sweet Corn",
      plantingDate: "Jul 1",
      harvestDate: "Sep 15",
      status: "ready-to-harvest" as const,
    },
    {
      id: "3",
      name: "Tomatoes",
      plantingDate: "Aug 1",
      harvestDate: "Oct 15",
      status: "active" as const,
    },
    {
      id: "4",
      name: "Eggplant",
      plantingDate: "Sep 10",
      harvestDate: "Dec 5",
      status: "upcoming" as const,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">AgriAlert Dashboard</h1>
        <p className="text-muted-foreground">
          Monitor weather conditions, receive alerts, and get AI-powered recommendations for your crops.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <WeatherCard weather={weatherData} />
        <AlertCard alerts={alertsData} />
        <RecommendationsCard recommendations={recommendationsData} />
        <ForecastCard forecast={forecastData} />
        <PlantingCard crops={cropsData} />
      </div>
    </div>
  );
};

export default Dashboard;

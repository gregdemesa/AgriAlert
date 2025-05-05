
import { useState } from "react";
import { WeatherCard } from "@/components/dashboard/WeatherCard";
import { AlertCard } from "@/components/dashboard/AlertCard";
import { RecommendationsCard } from "@/components/dashboard/RecommendationsCard";
import { ForecastCard } from "@/components/dashboard/ForecastCard";
import { PlantingCard } from "@/components/dashboard/PlantingCard";
import { useLocation } from "@/lib/LocationContext";

const Dashboard = () => {
  const { location } = useLocation();

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

  // We now use real forecast data from the WeatherContext

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

      {/* Location request is now handled at the app level */}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <WeatherCard />
        <AlertCard alerts={alertsData} />
        <RecommendationsCard recommendations={recommendationsData} />
        <ForecastCard />
        <PlantingCard crops={cropsData} />
      </div>
    </div>
  );
};

export default Dashboard;

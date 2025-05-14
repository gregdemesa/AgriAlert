import React, { useState } from "react";
import { WeatherCard } from "@/components/dashboard/WeatherCard";
import { ForecastCard } from "@/components/dashboard/ForecastCard";
import { HistoricalWeatherCard } from "@/components/weather/HistoricalWeatherCard";
import { WeatherStatisticsCard } from "@/components/weather/WeatherStatisticsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import { useLocation } from "@/lib/LocationContext";
import { useWeather } from "@/lib/WeatherContext";
import { LocationDisplay } from "@/components/location/LocationDisplay";
import { Skeleton } from "@/components/ui/skeleton";

const Weather = () => {
  const { location } = useLocation();
  const { hourlyForecast } = useWeather();

  // Transform hourly forecast data for the chart
  const hourlyData = React.useMemo(() => {
    if (!hourlyForecast.data || hourlyForecast.data.length === 0) {
      console.log('No hourly forecast data available');
      return [];
    }

    console.log(`Transforming ${hourlyForecast.data.length} hourly forecast items for chart`);
    return hourlyForecast.data.map(item => ({
      time: item.time,
      temperature: item.temperature,
      humidity: item.humidity
    }));
  }, [hourlyForecast.data]);

  // Mock data for monthly rainfall
  const monthlyData = [
    { month: "Jan", rainfall: 15, average: 20 },
    { month: "Feb", rainfall: 10, average: 18 },
    { month: "Mar", rainfall: 8, average: 15 },
    { month: "Apr", rainfall: 12, average: 10 },
    { month: "May", rainfall: 20, average: 22 },
    { month: "Jun", rainfall: 25, average: 28 },
    { month: "Jul", rainfall: 40, average: 32 },
    { month: "Aug", rainfall: 35, average: 30 },
    { month: "Sep", rainfall: 30, average: 25 },
    { month: "Oct", rainfall: 25, average: 20 },
    { month: "Nov", rainfall: 20, average: 18 },
    { month: "Dec", rainfall: 18, average: 15 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Weather Monitor</h1>
        <p className="text-muted-foreground">
          Track current conditions and forecasts to plan your farming activities.
        </p>
      </div>

      {location && (
        <div className="mb-4">
          <LocationDisplay compact />
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <WeatherCard />
        <ForecastCard />
      </div>

      <Tabs defaultValue="hourly">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="hourly">Hourly Forecast</TabsTrigger>
          <TabsTrigger value="rainfall">Rainfall Analysis</TabsTrigger>
          <TabsTrigger value="historical">Historical Data</TabsTrigger>
          <TabsTrigger value="statistics">Weather Statistics</TabsTrigger>
        </TabsList>

        <TabsContent value="hourly" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>24-Hour Temperature & Humidity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                {hourlyForecast.isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <Skeleton className="h-[250px] w-full" />
                  </div>
                ) : hourlyForecast.error ? (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                    <p>Error loading hourly forecast data:</p>
                    <p className="text-sm text-red-500 mt-1 mb-2">
                      {hourlyForecast.error.message || "Unknown error"}
                    </p>
                    <button
                      onClick={() => hourlyForecast.refetch()}
                      className="mt-2 text-sm text-primary hover:underline"
                    >
                      Try again
                    </button>
                  </div>
                ) : hourlyData.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                    <p>Hourly forecast data unavailable</p>
                    <button
                      onClick={() => hourlyForecast.refetch()}
                      className="mt-2 text-sm text-primary hover:underline"
                    >
                      Try again
                    </button>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={hourlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip />
                      <Legend />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="temperature"
                        stroke="#F59E0B"
                        name="Temperature (°C)"
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="humidity"
                        stroke="#3B82F6"
                        name="Humidity (%)"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rainfall" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Rainfall Patterns</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                {/* Note: This is still using mock data as OpenWeatherMap's free tier doesn't provide historical rainfall data */}
                {/* In a production app, you would use a paid weather API that provides historical data */}
                <div className="flex flex-col items-center justify-center h-full">
                  <p className="text-muted-foreground mb-4">
                    Monthly rainfall data requires a premium weather API subscription.
                  </p>
                  <ResponsiveContainer width="100%" height="80%">
                    <LineChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="rainfall"
                        stroke="#3B82F6"
                        name="Rainfall (mm) (Sample Data)"
                      />
                      <Line
                        type="monotone"
                        dataKey="average"
                        stroke="#9CA3AF"
                        strokeDasharray="5 5"
                        name="Historical Average (mm) (Sample Data)"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="historical" className="pt-4">
          <HistoricalWeatherCard />
        </TabsContent>

        <TabsContent value="statistics" className="pt-4">
          <WeatherStatisticsCard />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Weather;

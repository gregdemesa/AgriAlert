import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useWeather } from "@/lib/WeatherContext";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip
} from "recharts";

// Weather condition colors
const COLORS = {
  sunny: "#F59E0B", // amber
  cloudy: "#94A3B8", // slate
  rainy: "#3B82F6", // blue
  stormy: "#8B5CF6", // purple
  snowy: "#E5E7EB", // gray
  windy: "#10B981", // emerald
};

export function WeatherStatisticsCard() {
  const { weatherStatistics } = useWeather();
  const [startDate, setStartDate] = useState<Date | undefined>(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 days ago
  );
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());

  const handleFetchData = () => {
    if (startDate && endDate) {
      weatherStatistics.fetchData(startDate, endDate);
    }
  };

  // Calculate predominant condition from historical data
  const calculatePredominantCondition = () => {
    if (!weatherStatistics.data) return null;

    // For now, we'll just return a placeholder since we don't have condition frequency data
    // In a real implementation, this would analyze the historical data to determine the most common condition
    return "sunny"; // Placeholder
  };

  const predominantCondition = calculatePredominantCondition();

  // Prepare pie chart data for rainfall vs dry days
  const rainfallData = weatherStatistics.data ? [
    {
      name: "Days with Rain",
      value: weatherStatistics.data.precipitation.daysWithRain
    },
    {
      name: "Dry Days",
      value: (new Date(weatherStatistics.data.period.end).getTime() -
              new Date(weatherStatistics.data.period.start).getTime()) /
              (1000 * 60 * 60 * 24) + 1 -
              weatherStatistics.data.precipitation.daysWithRain
    }
  ] : [];

  return (
    <Card className="col-span-full md:col-span-1">
      <CardHeader>
        <CardTitle>Weather Statistics</CardTitle>
        <CardDescription>
          Weather statistics for the selected time period
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-6">
          <div className="flex flex-wrap items-center gap-4 sm:flex-nowrap">
            <div className="grid w-full gap-1.5">
              <div className="text-sm font-medium leading-none">Start Date</div>
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={setStartDate}
                disabled={(date) => date > new Date() || (endDate ? date > endDate : false)}
                className="rounded-md border"
              />
            </div>
            <div className="grid w-full gap-1.5">
              <div className="text-sm font-medium leading-none">End Date</div>
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={setEndDate}
                disabled={(date) =>
                  date > new Date() ||
                  (startDate ? date < startDate : false)
                }
                className="rounded-md border"
              />
            </div>
            <div className="flex h-full items-end justify-start mt-4 md:ml-4">
              <Button
                onClick={handleFetchData}
                disabled={!startDate || !endDate}
                size="sm"
                className="whitespace-nowrap"
              >
                Fetch Statistics
              </Button>
            </div>
          </div>

          {weatherStatistics.isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-[300px] w-full" />
            </div>
          ) : weatherStatistics.error ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                {weatherStatistics.error.message || "Failed to load weather statistics"}
                <div className="mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => weatherStatistics.refetch()}
                  >
                    Try Again
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          ) : !weatherStatistics.data ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <p>No statistics available for the selected period.</p>
              <p className="text-sm mt-2">Please select a date range and fetch data.</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex flex-col space-y-1.5 rounded-lg border p-4">
                  <h3 className="font-semibold">Period</h3>
                  <p>{weatherStatistics.data.period.start} to {weatherStatistics.data.period.end}</p>
                </div>
                <div className="flex flex-col space-y-1.5 rounded-lg border p-4">
                  <h3 className="font-semibold">Total Precipitation</h3>
                  <p>{weatherStatistics.data.precipitation.total} mm</p>
                </div>
                <div className="flex flex-col space-y-1.5 rounded-lg border p-4">
                  <h3 className="font-semibold">Average Temperature</h3>
                  <p>{weatherStatistics.data.temperature.avg}°C</p>
                </div>
                <div className="flex flex-col space-y-1.5 rounded-lg border p-4">
                  <h3 className="font-semibold">Temperature Range</h3>
                  <p>{weatherStatistics.data.temperature.min}°C - {weatherStatistics.data.temperature.max}°C</p>
                </div>
                <div className="flex flex-col space-y-1.5 rounded-lg border p-4">
                  <h3 className="font-semibold">Average Humidity</h3>
                  <p>{weatherStatistics.data.humidity.avg}%</p>
                </div>
                <div className="flex flex-col space-y-1.5 rounded-lg border p-4">
                  <h3 className="font-semibold">Wind Speed</h3>
                  <p>Avg: {weatherStatistics.data.windSpeed.avg} km/h | Max: {weatherStatistics.data.windSpeed.max} km/h</p>
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-4">Rainfall Distribution</h3>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={rainfallData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={(entry) => `${entry.name}: ${entry.value} days`}
                      >
                        <Cell key="cell-0" fill="#3B82F6" /> {/* Blue for rainy days */}
                        <Cell key="cell-1" fill="#10B981" /> {/* Emerald for dry days */}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} days`, 'Duration']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-4">Agricultural Insights</h3>
                <div className="space-y-2">
                  <p><strong>Rainfall Assessment:</strong> {weatherStatistics.data.precipitation.total > 50 ? 'Adequate rainfall for most crops' : 'Irrigation may be needed for optimal growth'}</p>
                  <p><strong>Temperature Conditions:</strong> {
                    weatherStatistics.data.temperature.avg > 30 ? 'High temperature stress possible' :
                    weatherStatistics.data.temperature.avg < 15 ? 'Cool conditions may slow growth' :
                    'Favorable temperature range for most crops'
                  }</p>
                  <p><strong>Humidity Levels:</strong> {
                    weatherStatistics.data.humidity.avg > 80 ? 'High humidity may increase disease risk' :
                    weatherStatistics.data.humidity.avg < 40 ? 'Low humidity may increase water requirements' :
                    'Moderate humidity levels'
                  }</p>
                  <p><strong>Wind Impact:</strong> {
                    weatherStatistics.data.windSpeed.avg > 20 ? 'Strong winds may affect pollination and crop stability' :
                    weatherStatistics.data.windSpeed.avg > 10 ? 'Moderate winds may help with air circulation' :
                    'Light winds, good for most agricultural activities'
                  }</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
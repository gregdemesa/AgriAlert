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
  
  // Prepare pie chart data for predominant conditions
  const conditionsData = weatherStatistics.data ? [
    { name: "Sunny", value: weatherStatistics.data.predominantCondition === "sunny" ? 100 : 0 },
    { name: "Cloudy", value: weatherStatistics.data.predominantCondition === "cloudy" ? 100 : 0 },
    { name: "Rainy", value: weatherStatistics.data.predominantCondition === "rainy" ? 100 : 0 },
    { name: "Stormy", value: weatherStatistics.data.predominantCondition === "stormy" ? 100 : 0 },
    { name: "Snowy", value: weatherStatistics.data.predominantCondition === "snowy" ? 100 : 0 },
    { name: "Windy", value: weatherStatistics.data.predominantCondition === "windy" ? 100 : 0 },
  ].filter(item => item.value > 0) : [];
  
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
                  <p>{weatherStatistics.data.period}</p>
                </div>
                <div className="flex flex-col space-y-1.5 rounded-lg border p-4">
                  <h3 className="font-semibold">Predominant Condition</h3>
                  <p className="capitalize">{weatherStatistics.data.predominantCondition}</p>
                </div>
                <div className="flex flex-col space-y-1.5 rounded-lg border p-4">
                  <h3 className="font-semibold">Average Temperature</h3>
                  <p>{weatherStatistics.data.avgTemperature}°C</p>
                </div>
                <div className="flex flex-col space-y-1.5 rounded-lg border p-4">
                  <h3 className="font-semibold">Temperature Range</h3>
                  <p>{weatherStatistics.data.minTemperature}°C - {weatherStatistics.data.maxTemperature}°C</p>
                </div>
                <div className="flex flex-col space-y-1.5 rounded-lg border p-4">
                  <h3 className="font-semibold">Average Humidity</h3>
                  <p>{weatherStatistics.data.avgHumidity}%</p>
                </div>
                <div className="flex flex-col space-y-1.5 rounded-lg border p-4">
                  <h3 className="font-semibold">Average Pressure</h3>
                  <p>{weatherStatistics.data.avgPressure} hPa</p>
                </div>
              </div>
              
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-4">Predominant Weather Condition</h3>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={conditionsData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={(entry) => entry.name}
                      >
                        {conditionsData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={COLORS[entry.name.toLowerCase() as keyof typeof COLORS]} 
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 
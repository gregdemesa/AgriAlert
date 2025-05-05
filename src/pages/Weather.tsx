
import { WeatherCard } from "@/components/dashboard/WeatherCard";
import { ForecastCard } from "@/components/dashboard/ForecastCard";
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

const Weather = () => {
  // Mock data for current weather
  const weatherData = {
    temperature: 28,
    condition: "sunny" as const,
    humidity: 65,
    windSpeed: 12,
    location: "Manila, Philippines",
  };

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

  // Mock data for hourly forecast
  const hourlyData = [
    { time: "6AM", temperature: 24, rainfall: 0, humidity: 70 },
    { time: "9AM", temperature: 26, rainfall: 0, humidity: 65 },
    { time: "12PM", temperature: 29, rainfall: 0, humidity: 60 },
    { time: "3PM", temperature: 30, rainfall: 0, humidity: 58 },
    { time: "6PM", temperature: 28, rainfall: 0, humidity: 62 },
    { time: "9PM", temperature: 26, rainfall: 0, humidity: 68 },
    { time: "12AM", temperature: 25, rainfall: 0, humidity: 72 },
    { time: "3AM", temperature: 24, rainfall: 0, humidity: 75 },
  ];

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

      <div className="grid gap-6 md:grid-cols-2">
        <WeatherCard weather={weatherData} />
        <ForecastCard forecast={forecastData} />
      </div>

      <Tabs defaultValue="hourly">
        <TabsList>
          <TabsTrigger value="hourly">Hourly Forecast</TabsTrigger>
          <TabsTrigger value="rainfall">Rainfall Analysis</TabsTrigger>
        </TabsList>
        <TabsContent value="hourly" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>24-Hour Temperature & Humidity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
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
                <ResponsiveContainer width="100%" height="100%">
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
                      name="Rainfall (mm)"
                    />
                    <Line
                      type="monotone"
                      dataKey="average"
                      stroke="#9CA3AF"
                      strokeDasharray="5 5"
                      name="Historical Average (mm)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Weather;

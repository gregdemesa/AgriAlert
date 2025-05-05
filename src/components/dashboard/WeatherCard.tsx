
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sun, CloudRain, Wind } from "lucide-react";

interface WeatherCondition {
  temperature: number;
  condition: "sunny" | "cloudy" | "rainy" | "windy";
  humidity: number;
  windSpeed: number;
  location: string;
}

interface WeatherCardProps {
  weather: WeatherCondition;
}

export function WeatherCard({ weather }: WeatherCardProps) {
  const renderWeatherIcon = () => {
    switch (weather.condition) {
      case "sunny":
        return <Sun size={42} className="text-yellow-500" />;
      case "rainy":
        return <CloudRain size={42} className="text-blue-500" />;
      case "windy":
        return <Wind size={42} className="text-gray-500" />;
      default:
        return <Sun size={42} className="text-yellow-500" />;
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-agri-green-light/30 to-agri-green/20 pb-2">
        <CardTitle className="flex items-center justify-between">
          <span>Current Weather</span>
          <span className="text-sm font-normal">{weather.location}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {renderWeatherIcon()}
            <div>
              <div className="text-3xl font-bold">{weather.temperature}°C</div>
              <div className="capitalize text-muted-foreground">
                {weather.condition}
              </div>
            </div>
          </div>
          <div className="grid gap-1 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Humidity:</span>
              <span>{weather.humidity}%</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Wind:</span>
              <span>{weather.windSpeed} km/h</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

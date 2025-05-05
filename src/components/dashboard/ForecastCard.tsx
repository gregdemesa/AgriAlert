
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sun, CloudRain, Wind, Cloud } from "lucide-react";

interface ForecastDay {
  day: string;
  temperature: {
    high: number;
    low: number;
  };
  condition: "sunny" | "cloudy" | "rainy" | "windy";
  precipitation: number;
}

interface ForecastCardProps {
  forecast: ForecastDay[];
}

export function ForecastCard({ forecast }: ForecastCardProps) {
  const getWeatherIcon = (condition: string) => {
    switch (condition) {
      case "sunny":
        return <Sun className="h-5 w-5 text-yellow-500" />;
      case "cloudy":
        return <Cloud className="h-5 w-5 text-gray-400" />;
      case "rainy":
        return <CloudRain className="h-5 w-5 text-blue-500" />;
      case "windy":
        return <Wind className="h-5 w-5 text-gray-500" />;
      default:
        return <Sun className="h-5 w-5 text-yellow-500" />;
    }
  };

  return (
    <Card>
      <CardHeader className="bg-gradient-to-r from-blue-100/50 to-blue-50/30 pb-2">
        <CardTitle>5-Day Forecast</CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="grid grid-cols-5 gap-2 text-center">
          {forecast.map((day) => (
            <div key={day.day} className="flex flex-col items-center">
              <span className="text-sm font-medium mb-1">{day.day}</span>
              <div className="mb-1">{getWeatherIcon(day.condition)}</div>
              <div className="text-sm">
                <span className="font-medium">{day.temperature.high}°</span>
                <span className="text-muted-foreground"> / {day.temperature.low}°</span>
              </div>
              <span className="text-xs text-muted-foreground">{day.precipitation}% rain</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

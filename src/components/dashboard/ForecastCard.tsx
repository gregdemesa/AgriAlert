
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sun, CloudRain, Wind, Cloud, Snowflake, CloudLightning } from "lucide-react";
import { useWeather } from "@/lib/WeatherContext";
import { ForecastDay, WeatherCondition } from "@/lib/weatherApi";
import { Skeleton } from "@/components/ui/skeleton";

interface ForecastCardProps {
  forecast?: ForecastDay[];
}

export function ForecastCard({ forecast: propForecast }: ForecastCardProps) {
  // Use the forecast from context if not provided as prop
  const { forecast } = useWeather();
  const forecastData = propForecast || forecast.data;
  const isLoading = !propForecast && forecast.isLoading;

  const getWeatherIcon = (condition?: WeatherCondition) => {
    if (!condition) return <Sun className="h-5 w-5 text-yellow-500" />;

    switch (condition) {
      case "sunny":
        return <Sun className="h-5 w-5 text-yellow-500" />;
      case "cloudy":
        return <Cloud className="h-5 w-5 text-gray-400" />;
      case "rainy":
        return <CloudRain className="h-5 w-5 text-blue-500" />;
      case "windy":
        return <Wind className="h-5 w-5 text-gray-500" />;
      case "stormy":
        return <CloudLightning className="h-5 w-5 text-purple-500" />;
      case "snowy":
        return <Snowflake className="h-5 w-5 text-blue-300" />;
      default:
        return <Sun className="h-5 w-5 text-yellow-500" />;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="bg-gradient-to-r from-blue-100/50 to-blue-50/30 pb-2">
          <CardTitle>5-Day Forecast</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid grid-cols-5 gap-2 text-center">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="flex flex-col items-center">
                <Skeleton className="h-4 w-8 mb-1" />
                <Skeleton className="h-5 w-5 rounded-full mb-1" />
                <Skeleton className="h-4 w-16 mb-1" />
                <Skeleton className="h-3 w-12" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Handle error state
  if (forecast.error && (!forecastData || forecastData.length === 0)) {
    return (
      <Card>
        <CardHeader className="bg-gradient-to-r from-blue-100/50 to-blue-50/30 pb-2">
          <CardTitle>5-Day Forecast</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="text-center text-muted-foreground">
            <p>Error loading forecast data.</p>
            <button
              onClick={() => forecast.refetch()}
              className="mt-2 text-sm text-primary hover:underline"
            >
              Try again
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Handle no data state
  if (!forecastData || forecastData.length === 0) {
    return (
      <Card>
        <CardHeader className="bg-gradient-to-r from-blue-100/50 to-blue-50/30 pb-2">
          <CardTitle>5-Day Forecast</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="text-center text-muted-foreground">
            Forecast data unavailable. Please check your location settings.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="bg-gradient-to-r from-blue-100/50 to-blue-50/30 pb-2">
        <CardTitle>5-Day Forecast</CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="grid grid-cols-5 gap-2 text-center">
          {forecastData.map((day) => (
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

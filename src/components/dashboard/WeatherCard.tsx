
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sun, CloudRain, Wind, Cloud, Snowflake, CloudLightning } from "lucide-react";
import { useWeather } from "@/lib/WeatherContext";
import { CurrentWeather, WeatherCondition } from "@/lib/weatherApi";
import { Skeleton } from "@/components/ui/skeleton";

interface WeatherCardProps {
  weather?: CurrentWeather;
}

export function WeatherCard({ weather: propWeather }: WeatherCardProps) {
  // Use the weather from context if not provided as prop
  const { currentWeather } = useWeather();
  const weather = propWeather || currentWeather.data;
  const isLoading = !propWeather && currentWeather.isLoading;

  const renderWeatherIcon = (condition?: WeatherCondition) => {
    if (!condition) return <Sun size={42} className="text-yellow-500" />;

    switch (condition) {
      case "sunny":
        return <Sun size={42} className="text-yellow-500" />;
      case "cloudy":
        return <Cloud size={42} className="text-gray-400" />;
      case "rainy":
        return <CloudRain size={42} className="text-blue-500" />;
      case "windy":
        return <Wind size={42} className="text-gray-500" />;
      case "stormy":
        return <CloudLightning size={42} className="text-purple-500" />;
      case "snowy":
        return <Snowflake size={42} className="text-blue-300" />;
      default:
        return <Sun size={42} className="text-yellow-500" />;
    }
  };

  if (isLoading) {
    return (
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-agri-green-light/30 to-agri-green/20 pb-2">
          <CardTitle className="flex items-center justify-between">
            <span>Current Weather</span>
            <Skeleton className="h-4 w-32" />
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div>
                <Skeleton className="h-8 w-20 mb-1" />
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
            <div className="grid gap-1 text-sm">
              <Skeleton className="h-4 w-24 mb-1" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Handle error state
  if (currentWeather.error && !weather) {
    return (
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-agri-green-light/30 to-agri-green/20 pb-2">
          <CardTitle>Current Weather</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="text-center text-muted-foreground">
            <p>Error loading weather data.</p>
            <button
              onClick={() => currentWeather.refetch()}
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
  if (!weather) {
    return (
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-agri-green-light/30 to-agri-green/20 pb-2">
          <CardTitle>Current Weather</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="text-center text-muted-foreground">
            Weather data unavailable. Please check your location settings.
          </div>
        </CardContent>
      </Card>
    );
  }

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
            {renderWeatherIcon(weather.condition)}
            <div>
              <div className="text-3xl font-bold">{weather.temperature}°C</div>
              <div className="capitalize text-muted-foreground">
                {weather.description || weather.condition}
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
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Feels like:</span>
              <span>{weather.feelsLike}°C</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

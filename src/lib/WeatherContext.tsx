import { createContext, useContext, ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from './LocationContext';
import {
  fetchCurrentWeather,
  fetchForecast,
  fetchHourlyForecast,
  CurrentWeather,
  ForecastDay,
  HourlyForecast
} from './weatherApi';

// Define the context type
interface WeatherContextType {
  currentWeather: {
    data: CurrentWeather | undefined;
    isLoading: boolean;
    error: Error | null;
    refetch: () => void;
  };
  forecast: {
    data: ForecastDay[] | undefined;
    isLoading: boolean;
    error: Error | null;
    refetch: () => void;
  };
  hourlyForecast: {
    data: HourlyForecast[] | undefined;
    isLoading: boolean;
    error: Error | null;
    refetch: () => void;
  };
}

// Create the context with default values
const WeatherContext = createContext<WeatherContextType | null>(null);

// Custom hook to use the weather context
export const useWeather = () => {
  const context = useContext(WeatherContext);
  if (!context) {
    throw new Error('useWeather must be used within a WeatherProvider');
  }
  return context;
};

// Weather Provider component
export const WeatherProvider = ({ children }: { children: ReactNode }) => {
  const { location } = useLocation();

  // Query for current weather
  const {
    data: currentWeatherData,
    isLoading: isCurrentWeatherLoading,
    error: currentWeatherError,
    refetch: refetchCurrentWeather,
  } = useQuery({
    queryKey: ['currentWeather', location?.latitude, location?.longitude],
    queryFn: () => (location ? fetchCurrentWeather(location) : Promise.reject('No location available')),
    enabled: !!location,
    refetchInterval: 1000 * 60 * 10, // Refetch every 10 minutes
    staleTime: 1000 * 60 * 5, // Consider data stale after 5 minutes
    retry: 3, // Retry failed requests 3 times
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  });

  // Query for 5-day forecast
  const {
    data: forecastData,
    isLoading: isForecastLoading,
    error: forecastError,
    refetch: refetchForecast,
  } = useQuery({
    queryKey: ['forecast', location?.latitude, location?.longitude],
    queryFn: () => (location ? fetchForecast(location) : Promise.reject('No location available')),
    enabled: !!location,
    refetchInterval: 1000 * 60 * 30, // Refetch every 30 minutes
    staleTime: 1000 * 60 * 15, // Consider data stale after 15 minutes
    retry: 3, // Retry failed requests 3 times
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  });

  // Query for hourly forecast
  const {
    data: hourlyForecastData,
    isLoading: isHourlyForecastLoading,
    error: hourlyForecastError,
    refetch: refetchHourlyForecast,
  } = useQuery({
    queryKey: ['hourlyForecast', location?.latitude, location?.longitude],
    queryFn: () => (location ? fetchHourlyForecast(location) : Promise.reject('No location available')),
    enabled: !!location,
    refetchInterval: 1000 * 60 * 30, // Refetch every 30 minutes
    staleTime: 1000 * 60 * 15, // Consider data stale after 15 minutes
    retry: 3, // Retry failed requests 3 times
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  });

  const value = {
    currentWeather: {
      data: currentWeatherData,
      isLoading: isCurrentWeatherLoading,
      error: currentWeatherError as Error | null,
      refetch: refetchCurrentWeather,
    },
    forecast: {
      data: forecastData,
      isLoading: isForecastLoading,
      error: forecastError as Error | null,
      refetch: refetchForecast,
    },
    hourlyForecast: {
      data: hourlyForecastData,
      isLoading: isHourlyForecastLoading,
      error: hourlyForecastError as Error | null,
      refetch: refetchHourlyForecast,
    },
  };

  return (
    <WeatherContext.Provider value={value}>
      {children}
    </WeatherContext.Provider>
  );
};

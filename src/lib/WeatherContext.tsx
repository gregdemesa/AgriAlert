import { createContext, useContext, ReactNode, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from './LocationContext';
import {
  fetchCurrentWeather,
  fetchForecast,
  fetchHourlyForecast,
  fetchHistoricalWeather,
  fetchWeatherStatistics,
  fetchWeatherAlerts,
  CurrentWeather,
  ForecastDay,
  HourlyForecast,
  HistoricalWeather,
  WeatherStatistics,
  WeatherAlert
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
  historicalWeather: {
    data: HistoricalWeather[] | undefined;
    isLoading: boolean;
    error: Error | null;
    refetch: () => void;
    fetchData: (startDate: Date, endDate: Date) => void;
  };
  weatherStatistics: {
    data: WeatherStatistics | undefined;
    isLoading: boolean;
    error: Error | null;
    refetch: () => void;
    fetchData: (startDate: Date, endDate: Date) => void;
  };
  weatherAlerts: {
    data: WeatherAlert[] | undefined;
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

  // State for date ranges for historical queries
  const [historicalDates, setHistoricalDates] = useState({
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Default: 7 days ago
    endDate: new Date() // Default: today
  });

  const [statisticsDates, setStatisticsDates] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Default: 30 days ago
    endDate: new Date() // Default: today
  });

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

  // Query for historical weather data
  const {
    data: historicalData,
    isLoading: isHistoricalLoading,
    error: historicalError,
    refetch: refetchHistorical,
  } = useQuery({
    queryKey: ['historicalWeather', location?.latitude, location?.longitude, historicalDates.startDate, historicalDates.endDate],
    queryFn: () => (
      location
        ? fetchHistoricalWeather(location, historicalDates.startDate, historicalDates.endDate)
        : Promise.reject('No location available')
    ),
    enabled: !!location && !!historicalDates.startDate && !!historicalDates.endDate,
    staleTime: 1000 * 60 * 60 * 24, // Consider data stale after 24 hours
    retry: 3, // Retry failed requests 3 times
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  });

  // Query for weather statistics
  const {
    data: statisticsData,
    isLoading: isStatisticsLoading,
    error: statisticsError,
    refetch: refetchStatistics,
  } = useQuery({
    queryKey: ['weatherStatistics', location?.latitude, location?.longitude, statisticsDates.startDate, statisticsDates.endDate],
    queryFn: () => (
      location
        ? fetchWeatherStatistics(location, statisticsDates.startDate, statisticsDates.endDate)
        : Promise.reject('No location available')
    ),
    enabled: !!location && !!statisticsDates.startDate && !!statisticsDates.endDate,
    staleTime: 1000 * 60 * 60 * 24, // Consider data stale after 24 hours
    retry: 3, // Retry failed requests 3 times
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  });

  // Query for weather alerts
  const {
    data: alertsData,
    isLoading: isAlertsLoading,
    error: alertsError,
    refetch: refetchAlerts,
  } = useQuery({
    queryKey: ['weatherAlerts', location?.latitude, location?.longitude],
    queryFn: () => (location ? fetchWeatherAlerts(location) : Promise.reject('No location available')),
    enabled: !!location,
    refetchInterval: 1000 * 60 * 15, // Refetch every 15 minutes
    staleTime: 1000 * 60 * 5, // Consider data stale after 5 minutes
    retry: 3, // Retry failed requests 3 times
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  });

  // Functions to fetch data with specific date ranges
  const fetchHistoricalWithDates = (startDate: Date, endDate: Date) => {
    setHistoricalDates({ startDate, endDate });
  };

  const fetchStatisticsWithDates = (startDate: Date, endDate: Date) => {
    setStatisticsDates({ startDate, endDate });
  };

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
    historicalWeather: {
      data: historicalData,
      isLoading: isHistoricalLoading,
      error: historicalError as Error | null,
      refetch: refetchHistorical,
      fetchData: fetchHistoricalWithDates,
    },
    weatherStatistics: {
      data: statisticsData,
      isLoading: isStatisticsLoading,
      error: statisticsError as Error | null,
      refetch: refetchStatistics,
      fetchData: fetchStatisticsWithDates,
    },
    weatherAlerts: {
      data: alertsData,
      isLoading: isAlertsLoading,
      error: alertsError as Error | null,
      refetch: refetchAlerts,
    },
  };

  return (
    <WeatherContext.Provider value={value}>
      {children}
    </WeatherContext.Provider>
  );
};

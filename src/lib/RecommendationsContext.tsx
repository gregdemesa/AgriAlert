import { createContext, useContext, ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from './LocationContext';
import { useWeather } from './WeatherContext';
import { usePlanting } from './PlantingContext';
import { generateRecommendations } from './geminiApi';

// Define the recommendation type
export interface Recommendation {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
}

// Define the context type
interface RecommendationsContextType {
  recommendations: {
    data: Recommendation[] | undefined;
    isLoading: boolean;
    error: Error | null;
    refetch: () => void;
  };
}

// Create the context with default values
const RecommendationsContext = createContext<RecommendationsContextType | null>(null);

// Custom hook to use the recommendations context
export const useRecommendations = () => {
  const context = useContext(RecommendationsContext);
  if (!context) {
    throw new Error('useRecommendations must be used within a RecommendationsProvider');
  }
  return context;
};

// Helper function to transform crop data for recommendations
const transformCropsForRecommendations = (activeCrops = [], upcomingCrops = []) => {
  const allCrops = [...activeCrops, ...upcomingCrops];

  if (allCrops.length === 0) {
    return null; // Return null if no crops are available
  }

  return allCrops.map(crop => ({
    name: crop.name,
    variety: crop.variety,
    status: crop.status,
    plantingDate: crop.plantingDate,
    harvestDate: crop.expectedHarvest || crop.harvestDate
  }));
};

// Recommendations Provider component
export const RecommendationsProvider = ({ children }: { children: ReactNode }) => {
  const { location } = useLocation();
  const { currentWeather, forecast } = useWeather();
  const { activeCrops, upcomingCrops } = usePlanting();

  // Query for AI recommendations
  const {
    data: recommendationsData,
    isLoading: isRecommendationsLoading,
    error: recommendationsError,
    refetch: refetchRecommendations,
  } = useQuery({
    queryKey: [
      'recommendations',
      location?.latitude,
      location?.longitude,
      currentWeather.data?.temperature,
      forecast.data?.length,
      activeCrops.data?.length,
      upcomingCrops.data?.length
    ],
    queryFn: async () => {
      if (!location || !currentWeather.data || !forecast.data) {
        throw new Error('Location or weather data not available');
      }

      // Transform crop data for recommendations
      const cropData = transformCropsForRecommendations(
        activeCrops.data || [],
        upcomingCrops.data || []
      );

      return generateRecommendations(location, currentWeather.data, forecast.data, cropData);
    },
    enabled: !!location && !!currentWeather.data && !!forecast.data,
    refetchInterval: 1000 * 60 * 60, // Refetch every hour
    staleTime: 1000 * 60 * 30, // Consider data stale after 30 minutes
    retry: 2, // Retry failed requests 2 times
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  });

  const value = {
    recommendations: {
      data: recommendationsData,
      isLoading: isRecommendationsLoading,
      error: recommendationsError as Error | null,
      refetch: refetchRecommendations,
    },
  };

  return (
    <RecommendationsContext.Provider value={value}>
      {children}
    </RecommendationsContext.Provider>
  );
};

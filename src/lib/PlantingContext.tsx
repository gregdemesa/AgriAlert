import { createContext, useContext, ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './AuthContext';
import {
  Crop,
  ActiveCrop,
  HistoricalCrop,
  addCrop,
  getCropsByUserId,
  getActiveCrops,
  getUpcomingCrops,
  getHistoricalCrops,
  getCropById,
  updateCrop,
  deleteCrop,
  updateCropStatus,
  markCropAsHarvested,
  addCropAlert,
  removeCropAlert
} from './plantingService';

// Define the context type
interface PlantingContextType {
  crops: {
    data: Crop[] | undefined;
    isLoading: boolean;
    error: Error | null;
    refetch: () => void;
  };
  activeCrops: {
    data: ActiveCrop[] | undefined;
    isLoading: boolean;
    error: Error | null;
    refetch: () => void;
  };
  upcomingCrops: {
    data: ActiveCrop[] | undefined;
    isLoading: boolean;
    error: Error | null;
    refetch: () => void;
  };
  historicalCrops: {
    data: HistoricalCrop[] | undefined;
    isLoading: boolean;
    error: Error | null;
    refetch: () => void;
  };
  addCrop: (crop: Omit<Crop, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateCrop: (cropId: string, cropData: Partial<Crop>) => Promise<void>;
  deleteCrop: (cropId: string) => Promise<void>;
  updateCropStatus: (cropId: string, status: ActiveCrop['status']) => Promise<void>;
  markCropAsHarvested: (cropId: string, harvestDate: string, yieldAmount: string, notes: string) => Promise<void>;
  addCropAlert: (cropId: string, alert: string) => Promise<void>;
  removeCropAlert: (cropId: string, alertIndex: number) => Promise<void>;
}

// Create the context with default values
const PlantingContext = createContext<PlantingContextType | null>(null);

// Custom hook to use the planting context
export const usePlanting = () => {
  const context = useContext(PlantingContext);
  if (!context) {
    throw new Error('usePlanting must be used within a PlantingProvider');
  }
  return context;
};

// Planting Provider component
export const PlantingProvider = ({ children }: { children: ReactNode }) => {
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();
  const userId = currentUser?.uid || '';

  // Query for all crops
  const {
    data: cropsData,
    isLoading: isCropsLoading,
    error: cropsError,
    refetch: refetchCrops,
  } = useQuery({
    queryKey: ['crops', userId],
    queryFn: () => (userId ? getCropsByUserId(userId) : Promise.reject('No user ID available')),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // Consider data stale after 5 minutes
  });

  // Query for active crops
  const {
    data: activeCropsData,
    isLoading: isActiveCropsLoading,
    error: activeCropsError,
    refetch: refetchActiveCrops,
  } = useQuery({
    queryKey: ['activeCrops', userId],
    queryFn: () => (userId ? getActiveCrops(userId) : Promise.reject('No user ID available')),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // Consider data stale after 5 minutes
  });

  // Query for upcoming crops
  const {
    data: upcomingCropsData,
    isLoading: isUpcomingCropsLoading,
    error: upcomingCropsError,
    refetch: refetchUpcomingCrops,
  } = useQuery({
    queryKey: ['upcomingCrops', userId],
    queryFn: () => (userId ? getUpcomingCrops(userId) : Promise.reject('No user ID available')),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // Consider data stale after 5 minutes
  });

  // Query for historical crops
  const {
    data: historicalCropsData,
    isLoading: isHistoricalCropsLoading,
    error: historicalCropsError,
    refetch: refetchHistoricalCrops,
  } = useQuery({
    queryKey: ['historicalCrops', userId],
    queryFn: () => (userId ? getHistoricalCrops(userId) : Promise.reject('No user ID available')),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // Consider data stale after 5 minutes
  });

  // Mutation for adding a crop
  const addCropMutation = useMutation({
    mutationFn: (crop: Omit<Crop, 'id' | 'createdAt' | 'updatedAt'>) => addCrop(crop),
    onSuccess: () => {
      // Invalidate and refetch all crop queries
      queryClient.invalidateQueries({ queryKey: ['crops'] });
      queryClient.invalidateQueries({ queryKey: ['activeCrops'] });
      queryClient.invalidateQueries({ queryKey: ['upcomingCrops'] });
      queryClient.invalidateQueries({ queryKey: ['historicalCrops'] });
    },
  });

  // Mutation for updating a crop
  const updateCropMutation = useMutation({
    mutationFn: ({ cropId, cropData }: { cropId: string; cropData: Partial<Crop> }) => 
      updateCrop(cropId, cropData),
    onSuccess: () => {
      // Invalidate and refetch all crop queries
      queryClient.invalidateQueries({ queryKey: ['crops'] });
      queryClient.invalidateQueries({ queryKey: ['activeCrops'] });
      queryClient.invalidateQueries({ queryKey: ['upcomingCrops'] });
      queryClient.invalidateQueries({ queryKey: ['historicalCrops'] });
    },
  });

  // Mutation for deleting a crop
  const deleteCropMutation = useMutation({
    mutationFn: (cropId: string) => deleteCrop(cropId),
    onSuccess: () => {
      // Invalidate and refetch all crop queries
      queryClient.invalidateQueries({ queryKey: ['crops'] });
      queryClient.invalidateQueries({ queryKey: ['activeCrops'] });
      queryClient.invalidateQueries({ queryKey: ['upcomingCrops'] });
      queryClient.invalidateQueries({ queryKey: ['historicalCrops'] });
    },
  });

  // Mutation for updating crop status
  const updateCropStatusMutation = useMutation({
    mutationFn: ({ cropId, status }: { cropId: string; status: ActiveCrop['status'] }) => 
      updateCropStatus(cropId, status),
    onSuccess: () => {
      // Invalidate and refetch all crop queries
      queryClient.invalidateQueries({ queryKey: ['crops'] });
      queryClient.invalidateQueries({ queryKey: ['activeCrops'] });
      queryClient.invalidateQueries({ queryKey: ['upcomingCrops'] });
      queryClient.invalidateQueries({ queryKey: ['historicalCrops'] });
    },
  });

  // Mutation for marking a crop as harvested
  const markCropAsHarvestedMutation = useMutation({
    mutationFn: ({ 
      cropId, 
      harvestDate, 
      yieldAmount, 
      notes 
    }: { 
      cropId: string; 
      harvestDate: string; 
      yieldAmount: string; 
      notes: string 
    }) => markCropAsHarvested(cropId, harvestDate, yieldAmount, notes),
    onSuccess: () => {
      // Invalidate and refetch all crop queries
      queryClient.invalidateQueries({ queryKey: ['crops'] });
      queryClient.invalidateQueries({ queryKey: ['activeCrops'] });
      queryClient.invalidateQueries({ queryKey: ['upcomingCrops'] });
      queryClient.invalidateQueries({ queryKey: ['historicalCrops'] });
    },
  });

  // Mutation for adding a crop alert
  const addCropAlertMutation = useMutation({
    mutationFn: ({ cropId, alert }: { cropId: string; alert: string }) => 
      addCropAlert(cropId, alert),
    onSuccess: () => {
      // Invalidate and refetch active crops
      queryClient.invalidateQueries({ queryKey: ['crops'] });
      queryClient.invalidateQueries({ queryKey: ['activeCrops'] });
      queryClient.invalidateQueries({ queryKey: ['upcomingCrops'] });
    },
  });

  // Mutation for removing a crop alert
  const removeCropAlertMutation = useMutation({
    mutationFn: ({ cropId, alertIndex }: { cropId: string; alertIndex: number }) => 
      removeCropAlert(cropId, alertIndex),
    onSuccess: () => {
      // Invalidate and refetch active crops
      queryClient.invalidateQueries({ queryKey: ['crops'] });
      queryClient.invalidateQueries({ queryKey: ['activeCrops'] });
      queryClient.invalidateQueries({ queryKey: ['upcomingCrops'] });
    },
  });

  // Wrapper functions for mutations
  const handleAddCrop = async (crop: Omit<Crop, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    if (!userId) {
      throw new Error('User not authenticated');
    }
    
    const cropWithUserId = {
      ...crop,
      userId,
    };
    
    return addCropMutation.mutateAsync(cropWithUserId);
  };

  const handleUpdateCrop = async (cropId: string, cropData: Partial<Crop>): Promise<void> => {
    await updateCropMutation.mutateAsync({ cropId, cropData });
  };

  const handleDeleteCrop = async (cropId: string): Promise<void> => {
    await deleteCropMutation.mutateAsync(cropId);
  };

  const handleUpdateCropStatus = async (cropId: string, status: ActiveCrop['status']): Promise<void> => {
    await updateCropStatusMutation.mutateAsync({ cropId, status });
  };

  const handleMarkCropAsHarvested = async (
    cropId: string, 
    harvestDate: string, 
    yieldAmount: string, 
    notes: string
  ): Promise<void> => {
    await markCropAsHarvestedMutation.mutateAsync({ cropId, harvestDate, yieldAmount, notes });
  };

  const handleAddCropAlert = async (cropId: string, alert: string): Promise<void> => {
    await addCropAlertMutation.mutateAsync({ cropId, alert });
  };

  const handleRemoveCropAlert = async (cropId: string, alertIndex: number): Promise<void> => {
    await removeCropAlertMutation.mutateAsync({ cropId, alertIndex });
  };

  const value = {
    crops: {
      data: cropsData,
      isLoading: isCropsLoading,
      error: cropsError as Error | null,
      refetch: refetchCrops,
    },
    activeCrops: {
      data: activeCropsData,
      isLoading: isActiveCropsLoading,
      error: activeCropsError as Error | null,
      refetch: refetchActiveCrops,
    },
    upcomingCrops: {
      data: upcomingCropsData,
      isLoading: isUpcomingCropsLoading,
      error: upcomingCropsError as Error | null,
      refetch: refetchUpcomingCrops,
    },
    historicalCrops: {
      data: historicalCropsData,
      isLoading: isHistoricalCropsLoading,
      error: historicalCropsError as Error | null,
      refetch: refetchHistoricalCrops,
    },
    addCrop: handleAddCrop,
    updateCrop: handleUpdateCrop,
    deleteCrop: handleDeleteCrop,
    updateCropStatus: handleUpdateCropStatus,
    markCropAsHarvested: handleMarkCropAsHarvested,
    addCropAlert: handleAddCropAlert,
    removeCropAlert: handleRemoveCropAlert,
  };

  return (
    <PlantingContext.Provider value={value}>
      {children}
    </PlantingContext.Provider>
  );
};

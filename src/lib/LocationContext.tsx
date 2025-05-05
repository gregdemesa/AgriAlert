import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define the location data structure
export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

// Define the context type
interface LocationContextType {
  location: LocationData | null;
  error: string | null;
  loading: boolean;
  permissionStatus: PermissionState | null;
  requestLocationPermission: () => Promise<boolean>;
  getCurrentLocation: () => Promise<LocationData | null>;
}

// Create the context with default values
const LocationContext = createContext<LocationContextType | null>(null);

// Custom hook to use the location context
export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};

// Location Provider component
export const LocationProvider = ({ children }: { children: ReactNode }) => {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [permissionStatus, setPermissionStatus] = useState<PermissionState | null>(null);

  // Check permission status on mount
  useEffect(() => {
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions
        .query({ name: 'geolocation' as PermissionName })
        .then((result) => {
          setPermissionStatus(result.state);

          // Listen for permission changes
          result.onchange = () => {
            setPermissionStatus(result.state);
          };
        })
        .catch((err) => {
          console.error('Error checking geolocation permission:', err);
        });
    }
  }, []);

  // Request location permission
  const requestLocationPermission = async (): Promise<boolean> => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return false;
    }

    try {
      setLoading(true);
      setError(null);

      // This will prompt the user for permission if not already granted
      const position = await getCurrentPositionPromise();

      const locationData: LocationData = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: position.timestamp,
      };

      setLocation(locationData);
      setLoading(false);

      // Log the location when permission is granted
      console.log('User location approved and logged:', locationData);
      console.log(`Latitude: ${locationData.latitude}, Longitude: ${locationData.longitude}`);
      console.log(`Accuracy: ${locationData.accuracy} meters`);
      console.log(`Timestamp: ${new Date(locationData.timestamp).toLocaleString()}`);

      return true;
    } catch (err: any) {
      setLoading(false);

      if (err.code === 1) {
        setError('Location permission denied');
        console.log('Location permission denied by user');
        return false;
      } else if (err.code === 2) {
        setError('Location unavailable');
        console.log('Location unavailable');
        return false;
      } else {
        setError('Error getting location');
        console.error('Geolocation error:', err);
        return false;
      }
    }
  };

  // Get current location
  const getCurrentLocation = async (): Promise<LocationData | null> => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return null;
    }

    try {
      setLoading(true);
      setError(null);

      const position = await getCurrentPositionPromise();

      const locationData: LocationData = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: position.timestamp,
      };

      setLocation(locationData);
      setLoading(false);

      // Log the location when retrieved
      console.log('User location updated:', locationData);

      return locationData;
    } catch (err: any) {
      setLoading(false);

      if (err.code === 1) {
        setError('Location permission denied');
      } else if (err.code === 2) {
        setError('Location unavailable');
      } else {
        setError('Error getting location');
        console.error('Geolocation error:', err);
      }

      return null;
    }
  };

  // Helper function to promisify getCurrentPosition
  const getCurrentPositionPromise = (): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      });
    });
  };

  const value = {
    location,
    error,
    loading,
    permissionStatus,
    requestLocationPermission,
    getCurrentLocation,
  };

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
};

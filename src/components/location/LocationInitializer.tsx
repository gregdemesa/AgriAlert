import { useEffect } from 'react';
import { useLocation } from '@/lib/LocationContext';

/**
 * A component that automatically requests location permission when mounted.
 * This should be placed at the root level of the application.
 */
export function LocationInitializer() {
  const { requestLocationPermission, getCurrentLocation, permissionStatus, location } = useLocation();

  // Request location permission when the component mounts
  // but only if the permission status is 'prompt' (not yet decided)
  useEffect(() => {
    if (permissionStatus === 'prompt') {
      // Small delay to ensure the app has fully loaded
      const timer = setTimeout(() => {
        requestLocationPermission();
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [permissionStatus, requestLocationPermission]);

  // Get current location if permission is already granted but we don't have location data
  // or if the stored location data is older than 30 minutes
  useEffect(() => {
    const isLocationStale = location &&
      (Date.now() - location.timestamp > 30 * 60 * 1000); // 30 minutes

    if (permissionStatus === 'granted' && (!location || isLocationStale)) {
      // Small delay to ensure the app has fully loaded
      const timer = setTimeout(() => {
        getCurrentLocation();
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [permissionStatus, location, getCurrentLocation]);

  // This component doesn't render anything
  return null;
}

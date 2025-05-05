import { useEffect } from 'react';
import { useLocation } from '@/lib/LocationContext';

/**
 * A component that automatically requests location permission when mounted.
 * This should be placed at the root level of the application.
 */
export function LocationInitializer() {
  const { requestLocationPermission, permissionStatus } = useLocation();

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

  // This component doesn't render anything
  return null;
}

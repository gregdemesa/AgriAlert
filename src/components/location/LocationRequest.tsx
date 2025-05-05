import { useState } from 'react';
import { MapPin, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useLocation } from '@/lib/LocationContext';

interface LocationRequestProps {
  onPermissionGranted?: () => void;
  title?: string;
  description?: string;
  buttonText?: string;
}

export function LocationRequest({
  onPermissionGranted,
  title = 'Location Access',
  description = 'AgriAlert needs your location to provide accurate weather information and alerts for your area.',
  buttonText = 'Allow Location Access',
}: LocationRequestProps) {
  const { requestLocationPermission, permissionStatus, error, loading } = useLocation();
  const [requestSent, setRequestSent] = useState(false);

  const handleRequestLocation = async () => {
    setRequestSent(true);
    const granted = await requestLocationPermission();
    if (granted && onPermissionGranted) {
      onPermissionGranted();
    }
  };

  // If permission is already granted, don't show the request
  if (permissionStatus === 'granted') {
    return null;
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-agri-green" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {permissionStatus === 'denied' && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Permission Denied</AlertTitle>
            <AlertDescription>
              You've denied location access. Please enable location in your browser settings to use this feature.
            </AlertDescription>
          </Alert>
        )}

        {permissionStatus === 'prompt' && !requestSent && (
          <p className="text-sm text-muted-foreground">
            Click the button below to allow AgriAlert to access your location. This helps us provide you with accurate weather information and alerts.
          </p>
        )}
        
        {requestSent && permissionStatus !== 'denied' && !error && (
          <p className="text-sm text-muted-foreground">
            Please respond to the browser's location permission prompt.
          </p>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleRequestLocation} 
          disabled={loading || permissionStatus === 'denied'} 
          className="w-full bg-agri-green hover:bg-agri-green-dark"
        >
          {loading ? 'Getting Location...' : buttonText}
        </Button>
      </CardFooter>
    </Card>
  );
}

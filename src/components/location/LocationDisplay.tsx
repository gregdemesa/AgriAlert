import { MapPin, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLocation, LocationData } from '@/lib/LocationContext';

interface LocationDisplayProps {
  showRefresh?: boolean;
  compact?: boolean;
}

export function LocationDisplay({ showRefresh = true, compact = false }: LocationDisplayProps) {
  const { location, getCurrentLocation, loading } = useLocation();

  const handleRefreshLocation = () => {
    getCurrentLocation();
  };

  const formatCoordinate = (coord: number): string => {
    return coord.toFixed(6);
  };

  const formatTimestamp = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  if (!location) {
    return null;
  }

  if (compact) {
    return (
      <div className="flex items-center gap-2 text-sm">
        <MapPin className="h-4 w-4 text-agri-green" />
        <span>
          {formatCoordinate(location.latitude)}, {formatCoordinate(location.longitude)}
        </span>
        {showRefresh && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={handleRefreshLocation}
            disabled={loading}
          >
            <RefreshCw className="h-3 w-3" />
          </Button>
        )}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-agri-green" />
            <span>Your Location</span>
          </div>
          {showRefresh && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleRefreshLocation}
              disabled={loading}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm">
          <div className="grid grid-cols-2 gap-1">
            <span className="text-muted-foreground">Latitude:</span>
            <span>{formatCoordinate(location.latitude)}</span>
          </div>
          <div className="grid grid-cols-2 gap-1">
            <span className="text-muted-foreground">Longitude:</span>
            <span>{formatCoordinate(location.longitude)}</span>
          </div>
          <div className="grid grid-cols-2 gap-1">
            <span className="text-muted-foreground">Accuracy:</span>
            <span>{Math.round(location.accuracy)} meters</span>
          </div>
          <div className="grid grid-cols-2 gap-1">
            <span className="text-muted-foreground">Updated:</span>
            <span>{formatTimestamp(location.timestamp)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

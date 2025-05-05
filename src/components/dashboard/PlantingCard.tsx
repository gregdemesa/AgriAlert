
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { usePlanting } from "@/lib/PlantingContext";
import { ActiveCrop } from "@/lib/plantingService";
import { Link } from "react-router-dom";

interface PlantingCardProps {
  crops?: ActiveCrop[];
}

export function PlantingCard({ crops: propCrops }: PlantingCardProps) {
  // Use the crops from context if not provided as prop
  const { activeCrops } = usePlanting();
  const cropsData = propCrops || activeCrops.data;
  const isLoading = !propCrops && activeCrops.isLoading;
  // Function to get status badge classes
  const getStatusClass = (status: string) => {
    switch (status) {
      case "upcoming":
        return "bg-blue-100 text-blue-800";
      case "active":
        return "bg-green-100 text-green-800";
      case "ready-to-harvest":
        return "bg-amber-100 text-amber-800";
      case "delayed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Sort crops by status priority if data is available
  const sortedCrops = cropsData ? [...cropsData].sort((a, b) => {
    // Sort by status priority: delayed, ready-to-harvest, active, upcoming
    const statusOrder: Record<string, number> = {
      "delayed": 0,
      "ready-to-harvest": 1,
      "active": 2,
      "upcoming": 3,
    };

    return statusOrder[a.status] - statusOrder[b.status];
  }) : [];

  // Loading skeleton
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="bg-gradient-to-r from-agri-green-light/30 to-agri-green-light/10 pb-2">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Planting Schedule
          </CardTitle>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <div className="divide-y">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="px-6 py-3">
                <div className="flex items-center justify-between mb-1">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-5 w-20 rounded-full" />
                </div>
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="bg-gradient-to-r from-agri-green-light/30 to-agri-green-light/10 pb-2">
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Planting Schedule
        </CardTitle>
      </CardHeader>
      <CardContent className="px-0 pb-0">
        {!cropsData || cropsData.length === 0 ? (
          <div className="px-6 py-4 text-center text-muted-foreground">
            No active crops in your schedule.
          </div>
        ) : (
          <div className="divide-y">
            {sortedCrops.slice(0, 3).map((crop) => (
              <div key={crop.id} className="px-6 py-3">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-medium">{crop.name}</h4>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusClass(
                      crop.status
                    )}`}
                  >
                    {crop.status.replace('-', ' ')}
                  </span>
                </div>
                <div className="text-sm text-muted-foreground flex justify-between">
                  <span>Planted: {crop.plantingDate}</span>
                  <span>Harvest: {crop.expectedHarvest}</span>
                </div>
              </div>
            ))}
            {cropsData.length > 3 && (
              <div className="px-6 py-2 text-center">
                <Link to="/planting" className="text-sm text-agri-green hover:underline">
                  View all {cropsData.length} crops
                </Link>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

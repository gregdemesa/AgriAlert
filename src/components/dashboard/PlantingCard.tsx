
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";

interface Crop {
  id: string;
  name: string;
  plantingDate: string;
  harvestDate: string;
  status: "upcoming" | "active" | "ready-to-harvest" | "delayed";
}

interface PlantingCardProps {
  crops: Crop[];
}

export function PlantingCard({ crops }: PlantingCardProps) {
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
  
  const sortedCrops = [...crops].sort((a, b) => {
    // Sort by status priority: delayed, ready-to-harvest, active, upcoming
    const statusOrder: Record<string, number> = {
      "delayed": 0,
      "ready-to-harvest": 1,
      "active": 2,
      "upcoming": 3,
    };
    
    return statusOrder[a.status] - statusOrder[b.status];
  });

  return (
    <Card>
      <CardHeader className="bg-gradient-to-r from-agri-green-light/30 to-agri-green-light/10 pb-2">
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Planting Schedule
        </CardTitle>
      </CardHeader>
      <CardContent className="px-0 pb-0">
        {crops.length === 0 ? (
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
                  <span>Harvest: {crop.harvestDate}</span>
                </div>
              </div>
            ))}
            {crops.length > 3 && (
              <div className="px-6 py-2 text-center">
                <a href="/planting" className="text-sm text-agri-green hover:underline">
                  View all {crops.length} crops
                </a>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

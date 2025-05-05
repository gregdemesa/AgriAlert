
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRecommendations } from "@/lib/RecommendationsContext";
import { Loader2 } from "lucide-react";

export function RecommendationsCard() {
  const { recommendations } = useRecommendations();
  const { data, isLoading, error } = recommendations;

  // Function to get priority badge classes
  const getPriorityClass = (priority: string) => {
    switch (priority) {
      case "low":
        return "bg-green-100 text-green-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "high":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-agri-green/20 to-agri-green-light/10 pb-2">
        <CardTitle>AI Recommendations</CardTitle>
      </CardHeader>
      <CardContent className="px-0 pb-0">
        {isLoading ? (
          <div className="px-6 py-8 flex justify-center items-center">
            <Loader2 className="h-6 w-6 animate-spin text-agri-green mr-2" />
            <span>Generating recommendations...</span>
          </div>
        ) : error ? (
          <div className="px-6 py-4 text-center text-muted-foreground">
            Unable to generate recommendations. Please try again later.
          </div>
        ) : !data || data.length === 0 ? (
          <div className="px-6 py-4 text-center text-muted-foreground">
            No recommendations available.
          </div>
        ) : (
          <div className="divide-y max-h-[400px] overflow-y-auto">
            {data.map((rec) => (
              <div key={rec.id} className="px-6 py-4">
                <div className="flex items-start justify-between mb-1">
                  <h4 className="font-medium">{rec.title}</h4>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getPriorityClass(
                      rec.priority
                    )}`}
                  >
                    {rec.priority}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {rec.description}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

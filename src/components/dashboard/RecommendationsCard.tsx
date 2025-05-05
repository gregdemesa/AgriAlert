
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Recommendation {
  id: string;
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
}

interface RecommendationsCardProps {
  recommendations: Recommendation[];
}

export function RecommendationsCard({ recommendations }: RecommendationsCardProps) {
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
    <Card>
      <CardHeader className="bg-gradient-to-r from-agri-green/20 to-agri-green-light/10 pb-2">
        <CardTitle>AI Recommendations</CardTitle>
      </CardHeader>
      <CardContent className="px-0 pb-0">
        {recommendations.length === 0 ? (
          <div className="px-6 py-4 text-center text-muted-foreground">
            No recommendations available.
          </div>
        ) : (
          <div className="divide-y">
            {recommendations.map((rec) => (
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

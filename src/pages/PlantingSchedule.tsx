
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, AlertTriangle } from "lucide-react";

const PlantingSchedule = () => {
  // Mock data for active crops
  const activeCrops = [
    {
      id: "1",
      name: "Lowland Rice",
      variety: "NSIC Rc222",
      plantingDate: "Jun 15, 2024",
      expectedHarvest: "Sep 30, 2024",
      status: "delayed",
      location: "East Field",
      area: "2.5 hectares",
      alerts: [
        "Harvest delayed due to expected heavy rainfall",
        "Consider early harvest to avoid crop damage",
      ],
    },
    {
      id: "2",
      name: "Sweet Corn",
      variety: "Sugar King",
      plantingDate: "Jul 1, 2024",
      expectedHarvest: "Sep 15, 2024",
      status: "ready-to-harvest",
      location: "North Field",
      area: "1.2 hectares",
      alerts: [],
    },
    {
      id: "3",
      name: "Tomatoes",
      variety: "Roma",
      plantingDate: "Aug 1, 2024",
      expectedHarvest: "Oct 15, 2024",
      status: "active",
      location: "Greenhouse 2",
      area: "0.5 hectares",
      alerts: [],
    },
  ];

  // Mock data for upcoming crops
  const upcomingCrops = [
    {
      id: "4",
      name: "Eggplant",
      variety: "Long Purple",
      plantingDate: "Sep 10, 2024",
      expectedHarvest: "Dec 5, 2024",
      status: "upcoming",
      location: "South Field",
      area: "1.0 hectares",
      alerts: [],
    },
    {
      id: "5",
      name: "String Beans",
      variety: "Kentucky Wonder",
      plantingDate: "Sep 20, 2024",
      expectedHarvest: "Nov 25, 2024",
      status: "upcoming",
      location: "West Field",
      area: "0.8 hectares",
      alerts: [
        "Consider delaying planting by 1 week due to forecasted heavy rainfall",
      ],
    },
  ];

  // Mock data for historical crops
  const historicalCrops = [
    {
      id: "6",
      name: "Watermelon",
      variety: "Sugar Baby",
      plantingDate: "Feb 15, 2024",
      harvestDate: "May 10, 2024",
      location: "South Field",
      area: "1.5 hectares",
      yield: "18.5 tons",
      notes: "Good yield despite dry spell in March",
    },
    {
      id: "7",
      name: "Okra",
      variety: "Clemson Spineless",
      plantingDate: "Mar 1, 2024",
      harvestDate: "Jun 15, 2024",
      location: "East Field",
      area: "1.0 hectares",
      yield: "8.2 tons",
      notes: "Affected by aphids in early stages, yield lower than expected",
    },
  ];

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Planting Schedule</h1>
          <p className="text-muted-foreground">
            Manage your crop calendar and view weather-adjusted planting times.
          </p>
        </div>
        <Button className="bg-agri-green hover:bg-agri-green-dark">
          <Calendar className="h-4 w-4 mr-2" /> Add Crop
        </Button>
      </div>

      <Tabs defaultValue="active">
        <TabsList>
          <TabsTrigger value="active">Active Crops</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="historical">Historical</TabsTrigger>
        </TabsList>
        
        <TabsContent value="active" className="pt-4 space-y-4">
          {activeCrops.map((crop) => (
            <Card key={crop.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle>{crop.name} - {crop.variety}</CardTitle>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusClass(
                      crop.status
                    )}`}
                  >
                    {crop.status.replace('-', ' ')}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <dl className="grid grid-cols-2 gap-x-4 gap-y-2">
                      <dt className="text-sm font-medium text-muted-foreground">Planting Date</dt>
                      <dd className="text-sm">{crop.plantingDate}</dd>
                      <dt className="text-sm font-medium text-muted-foreground">Expected Harvest</dt>
                      <dd className="text-sm">{crop.expectedHarvest}</dd>
                      <dt className="text-sm font-medium text-muted-foreground">Location</dt>
                      <dd className="text-sm">{crop.location}</dd>
                      <dt className="text-sm font-medium text-muted-foreground">Area</dt>
                      <dd className="text-sm">{crop.area}</dd>
                    </dl>
                  </div>
                  {crop.alerts.length > 0 && (
                    <div className="bg-amber-50 p-3 rounded-md">
                      <div className="flex items-center gap-2 text-amber-800 font-medium mb-2">
                        <AlertTriangle className="h-4 w-4" />
                        <span>Alerts & Recommendations</span>
                      </div>
                      <ul className="space-y-1">
                        {crop.alerts.map((alert, index) => (
                          <li key={index} className="text-sm text-amber-800">• {alert}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
        
        <TabsContent value="upcoming" className="pt-4 space-y-4">
          {upcomingCrops.map((crop) => (
            <Card key={crop.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle>{crop.name} - {crop.variety}</CardTitle>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusClass(
                      crop.status
                    )}`}
                  >
                    {crop.status}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <dl className="grid grid-cols-2 gap-x-4 gap-y-2">
                      <dt className="text-sm font-medium text-muted-foreground">Planned Planting</dt>
                      <dd className="text-sm">{crop.plantingDate}</dd>
                      <dt className="text-sm font-medium text-muted-foreground">Expected Harvest</dt>
                      <dd className="text-sm">{crop.expectedHarvest}</dd>
                      <dt className="text-sm font-medium text-muted-foreground">Location</dt>
                      <dd className="text-sm">{crop.location}</dd>
                      <dt className="text-sm font-medium text-muted-foreground">Area</dt>
                      <dd className="text-sm">{crop.area}</dd>
                    </dl>
                  </div>
                  {crop.alerts.length > 0 && (
                    <div className="bg-amber-50 p-3 rounded-md">
                      <div className="flex items-center gap-2 text-amber-800 font-medium mb-2">
                        <AlertTriangle className="h-4 w-4" />
                        <span>Alerts & Recommendations</span>
                      </div>
                      <ul className="space-y-1">
                        {crop.alerts.map((alert, index) => (
                          <li key={index} className="text-sm text-amber-800">• {alert}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
        
        <TabsContent value="historical" className="pt-4 space-y-4">
          {historicalCrops.map((crop) => (
            <Card key={crop.id}>
              <CardHeader className="pb-2">
                <CardTitle>{crop.name} - {crop.variety}</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="grid md:grid-cols-3 gap-x-4 gap-y-2">
                  <dt className="text-sm font-medium text-muted-foreground">Planting Date</dt>
                  <dd className="text-sm md:col-span-2">{crop.plantingDate}</dd>
                  <dt className="text-sm font-medium text-muted-foreground">Harvest Date</dt>
                  <dd className="text-sm md:col-span-2">{crop.harvestDate}</dd>
                  <dt className="text-sm font-medium text-muted-foreground">Location</dt>
                  <dd className="text-sm md:col-span-2">{crop.location}</dd>
                  <dt className="text-sm font-medium text-muted-foreground">Area</dt>
                  <dd className="text-sm md:col-span-2">{crop.area}</dd>
                  <dt className="text-sm font-medium text-muted-foreground">Yield</dt>
                  <dd className="text-sm md:col-span-2">{crop.yield}</dd>
                  <dt className="text-sm font-medium text-muted-foreground">Notes</dt>
                  <dd className="text-sm md:col-span-2">{crop.notes}</dd>
                </dl>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PlantingSchedule;

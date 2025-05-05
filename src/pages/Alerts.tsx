
import { AlertCard } from "@/components/dashboard/AlertCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Alerts = () => {
  // Mock data for current alerts
  const currentAlerts = [
    {
      id: "1",
      title: "Heavy Rainfall Expected",
      description: "Expect 15-20mm of rainfall in the next 24 hours, which may affect lowland crops.",
      level: "severe" as const,
      time: "Today, 10:30 AM",
    },
    {
      id: "2",
      title: "Weather Warning",
      description: "High temperatures forecasted for the next week; ensure adequate irrigation.",
      level: "warning" as const,
      time: "Yesterday, 3:15 PM",
    },
  ];

  // Mock data for past alerts
  const pastAlerts = [
    {
      id: "3",
      title: "Typhoon Warning",
      description: "Typhoon expected to make landfall in 72 hours. Secure crops and farm equipment.",
      level: "emergency" as const,
      time: "Sep 15, 2:30 PM",
    },
    {
      id: "4",
      title: "Pest Alert: Fall Armyworm",
      description: "Fall armyworm detected in neighboring farms. Inspect crops and apply preventive measures.",
      level: "severe" as const,
      time: "Sep 10, 9:15 AM",
    },
    {
      id: "5",
      title: "Drought Advisory",
      description: "Extended dry period expected. Implement water conservation measures.",
      level: "warning" as const,
      time: "Aug 28, 11:45 AM",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Alerts & Warnings</h1>
        <p className="text-muted-foreground">
          Stay informed about weather events and other conditions affecting your farm.
        </p>
      </div>

      <Tabs defaultValue="current">
        <TabsList>
          <TabsTrigger value="current">Current Alerts</TabsTrigger>
          <TabsTrigger value="past">Past Alerts</TabsTrigger>
        </TabsList>
        <TabsContent value="current" className="pt-4">
          <AlertCard alerts={currentAlerts} />
        </TabsContent>
        <TabsContent value="past" className="pt-4">
          <AlertCard alerts={pastAlerts} />
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Alert Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium" htmlFor="alert-radius">
                Alert Radius
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  id="alert-radius"
                  min="5"
                  max="50"
                  defaultValue="20"
                  className="w-full"
                />
                <span className="text-sm">20 km</span>
              </div>
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Alert Types</label>
              <div className="grid gap-2">
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="weather-alerts" defaultChecked />
                  <label htmlFor="weather-alerts">Weather Alerts</label>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="pest-alerts" defaultChecked />
                  <label htmlFor="pest-alerts">Pest & Disease Alerts</label>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="market-alerts" defaultChecked />
                  <label htmlFor="market-alerts">Market Price Alerts</label>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Alerts;


import { AlertCard } from "@/components/dashboard/AlertCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAlerts } from "@/lib/AlertContext";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const Alerts = () => {
  const { currentAlerts, pastAlerts, emailNotificationsEnabled, setEmailNotificationsEnabled } = useAlerts();

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
          <CardTitle>Email Notification Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-notifications">Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive alerts via email
                </p>
              </div>
              <Switch
                id="email-notifications"
                checked={emailNotificationsEnabled}
                onCheckedChange={setEmailNotificationsEnabled}
              />
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              When enabled, you will receive email notifications for new weather alerts.
              You can customize which types of notifications you receive in the Settings page.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Alerts;

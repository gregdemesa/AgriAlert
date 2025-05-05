
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

const Settings = () => {
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
  });

  const [emailNotificationTypes, setEmailNotificationTypes] = useState({
    weatherAlerts: true,
    harvestReminders: true,
    marketUpdates: false,
    systemUpdates: true,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account and application preferences.
        </p>
      </div>

      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="farm">Farm Details</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="sensors">IoT Sensors</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile" className="pt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" defaultValue="John" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" defaultValue="Doe" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" defaultValue="john@example.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" type="tel" defaultValue="+63 912 345 6789" />
              </div>
              <Button>Save Changes</Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input id="currentPassword" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input id="newPassword" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input id="confirmPassword" type="password" />
              </div>
              <Button>Change Password</Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="farm" className="pt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Farm Location</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="farmName">Farm Name</Label>
                <Input id="farmName" defaultValue="Green Valley Farm" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input id="address" defaultValue="123 Agriculture Road" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City/Municipality</Label>
                  <Input id="city" defaultValue="San Fernando" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="province">Province</Label>
                  <Input id="province" defaultValue="Pampanga" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zipCode">ZIP Code</Label>
                  <Input id="zipCode" defaultValue="2000" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="coordinates">GPS Coordinates</Label>
                <Input id="coordinates" defaultValue="15.0333° N, 120.6833° E" />
              </div>
              <Button>Save Location</Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Farm Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="farmSize">Total Farm Size (hectares)</Label>
                <Input id="farmSize" type="number" defaultValue="5.5" />
              </div>
              <div className="space-y-2">
                <Label>Primary Crops</Label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="rice" defaultChecked />
                    <Label htmlFor="rice">Rice</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="corn" defaultChecked />
                    <Label htmlFor="corn">Corn</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="vegetables" defaultChecked />
                    <Label htmlFor="vegetables">Vegetables</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="fruits" />
                    <Label htmlFor="fruits">Fruits</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="other" />
                    <Label htmlFor="other">Other</Label>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="soilType">Soil Type</Label>
                <select id="soilType" className="w-full rounded-md border p-2">
                  <option value="clay">Clay</option>
                  <option value="loam" selected>Loam</option>
                  <option value="sandy">Sandy</option>
                  <option value="silty">Silty</option>
                </select>
              </div>
              <Button>Save Details</Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications" className="pt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Channels</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-notifications">Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive alerts and updates via email
                  </p>
                </div>
                <Switch
                  id="email-notifications"
                  checked={notifications.email}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, email: checked })
                  }
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="push-notifications">Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive alerts on your mobile device
                  </p>
                </div>
                <Switch
                  id="push-notifications"
                  checked={notifications.push}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, push: checked })
                  }
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="sms-notifications">SMS Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive critical alerts via text message
                  </p>
                </div>
                <Switch
                  id="sms-notifications"
                  checked={notifications.sms}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, sms: checked })
                  }
                />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Notification Types</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="weather-alerts">Weather Alerts</Label>
                <Switch
                  id="weather-alerts"
                  checked={emailNotificationTypes.weatherAlerts}
                  onCheckedChange={(checked) =>
                    setEmailNotificationTypes({
                      ...emailNotificationTypes,
                      weatherAlerts: checked,
                    })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="harvest-reminders">Harvest Reminders</Label>
                <Switch
                  id="harvest-reminders"
                  checked={emailNotificationTypes.harvestReminders}
                  onCheckedChange={(checked) =>
                    setEmailNotificationTypes({
                      ...emailNotificationTypes,
                      harvestReminders: checked,
                    })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="market-updates">Market Updates</Label>
                <Switch
                  id="market-updates"
                  checked={emailNotificationTypes.marketUpdates}
                  onCheckedChange={(checked) =>
                    setEmailNotificationTypes({
                      ...emailNotificationTypes,
                      marketUpdates: checked,
                    })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="system-updates">System Updates</Label>
                <Switch
                  id="system-updates"
                  checked={emailNotificationTypes.systemUpdates}
                  onCheckedChange={(checked) =>
                    setEmailNotificationTypes({
                      ...emailNotificationTypes,
                      systemUpdates: checked,
                    })
                  }
                />
              </div>
              <Button>Save Preferences</Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="sensors" className="pt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>IoT Sensor Integration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Connect your IoT sensors for more accurate and localized alerts.
              </p>
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="h-10 w-10 bg-blue-100 rounded-md flex items-center justify-center text-blue-700">
                    <span className="font-medium">1</span>
                  </div>
                  <div>
                    <h4 className="font-medium">Register Sensor</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Enter your sensor's unique ID to register it with AgriAlert.
                    </p>
                    <div className="flex space-x-2 mt-2">
                      <Input placeholder="Sensor ID" />
                      <Button>Register</Button>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="h-10 w-10 bg-blue-100 rounded-md flex items-center justify-center text-blue-700">
                    <span className="font-medium">2</span>
                  </div>
                  <div>
                    <h4 className="font-medium">Place Sensor</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Install your sensor in the field according to the provided instructions.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="h-10 w-10 bg-blue-100 rounded-md flex items-center justify-center text-blue-700">
                    <span className="font-medium">3</span>
                  </div>
                  <div>
                    <h4 className="font-medium">Verify Connection</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Ensure your sensor is properly connected and sending data.
                    </p>
                    <Button variant="outline" className="mt-2">Test Connection</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Connected Sensors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <div className="grid grid-cols-5 p-4 font-medium border-b">
                  <div>Sensor ID</div>
                  <div>Type</div>
                  <div>Location</div>
                  <div>Status</div>
                  <div>Last Update</div>
                </div>
                <div className="divide-y">
                  <div className="grid grid-cols-5 p-4">
                    <div>SN-2024-001</div>
                    <div>Soil Moisture</div>
                    <div>East Field</div>
                    <div>
                      <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-green-100 text-green-800">
                        Active
                      </span>
                    </div>
                    <div>10 mins ago</div>
                  </div>
                  <div className="grid grid-cols-5 p-4">
                    <div>SN-2024-002</div>
                    <div>Rain Gauge</div>
                    <div>North Field</div>
                    <div>
                      <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-green-100 text-green-800">
                        Active
                      </span>
                    </div>
                    <div>5 mins ago</div>
                  </div>
                  <div className="grid grid-cols-5 p-4">
                    <div>SN-2024-003</div>
                    <div>Weather Station</div>
                    <div>Central Area</div>
                    <div>
                      <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-red-100 text-red-800">
                        Offline
                      </span>
                    </div>
                    <div>2 days ago</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;

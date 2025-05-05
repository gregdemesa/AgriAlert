
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/lib/AuthContext";
import { useLocation } from "@/lib/LocationContext";
import { useToast } from "@/components/ui/use-toast";
import { updateProfile, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { LocationDisplay } from "@/components/location/LocationDisplay";
import { EmailNotificationSettings, defaultEmailNotificationSettings } from "@/lib/emailService";
import { useAlerts } from "@/lib/AlertContext";

const Settings = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const { location, permissionStatus } = useLocation();
  const [showLocationRequest, setShowLocationRequest] = useState(false);

  // User profile state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState(""); // Leave blank if not available
  const [isLoading, setIsLoading] = useState(false);

  // We no longer need to show the location request component
  // as it's now handled at the app level

  // Email notification settings
  const [emailNotifications, setEmailNotifications] = useState<EmailNotificationSettings>(defaultEmailNotificationSettings);
  const { emailNotificationsEnabled, setEmailNotificationsEnabled } = useAlerts();

  // Load user data when component mounts
  useEffect(() => {
    if (currentUser) {
      // Set email from Firebase auth
      setEmail(currentUser.email || "");

      // Parse displayName to get first and last name
      if (currentUser.displayName) {
        const nameParts = currentUser.displayName.split(" ");
        setFirstName(nameParts[0] || "");
        setLastName(nameParts.slice(1).join(" ") || "");
      }

      // Explicitly ensure phone is empty (not email)
      setPhone("");
    }
  }, [currentUser]);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Handle profile update
  const handleProfileUpdate = async () => {
    if (!currentUser) return;

    try {
      setIsLoading(true);

      // Update display name in Firebase
      await updateProfile(currentUser, {
        displayName: `${firstName} ${lastName}`
      });

      toast({
        title: "Profile Updated",
        description: "Your profile information has been updated successfully.",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Update Failed",
        description: "There was a problem updating your profile.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle password change
  const handlePasswordChange = async () => {
    if (!currentUser || !currentUser.email) return;

    // Validate passwords
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      toast({
        title: "Error",
        description: "Please fill in all password fields",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmNewPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsChangingPassword(true);

      // Re-authenticate user before changing password
      const credential = EmailAuthProvider.credential(
        currentUser.email,
        currentPassword
      );

      await reauthenticateWithCredential(currentUser, credential);

      // Update password
      await updatePassword(currentUser, newPassword);

      // Clear password fields
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");

      toast({
        title: "Password Updated",
        description: "Your password has been changed successfully.",
      });
    } catch (error: any) {
      console.error("Error changing password:", error);

      let errorMessage = "There was a problem changing your password.";

      // Handle specific Firebase errors
      if (error.code === "auth/wrong-password") {
        errorMessage = "Current password is incorrect.";
      } else if (error.code === "auth/too-many-requests") {
        errorMessage = "Too many attempts. Please try again later.";
      }

      toast({
        title: "Password Change Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

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
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  disabled={true} // Email can't be changed in Firebase without re-authentication
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Email address cannot be changed directly. Please contact support for assistance.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter your phone number"
                  disabled={isLoading}
                />
              </div>
              <Button
                onClick={handleProfileUpdate}
                disabled={isLoading}
              >
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  disabled={isChangingPassword}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={isChangingPassword}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
                <Input
                  id="confirmNewPassword"
                  type="password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  disabled={isChangingPassword}
                />
              </div>
              <Button
                onClick={handlePasswordChange}
                disabled={isChangingPassword || !currentUser?.email}
              >
                {isChangingPassword ? "Changing Password..." : "Change Password"}
              </Button>
              {!currentUser?.email && (
                <p className="text-xs text-muted-foreground mt-1">
                  Password change is only available for email/password accounts.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="farm" className="pt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Farm Location</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {location && (
                <div className="mb-4">
                  <LocationDisplay />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="farmName">Farm Name</Label>
                <Input id="farmName" placeholder="Enter farm name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input id="address" placeholder="Enter farm address" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City/Municipality</Label>
                  <Input id="city" placeholder="City" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="province">Province</Label>
                  <Input id="province" placeholder="Province" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zipCode">ZIP Code</Label>
                  <Input id="zipCode" placeholder="ZIP Code" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="coordinates">GPS Coordinates</Label>
                <Input
                  id="coordinates"
                  placeholder="Latitude, Longitude"
                  value={location ? `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}` : ""}
                  readOnly={!!location}
                />
                {!location && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Use the "Get Current Location" button above to automatically fill this field.
                  </p>
                )}
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
                <Input id="farmSize" type="number" placeholder="Enter farm size" />
              </div>
              <div className="space-y-2">
                <Label>Primary Crops</Label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="rice" />
                    <Label htmlFor="rice">Rice</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="corn" />
                    <Label htmlFor="corn">Corn</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="vegetables" />
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
                  <option value="">Select soil type</option>
                  <option value="clay">Clay</option>
                  <option value="loam">Loam</option>
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
              <CardTitle>Email Notifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-notifications">Enable Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive alerts and updates via email
                  </p>
                </div>
                <Switch
                  id="email-notifications"
                  checked={emailNotificationsEnabled}
                  onCheckedChange={setEmailNotificationsEnabled}
                />
              </div>
              <Separator />
              <p className="text-sm font-medium mb-2">Notification Types</p>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="weather-alerts">Weather Alerts</Label>
                  <Switch
                    id="weather-alerts"
                    checked={emailNotificationsEnabled && emailNotifications.types.weatherAlerts}
                    disabled={!emailNotificationsEnabled}
                    onCheckedChange={(checked) =>
                      setEmailNotifications({
                        ...emailNotifications,
                        types: {
                          ...emailNotifications.types,
                          weatherAlerts: checked,
                        },
                      })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="harvest-reminders">Harvest Reminders</Label>
                  <Switch
                    id="harvest-reminders"
                    checked={emailNotificationsEnabled && emailNotifications.types.harvestReminders}
                    disabled={!emailNotificationsEnabled}
                    onCheckedChange={(checked) =>
                      setEmailNotifications({
                        ...emailNotifications,
                        types: {
                          ...emailNotifications.types,
                          harvestReminders: checked,
                        },
                      })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="system-updates">System Updates</Label>
                  <Switch
                    id="system-updates"
                    checked={emailNotificationsEnabled && emailNotifications.types.systemUpdates}
                    disabled={!emailNotificationsEnabled}
                    onCheckedChange={(checked) =>
                      setEmailNotifications({
                        ...emailNotifications,
                        types: {
                          ...emailNotifications.types,
                          systemUpdates: checked,
                        },
                      })
                    }
                  />
                </div>
              </div>
              <Button
                className="mt-2"
                onClick={async () => {
                  try {
                    // Save notification types to Firebase
                    if (currentUser) {
                      const userPrefsRef = doc(db, 'userPreferences', currentUser.uid);
                      await setDoc(userPrefsRef, {
                        emailNotificationTypes: emailNotifications.types
                      }, { merge: true });

                      toast({
                        title: "Preferences saved",
                        description: "Your notification preferences have been updated.",
                      });
                    }
                  } catch (error) {
                    console.error('Error saving notification preferences:', error);
                    toast({
                      title: "Error",
                      description: "Failed to save notification preferences.",
                      variant: "destructive",
                    });
                  }
                }}
              >
                Save Preferences
              </Button>
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

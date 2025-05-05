
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, AlertTriangle, Edit, Trash2, MoreHorizontal } from "lucide-react";
import { usePlanting } from "@/lib/PlantingContext";
import { useAuth } from "@/lib/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import CropForm from "@/components/planting/CropForm";
import { ActiveCrop, HistoricalCrop } from "@/lib/plantingService";

const PlantingSchedule = () => {
  const {
    activeCrops,
    upcomingCrops,
    historicalCrops,
    addCrop,
    updateCrop,
    deleteCrop,
    markCropAsHarvested
  } = usePlanting();
  const { currentUser } = useAuth();
  const userId = currentUser?.uid;
  const { toast } = useToast();

  // State for the crop form dialog
  const [formOpen, setFormOpen] = useState(false);
  const [selectedCrop, setSelectedCrop] = useState<ActiveCrop | HistoricalCrop | undefined>(undefined);
  const [isEditing, setIsEditing] = useState(false);

  // State for the delete confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [cropToDelete, setCropToDelete] = useState<string | null>(null);

  // State for the harvest dialog
  const [harvestDialogOpen, setHarvestDialogOpen] = useState(false);
  const [cropToHarvest, setCropToHarvest] = useState<ActiveCrop | null>(null);
  const [harvestDate, setHarvestDate] = useState<Date | undefined>(new Date());
  const [yieldAmount, setYieldAmount] = useState('');
  const [harvestNotes, setHarvestNotes] = useState('');
  const [isHarvestLoading, setIsHarvestLoading] = useState(false);

  // State for tracking the current tab
  const [currentTab, setCurrentTab] = useState("active");

  // Refetch data when tab changes, with debouncing to prevent excessive API calls
  useEffect(() => {
    // Create a debounced refetch function to prevent too many API calls
    const debouncedRefetch = setTimeout(() => {
      try {
        // Only refetch the data for the current tab to reduce Firebase load
        if (currentTab === 'active') {
          activeCrops.refetch();
        } else if (currentTab === 'upcoming') {
          upcomingCrops.refetch();
        } else if (currentTab === 'historical') {
          historicalCrops.refetch();
        }
      } catch (error) {
        console.error("Error refetching data:", error);
        toast({
          title: "Error",
          description: "Failed to load data. Please refresh the page.",
          variant: "destructive",
        });
      }
    }, 300); // 300ms debounce delay

    // Clean up the timeout when the component unmounts or when the tab changes again
    return () => clearTimeout(debouncedRefetch);
  }, [currentTab]);

  // Log active crops whenever they change
  useEffect(() => {
    if (activeCrops.data) {
      const activeStatusCrops = activeCrops.data.filter(crop => crop.status === 'active');
      console.log('Crops with active status:', activeStatusCrops);
      console.log('All crops in activeCrops:', activeCrops.data);
    }
  }, [activeCrops.data]);

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
      case "completed":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Handle opening the form for a new crop
  const handleAddCrop = () => {
    setSelectedCrop(undefined);
    setIsEditing(false);
    setFormOpen(true);
  };

  // Handle opening the form for editing a crop
  const handleEditCrop = (crop: ActiveCrop | HistoricalCrop) => {
    setSelectedCrop(crop);
    setIsEditing(true);
    setFormOpen(true);
  };

  // Handle deleting a crop
  const handleDeleteClick = (cropId: string) => {
    setCropToDelete(cropId);
    setDeleteDialogOpen(true);
  };

  // Confirm deletion of a crop
  const confirmDelete = async () => {
    if (cropToDelete) {
      try {
        await deleteCrop(cropToDelete);

        // Explicitly refetch all data to ensure the UI is updated
        activeCrops.refetch();
        upcomingCrops.refetch();
        historicalCrops.refetch();

        toast({
          title: "Crop deleted",
          description: "The crop has been successfully deleted.",
        });
      } catch (error) {
        console.error("Error deleting crop:", error);
        toast({
          title: "Error",
          description: "Failed to delete the crop. Please try again.",
          variant: "destructive",
        });
      } finally {
        setCropToDelete(null);
        setDeleteDialogOpen(false);
      }
    }
  };

  // Handle opening the harvest dialog
  const handleHarvestClick = (crop: ActiveCrop) => {
    setCropToHarvest(crop);
    setHarvestDate(new Date());
    setYieldAmount('');
    setHarvestNotes('');
    setHarvestDialogOpen(true);
  };

  // Confirm harvesting a crop
  const confirmHarvest = async () => {
    if (cropToHarvest && harvestDate) {
      try {
        setIsHarvestLoading(true);
        await markCropAsHarvested(
          cropToHarvest.id!,
          format(harvestDate, 'MMM d, yyyy'),
          yieldAmount || 'Not recorded',
          harvestNotes
        );

        // Switch to historical tab
        setCurrentTab('historical');

        // Explicitly refetch all data to ensure the UI is updated
        activeCrops.refetch();
        upcomingCrops.refetch();
        historicalCrops.refetch();

        toast({
          title: "Crop marked as harvested",
          description: "The crop has been moved to the historical records.",
        });
      } catch (error) {
        console.error("Error marking crop as harvested:", error);
        toast({
          title: "Error",
          description: "Failed to mark the crop as harvested. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsHarvestLoading(false);
        setCropToHarvest(null);
        setHarvestDialogOpen(false);
      }
    }
  };

  // Handle form submission for adding/editing a crop
  const handleFormSubmit = async (cropData: Omit<ActiveCrop | HistoricalCrop, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      if (!userId) {
        console.error("No user ID available");
        toast({
          title: "Error",
          description: "You must be logged in to perform this action.",
          variant: "destructive",
        });
        return;
      }

      if (isEditing && selectedCrop?.id) {
        console.log('Updating crop with ID:', selectedCrop.id);
        console.log('Previous status:', selectedCrop.status);
        console.log('New status:', cropData.status);

        // Ensure userId is included in the update data
        const updateData = {
          ...cropData,
          userId: userId // Explicitly set the userId to preserve it
        };

        console.log('Update data with userId:', updateData);
        await updateCrop(selectedCrop.id, updateData);
        console.log('Crop updated in Firestore');

        // Determine which tab to show based on the new status
        if ('status' in cropData) {
          if (cropData.status === 'upcoming') {
            setCurrentTab('upcoming');
          } else if (cropData.status === 'completed') {
            setCurrentTab('historical');
          } else {
            setCurrentTab('active');
          }
        }

        // Explicitly refetch all data to ensure the UI is updated
        console.log('Refetching all crop data...');
        await Promise.all([
          activeCrops.refetch(),
          upcomingCrops.refetch(),
          historicalCrops.refetch()
        ]);
        console.log('All crop data refetched');

        toast({
          title: "Crop updated",
          description: "The crop has been successfully updated.",
        });
      } else {
        console.log('Adding new crop with status:', cropData.status);

        // Ensure userId is included in the new crop data
        const newCropData = {
          ...cropData,
          userId: userId // Explicitly set the userId
        };

        console.log('New crop data with userId:', newCropData);
        await addCrop(newCropData);
        console.log('New crop added to Firestore');

        // Switch to the appropriate tab for the new crop
        if ('status' in cropData) {
          if (cropData.status === 'upcoming') {
            setCurrentTab('upcoming');
          } else if (cropData.status === 'completed') {
            setCurrentTab('historical');
          } else {
            setCurrentTab('active');
          }
        }

        // Explicitly refetch all data to ensure the UI is updated
        console.log('Refetching all crop data...');
        await Promise.all([
          activeCrops.refetch(),
          upcomingCrops.refetch(),
          historicalCrops.refetch()
        ]);
        console.log('All crop data refetched');

        toast({
          title: "Crop added",
          description: "The crop has been successfully added to your planting schedule.",
        });
      }
    } catch (error) {
      console.error("Error saving crop:", error);
      toast({
        title: "Error",
        description: "Failed to save the crop. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Check if all data is loading initially
  const isInitialLoading = activeCrops.isLoading && upcomingCrops.isLoading && historicalCrops.isLoading;

  // Check for any errors across all queries
  const hasErrors = activeCrops.error || upcomingCrops.error || historicalCrops.error;

  // Show a global loading state on initial load
  if (isInitialLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Planting Schedule</h1>
            <p className="text-muted-foreground">
              Loading your planting data...
            </p>
          </div>
          <Skeleton className="h-10 w-32" />
        </div>

        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <Card key={index}>
              <CardHeader className="pb-2">
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <dl className="grid grid-cols-2 gap-x-4 gap-y-2">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="contents">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-4 w-32" />
                        </div>
                      ))}
                    </dl>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Show a global error state if any of the queries failed
  if (hasErrors) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Planting Schedule</h1>
            <p className="text-muted-foreground">
              There was a problem loading your data.
            </p>
          </div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
            <div>
              <h3 className="text-red-800 font-medium">Error loading planting schedule</h3>
              <p className="text-red-700 mt-1">
                We encountered an issue connecting to the database. This could be due to network issues or server problems.
              </p>
              <Button
                variant="outline"
                className="mt-3"
                onClick={() => {
                  activeCrops.refetch();
                  upcomingCrops.refetch();
                  historicalCrops.refetch();
                }}
              >
                Retry Loading Data
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Planting Schedule</h1>
          <p className="text-muted-foreground">
            Manage your crop calendar and view weather-adjusted planting times.
          </p>
        </div>
        <Button
          className="bg-agri-green hover:bg-agri-green-dark"
          onClick={handleAddCrop}
        >
          <Calendar className="h-4 w-4 mr-2" /> Add Crop
        </Button>
      </div>

      <Tabs value={currentTab} onValueChange={setCurrentTab}>
        <TabsList>
          <TabsTrigger value="active">Active Crops</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="historical">Historical</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="pt-4 space-y-4">
          {activeCrops.isLoading ? (
            // Loading skeleton
            Array.from({ length: 3 }).map((_, index) => (
              <Card key={index}>
                <CardHeader className="pb-2">
                  <Skeleton className="h-6 w-48" />
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <dl className="grid grid-cols-2 gap-x-4 gap-y-2">
                        {Array.from({ length: 4 }).map((_, i) => (
                          <div key={i} className="contents">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 w-32" />
                          </div>
                        ))}
                      </dl>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : activeCrops.error ? (
            <div className="text-center py-8 text-red-500">
              Error loading crops: {activeCrops.error.message}
              <Button
                variant="outline"
                className="mt-2 mx-auto block"
                onClick={() => activeCrops.refetch()}
              >
                Retry
              </Button>
            </div>
          ) : activeCrops.data && activeCrops.data.filter(crop => ['active', 'ready-to-harvest', 'delayed'].includes(crop.status)).length > 0 ? (
            activeCrops.data
              .filter(crop => ['active', 'ready-to-harvest', 'delayed'].includes(crop.status))
              .map((crop) => (
                <Card key={crop.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle>{crop.name} - {crop.variety}</CardTitle>
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusClass(
                            crop.status
                          )}`}
                        >
                          {crop.status.replace('-', ' ')}
                        </span>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditCrop(crop)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleHarvestClick(crop)}>
                              <Calendar className="h-4 w-4 mr-2" />
                              Mark as Harvested
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteClick(crop.id!)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
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
              ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No active crops found. Add a crop to get started.
            </div>
          )}
        </TabsContent>

        <TabsContent value="upcoming" className="pt-4 space-y-4">
          {upcomingCrops.isLoading ? (
            // Loading skeleton
            Array.from({ length: 2 }).map((_, index) => (
              <Card key={index}>
                <CardHeader className="pb-2">
                  <Skeleton className="h-6 w-48" />
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <dl className="grid grid-cols-2 gap-x-4 gap-y-2">
                        {Array.from({ length: 4 }).map((_, i) => (
                          <div key={i} className="contents">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 w-32" />
                          </div>
                        ))}
                      </dl>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : upcomingCrops.error ? (
            <div className="text-center py-8 text-red-500">
              Error loading crops: {upcomingCrops.error.message}
              <Button
                variant="outline"
                className="mt-2 mx-auto block"
                onClick={() => upcomingCrops.refetch()}
              >
                Retry
              </Button>
            </div>
          ) : upcomingCrops.data && upcomingCrops.data.length > 0 ? (
            upcomingCrops.data.map((crop) => (
              <Card key={crop.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle>{crop.name} - {crop.variety}</CardTitle>
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusClass(
                          crop.status
                        )}`}
                      >
                        {crop.status}
                      </span>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditCrop(crop)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleHarvestClick(crop)}>
                            <Calendar className="h-4 w-4 mr-2" />
                            Mark as Harvested
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteClick(crop.id!)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
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
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No upcoming crops found. Add a crop to get started.
            </div>
          )}
        </TabsContent>

        <TabsContent value="historical" className="pt-4 space-y-4">
          {historicalCrops.isLoading ? (
            // Loading skeleton
            Array.from({ length: 2 }).map((_, index) => (
              <Card key={index}>
                <CardHeader className="pb-2">
                  <Skeleton className="h-6 w-48" />
                </CardHeader>
                <CardContent>
                  <dl className="grid md:grid-cols-3 gap-x-4 gap-y-2">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="contents">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-32 md:col-span-2" />
                      </div>
                    ))}
                  </dl>
                </CardContent>
              </Card>
            ))
          ) : historicalCrops.error ? (
            <div className="text-center py-8 text-red-500">
              Error loading crops: {historicalCrops.error.message}
              <Button
                variant="outline"
                className="mt-2 mx-auto block"
                onClick={() => historicalCrops.refetch()}
              >
                Retry
              </Button>
            </div>
          ) : historicalCrops.data && historicalCrops.data.length > 0 ? (
            historicalCrops.data.map((crop) => (
              <Card key={crop.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle>{crop.name} - {crop.variety}</CardTitle>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditCrop(crop)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteClick(crop.id!)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
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
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No historical crops found. Completed crops will appear here.
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Crop Form Dialog */}
      <CropForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleFormSubmit}
        initialData={selectedCrop}
        isEditing={isEditing}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the crop
              and remove it from your planting schedule.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Harvest Dialog */}
      <Dialog open={harvestDialogOpen} onOpenChange={setHarvestDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Mark Crop as Harvested</DialogTitle>
            <DialogDescription>
              Enter harvest details to move this crop to historical records.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {cropToHarvest && (
              <div className="font-medium">
                {cropToHarvest.name} - {cropToHarvest.variety}
              </div>
            )}

            <div className="space-y-2">
              <Label>Harvest Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !harvestDate && "text-muted-foreground"
                    )}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {harvestDate ? format(harvestDate, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={harvestDate}
                    onSelect={setHarvestDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="yield">Yield</Label>
              <Input
                id="yield"
                value={yieldAmount}
                onChange={(e) => setYieldAmount(e.target.value)}
                placeholder="e.g., 18.5 tons, 2500 kg"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={harvestNotes}
                onChange={(e) => setHarvestNotes(e.target.value)}
                placeholder="Any additional notes about this harvest"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setHarvestDialogOpen(false)}
              disabled={isHarvestLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmHarvest}
              disabled={isHarvestLoading || !harvestDate}
            >
              {isHarvestLoading ? 'Saving...' : 'Mark as Harvested'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PlantingSchedule;

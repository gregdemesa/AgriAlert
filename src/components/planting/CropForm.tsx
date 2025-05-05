import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Calendar } from "lucide-react";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { ActiveCrop, HistoricalCrop, CropStatus, isHistoricalCrop } from "@/lib/plantingService";

interface CropFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (crop: Omit<ActiveCrop | HistoricalCrop, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  initialData?: ActiveCrop | HistoricalCrop;
  isEditing?: boolean;
}

const CropForm = ({ 
  open, 
  onOpenChange, 
  onSubmit, 
  initialData, 
  isEditing = false 
}: CropFormProps) => {
  const [formType, setFormType] = useState<'active' | 'historical'>(
    initialData && isHistoricalCrop(initialData) ? 'historical' : 'active'
  );
  
  // Form state for active crops
  const [name, setName] = useState('');
  const [variety, setVariety] = useState('');
  const [location, setLocation] = useState('');
  const [area, setArea] = useState('');
  const [status, setStatus] = useState<CropStatus>('upcoming');
  const [plantingDate, setPlantingDate] = useState<Date | undefined>(undefined);
  const [expectedHarvest, setExpectedHarvest] = useState<Date | undefined>(undefined);
  
  // Additional fields for historical crops
  const [harvestDate, setHarvestDate] = useState<Date | undefined>(undefined);
  const [yieldAmount, setYieldAmount] = useState('');
  const [notes, setNotes] = useState('');
  
  // Loading state
  const [isLoading, setIsLoading] = useState(false);

  // Initialize form with data if editing
  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setVariety(initialData.variety);
      setLocation(initialData.location);
      setArea(initialData.area);
      
      // Try to parse dates
      try {
        setPlantingDate(new Date(initialData.plantingDate));
        
        if (isHistoricalCrop(initialData)) {
          setFormType('historical');
          setHarvestDate(new Date(initialData.harvestDate));
          setYieldAmount(initialData.yield);
          setNotes(initialData.notes);
        } else {
          setFormType('active');
          setStatus(initialData.status);
          setExpectedHarvest(new Date(initialData.expectedHarvest));
        }
      } catch (error) {
        console.error('Error parsing dates:', error);
      }
    } else {
      // Reset form for new crop
      resetForm();
    }
  }, [initialData, open]);

  const resetForm = () => {
    setName('');
    setVariety('');
    setLocation('');
    setArea('');
    setStatus('upcoming');
    setPlantingDate(undefined);
    setExpectedHarvest(undefined);
    setHarvestDate(undefined);
    setYieldAmount('');
    setNotes('');
    setFormType('active');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !variety || !location || !area || !plantingDate) {
      // Show validation error
      return;
    }
    
    try {
      setIsLoading(true);
      
      if (formType === 'active') {
        if (!expectedHarvest) {
          // Show validation error for expected harvest
          return;
        }
        
        const activeCrop: Omit<ActiveCrop, 'id' | 'createdAt' | 'updatedAt'> = {
          name,
          variety,
          location,
          area,
          status,
          plantingDate: format(plantingDate, 'MMM d, yyyy'),
          expectedHarvest: format(expectedHarvest, 'MMM d, yyyy'),
          alerts: initialData && !isHistoricalCrop(initialData) ? initialData.alerts : [],
          userId: '',
        };
        
        await onSubmit(activeCrop);
      } else {
        if (!harvestDate || !yieldAmount) {
          // Show validation error for harvest date and yield
          return;
        }
        
        const historicalCrop: Omit<HistoricalCrop, 'id' | 'createdAt' | 'updatedAt'> = {
          name,
          variety,
          location,
          area,
          plantingDate: format(plantingDate, 'MMM d, yyyy'),
          harvestDate: format(harvestDate, 'MMM d, yyyy'),
          yield: yieldAmount,
          notes,
          status: 'completed',
          userId: '',
        };
        
        await onSubmit(historicalCrop);
      }
      
      resetForm();
      onOpenChange(false);
    } catch (error) {
      console.error('Error submitting crop:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Crop' : 'Add New Crop'}</DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Update the details of your crop.' 
              : 'Enter the details of your crop to add it to your planting schedule.'}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isEditing && (
            <div className="flex space-x-4">
              <Button
                type="button"
                variant={formType === 'active' ? 'default' : 'outline'}
                className="flex-1"
                onClick={() => setFormType('active')}
              >
                Active/Upcoming Crop
              </Button>
              <Button
                type="button"
                variant={formType === 'historical' ? 'default' : 'outline'}
                className="flex-1"
                onClick={() => setFormType('historical')}
              >
                Historical Crop
              </Button>
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Crop Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Rice, Corn, Tomatoes"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="variety">Variety</Label>
              <Input
                id="variety"
                value={variety}
                onChange={(e) => setVariety(e.target.value)}
                placeholder="e.g., NSIC Rc222, Sugar King"
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., North Field, Greenhouse 2"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="area">Area</Label>
              <Input
                id="area"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                placeholder="e.g., 2.5 hectares, 1000 sq.m."
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Planting Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !plantingDate && "text-muted-foreground"
                    )}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {plantingDate ? format(plantingDate, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={plantingDate}
                    onSelect={setPlantingDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            {formType === 'active' ? (
              <>
                <div className="space-y-2">
                  <Label>Expected Harvest</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !expectedHarvest && "text-muted-foreground"
                        )}
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {expectedHarvest ? format(expectedHarvest, "PPP") : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <CalendarComponent
                        mode="single"
                        selected={expectedHarvest}
                        onSelect={setExpectedHarvest}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="status">Status</Label>
                  <Select 
                    value={status} 
                    onValueChange={(value) => setStatus(value as CropStatus)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="upcoming">Upcoming</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="ready-to-harvest">Ready to Harvest</SelectItem>
                      <SelectItem value="delayed">Delayed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            ) : (
              <>
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
                
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="yield">Yield</Label>
                  <Input
                    id="yield"
                    value={yieldAmount}
                    onChange={(e) => setYieldAmount(e.target.value)}
                    placeholder="e.g., 18.5 tons, 2500 kg"
                    required={formType === 'historical'}
                  />
                </div>
                
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any additional notes about this crop"
                    rows={3}
                  />
                </div>
              </>
            )}
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : isEditing ? 'Update Crop' : 'Add Crop'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CropForm;

import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useWeather } from "@/lib/WeatherContext";

export function HistoricalWeatherCard() {
  const { historicalWeather } = useWeather();
  const [view, setView] = useState<"chart" | "table">("chart");
  const [startDate, setStartDate] = useState<Date | undefined>(
    new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 days ago
  );
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());
  
  const handleFetchData = () => {
    if (startDate && endDate) {
      historicalWeather.fetchData(startDate, endDate);
    }
  };
  
  // Format data for the chart with sampling for better readability
  const formatChartData = () => {
    if (!historicalWeather.data || historicalWeather.data.length === 0) return [];
    
    const processedData = historicalWeather.data.map(item => {
      // Extract and format date as numbers with time
      let formattedDate = "";
      try {
        // Try to extract both date and time components
        const fullDate = new Date(item.date);
        if (!isNaN(fullDate.getTime())) {
          // Valid date object created - use direct date methods
          const month = fullDate.getMonth() + 1; // Months are 0-indexed
          const day = fullDate.getDate();
          const hours = fullDate.getHours();
          const minutes = fullDate.getMinutes();
          const ampm = hours >= 12 ? 'PM' : 'AM';
          const hour12 = hours % 12 || 12; // Convert to 12-hour format
          
          formattedDate = `${month}/${day} ${hour12}${minutes === 0 ? '' : ':' + minutes.toString().padStart(2, '0')}${ampm}`;
        } else {
          // Fallback to string parsing
          const parts = item.date.split(',');
          const datePart = parts[0].trim();
          let timePart = "";
          
          // Try to extract time from the string
          if (parts.length > 1) {
            timePart = parts[1].trim();
          } else {
            const timeMatch = item.date.match(/(\d{1,2}:\d{2}\s*(AM|PM))/i);
            if (timeMatch) {
              timePart = timeMatch[0];
            }
          }
          
          // Parse the date part
          const dateParts = datePart.split(' ');
          if (dateParts.length >= 2) {
            const monthAbbr = dateParts[0];
            const day = parseInt(dateParts[1], 10);
            
            const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            const month = monthNames.indexOf(monthAbbr) + 1;
            
            if (month > 0 && !isNaN(day)) {
              formattedDate = `${month}/${day}${timePart ? ' ' + timePart : ''}`;
            } else {
              formattedDate = item.date;
            }
          } else {
            formattedDate = item.date;
          }
        }
      } catch (err) {
        // Fallback to the original date string
        formattedDate = item.date;
      }
      
      return {
        date: formattedDate,
        temperature: item.temperature,
        humidity: item.humidity,
        pressure: item.pressure / 10, // Scale down for better visualization
      };
    });
    
    // If there are too many data points, sample them to improve readability
    const MAX_DATA_POINTS = 24; // Maximum number of data points for good readability
    
    if (processedData.length > MAX_DATA_POINTS) {
      // Calculate how many points to skip
      const skipFactor = Math.floor(processedData.length / MAX_DATA_POINTS);
      
      // Sample the data - keep every Nth item
      const sampledData = [];
      for (let i = 0; i < processedData.length; i += skipFactor) {
        sampledData.push(processedData[i]);
      }
      
      // Ensure we always include the most recent data point
      if (sampledData[sampledData.length - 1] !== processedData[processedData.length - 1]) {
        sampledData.push(processedData[processedData.length - 1]);
      }
      
      return sampledData;
    }
    
    return processedData;
  };
  
  const chartData = formatChartData();
  
  // Calculate date range for display
  const dateRange = historicalWeather.data && historicalWeather.data.length > 0 
    ? {
        start: historicalWeather.data[0]?.date.split(',')[0],
        end: historicalWeather.data[historicalWeather.data.length-1]?.date.split(',')[0]
      }
    : null;
  
  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle>Historical Weather Data</CardTitle>
        <CardDescription>
          View historical weather patterns to analyze trends and plan better
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-6">
          <div className="flex flex-wrap items-center gap-4 sm:flex-nowrap">
            <div className="grid w-full gap-1.5">
              <div className="text-sm font-medium leading-none">Start Date</div>
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={setStartDate}
                disabled={(date) => date > new Date() || (endDate ? date > endDate : false)}
                className="rounded-md border"
              />
            </div>
            <div className="grid w-full gap-1.5">
              <div className="text-sm font-medium leading-none">End Date</div>
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={setEndDate}
                disabled={(date) => 
                  date > new Date() || 
                  (startDate ? date < startDate : false)
                }
                className="rounded-md border"
              />
            </div>
            <div className="flex h-full items-end justify-start mt-4 md:ml-4">
              <Button onClick={handleFetchData} disabled={!startDate || !endDate}>
                Fetch Data
              </Button>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <Button 
              variant={view === "chart" ? "default" : "outline"} 
              onClick={() => setView("chart")}
            >
              Chart View
            </Button>
            <Button 
              variant={view === "table" ? "default" : "outline"} 
              onClick={() => setView("table")}
            >
              Table View
            </Button>
          </div>
          
          {historicalWeather.isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-[300px] w-full" />
            </div>
          ) : historicalWeather.error ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                {historicalWeather.error.message || "Failed to load historical weather data"}
                <div className="mt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => historicalWeather.refetch()}
                  >
                    Try Again
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          ) : !historicalWeather.data || historicalWeather.data.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <p>No historical data available for the selected period.</p>
              <p className="text-sm mt-2">Please select a date range and fetch data.</p>
            </div>
          ) : view === "chart" ? (
            <div className="h-[500px] w-full pb-10">
              {dateRange && (
                <h3 className="text-sm text-muted-foreground mb-2">
                  Showing historical data from {dateRange.start} to {dateRange.end}
                  {chartData.length < historicalWeather.data?.length && 
                    ` (sampled from ${historicalWeather.data?.length} data points)`}
                </h3>
              )}
              <ResponsiveContainer width="100%" height="100%">
                <LineChart 
                  data={chartData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 100 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 13, fontWeight: 500 }}
                    angle={-45}
                    textAnchor="end"
                    height={100}
                    interval={0}
                    tickFormatter={(value) => {
                      // Ensure consistent formatting in the ticks
                      if (value.includes(' ')) {
                        const [date, time] = value.split(' ');
                        return `${date}\n${time}`;
                      }
                      return value;
                    }}
                  />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip wrapperStyle={{ zIndex: 1000 }} />
                  <Legend 
                    verticalAlign="bottom" 
                    height={60}
                    wrapperStyle={{ position: 'relative', marginTop: '20px', paddingTop: '10px' }}
                  />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="temperature"
                    stroke="#F59E0B"
                    name="Temperature (°C)"
                    strokeWidth={2}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="humidity"
                    stroke="#3B82F6"
                    name="Humidity (%)"
                    strokeWidth={2}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="pressure"
                    stroke="#10B981"
                    name="Pressure (hPa/10)"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="overflow-auto max-h-[400px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[180px]">Date</TableHead>
                    <TableHead>Temperature (°C)</TableHead>
                    <TableHead>Humidity (%)</TableHead>
                    <TableHead>Wind Speed (m/s)</TableHead>
                    <TableHead>Pressure (hPa)</TableHead>
                    <TableHead>Condition</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {historicalWeather.data.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="whitespace-nowrap">{item.date}</TableCell>
                      <TableCell>{item.temperature}</TableCell>
                      <TableCell>{item.humidity}</TableCell>
                      <TableCell>{item.windSpeed}</TableCell>
                      <TableCell>{item.pressure}</TableCell>
                      <TableCell>{item.description}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <caption className="mt-4 text-sm text-muted-foreground">
                  Historical weather data for the selected period.
                </caption>
              </Table>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 
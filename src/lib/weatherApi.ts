import { LocationData } from './LocationContext';

// WeatherAPI.com base URL
const API_BASE_URL = 'https://api.weatherapi.com/v1';

// API key from environment variables
const API_KEY = import.meta.env.VITE_FREE_WEATHER_API;

// Log API key availability (not the actual key for security)
console.log('WeatherAPI.com API key available:', !!API_KEY);

// Weather condition mapping
export type WeatherCondition = 'sunny' | 'cloudy' | 'rainy' | 'windy' | 'stormy' | 'snowy';

// Map WeatherAPI.com condition codes to our app's condition types
const mapWeatherCondition = (conditionCode: number, conditionText: string): WeatherCondition => {
  // Convert condition text to lowercase for easier comparison
  const condition = conditionText.toLowerCase();

  // Thunderstorm, storm
  if (condition.includes('thunder') || condition.includes('storm')) {
    return 'stormy';
  }
  // Rain, drizzle, shower
  if (condition.includes('rain') || condition.includes('drizzle') || condition.includes('shower')) {
    return 'rainy';
  }
  // Snow, sleet, blizzard
  if (condition.includes('snow') || condition.includes('sleet') || condition.includes('blizzard') || condition.includes('ice')) {
    return 'snowy';
  }
  // Cloudy, overcast, fog, mist
  if (condition.includes('cloud') || condition.includes('overcast') || condition.includes('fog') || condition.includes('mist')) {
    return 'cloudy';
  }
  // Sunny, clear
  if (condition.includes('sunny') || condition.includes('clear')) {
    return 'sunny';
  }
  // Windy
  if (condition.includes('wind') || condition.includes('gale')) {
    return 'windy';
  }
  // Default
  return 'sunny';
};

// Weather API Response interfaces
interface WeatherAPIResponse {
  location: {
    name: string;
    region: string;
    localtime: string;
  };
  current: {
    temp_c: number;
    humidity: number;
    wind_kph: number;
    pressure_mb: number;
    condition: {
      code: number;
      text: string;
      icon: string;
    };
    feelslike_c: number;
    vis_km: number;
  };
  forecast: {
    forecastday: Array<{
      date: string;
      day: {
        avgtemp_c: number;
        mintemp_c: number;
        maxtemp_c: number;
        avghumidity: number;
        totalprecip_mm: number;
        condition: {
          code: number;
          text: string;
          icon: string;
        };
      };
      hour: Array<{
        time: string;
        temp_c: number;
        humidity: number;
        wind_kph: number;
        pressure_mb: number;
        condition: {
          code: number;
          text: string;
          icon: string;
        };
      }>;
      astro: {
        sunrise: string;
        sunset: string;
      };
    }>;
  };
}

// Current weather interface
export interface CurrentWeather {
  temperature: number;
  humidity: number;
  condition: WeatherCondition;
  windSpeed: number;
  pressure: number;
  icon: string;
  location: string;
  description: string;
  feelsLike: number;
  visibility: number;
  sunrise: number;
  sunset: number;
}

// Forecast day interface
export interface ForecastDay {
  date: string;
  day: string;
  temperature: {
    avg: number;
    min: number;
    max: number;
  };
  humidity: number;
  condition: WeatherCondition;
  precipitation: number;
  icon: string;
  description: string;
}

// Hourly forecast interface
export interface HourlyForecast {
  time: string;
  temperature: number;
  humidity: number;
  condition: WeatherCondition;
  windSpeed: number;
  icon: string;
}

// Historical weather interface
export interface HistoricalWeather {
  date: string;
  temperature: {
    avg: number;
    min: number;
    max: number;
  };
  humidity: number;
  condition: WeatherCondition;
  precipitation: number;
  icon: string;
  windSpeed: number;
  pressure: number;
}

// Weather statistics interface
export interface WeatherStatistics {
  temperature: {
    avg: number;
    min: number;
    max: number;
  };
  precipitation: {
    total: number;
    daysWithRain: number;
  };
  humidity: {
    avg: number;
  };
  windSpeed: {
    avg: number;
    max: number;
  };
  period: {
    start: string;
    end: string;
  };
}

// Map WeatherAPI.com alert severity to our alert level
export const mapAlertSeverity = (severity: string): 'warning' | 'severe' | 'emergency' => {
  switch (severity.toLowerCase()) {
    case 'moderate':
      return 'warning';
    case 'severe':
      return 'severe';
    case 'extreme':
      return 'emergency';
    default:
      return 'warning';
  }
};

// Function to fetch current weather
export const fetchCurrentWeather = async (location: LocationData): Promise<CurrentWeather> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/current.json?key=${API_KEY}&q=${location.latitude},${location.longitude}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch current weather');
    }

    const data: WeatherAPIResponse = await response.json();

    // Get sunrise and sunset times
    const forecastResponse = await fetch(
      `${API_BASE_URL}/forecast.json?key=${API_KEY}&q=${location.latitude},${location.longitude}&days=1`
    );

    let sunrise = 0;
    let sunset = 0;

    if (forecastResponse.ok) {
      const forecastData: WeatherAPIResponse = await forecastResponse.json();
      if (forecastData.forecast?.forecastday?.[0]?.astro) {
        const astro = forecastData.forecast.forecastday[0].astro;
        const sunriseDate = new Date(`${data.location.localtime.split(' ')[0]} ${astro.sunrise}`);
        const sunsetDate = new Date(`${data.location.localtime.split(' ')[0]} ${astro.sunset}`);
        sunrise = Math.floor(sunriseDate.getTime() / 1000);
        sunset = Math.floor(sunsetDate.getTime() / 1000);
      }
    }

    return {
      temperature: Math.round(data.current.temp_c),
      humidity: data.current.humidity,
      condition: mapWeatherCondition(data.current.condition.code, data.current.condition.text),
      windSpeed: data.current.wind_kph,
      pressure: data.current.pressure_mb,
      icon: `https:${data.current.condition.icon}`,
      location: `${data.location.name}, ${data.location.region}`,
      description: data.current.condition.text,
      feelsLike: Math.round(data.current.feelslike_c),
      visibility: data.current.vis_km,
      sunrise,
      sunset,
    };
  } catch (error: unknown) {
    console.error('Error fetching current weather:', error);
    throw error;
  }
};

// Function to fetch 5-day forecast
export const fetchForecast = async (location: LocationData): Promise<ForecastDay[]> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/forecast.json?key=${API_KEY}&q=${location.latitude},${location.longitude}&days=5`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch forecast');
    }

    const data: WeatherAPIResponse = await response.json();
    return data.forecast.forecastday.map((day) => ({
      date: new Date(day.date).toLocaleDateString('en-US'),
      day: new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' }),
      temperature: {
        avg: Math.round(day.day.avgtemp_c),
        min: Math.round(day.day.mintemp_c),
        max: Math.round(day.day.maxtemp_c),
      },
      humidity: day.day.avghumidity,
      condition: mapWeatherCondition(day.day.condition.code, day.day.condition.text),
      precipitation: day.day.totalprecip_mm,
      icon: `https:${day.day.condition.icon}`,
      description: day.day.condition.text,
    }));
  } catch (error: unknown) {
    console.error('Error fetching forecast:', error);
    throw error;
  }
};

// Function to fetch hourly forecast for the next 24 hours
export const fetchHourlyForecast = async (location: LocationData): Promise<HourlyForecast[]> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/forecast.json?key=${API_KEY}&q=${location.latitude},${location.longitude}&days=1`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch hourly forecast');
    }

    const data: WeatherAPIResponse = await response.json();
    return data.forecast.forecastday[0].hour.map((hour) => ({
      time: new Date(hour.time).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
      temperature: Math.round(hour.temp_c),
      humidity: hour.humidity,
      condition: mapWeatherCondition(hour.condition.code, hour.condition.text),
      windSpeed: hour.wind_kph,
      icon: `https:${hour.condition.icon}`,
    }));
  } catch (error: unknown) {
    console.error('Error fetching hourly forecast:', error);
    throw error;
  }
};

// Weather alert interface
export interface WeatherAlert {
  headline: string;
  severity: string;
  urgency: string;
  areas: string;
  category: string;
  event: string;
  effective: string;
  expires: string;
  description: string;
  instruction: string;
}

// Function to fetch weather alerts
export const fetchWeatherAlerts = async (location: LocationData): Promise<WeatherAlert[]> => {
  try {
    console.log('Fetching weather alerts for location:', location);

    const url = `${API_BASE_URL}/forecast.json?key=${API_KEY}&q=${location.latitude},${location.longitude}&days=1&aqi=no&alerts=yes`;
    console.log('Weather alerts API URL:', url);

    const response = await fetch(url);

    if (!response.ok) {
      console.error('Failed to fetch weather alerts, status:', response.status);
      throw new Error('Failed to fetch weather alerts');
    }

    const data = await response.json();
    console.log('Weather API response received');

    // Check if alerts exist
    if (!data.alerts || !data.alerts.alert || data.alerts.alert.length === 0) {
      console.log('No weather alerts found from WeatherAPI.com');
      return [];
    }

    console.log('Weather alerts found:', data.alerts.alert);

    // Process the alerts data
    const alertsData: WeatherAlert[] = data.alerts.alert.map((item: any) => ({
      headline: item.headline || '',
      severity: item.severity || '',
      urgency: item.urgency || '',
      areas: item.areas || '',
      category: item.category || '',
      event: item.event || '',
      effective: item.effective || '',
      expires: item.expires || '',
      description: item.desc || '',
      instruction: item.instruction || '',
    }));

    return alertsData;
  } catch (error) {
    console.error('Error fetching weather alerts:', error);
    throw error;
  }
};

// Function to format date for WeatherAPI.com (YYYY-MM-DD format)
const formatDateForAPI = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

// Function to fetch historical weather data
export const fetchHistoricalWeather = async (
  location: LocationData,
  startDate: Date,
  endDate: Date
): Promise<HistoricalWeather[]> => {
  try {
    // WeatherAPI.com allows fetching historical data one day at a time
    // We'll need to make multiple requests if the date range is more than one day
    const days: Date[] = [];
    let currentDate = new Date(startDate);
    currentDate.setHours(0, 0, 0, 0);
    const endDateMidnight = new Date(endDate);
    endDateMidnight.setHours(0, 0, 0, 0);

    // Create an array of dates to fetch (inclusive)
    while (currentDate <= endDateMidnight) {
      days.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Fetch historical data for each day
    const historicalData: HistoricalWeather[] = [];

    for (const day of days) {
      const formattedDate = formatDateForAPI(day);
      const response = await fetch(
        `${API_BASE_URL}/history.json?key=${API_KEY}&q=${location.latitude},${location.longitude}&dt=${formattedDate}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch historical weather for ${formattedDate}`);
      }

      const data: WeatherAPIResponse = await response.json();

      // Process the historical data
      if (data.forecast && data.forecast.forecastday && data.forecast.forecastday.length > 0) {
        const dayData = data.forecast.forecastday[0];
        const hourData = dayData.hour[12]; // Get noon data for the day

        historicalData.push({
          date: new Date(dayData.date).toLocaleDateString('en-US'),
          temperature: {
            avg: Math.round(dayData.day.avgtemp_c),
            min: Math.round(dayData.day.mintemp_c),
            max: Math.round(dayData.day.maxtemp_c),
          },
          humidity: dayData.day.avghumidity,
          condition: mapWeatherCondition(dayData.day.condition.code, dayData.day.condition.text),
          precipitation: dayData.day.totalprecip_mm,
          icon: `https:${dayData.day.condition.icon}`,
          windSpeed: hourData ? hourData.wind_kph : 0,
          pressure: hourData ? hourData.pressure_mb : 0,
        });
      }
    }

    return historicalData;
  } catch (error: unknown) {
    console.error('Error fetching historical weather:', error);
    throw error;
  }
};

// Function to fetch weather statistics
export const fetchWeatherStatistics = async (
  location: LocationData,
  startDate: Date,
  endDate: Date
): Promise<WeatherStatistics> => {
  try {
    // Fetch historical data for the period
    const historicalData = await fetchHistoricalWeather(location, startDate, endDate);

    // Calculate statistics from historical data
    let totalTemp = 0;
    let minTemp = Infinity;
    let maxTemp = -Infinity;
    let totalHumidity = 0;
    let totalPrecipitation = 0;
    let daysWithRain = 0;
    let totalWindSpeed = 0;
    let maxWindSpeed = 0;

    historicalData.forEach(day => {
      // Temperature
      totalTemp += day.temperature.avg;
      minTemp = Math.min(minTemp, day.temperature.min);
      maxTemp = Math.max(maxTemp, day.temperature.max);

      // Humidity
      totalHumidity += day.humidity;

      // Precipitation
      totalPrecipitation += day.precipitation;
      if (day.precipitation > 0) {
        daysWithRain++;
      }

      // Wind Speed
      if (day.windSpeed) {
        totalWindSpeed += day.windSpeed;
        maxWindSpeed = Math.max(maxWindSpeed, day.windSpeed);
      }
    });

    // Calculate averages
    const avgTemp = historicalData.length > 0 ? totalTemp / historicalData.length : 0;
    const avgHumidity = historicalData.length > 0 ? totalHumidity / historicalData.length : 0;
    const avgWindSpeed = historicalData.length > 0 ? totalWindSpeed / historicalData.length : 0;

    return {
      temperature: {
        avg: Math.round(avgTemp),
        min: Math.round(minTemp === Infinity ? 0 : minTemp),
        max: Math.round(maxTemp === -Infinity ? 0 : maxTemp),
      },
      precipitation: {
        total: Math.round(totalPrecipitation),
        daysWithRain,
      },
      humidity: {
        avg: Math.round(avgHumidity),
      },
      windSpeed: {
        avg: Math.round(avgWindSpeed),
        max: Math.round(maxWindSpeed),
      },
      period: {
        start: startDate.toLocaleDateString('en-US'),
        end: endDate.toLocaleDateString('en-US'),
      },
    };
  } catch (error: unknown) {
    console.error('Error fetching weather statistics:', error);
    throw error;
  }
};

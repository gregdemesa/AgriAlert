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

// Current weather interface
export interface CurrentWeather {
  temperature: number;
  condition: WeatherCondition;
  humidity: number;
  windSpeed: number;
  location: string;
  description: string;
  feelsLike: number;
  pressure: number;
  visibility: number;
  sunrise: number;
  sunset: number;
  icon: string;
}

// Forecast day interface
export interface ForecastDay {
  day: string;
  date: string;
  temperature: {
    high: number;
    low: number;
  };
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
  icon: string;
}

// Function to fetch current weather
export const fetchCurrentWeather = async (location: LocationData): Promise<CurrentWeather> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/current.json?key=${API_KEY}&q=${location.latitude},${location.longitude}&aqi=no`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch current weather');
    }

    const data = await response.json();

    // Extract location and current weather data
    const { location: locationData, current } = data;

    // Map the API response to our CurrentWeather interface
    const weather: CurrentWeather = {
      temperature: Math.round(current.temp_c),
      condition: mapWeatherCondition(current.condition.code, current.condition.text),
      humidity: current.humidity,
      windSpeed: Math.round(current.wind_kph),
      location: `${locationData.name}, ${locationData.region}`,
      description: current.condition.text,
      feelsLike: Math.round(current.feelslike_c),
      pressure: current.pressure_mb,
      visibility: current.vis_km,
      // Use default values for sunrise and sunset if not available
      sunrise: 0,
      sunset: 0,
      icon: `https:${current.condition.icon}`,
    };

    // Try to get sunrise and sunset times if available
    try {
      // Make a separate request to get forecast data with astronomy info
      const forecastResponse = await fetch(
        `${API_BASE_URL}/forecast.json?key=${API_KEY}&q=${location.latitude},${location.longitude}&days=1&aqi=no`
      );

      if (forecastResponse.ok) {
        const forecastData = await forecastResponse.json();
        if (forecastData.forecast && forecastData.forecast.forecastday && forecastData.forecast.forecastday.length > 0) {
          const astro = forecastData.forecast.forecastday[0].astro;
          if (astro) {
            // Convert 12-hour time format to timestamp
            const sunriseTime = astro.sunrise;
            const sunsetTime = astro.sunset;

            const sunriseDate = new Date(`${locationData.localtime.split(' ')[0]} ${sunriseTime}`);
            const sunsetDate = new Date(`${locationData.localtime.split(' ')[0]} ${sunsetTime}`);

            weather.sunrise = Math.floor(sunriseDate.getTime() / 1000);
            weather.sunset = Math.floor(sunsetDate.getTime() / 1000);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching sunrise/sunset times:', error);
      // Use default values if there's an error
    }

    return weather;
  } catch (error) {
    console.error('Error fetching current weather:', error);
    throw error;
  }
};

// Function to fetch 5-day forecast
export const fetchForecast = async (location: LocationData): Promise<ForecastDay[]> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/forecast.json?key=${API_KEY}&q=${location.latitude},${location.longitude}&days=5&aqi=no&alerts=yes`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch forecast');
    }

    const data = await response.json();

    // Process the forecast data
    // WeatherAPI.com returns forecast for up to 14 days
    // We'll take the first 5 days

    const forecastDays: ForecastDay[] = data.forecast.forecastday.map((item: any) => {
      const date = new Date(item.date);
      return {
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        date: date.toLocaleDateString('en-US'),
        temperature: {
          high: Math.round(item.day.maxtemp_c),
          low: Math.round(item.day.mintemp_c),
        },
        condition: mapWeatherCondition(item.day.condition.code, item.day.condition.text),
        precipitation: Math.round(item.day.daily_chance_of_rain),
        icon: `https:${item.day.condition.icon}`,
        description: item.day.condition.text,
      };
    });

    return forecastDays;
  } catch (error) {
    console.error('Error fetching forecast:', error);
    throw error;
  }
};

// Function to fetch hourly forecast for the next 24 hours
export const fetchHourlyForecast = async (location: LocationData): Promise<HourlyForecast[]> => {
  try {
    console.log('Fetching hourly forecast for location:', location);

    const url = `${API_BASE_URL}/forecast.json?key=${API_KEY}&q=${location.latitude},${location.longitude}&days=1&aqi=no&alerts=yes`;
    console.log('Hourly forecast API URL:', url);

    const response = await fetch(url);

    if (!response.ok) {
      console.error('Failed to fetch hourly forecast, status:', response.status);
      throw new Error(`Failed to fetch hourly forecast: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Hourly forecast API response received');

    // Log the response data structure for debugging
    console.log('Hourly forecast API response structure:',
      JSON.stringify({
        hasForecast: !!data.forecast,
        hasForecastDay: !!(data.forecast && data.forecast.forecastday),
        forecastDayLength: data.forecast && data.forecast.forecastday ? data.forecast.forecastday.length : 0,
        hasHour: !!(data.forecast && data.forecast.forecastday && data.forecast.forecastday[0] && data.forecast.forecastday[0].hour),
        hourLength: data.forecast && data.forecast.forecastday && data.forecast.forecastday[0] && data.forecast.forecastday[0].hour ? data.forecast.forecastday[0].hour.length : 0
      })
    );

    // Validate the response structure
    if (!data.forecast || !data.forecast.forecastday || !data.forecast.forecastday[0] || !data.forecast.forecastday[0].hour) {
      console.error('Unexpected API response structure:', data);
      return [];
    }

    const hourlyItems = data.forecast.forecastday[0].hour;
    console.log(`Processing ${hourlyItems.length} hourly forecast items`);

    // Process the hourly forecast data (first 24 hours)
    const hourlyData: HourlyForecast[] = hourlyItems.map((item: any) => {
      const date = new Date(item.time);
      return {
        time: date.toLocaleTimeString('en-US', { hour: '2-digit', hour12: true }),
        temperature: Math.round(item.temp_c),
        humidity: item.humidity,
        condition: mapWeatherCondition(item.condition.code, item.condition.text),
        icon: `https:${item.condition.icon}`,
      };
    });

    console.log(`Processed ${hourlyData.length} hourly forecast items successfully`);
    return hourlyData;
  } catch (error) {
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

    // Create an array of dates to fetch
    while (currentDate <= endDate) {
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

      const data = await response.json();

      // Process the historical data
      if (data.forecast && data.forecast.forecastday && data.forecast.forecastday.length > 0) {
        const dayData = data.forecast.forecastday[0];

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
        });
      }
    }

    return historicalData;
  } catch (error) {
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
  } catch (error) {
    console.error('Error calculating weather statistics:', error);
    throw error;
  }
};

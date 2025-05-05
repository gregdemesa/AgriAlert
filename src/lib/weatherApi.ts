import { LocationData } from './LocationContext';

// OpenWeatherMap API base URL
const API_BASE_URL = 'https://api.openweathermap.org/data/2.5';

// API key from environment variables
const API_KEY = import.meta.env.VITE_OPEN_WEATHER_MAP;

// Weather condition mapping
export type WeatherCondition = 'sunny' | 'cloudy' | 'rainy' | 'windy' | 'stormy' | 'snowy';

// Map OpenWeatherMap condition codes to our app's condition types
const mapWeatherCondition = (conditionCode: number): WeatherCondition => {
  // Thunderstorm
  if (conditionCode >= 200 && conditionCode < 300) {
    return 'stormy';
  }
  // Drizzle or Rain
  if ((conditionCode >= 300 && conditionCode < 400) || (conditionCode >= 500 && conditionCode < 600)) {
    return 'rainy';
  }
  // Snow
  if (conditionCode >= 600 && conditionCode < 700) {
    return 'snowy';
  }
  // Atmosphere (fog, mist, etc.)
  if (conditionCode >= 700 && conditionCode < 800) {
    return 'cloudy';
  }
  // Clear
  if (conditionCode === 800) {
    return 'sunny';
  }
  // Clouds
  if (conditionCode > 800 && conditionCode < 900) {
    return 'cloudy';
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
      `${API_BASE_URL}/weather?lat=${location.latitude}&lon=${location.longitude}&units=metric&appid=${API_KEY}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch current weather');
    }

    const data = await response.json();
    
    // Extract city name
    const cityName = data.name;
    
    // Map the API response to our CurrentWeather interface
    const weather: CurrentWeather = {
      temperature: Math.round(data.main.temp),
      condition: mapWeatherCondition(data.weather[0].id),
      humidity: data.main.humidity,
      windSpeed: Math.round(data.wind.speed),
      location: cityName,
      description: data.weather[0].description,
      feelsLike: Math.round(data.main.feels_like),
      pressure: data.main.pressure,
      visibility: data.visibility / 1000, // Convert to km
      sunrise: data.sys.sunrise,
      sunset: data.sys.sunset,
      icon: data.weather[0].icon,
    };

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
      `${API_BASE_URL}/forecast?lat=${location.latitude}&lon=${location.longitude}&units=metric&appid=${API_KEY}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch forecast');
    }

    const data = await response.json();
    
    // Process the forecast data
    // OpenWeatherMap returns forecast in 3-hour intervals for 5 days
    // We'll aggregate this data to get daily forecasts
    
    const dailyForecasts: { [key: string]: ForecastDay } = {};
    
    // Group forecast data by day
    data.list.forEach((item: any) => {
      const date = new Date(item.dt * 1000);
      const day = date.toLocaleDateString('en-US', { weekday: 'short' });
      const dateStr = date.toLocaleDateString('en-US');
      
      if (!dailyForecasts[dateStr]) {
        dailyForecasts[dateStr] = {
          day,
          date: dateStr,
          temperature: {
            high: -Infinity,
            low: Infinity,
          },
          condition: mapWeatherCondition(item.weather[0].id),
          precipitation: 0,
          icon: item.weather[0].icon,
          description: item.weather[0].description,
        };
      }
      
      // Update high and low temperatures
      if (item.main.temp_max > dailyForecasts[dateStr].temperature.high) {
        dailyForecasts[dateStr].temperature.high = Math.round(item.main.temp_max);
      }
      
      if (item.main.temp_min < dailyForecasts[dateStr].temperature.low) {
        dailyForecasts[dateStr].temperature.low = Math.round(item.main.temp_min);
      }
      
      // Update precipitation probability (if available)
      if (item.pop) {
        dailyForecasts[dateStr].precipitation = Math.max(
          dailyForecasts[dateStr].precipitation,
          Math.round(item.pop * 100)
        );
      }
    });
    
    // Convert to array and take only the first 5 days
    return Object.values(dailyForecasts).slice(0, 5);
  } catch (error) {
    console.error('Error fetching forecast:', error);
    throw error;
  }
};

// Function to fetch hourly forecast for the next 24 hours
export const fetchHourlyForecast = async (location: LocationData): Promise<HourlyForecast[]> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/forecast?lat=${location.latitude}&lon=${location.longitude}&units=metric&appid=${API_KEY}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch hourly forecast');
    }

    const data = await response.json();
    
    // Process the hourly forecast data (first 24 hours / 8 data points)
    const hourlyData: HourlyForecast[] = data.list.slice(0, 8).map((item: any) => {
      const date = new Date(item.dt * 1000);
      return {
        time: date.toLocaleTimeString('en-US', { hour: '2-digit', hour12: true }),
        temperature: Math.round(item.main.temp),
        humidity: item.main.humidity,
        condition: mapWeatherCondition(item.weather[0].id),
        icon: item.weather[0].icon,
      };
    });
    
    return hourlyData;
  } catch (error) {
    console.error('Error fetching hourly forecast:', error);
    throw error;
  }
};

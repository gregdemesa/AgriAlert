// This is a test script to verify that the OpenWeatherMap API integration works correctly
// You can run this script with ts-node or similar tools

import { fetchCurrentWeather, fetchForecast, fetchHourlyForecast } from './lib/weatherApi';

// Mock location data for testing
const mockLocation = {
  latitude: 14.5995, // Manila, Philippines
  longitude: 120.9842,
  accuracy: 10,
  timestamp: Date.now(),
};

async function testWeatherAPI() {
  try {
    console.log('Testing OpenWeatherMap API integration...');
    
    // Test current weather
    console.log('\nFetching current weather...');
    const currentWeather = await fetchCurrentWeather(mockLocation);
    console.log('Current Weather:', JSON.stringify(currentWeather, null, 2));
    
    // Test forecast
    console.log('\nFetching 5-day forecast...');
    const forecast = await fetchForecast(mockLocation);
    console.log('Forecast:', JSON.stringify(forecast, null, 2));
    
    // Test hourly forecast
    console.log('\nFetching hourly forecast...');
    const hourlyForecast = await fetchHourlyForecast(mockLocation);
    console.log('Hourly Forecast:', JSON.stringify(hourlyForecast, null, 2));
    
    console.log('\nAll tests completed successfully!');
  } catch (error) {
    console.error('Error testing weather API:', error);
  }
}

// Run the test
testWeatherAPI();

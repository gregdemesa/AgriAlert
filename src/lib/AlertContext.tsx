import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { useWeather } from './WeatherContext';
import { sendWeatherAlertEmail } from './emailService';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';

// Alert level type
export type AlertLevel = 'warning' | 'severe' | 'emergency';

// Alert interface
export interface Alert {
  id: string;
  title: string;
  description: string;
  level: AlertLevel;
  time: string;
  read?: boolean;
}

// Alert context interface
interface AlertContextType {
  currentAlerts: Alert[];
  pastAlerts: Alert[];
  emailNotificationsEnabled: boolean;
  setEmailNotificationsEnabled: (enabled: boolean) => void;
  markAlertAsRead: (alertId: string) => void;
}

// Create context
const AlertContext = createContext<AlertContextType | undefined>(undefined);

// Provider component
export const AlertProvider = ({ children }: { children: ReactNode }) => {
  const { currentUser } = useAuth();
  const { currentWeather, forecast } = useWeather();
  // Initialize with sample alerts for demonstration purposes
  const [currentAlerts, setCurrentAlerts] = useState<Alert[]>([
    {
      id: "1",
      title: "Heavy Rainfall Expected",
      description: "Expect 15-20mm of rainfall in the next 24 hours, which may affect lowland crops.",
      level: "severe",
      time: "Today, 10:30 AM",
    },
    {
      id: "2",
      title: "Weather Warning",
      description: "High temperatures forecasted for the next week; ensure adequate irrigation.",
      level: "warning",
      time: "Yesterday, 3:15 PM",
    },
  ]);
  // Initialize with sample past alerts for demonstration purposes
  const [pastAlerts, setPastAlerts] = useState<Alert[]>([
    {
      id: "3",
      title: "Typhoon Warning",
      description: "Typhoon expected to make landfall in 72 hours. Secure crops and farm equipment.",
      level: "emergency",
      time: "Sep 15, 2:30 PM",
    },
    {
      id: "4",
      title: "Pest Alert: Fall Armyworm",
      description: "Fall armyworm detected in neighboring farms. Inspect crops and apply preventive measures.",
      level: "severe",
      time: "Sep 10, 9:15 AM",
    },
    {
      id: "5",
      title: "Drought Advisory",
      description: "Extended dry period expected. Implement water conservation measures.",
      level: "warning",
      time: "Aug 28, 11:45 AM",
    },
  ]);
  const [emailNotificationsEnabled, setEmailNotificationsEnabled] = useState(true);

  // Load user's notification preferences
  useEffect(() => {
    const loadNotificationPreferences = async () => {
      if (!currentUser) return;

      try {
        const userPrefsDoc = await getDoc(doc(db, 'userPreferences', currentUser.uid));
        if (userPrefsDoc.exists()) {
          const data = userPrefsDoc.data();
          if (data.emailNotificationsEnabled !== undefined) {
            setEmailNotificationsEnabled(data.emailNotificationsEnabled);
          }
        }
      } catch (error) {
        console.error('Error loading notification preferences:', error);
      }
    };

    loadNotificationPreferences();
  }, [currentUser]);

  // Save user's notification preferences
  useEffect(() => {
    const saveNotificationPreferences = async () => {
      if (!currentUser) return;

      try {
        await setDoc(
          doc(db, 'userPreferences', currentUser.uid),
          { emailNotificationsEnabled },
          { merge: true }
        );
      } catch (error) {
        console.error('Error saving notification preferences:', error);
      }
    };

    saveNotificationPreferences();
  }, [currentUser, emailNotificationsEnabled]);

  // Generate weather alerts based on current weather and forecast
  useEffect(() => {
    if (!currentWeather.data || !forecast.data) return;

    // This function would normally generate alerts based on real weather data
    // For demonstration purposes, we're using sample alerts initialized above
    const generateWeatherAlerts = () => {
      // In a real application, we would generate alerts based on weather conditions
      // For example:

      /*
      const newAlerts: Alert[] = [];

      // Check for extreme temperatures
      if (currentWeather.data.temperature > 35) {
        newAlerts.push({
          id: `temp-high-${Date.now()}`,
          title: 'Extreme Heat Warning',
          description: `Current temperature is ${currentWeather.data.temperature}°C. Take measures to protect crops from heat stress.`,
          level: 'severe',
          time: new Date().toLocaleString(),
        });
      }

      // Check for heavy rainfall in forecast
      const heavyRainForecast = forecast.data.find(day =>
        day.precipitation > 70
      );

      if (heavyRainForecast) {
        newAlerts.push({
          id: `rain-heavy-${Date.now()}`,
          title: 'Heavy Rainfall Expected',
          description: `Heavy rainfall expected on ${heavyRainForecast.day} with ${heavyRainForecast.precipitation}% probability. Prepare drainage systems.`,
          level: 'warning',
          time: new Date().toLocaleString(),
        });
      }

      // Check for strong winds
      if (currentWeather.data.windSpeed > 30) {
        newAlerts.push({
          id: `wind-strong-${Date.now()}`,
          title: 'Strong Wind Alert',
          description: `Current wind speed is ${currentWeather.data.windSpeed} km/h. Secure structures and protect sensitive crops.`,
          level: 'emergency',
          time: new Date().toLocaleString(),
        });
      }

      // Update current alerts
      setCurrentAlerts(prev => {
        // Filter out duplicates
        const existingIds = prev.map(alert => alert.id);
        const uniqueNewAlerts = newAlerts.filter(alert => !existingIds.includes(alert.id));
        return [...prev, ...uniqueNewAlerts];
      });
      */

      // In a real application, we would send email notifications for new alerts
      // For demonstration purposes, we'll just log a message
      if (emailNotificationsEnabled) {
        console.log('Email notifications are enabled. In a real application, emails would be sent for new alerts.');

        // Example of how email notifications would be sent:
        /*
        newAlerts.forEach(alert => {
          sendWeatherAlertEmail(alert.title, alert.description, alert.level)
            .then(success => {
              if (success) {
                console.log(`Email notification sent for alert: ${alert.title}`);
              } else {
                console.error(`Failed to send email notification for alert: ${alert.title}`);
              }
            });
        });
        */
      }
    };

    generateWeatherAlerts();
  }, [currentWeather.data, forecast.data, emailNotificationsEnabled]);

  // Mark an alert as read
  const markAlertAsRead = (alertId: string) => {
    setCurrentAlerts(prev => {
      const updatedAlerts = prev.map(alert =>
        alert.id === alertId ? { ...alert, read: true } : alert
      );

      // Move read alerts to past alerts
      const alertToMove = updatedAlerts.find(alert => alert.id === alertId);
      if (alertToMove) {
        setPastAlerts(prev => [...prev, alertToMove]);
        return updatedAlerts.filter(alert => alert.id !== alertId);
      }

      return updatedAlerts;
    });
  };

  return (
    <AlertContext.Provider
      value={{
        currentAlerts,
        pastAlerts,
        emailNotificationsEnabled,
        setEmailNotificationsEnabled,
        markAlertAsRead,
      }}
    >
      {children}
    </AlertContext.Provider>
  );
};

// Hook for using the alert context
export const useAlerts = () => {
  const context = useContext(AlertContext);
  if (context === undefined) {
    throw new Error('useAlerts must be used within an AlertProvider');
  }
  return context;
};

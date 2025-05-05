import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { useWeather } from './WeatherContext';
import { sendWeatherAlertEmail } from './emailService';
import { doc, getDoc, setDoc, collection, addDoc, query, where, orderBy, getDocs, Timestamp } from 'firebase/firestore';
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
  timestamp?: Timestamp;
  read?: boolean;
  userId?: string;
}

// Alert context interface
interface AlertContextType {
  currentAlerts: Alert[];
  pastAlerts: Alert[];
  emailNotificationsEnabled: boolean;
  setEmailNotificationsEnabled: (enabled: boolean) => void;
  markAlertAsRead: (alertId: string) => void;
  addAlert: (alert: Omit<Alert, 'id' | 'timestamp' | 'userId'>) => Promise<void>;
  isLoading: boolean;
}

// Create context
const AlertContext = createContext<AlertContextType | undefined>(undefined);

// Provider component
export const AlertProvider = ({ children }: { children: ReactNode }) => {
  const { currentUser } = useAuth();
  const { currentWeather, forecast } = useWeather();
  const [currentAlerts, setCurrentAlerts] = useState<Alert[]>([]);
  const [pastAlerts, setPastAlerts] = useState<Alert[]>([]);
  const [emailNotificationsEnabled, setEmailNotificationsEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

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

  // Fetch alerts from Firebase
  useEffect(() => {
    const fetchAlerts = async () => {
      if (!currentUser) return;

      try {
        setIsLoading(true);

        // Create a reference to the alerts collection
        const alertsRef = collection(db, 'alerts');

        // Query for current (unread) alerts for this user
        const currentAlertsQuery = query(
          alertsRef,
          where('userId', '==', currentUser.uid),
          where('read', '==', false),
          orderBy('timestamp', 'desc')
        );

        // Query for past (read) alerts for this user
        const pastAlertsQuery = query(
          alertsRef,
          where('userId', '==', currentUser.uid),
          where('read', '==', true),
          orderBy('timestamp', 'desc')
        );

        // Get the alerts
        const currentAlertsSnapshot = await getDocs(currentAlertsQuery);
        const pastAlertsSnapshot = await getDocs(pastAlertsQuery);

        // Convert the snapshots to Alert objects
        const currentAlertsList: Alert[] = currentAlertsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data() as Omit<Alert, 'id'>
        }));

        const pastAlertsList: Alert[] = pastAlertsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data() as Omit<Alert, 'id'>
        }));

        // Update state
        setCurrentAlerts(currentAlertsList);
        setPastAlerts(pastAlertsList);
      } catch (error) {
        console.error('Error fetching alerts:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAlerts();
  }, [currentUser]);

  // Function to add a new alert
  const addAlert = async (alert: Omit<Alert, 'id' | 'timestamp' | 'userId'>) => {
    if (!currentUser) return;

    try {
      // Create a reference to the alerts collection
      const alertsRef = collection(db, 'alerts');

      // Add the alert to Firebase
      const newAlert = {
        ...alert,
        userId: currentUser.uid,
        timestamp: Timestamp.now(),
        read: false
      };

      const docRef = await addDoc(alertsRef, newAlert);

      // Update local state
      setCurrentAlerts(prev => [
        {
          id: docRef.id,
          ...newAlert
        },
        ...prev
      ]);

      // Send email notification if enabled
      if (emailNotificationsEnabled) {
        sendWeatherAlertEmail(alert.title, alert.description, alert.level)
          .then(success => {
            if (success) {
              console.log(`Email notification sent for alert: ${alert.title}`);
            } else {
              console.error(`Failed to send email notification for alert: ${alert.title}`);
            }
          });
      }
    } catch (error) {
      console.error('Error adding alert:', error);
    }
  };

  // Generate weather alerts based on current weather and forecast
  useEffect(() => {
    if (!currentUser || !currentWeather.data || !forecast.data || isLoading) return;

    const generateWeatherAlerts = async () => {
      try {
        // Check for extreme temperatures
        if (currentWeather.data.temperature > 35) {
          await addAlert({
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
          await addAlert({
            title: 'Heavy Rainfall Expected',
            description: `Heavy rainfall expected on ${heavyRainForecast.day} with ${heavyRainForecast.precipitation}% probability. Prepare drainage systems.`,
            level: 'warning',
            time: new Date().toLocaleString(),
          });
        }

        // Check for strong winds
        if (currentWeather.data.windSpeed > 30) {
          await addAlert({
            title: 'Strong Wind Alert',
            description: `Current wind speed is ${currentWeather.data.windSpeed} km/h. Secure structures and protect sensitive crops.`,
            level: 'emergency',
            time: new Date().toLocaleString(),
          });
        }
      } catch (error) {
        console.error('Error generating weather alerts:', error);
      }
    };

    // Only generate alerts once when the component mounts
    // In a real app, you might want to check periodically
    if (currentAlerts.length === 0) {
      generateWeatherAlerts();
    }
  }, [currentUser, currentWeather.data, forecast.data, isLoading, currentAlerts.length, addAlert]);

  // Mark an alert as read
  const markAlertAsRead = async (alertId: string) => {
    if (!currentUser) return;

    try {
      // Update the alert in Firebase
      const alertRef = doc(db, 'alerts', alertId);
      await setDoc(alertRef, { read: true }, { merge: true });

      // Update local state
      setCurrentAlerts(prev => {
        // Find the alert to move
        const alertToMove = prev.find(alert => alert.id === alertId);

        // Remove it from current alerts
        const updatedCurrentAlerts = prev.filter(alert => alert.id !== alertId);

        // Add it to past alerts if found
        if (alertToMove) {
          const updatedAlert = { ...alertToMove, read: true };
          setPastAlerts(prevPastAlerts => [updatedAlert, ...prevPastAlerts]);
        }

        return updatedCurrentAlerts;
      });
    } catch (error) {
      console.error('Error marking alert as read:', error);
    }
  };

  return (
    <AlertContext.Provider
      value={{
        currentAlerts,
        pastAlerts,
        emailNotificationsEnabled,
        setEmailNotificationsEnabled,
        markAlertAsRead,
        addAlert,
        isLoading,
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

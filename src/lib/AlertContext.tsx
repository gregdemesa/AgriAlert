import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { useWeather } from './WeatherContext';
import { sendWeatherAlertEmail } from './emailService';
import {
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  where,
  orderBy,
  getDocs,
  addDoc,
  updateDoc,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
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
  userId?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

// Alert context interface
interface AlertContextType {
  currentAlerts: Alert[];
  pastAlerts: Alert[];
  emailNotificationsEnabled: boolean;
  setEmailNotificationsEnabled: (enabled: boolean) => void;
  markAlertAsRead: (alertId: string) => Promise<void>;
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
  const [preferencesLoaded, setPreferencesLoaded] = useState(false);

  // Load alerts from Firebase
  useEffect(() => {
    const loadAlerts = async () => {
      if (!currentUser) return;

      setIsLoading(true);

      try {
        // Create a reference to the alerts collection
        const alertsRef = collection(db, 'alerts');

        // Query for current (unread) alerts for this user
        const currentAlertsQuery = query(
          alertsRef,
          where('userId', '==', currentUser.uid),
          where('read', '==', false),
          orderBy('createdAt', 'desc')
        );

        // Query for past (read) alerts for this user
        const pastAlertsQuery = query(
          alertsRef,
          where('userId', '==', currentUser.uid),
          where('read', '==', true),
          orderBy('createdAt', 'desc')
        );

        // Get the alerts
        const currentAlertsSnapshot = await getDocs(currentAlertsQuery);
        const pastAlertsSnapshot = await getDocs(pastAlertsQuery);

        // Convert the snapshots to Alert objects
        const currentAlertsData = currentAlertsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          time: doc.data().createdAt?.toDate().toLocaleString() || new Date().toLocaleString(),
        } as Alert));

        const pastAlertsData = pastAlertsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          time: doc.data().createdAt?.toDate().toLocaleString() || new Date().toLocaleString(),
        } as Alert));

        // Update state
        setCurrentAlerts(currentAlertsData);
        setPastAlerts(pastAlertsData);
      } catch (error) {
        console.error('Error loading alerts:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAlerts();
  }, [currentUser]);

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
        // Mark preferences as loaded, even if the document doesn't exist
        setPreferencesLoaded(true);
      } catch (error) {
        console.error('Error loading notification preferences:', error);
        // Mark preferences as loaded even on error, to prevent getting stuck
        setPreferencesLoaded(true);
      }
    };

    loadNotificationPreferences();
  }, [currentUser]);

  // Save user's notification preferences
  useEffect(() => {
    const saveNotificationPreferences = async () => {
      // Only save preferences if they've been loaded from Firebase first
      // This prevents the default value from overwriting the user's preference
      if (!currentUser || !preferencesLoaded) return;

      console.log('Saving email notification preference:', emailNotificationsEnabled);

      try {
        await setDoc(
          doc(db, 'userPreferences', currentUser.uid),
          { emailNotificationsEnabled },
          { merge: true }
        );
        console.log('Email notification preference saved successfully');
      } catch (error) {
        console.error('Error saving notification preferences:', error);
      }
    };

    saveNotificationPreferences();
  }, [currentUser, emailNotificationsEnabled, preferencesLoaded]);

  // Generate weather alerts based on current weather and forecast
  useEffect(() => {
    if (!currentWeather.data || !forecast.data || !currentUser) return;

    const generateWeatherAlerts = async () => {
      try {
        const newAlerts: Omit<Alert, 'id'>[] = [];

        // Check for extreme temperatures
        if (currentWeather.data.temperature > 35) {
          newAlerts.push({
            title: 'Extreme Heat Warning',
            description: `Current temperature is ${currentWeather.data.temperature}°C. Take measures to protect crops from heat stress.`,
            level: 'severe',
            time: new Date().toLocaleString(),
            read: false,
            userId: currentUser.uid,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now()
          });
        }

        // Check for heavy rainfall in forecast
        const heavyRainForecast = forecast.data.find(day =>
          day.precipitation > 70
        );

        if (heavyRainForecast) {
          newAlerts.push({
            title: 'Heavy Rainfall Expected',
            description: `Heavy rainfall expected on ${heavyRainForecast.day} with ${heavyRainForecast.precipitation}% probability. Prepare drainage systems.`,
            level: 'warning',
            time: new Date().toLocaleString(),
            read: false,
            userId: currentUser.uid,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now()
          });
        }

        // Check for strong winds
        if (currentWeather.data.windSpeed > 30) {
          newAlerts.push({
            title: 'Strong Wind Alert',
            description: `Current wind speed is ${currentWeather.data.windSpeed} km/h. Secure structures and protect sensitive crops.`,
            level: 'emergency',
            time: new Date().toLocaleString(),
            read: false,
            userId: currentUser.uid,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now()
          });
        }

        // Save new alerts to Firebase
        if (newAlerts.length > 0) {
          const alertsRef = collection(db, 'alerts');

          for (const alert of newAlerts) {
            // Check if a similar alert already exists
            const existingAlertsQuery = query(
              alertsRef,
              where('userId', '==', currentUser.uid),
              where('title', '==', alert.title),
              where('read', '==', false)
            );

            const existingAlerts = await getDocs(existingAlertsQuery);

            // Only add the alert if it doesn't already exist
            if (existingAlerts.empty) {
              const docRef = await addDoc(alertsRef, alert);
              console.log(`New alert added with ID: ${docRef.id}`);

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
            }
          }

          // Reload alerts to update the UI
          const currentAlertsQuery = query(
            alertsRef,
            where('userId', '==', currentUser.uid),
            where('read', '==', false),
            orderBy('createdAt', 'desc')
          );

          const currentAlertsSnapshot = await getDocs(currentAlertsQuery);

          const currentAlertsData = currentAlertsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            time: doc.data().createdAt?.toDate().toLocaleString() || new Date().toLocaleString(),
          } as Alert));

          setCurrentAlerts(currentAlertsData);
        }
      } catch (error) {
        console.error('Error generating or saving alerts:', error);
      }
    };

    generateWeatherAlerts();
  }, [currentWeather.data, forecast.data, emailNotificationsEnabled, currentUser]);

  // Mark an alert as read
  const markAlertAsRead = async (alertId: string) => {
    try {
      // Get the alert to mark as read
      const alertToUpdate = currentAlerts.find(alert => alert.id === alertId);

      if (!alertToUpdate) {
        console.error(`Alert with ID ${alertId} not found`);
        return;
      }

      // Update the alert in Firebase
      const alertRef = doc(db, 'alerts', alertId);
      await updateDoc(alertRef, {
        read: true,
        updatedAt: serverTimestamp()
      });

      console.log(`Alert ${alertId} marked as read in Firebase`);

      // Update local state
      setCurrentAlerts(prev => {
        // Remove the alert from current alerts
        return prev.filter(alert => alert.id !== alertId);
      });

      // Add the alert to past alerts
      setPastAlerts(prev => [
        ...prev,
        { ...alertToUpdate, read: true }
      ]);
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

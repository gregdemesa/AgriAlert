import { auth } from './firebase';

// Brevo API key from environment variables
const BREVO_API_KEY = import.meta.env.VITE_BREVO_API_KEY;
const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

// Email notification types
export type EmailNotificationType = 'weatherAlert' | 'harvestReminder' | 'systemUpdate';

// Interface for email notification settings
export interface EmailNotificationSettings {
  enabled: boolean;
  types: {
    weatherAlerts: boolean;
    harvestReminders: boolean;
    systemUpdates: boolean;
  };
}

// Default email notification settings
export const defaultEmailNotificationSettings: EmailNotificationSettings = {
  enabled: true,
  types: {
    weatherAlerts: true,
    harvestReminders: true,
    systemUpdates: true,
  },
};

// Interface for email data
interface EmailData {
  sender: {
    name: string;
    email: string;
  };
  to: {
    email: string;
    name?: string;
  }[];
  subject: string;
  htmlContent: string;
}

/**
 * Send an email notification using Brevo API
 * @param to Recipient email address
 * @param subject Email subject
 * @param htmlContent Email content in HTML format
 * @param recipientName Optional recipient name
 * @returns Promise that resolves when email is sent
 */
export const sendEmail = async (
  to: string,
  subject: string,
  htmlContent: string,
  recipientName?: string
): Promise<boolean> => {
  try {
    // Get current user
    const currentUser = auth.currentUser;
    if (!currentUser || !currentUser.email) {
      console.error('No authenticated user found');
      return false;
    }

    // Prepare email data
    const emailData: EmailData = {
      sender: {
        name: 'AgriAlert',
        email: 'teamyapac@gmail.com'
      },
      to: [
        {
          email: to || currentUser.email,
          name: recipientName || currentUser.displayName || undefined,
        },
      ],
      subject,
      htmlContent,
    };

    // Send email using Brevo API
    const response = await fetch(BREVO_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': BREVO_API_KEY,
      },
      body: JSON.stringify(emailData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error sending email:', errorData);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};

/**
 * Send a weather alert email
 * @param alertTitle Alert title
 * @param alertDescription Alert description
 * @param alertLevel Alert level (warning, severe, emergency)
 * @returns Promise that resolves when email is sent
 */
export const sendWeatherAlertEmail = async (
  alertTitle: string,
  alertDescription: string,
  alertLevel: 'warning' | 'severe' | 'emergency'
): Promise<boolean> => {
  try {
    // Get current user
    const currentUser = auth.currentUser;
    if (!currentUser || !currentUser.email) {
      console.error('No authenticated user found');
      return false;
    }

    // Create HTML content for the email
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
          <h1 style="color: #333; margin: 0;">AgriAlert Weather Alert</h1>
        </div>
        <div style="padding: 20px; border: 1px solid #ddd; background-color: #fff;">
          <div style="margin-bottom: 20px;">
            <span style="display: inline-block; padding: 5px 10px; border-radius: 4px; font-size: 12px; font-weight: bold; text-transform: uppercase; color: #fff; background-color: ${
              alertLevel === 'emergency'
                ? '#dc3545'
                : alertLevel === 'severe'
                ? '#fd7e14'
                : '#ffc107'
            };">${alertLevel}</span>
          </div>
          <h2 style="color: #333; margin-top: 0;">${alertTitle}</h2>
          <p style="color: #666; line-height: 1.5;">${alertDescription}</p>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #888; font-size: 12px;">
            <p>This is an automated alert from AgriAlert. Please do not reply to this email.</p>
            <p>To manage your notification settings, log in to your AgriAlert account.</p>
          </div>
        </div>
      </div>
    `;

    // Send the email
    return await sendEmail(
      currentUser.email,
      `AgriAlert: ${alertTitle}`,
      htmlContent,
      currentUser.displayName || undefined
    );
  } catch (error) {
    console.error('Error sending weather alert email:', error);
    return false;
  }
};

/**
 * Send a harvest reminder email
 * @param cropName Crop name
 * @param harvestDate Harvest date
 * @returns Promise that resolves when email is sent
 */
export const sendHarvestReminderEmail = async (
  cropName: string,
  harvestDate: string
): Promise<boolean> => {
  try {
    // Get current user
    const currentUser = auth.currentUser;
    if (!currentUser || !currentUser.email) {
      console.error('No authenticated user found');
      return false;
    }

    // Create HTML content for the email
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
          <h1 style="color: #333; margin: 0;">AgriAlert Harvest Reminder</h1>
        </div>
        <div style="padding: 20px; border: 1px solid #ddd; background-color: #fff;">
          <h2 style="color: #333; margin-top: 0;">Time to Harvest Your ${cropName}</h2>
          <p style="color: #666; line-height: 1.5;">
            This is a reminder that your ${cropName} is scheduled for harvest on ${harvestDate}.
          </p>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #888; font-size: 12px;">
            <p>This is an automated reminder from AgriAlert. Please do not reply to this email.</p>
            <p>To manage your notification settings, log in to your AgriAlert account.</p>
          </div>
        </div>
      </div>
    `;

    // Send the email
    return await sendEmail(
      currentUser.email,
      `AgriAlert: Harvest Reminder for ${cropName}`,
      htmlContent,
      currentUser.displayName || undefined
    );
  } catch (error) {
    console.error('Error sending harvest reminder email:', error);
    return false;
  }
};

/**
 * Send a system update email
 * @param updateTitle Update title
 * @param updateDescription Update description
 * @returns Promise that resolves when email is sent
 */
export const sendSystemUpdateEmail = async (
  updateTitle: string,
  updateDescription: string
): Promise<boolean> => {
  try {
    // Get current user
    const currentUser = auth.currentUser;
    if (!currentUser || !currentUser.email) {
      console.error('No authenticated user found');
      return false;
    }

    // Create HTML content for the email
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
          <h1 style="color: #333; margin: 0;">AgriAlert System Update</h1>
        </div>
        <div style="padding: 20px; border: 1px solid #ddd; background-color: #fff;">
          <h2 style="color: #333; margin-top: 0;">${updateTitle}</h2>
          <p style="color: #666; line-height: 1.5;">${updateDescription}</p>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #888; font-size: 12px;">
            <p>This is an automated notification from AgriAlert. Please do not reply to this email.</p>
            <p>To manage your notification settings, log in to your AgriAlert account.</p>
          </div>
        </div>
      </div>
    `;

    // Send the email
    return await sendEmail(
      currentUser.email,
      `AgriAlert: ${updateTitle}`,
      htmlContent,
      currentUser.displayName || undefined
    );
  } catch (error) {
    console.error('Error sending system update email:', error);
    return false;
  }
};

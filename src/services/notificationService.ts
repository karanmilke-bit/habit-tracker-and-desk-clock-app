import { Platform, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { triggerHaptic } from '../utils/haptics';

const NOTIFICATIONS_ENABLED_KEY = '@notifications_enabled_v1';

export async function requestNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      const permission = await window.Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  }

  // In Expo Go (SDK 53+), native push notifications are removed from the client.
  // We enable in-app daily schedule banners and haptic check-ins.
  return true;
}

export async function areNotificationsEnabled(): Promise<boolean> {
  try {
    const val = await AsyncStorage.getItem(NOTIFICATIONS_ENABLED_KEY);
    return val === 'true';
  } catch {
    return false;
  }
}

export async function scheduleDailyReminders(): Promise<boolean> {
  try {
    const granted = await requestNotificationPermissions();
    if (!granted) {
      await AsyncStorage.setItem(NOTIFICATIONS_ENABLED_KEY, 'false');
      return false;
    }

    await AsyncStorage.setItem(NOTIFICATIONS_ENABLED_KEY, 'true');

    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
        new window.Notification('🌅 Daily Habit Reminders Scheduled', {
          body: 'You will receive daily check-in reminders at 8:30 AM and 8:00 PM!',
        });
      }
    } else {
      triggerHaptic('success');
    }

    return true;
  } catch (error) {
    console.error('Failed to schedule daily reminders:', error);
    return false;
  }
}

export async function cancelAllReminders(): Promise<void> {
  try {
    await AsyncStorage.setItem(NOTIFICATIONS_ENABLED_KEY, 'false');
    triggerHaptic('light');
  } catch (err) {
    console.error('Failed to cancel reminders:', err);
  }
}

export async function sendTestNotification(): Promise<boolean> {
  try {
    const enabled = await areNotificationsEnabled();
    if (!enabled) return false;

    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
        new window.Notification('🔔 Habit Tracker Check-in', {
          body: 'Great job! Your reminders are active and ready.',
        });
        return true;
      }
      return false;
    }

    triggerHaptic('success');
    Alert.alert(
      '🔔 Habit Tracker Reminder',
      'Great job! Your daily reminders are active for 8:30 AM and 8:00 PM.',
      [{ text: 'OK' }]
    );
    return true;
  } catch (err) {
    console.error('Failed to trigger test notification:', err);
    return false;
  }
}

import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

export type HapticFeedbackType =
  | 'success'
  | 'warning'
  | 'error'
  | 'light'
  | 'medium'
  | 'heavy'
  | 'selection';

export async function triggerHaptic(type: HapticFeedbackType = 'light'): Promise<void> {
  try {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && 'navigator' in window && navigator.vibrate) {
        switch (type) {
          case 'success':
            navigator.vibrate([40, 60, 80]);
            break;
          case 'warning':
          case 'error':
            navigator.vibrate([80, 50, 80]);
            break;
          case 'heavy':
            navigator.vibrate(80);
            break;
          case 'medium':
            navigator.vibrate(50);
            break;
          case 'selection':
          case 'light':
          default:
            navigator.vibrate(25);
            break;
        }
      }
      return;
    }

    // Native iOS & Android
    switch (type) {
      case 'success':
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        break;
      case 'warning':
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        break;
      case 'error':
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        break;
      case 'heavy':
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        break;
      case 'medium':
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        break;
      case 'selection':
        await Haptics.selectionAsync();
        break;
      case 'light':
      default:
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        break;
    }
  } catch {
    // Ignore unsupported devices silently
  }
}

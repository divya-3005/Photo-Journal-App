import { Alert, Platform } from 'react-native';

/**
 * Cross-platform confirmation dialog that works seamlessly on Web, iOS, and Android.
 * React Native Web does not invoke Alert.alert button callbacks, so window.confirm is used on web.
 */
export function confirmAction({
  title,
  message,
  onConfirm,
  confirmText = 'Confirm',
  isDestructive = false,
}) {
  if (Platform.OS === 'web') {
    const promptText = message ? `${title}\n\n${message}` : title;
    if (typeof window !== 'undefined' && window.confirm(promptText)) {
      onConfirm?.();
    }
  } else {
    Alert.alert(title, message, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: confirmText,
        style: isDestructive ? 'destructive' : 'default',
        onPress: onConfirm,
      },
    ]);
  }
}

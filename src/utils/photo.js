import * as ImagePicker from 'expo-image-picker';
import { Alert, Linking, Platform } from 'react-native';

// Ask for camera or gallery permission. Returns true if allowed.
async function askPermission(type) {
  // Web does not require native permission dialogs
  if (Platform.OS === 'web') return true;

  try {
    const result =
      type === 'camera'
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (result.granted) return true;

    if (!result.canAskAgain) {
      // User blocked it permanently -> only Settings can fix it
      Alert.alert(
        'Permission blocked',
        `Please allow ${type === 'camera' ? 'camera' : 'photo'} access in Settings.`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: () => Linking.openSettings() },
        ]
      );
    } else {
      Alert.alert('Permission needed', 'We need permission to add a photo.');
    }
  } catch (e) {
    console.warn('Permission request error:', e);
  }
  return false;
}

export async function takePhoto() {
  const allowed = await askPermission('camera');
  if (!allowed) return null;

  try {
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.7,
    });
    if (result.canceled) return null;
    return result.assets[0].uri;
  } catch (e) {
    // e.g. iOS Simulator has no camera
    Alert.alert('Camera not available', 'Try choosing from the gallery.');
    return null;
  }
}

export async function pickFromGallery() {
  const allowed = await askPermission('gallery');
  if (!allowed) return null;

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    quality: 0.7,
  });
  if (result.canceled) return null;
  return result.assets[0].uri;
}

import * as Device from 'expo-device';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

/**
 * Gets the platform name in a format suitable for Appwrite's platform parameter
 * @returns A string representing the platform
 */
export const getPlatformName = (): string => {
  try {
    // Use the device OS name if available
    if (Device && Device.osName) {
      return Device.osName;
    }
    
    // Fallback to Platform.OS
    return Platform.OS || 'unknown';
  } catch (error) {
    console.error('Error getting platform name:', error);
    return Platform.OS || 'unknown';
  }
};

/**
 * Gets the app identifier in a format suitable for Appwrite
 * @returns A string representing the app identifier
 */
export const getAppIdentifier = (): string => {
  try {
    // For web platform
    if (Platform.OS === 'web') {
      return window.location.hostname || 'web-app';
    }
    
    // For iOS, try to get the bundleIdentifier
    if (Platform.OS === 'ios') {
      return 'com.nik.estate';
    }
    
    // For Android, try to get the package name
    if (Platform.OS === 'android') {
      return 'com.nik.estate';
    }
    
    // Default fallback
    return 'com.nik.estate';
  } catch (error) {
    console.error('Error getting app identifier:', error);
    return 'com.nik.estate'; // Fallback to default
  }
};
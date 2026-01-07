import * as Notifications from 'expo-notifications';
import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { contactApi } from '../api';

const BACKGROUND_FETCH_TASK = 'background-message-check';
const LAST_COUNT_KEY = 'last_unread_count';
const NOTIFICATION_ENABLED_KEY = 'notifications_enabled';

// Configure how notifications appear when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// Request notification permissions
export async function requestNotificationPermissions(): Promise<boolean> {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    return false;
  }

  // Set up Android notification channel
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('messages', {
      name: 'New Messages',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#da2862',
    });
  }

  return true;
}

// Show a local notification
export async function showNotification(title: string, body: string, data?: object) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data,
      sound: true,
      ...(Platform.OS === 'android' && { channelId: 'messages' }),
    },
    trigger: null, // Show immediately
  });
}

// Check for new messages and notify
export async function checkForNewMessages(): Promise<{ hasNew: boolean; newCount: number }> {
  try {
    // Check if user is authenticated
    const token = await SecureStore.getItemAsync('admin_token');
    if (!token) {
      return { hasNew: false, newCount: 0 };
    }

    // Get current unread count from API
    const { count: currentCount } = await contactApi.getUnreadCount();

    // Get last known count
    const lastCountStr = await SecureStore.getItemAsync(LAST_COUNT_KEY);
    const lastCount = lastCountStr ? parseInt(lastCountStr, 10) : 0;

    // Save current count
    await SecureStore.setItemAsync(LAST_COUNT_KEY, currentCount.toString());

    // Check if there are new messages
    if (currentCount > lastCount) {
      const newMessages = currentCount - lastCount;
      return { hasNew: true, newCount: newMessages };
    }

    return { hasNew: false, newCount: 0 };
  } catch (error) {
    console.log('Error checking for new messages:', error);
    return { hasNew: false, newCount: 0 };
  }
}

// Enable/disable notification checking
export async function setNotificationsEnabled(enabled: boolean) {
  await SecureStore.setItemAsync(NOTIFICATION_ENABLED_KEY, enabled ? 'true' : 'false');

  if (enabled) {
    await registerBackgroundFetch();
  } else {
    await unregisterBackgroundFetch();
  }
}

export async function areNotificationsEnabled(): Promise<boolean> {
  const enabled = await SecureStore.getItemAsync(NOTIFICATION_ENABLED_KEY);
  return enabled === 'true';
}

// Register background fetch task
export async function registerBackgroundFetch() {
  try {
    await BackgroundFetch.registerTaskAsync(BACKGROUND_FETCH_TASK, {
      minimumInterval: 15 * 60, // 15 minutes (minimum on Android)
      stopOnTerminate: false,
      startOnBoot: true,
    });
    console.log('Background fetch registered');
  } catch (error) {
    console.log('Error registering background fetch:', error);
  }
}

// Unregister background fetch task
export async function unregisterBackgroundFetch() {
  try {
    await BackgroundFetch.unregisterTaskAsync(BACKGROUND_FETCH_TASK);
    console.log('Background fetch unregistered');
  } catch (error) {
    console.log('Error unregistering background fetch:', error);
  }
}

// Check if background fetch is registered
export async function isBackgroundFetchRegistered(): Promise<boolean> {
  return await TaskManager.isTaskRegisteredAsync(BACKGROUND_FETCH_TASK);
}

// Initialize the background task (call this at app startup, outside of React)
export function defineBackgroundTask() {
  TaskManager.defineTask(BACKGROUND_FETCH_TASK, async () => {
    try {
      const notificationsEnabled = await areNotificationsEnabled();
      if (!notificationsEnabled) {
        return BackgroundFetch.BackgroundFetchResult.NoData;
      }

      const { hasNew, newCount } = await checkForNewMessages();

      if (hasNew) {
        await showNotification(
          'New Contact Message',
          newCount === 1
            ? 'You have 1 new message'
            : `You have ${newCount} new messages`,
          { screen: 'Contacts' }
        );
        return BackgroundFetch.BackgroundFetchResult.NewData;
      }

      return BackgroundFetch.BackgroundFetchResult.NoData;
    } catch (error) {
      console.log('Background fetch error:', error);
      return BackgroundFetch.BackgroundFetchResult.Failed;
    }
  });
}

// Reset the last count (call when viewing messages)
export async function resetLastCount(count: number) {
  await SecureStore.setItemAsync(LAST_COUNT_KEY, count.toString());
}

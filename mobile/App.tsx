import React, { useEffect, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer, NavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as Notifications from 'expo-notifications';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import {
  LoginScreen,
  DashboardScreen,
  PostsScreen,
  ProjectsScreen,
  NowScreen,
  ContactsScreen,
} from './src/screens';
import {
  defineBackgroundTask,
  requestNotificationPermissions,
  areNotificationsEnabled,
  registerBackgroundFetch,
  checkForNewMessages,
  showNotification,
} from './src/services/notifications';

// Define the background task at module level (required by expo-task-manager)
defineBackgroundTask();

export type RootStackParamList = {
  Dashboard: undefined;
  Posts: undefined;
  Projects: undefined;
  Now: undefined;
  Contacts: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

function AppNavigator() {
  const navigationRef = useRef<NavigationContainerRef<RootStackParamList>>(null);
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();

  useEffect(() => {
    // Initialize notifications
    initializeNotifications();

    // Listen for notifications when app is in foreground
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
    });

    // Handle notification tap
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data;
      if (data?.screen === 'Contacts' && navigationRef.current) {
        navigationRef.current.navigate('Contacts');
      }
    });

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  const initializeNotifications = async () => {
    const enabled = await areNotificationsEnabled();
    if (enabled) {
      const hasPermission = await requestNotificationPermissions();
      if (hasPermission) {
        await registerBackgroundFetch();

        // Check for new messages on app open
        const { hasNew, newCount } = await checkForNewMessages();
        if (hasNew) {
          await showNotification(
            'New Contact Message',
            newCount === 1
              ? 'You have 1 new message'
              : `You have ${newCount} new messages`,
            { screen: 'Contacts' }
          );
        }
      }
    }
  };

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#0a0a0a' },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
        <Stack.Screen name="Posts" component={PostsScreen} />
        <Stack.Screen name="Projects" component={ProjectsScreen} />
        <Stack.Screen name="Now" component={NowScreen} />
        <Stack.Screen name="Contacts" component={ContactsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#a78bfa" />
        <StatusBar style="light" />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  return <AppNavigator />;
}

export default function App() {
  return (
    <AuthProvider>
      <StatusBar style="light" />
      <AppContent />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

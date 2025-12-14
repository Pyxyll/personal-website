import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import * as LocalAuthentication from 'expo-local-authentication';
import { authApi } from '../api';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  biometricsAvailable: boolean;
  biometricsEnabled: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  enableBiometrics: (email: string, password: string) => Promise<void>;
  disableBiometrics: () => Promise<void>;
  loginWithBiometrics: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [biometricsAvailable, setBiometricsAvailable] = useState(false);
  const [biometricsEnabled, setBiometricsEnabled] = useState(false);

  useEffect(() => {
    checkAuth();
    checkBiometrics();
  }, []);

  const checkBiometrics = async () => {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    setBiometricsAvailable(hasHardware && isEnrolled);

    const enabled = await SecureStore.getItemAsync('biometrics_enabled');
    setBiometricsEnabled(enabled === 'true');
  };

  const checkAuth = async () => {
    const token = await SecureStore.getItemAsync('admin_token');
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const userData = await authApi.me();
      setUser(userData);
    } catch {
      await SecureStore.deleteItemAsync('admin_token');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const { user: userData, token } = await authApi.login(email, password);
    await SecureStore.setItemAsync('admin_token', token);
    setUser(userData);
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignore errors on logout
    } finally {
      await SecureStore.deleteItemAsync('admin_token');
      setUser(null);
    }
  };

  const enableBiometrics = async (email: string, password: string) => {
    await SecureStore.setItemAsync('bio_email', email);
    await SecureStore.setItemAsync('bio_password', password);
    await SecureStore.setItemAsync('biometrics_enabled', 'true');
    setBiometricsEnabled(true);
  };

  const disableBiometrics = async () => {
    await SecureStore.deleteItemAsync('bio_email');
    await SecureStore.deleteItemAsync('bio_password');
    await SecureStore.deleteItemAsync('biometrics_enabled');
    setBiometricsEnabled(false);
  };

  const loginWithBiometrics = async (): Promise<boolean> => {
    if (!biometricsAvailable || !biometricsEnabled) {
      return false;
    }

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Login to Admin Panel',
      fallbackLabel: 'Use password',
      disableDeviceFallback: false,
    });

    if (result.success) {
      const email = await SecureStore.getItemAsync('bio_email');
      const password = await SecureStore.getItemAsync('bio_password');

      if (email && password) {
        await login(email, password);
        return true;
      }
    }

    return false;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        biometricsAvailable,
        biometricsEnabled,
        login,
        logout,
        enableBiometrics,
        disableBiometrics,
        loginWithBiometrics,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

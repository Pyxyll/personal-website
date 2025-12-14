import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '../contexts/AuthContext';

export default function LoginScreen() {
  const {
    login,
    biometricsAvailable,
    biometricsEnabled,
    enableBiometrics,
    loginWithBiometrics
  } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (biometricsEnabled) {
      handleBiometricLogin();
    }
  }, [biometricsEnabled]);

  const handleBiometricLogin = async () => {
    setError('');
    setIsLoading(true);
    try {
      const success = await loginWithBiometrics();
      if (!success) {
        setError('Biometric authentication failed');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Biometric login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please enter email and password');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      await login(email, password);

      // After successful login, offer to enable biometrics if available
      if (biometricsAvailable && !biometricsEnabled) {
        Alert.alert(
          'Enable Biometrics',
          'Would you like to enable fingerprint/face login for faster access?',
          [
            { text: 'Not now', style: 'cancel' },
            {
              text: 'Enable',
              onPress: async () => {
                await enableBiometrics(email, password);
              },
            },
          ]
        );
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar style="light" />
      <View style={styles.content}>
        <Text style={styles.title}>// Admin Login</Text>
        <Text style={styles.subtitle}>dylancollins.me</Text>

        {biometricsEnabled && (
          <TouchableOpacity
            style={styles.biometricButton}
            onPress={handleBiometricLogin}
            disabled={isLoading}
          >
            <Text style={styles.biometricIcon}>&#128274;</Text>
            <Text style={styles.biometricText}>Tap to use biometrics</Text>
          </TouchableOpacity>
        )}

        {biometricsEnabled && (
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or use password</Text>
            <View style={styles.dividerLine} />
          </View>
        )}

        <View>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="admin@example.com"
            placeholderTextColor="#737373"
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="password"
            placeholderTextColor="#737373"
            secureTextEntry={true}
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TouchableOpacity
            style={[styles.button, isLoading ? styles.buttonDisabled : null]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#0a0a0a" />
            ) : (
              <Text style={styles.buttonText}>[Login]</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#a78bfa',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#737373',
    marginBottom: 32,
  },
  biometricButton: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#a78bfa',
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  biometricIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  biometricText: {
    color: '#a78bfa',
    fontSize: 16,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#333333',
  },
  dividerText: {
    color: '#737373',
    paddingHorizontal: 12,
    fontSize: 12,
  },
  label: {
    fontSize: 14,
    color: '#e5e5e5',
    marginBottom: 4,
    marginTop: 12,
  },
  input: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333333',
    padding: 12,
    color: '#e5e5e5',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#e5e5e5',
    padding: 14,
    alignItems: 'center',
    marginTop: 24,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#0a0a0a',
    fontSize: 16,
    fontWeight: '600',
  },
  error: {
    color: '#dc2626',
    fontSize: 14,
    marginTop: 12,
  },
});

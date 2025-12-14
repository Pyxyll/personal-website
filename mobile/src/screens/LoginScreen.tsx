import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Animated,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '../contexts/AuthContext';
import { colors, spacing, typography } from '../theme';
import { FadeIn } from '../components/Animated';

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
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  // Cursor blink animation
  const cursorOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const blink = Animated.loop(
      Animated.sequence([
        Animated.timing(cursorOpacity, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(cursorOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    );
    blink.start();
    return () => blink.stop();
  }, []);

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
        {/* Logo/Brand Section */}
        <FadeIn delay={0}>
          <View style={styles.brandSection}>
            <View style={styles.logoContainer}>
              <Text style={styles.logoText}>D</Text>
            </View>
            <Text style={styles.title}>// admin_login</Text>
            <Text style={styles.subtitle}>dylancollins.me</Text>
          </View>
        </FadeIn>

        {/* Biometric Button */}
        {biometricsEnabled && (
          <FadeIn delay={100}>
            <Pressable
              style={({ pressed }) => [
                styles.biometricButton,
                pressed && styles.biometricButtonPressed,
              ]}
              onPress={handleBiometricLogin}
              disabled={isLoading}
            >
              <View style={styles.biometricIconContainer}>
                <Text style={styles.biometricIcon}>*</Text>
              </View>
              <Text style={styles.biometricText}>authenticate with biometrics</Text>
              <Text style={styles.biometricAction}>[scan]</Text>
            </Pressable>

            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>
          </FadeIn>
        )}

        {/* Login Form */}
        <FadeIn delay={biometricsEnabled ? 200 : 100}>
          <View style={styles.formSection}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                <Text style={styles.labelAccent}>$</Text> email
              </Text>
              <View style={[
                styles.inputContainer,
                emailFocused && styles.inputContainerFocused,
              ]}>
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="admin@example.com"
                  placeholderTextColor={colors.textDisabled}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                />
                {emailFocused && (
                  <Animated.Text style={[styles.cursor, { opacity: cursorOpacity }]}>
                    _
                  </Animated.Text>
                )}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                <Text style={styles.labelAccent}>$</Text> password
              </Text>
              <View style={[
                styles.inputContainer,
                passwordFocused && styles.inputContainerFocused,
              ]}>
                <TextInput
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="••••••••"
                  placeholderTextColor={colors.textDisabled}
                  secureTextEntry={true}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                />
                {passwordFocused && (
                  <Animated.Text style={[styles.cursor, { opacity: cursorOpacity }]}>
                    _
                  </Animated.Text>
                )}
              </View>
            </View>

            {error ? (
              <FadeIn slideFrom="none">
                <View style={styles.errorContainer}>
                  <Text style={styles.errorPrefix}>error:</Text>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              </FadeIn>
            ) : null}

            <Pressable
              style={({ pressed }) => [
                styles.button,
                pressed && styles.buttonPressed,
                isLoading && styles.buttonDisabled,
              ]}
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator color={colors.background} size="small" />
                  <Text style={styles.buttonTextLoading}>authenticating...</Text>
                </View>
              ) : (
                <Text style={styles.buttonText}>[submit]</Text>
              )}
            </Pressable>
          </View>
        </FadeIn>

        {/* Footer */}
        <FadeIn delay={300}>
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              <Text style={styles.footerAccent}>{'>'}</Text> secure connection
            </Text>
          </View>
        </FadeIn>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.xl,
  },

  // Brand Section
  brandSection: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  logoContainer: {
    width: 80,
    height: 80,
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  logoText: {
    fontSize: 48,
    fontWeight: typography.bold,
    color: colors.text,
  },
  title: {
    fontSize: typography.xl,
    fontWeight: typography.bold,
    color: colors.accent,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.sm,
    color: colors.textMuted,
  },

  // Biometric Button
  biometricButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  biometricButtonPressed: {
    borderColor: colors.accent,
    backgroundColor: colors.cardHover,
  },
  biometricIconContainer: {
    width: 40,
    height: 40,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  biometricIcon: {
    fontSize: typography.xl,
    color: colors.accent,
  },
  biometricText: {
    flex: 1,
    fontSize: typography.base,
    color: colors.text,
  },
  biometricAction: {
    fontSize: typography.sm,
    color: colors.textMuted,
  },

  // Divider
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    color: colors.textMuted,
    paddingHorizontal: spacing.md,
    fontSize: typography.sm,
  },

  // Form
  formSection: {
    marginBottom: spacing.xl,
  },
  inputGroup: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  labelAccent: {
    color: colors.accent,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
  },
  inputContainerFocused: {
    borderColor: colors.accent,
  },
  input: {
    flex: 1,
    paddingVertical: spacing.md,
    color: colors.text,
    fontSize: typography.md,
  },
  cursor: {
    color: colors.accent,
    fontSize: typography.md,
    marginLeft: 2,
  },

  // Error
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(220, 38, 38, 0.1)',
    borderWidth: 1,
    borderColor: colors.destructive,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  errorPrefix: {
    color: colors.destructive,
    fontSize: typography.sm,
    fontWeight: typography.semibold,
    marginRight: spacing.sm,
  },
  errorText: {
    color: colors.text,
    fontSize: typography.sm,
    flex: 1,
  },

  // Button
  button: {
    backgroundColor: colors.text,
    padding: spacing.lg,
    alignItems: 'center',
  },
  buttonPressed: {
    backgroundColor: colors.textSecondary,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: colors.background,
    fontSize: typography.md,
    fontWeight: typography.semibold,
  },
  buttonTextLoading: {
    color: colors.background,
    fontSize: typography.md,
    marginLeft: spacing.sm,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  // Footer
  footer: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: typography.sm,
    color: colors.textMuted,
  },
  footerAccent: {
    color: colors.accent,
  },
});

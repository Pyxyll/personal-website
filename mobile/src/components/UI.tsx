import React from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import { colors, spacing, typography, borders } from '../theme';

// ===== TYPOGRAPHY =====

interface TypographyProps {
  children: React.ReactNode;
  style?: TextStyle;
  color?: string;
}

export function Title({ children, style, color }: TypographyProps) {
  return (
    <Text style={[styles.title, color ? { color } : null, style]}>
      {children}
    </Text>
  );
}

export function Subtitle({ children, style, color }: TypographyProps) {
  return (
    <Text style={[styles.subtitle, color ? { color } : null, style]}>
      {children}
    </Text>
  );
}

export function Label({ children, style, color }: TypographyProps) {
  return (
    <Text style={[styles.label, color ? { color } : null, style]}>
      {children}
    </Text>
  );
}

export function Muted({ children, style }: TypographyProps) {
  return <Text style={[styles.muted, style]}>{children}</Text>;
}

// ===== BUTTONS =====

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  style,
}: ButtonProps) {
  const getButtonStyle = () => {
    switch (variant) {
      case 'secondary':
        return styles.buttonSecondary;
      case 'outline':
        return styles.buttonOutline;
      case 'ghost':
        return styles.buttonGhost;
      case 'destructive':
        return styles.buttonDestructive;
      default:
        return styles.buttonPrimary;
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case 'outline':
      case 'ghost':
        return styles.buttonTextOutline;
      case 'destructive':
        return styles.buttonTextDestructive;
      default:
        return styles.buttonTextPrimary;
    }
  };

  const getSizeStyle = () => {
    switch (size) {
      case 'sm':
        return styles.buttonSm;
      case 'lg':
        return styles.buttonLg;
      default:
        return styles.buttonMd;
    }
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.buttonBase,
        getButtonStyle(),
        getSizeStyle(),
        pressed && styles.buttonPressed,
        disabled && styles.buttonDisabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' ? colors.background : colors.text}
          size="small"
        />
      ) : (
        <View style={styles.buttonContent}>
          {icon}
          <Text style={[getTextStyle(), icon ? { marginLeft: spacing.sm } : null]}>
            [{title}]
          </Text>
        </View>
      )}
    </Pressable>
  );
}

// ===== BADGES =====

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'accent' | 'success' | 'warning' | 'error' | 'outline';
  style?: ViewStyle;
}

export function Badge({ children, variant = 'default', style }: BadgeProps) {
  const getBadgeStyle = () => {
    switch (variant) {
      case 'accent':
        return styles.badgeAccent;
      case 'success':
        return styles.badgeSuccess;
      case 'warning':
        return styles.badgeWarning;
      case 'error':
        return styles.badgeError;
      case 'outline':
        return styles.badgeOutline;
      default:
        return styles.badgeDefault;
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case 'outline':
        return styles.badgeTextOutline;
      default:
        return styles.badgeText;
    }
  };

  return (
    <View style={[styles.badgeBase, getBadgeStyle(), style]}>
      <Text style={getTextStyle()}>{children}</Text>
    </View>
  );
}

// ===== DIVIDER =====

interface DividerProps {
  style?: ViewStyle;
  accent?: boolean;
}

export function Divider({ style, accent = false }: DividerProps) {
  return (
    <View
      style={[
        styles.divider,
        accent && styles.dividerAccent,
        style,
      ]}
    />
  );
}

// ===== HEADER =====

interface HeaderProps {
  title: string;
  subtitle?: string;
  rightElement?: React.ReactNode;
  style?: ViewStyle;
}

export function Header({ title, subtitle, rightElement, style }: HeaderProps) {
  return (
    <View style={[styles.header, style]}>
      <View style={styles.headerLeft}>
        <Text style={styles.headerTitle}>// {title}</Text>
        {subtitle && <Text style={styles.headerSubtitle}>{subtitle}</Text>}
      </View>
      {rightElement && <View style={styles.headerRight}>{rightElement}</View>}
    </View>
  );
}

// ===== CARD COMPONENTS =====

interface CardHeaderProps {
  title: string;
  badge?: string | number;
  action?: React.ReactNode;
}

export function CardHeader({ title, badge, action }: CardHeaderProps) {
  return (
    <View style={styles.cardHeader}>
      <View style={styles.cardHeaderLeft}>
        <Text style={styles.cardTitle}>{title}</Text>
        {badge !== undefined && (
          <Badge variant="accent" style={{ marginLeft: spacing.sm }}>
            {badge}
          </Badge>
        )}
      </View>
      {action}
    </View>
  );
}

// ===== EMPTY STATE =====

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
}

export function EmptyState({ icon = '[ ]', title, description }: EmptyStateProps) {
  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateIcon}>{icon}</Text>
      <Text style={styles.emptyStateTitle}>{title}</Text>
      {description && (
        <Text style={styles.emptyStateDescription}>{description}</Text>
      )}
    </View>
  );
}

// ===== LOADING =====

export function LoadingScreen() {
  return (
    <View style={styles.loadingScreen}>
      <Text style={styles.loadingText}>loading</Text>
      <Text style={styles.loadingCursor}>_</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  // Typography
  title: {
    fontSize: typography.xl,
    fontWeight: typography.bold,
    color: colors.accent,
  },
  subtitle: {
    fontSize: typography.sm,
    color: colors.textMuted,
  },
  label: {
    fontSize: typography.base,
    color: colors.text,
    fontWeight: typography.medium,
  },
  muted: {
    fontSize: typography.sm,
    color: colors.textMuted,
  },

  // Button Base
  buttonBase: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonPrimary: {
    backgroundColor: colors.text,
  },
  buttonSecondary: {
    backgroundColor: colors.surface,
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.border,
  },
  buttonGhost: {
    backgroundColor: 'transparent',
  },
  buttonDestructive: {
    backgroundColor: colors.destructive,
  },
  buttonSm: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  buttonMd: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  buttonLg: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonTextPrimary: {
    color: colors.background,
    fontSize: typography.md,
    fontWeight: typography.semibold,
  },
  buttonTextOutline: {
    color: colors.text,
    fontSize: typography.md,
    fontWeight: typography.semibold,
  },
  buttonTextDestructive: {
    color: colors.text,
    fontSize: typography.md,
    fontWeight: typography.semibold,
  },

  // Badges
  badgeBase: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  badgeDefault: {
    backgroundColor: colors.surface,
  },
  badgeAccent: {
    backgroundColor: colors.accent,
  },
  badgeSuccess: {
    backgroundColor: colors.success,
  },
  badgeWarning: {
    backgroundColor: colors.warning,
  },
  badgeError: {
    backgroundColor: colors.error,
  },
  badgeOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.border,
  },
  badgeText: {
    color: colors.text,
    fontSize: typography.xs,
    fontWeight: typography.semibold,
  },
  badgeTextOutline: {
    color: colors.textMuted,
    fontSize: typography.xs,
    fontWeight: typography.medium,
  },

  // Divider
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  dividerAccent: {
    backgroundColor: colors.accent,
    opacity: 0.3,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: spacing.lg,
    paddingTop: 60,
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.background,
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    marginLeft: spacing.lg,
  },
  headerTitle: {
    fontSize: typography.xl,
    fontWeight: typography.bold,
    color: colors.accent,
  },
  headerSubtitle: {
    fontSize: typography.sm,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },

  // Card
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: typography.md,
    fontWeight: typography.semibold,
    color: colors.text,
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxl,
  },
  emptyStateIcon: {
    fontSize: 32,
    color: colors.textMuted,
    marginBottom: spacing.md,
  },
  emptyStateTitle: {
    fontSize: typography.md,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  emptyStateDescription: {
    fontSize: typography.sm,
    color: colors.textMuted,
    textAlign: 'center',
  },

  // Loading
  loadingScreen: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  loadingText: {
    fontSize: typography.lg,
    color: colors.textMuted,
  },
  loadingCursor: {
    fontSize: typography.lg,
    color: colors.accent,
  },
});

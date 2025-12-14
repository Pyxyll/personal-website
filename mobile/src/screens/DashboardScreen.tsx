import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Pressable,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '../contexts/AuthContext';
import { contactApi } from '../api';
import { colors, spacing, typography } from '../theme';
import { FadeIn, StaggeredList, AnimatedCard } from '../components/Animated';
import { Header, Badge, Divider, Muted } from '../components/UI';
import type { RootStackParamList } from '../../App';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface MenuItem {
  title: string;
  description: string;
  screen: keyof RootStackParamList;
  icon: string;
  badge?: number;
}

export default function DashboardScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { user, logout, biometricsEnabled, disableBiometrics } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const fetchUnreadCount = async () => {
    try {
      const data = await contactApi.getUnreadCount();
      setUnreadCount(data.count);
    } catch {
      // Ignore
    }
  };

  useEffect(() => {
    fetchUnreadCount();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchUnreadCount();
    setRefreshing(false);
  };

  const menuItems: MenuItem[] = [
    {
      title: 'Blog Posts',
      description: 'Create, edit, and manage blog posts',
      screen: 'Posts',
      icon: '>_',
    },
    {
      title: 'Projects',
      description: 'Manage your portfolio projects',
      screen: 'Projects',
      icon: '{}',
    },
    {
      title: 'Now Page',
      description: "Update what you're currently doing",
      screen: 'Now',
      icon: '~$',
    },
    {
      title: 'Contact Messages',
      description: 'View messages from visitors',
      screen: 'Contacts',
      icon: '@:',
      badge: unreadCount || undefined,
    },
  ];

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <FadeIn>
        <Header
          title="Dashboard"
          subtitle={user?.email}
          rightElement={
            <Pressable onPress={logout} hitSlop={8}>
              <Text style={styles.logoutText}>[logout]</Text>
            </Pressable>
          }
        />
      </FadeIn>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.accent}
            colors={[colors.accent]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Welcome Section */}
        <FadeIn delay={100}>
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeText}>
              <Text style={styles.welcomeAccent}>{'>'}</Text> Welcome back
            </Text>
            <Muted>Manage your website content</Muted>
          </View>
        </FadeIn>

        {/* Menu Cards */}
        <View style={styles.menuGrid}>
          <StaggeredList staggerDelay={80}>
            {menuItems.map((item) => (
              <AnimatedCard
                key={item.screen}
                style={styles.menuCard}
                onPress={() => navigation.navigate(item.screen)}
              >
                <View style={styles.cardContent}>
                  <View style={styles.cardIconContainer}>
                    <Text style={styles.cardIcon}>{item.icon}</Text>
                  </View>

                  <View style={styles.cardBody}>
                    <View style={styles.cardHeaderRow}>
                      <Text style={styles.cardTitle}>{item.title}</Text>
                      {item.badge && (
                        <Badge variant="accent">{item.badge}</Badge>
                      )}
                    </View>

                    <Text style={styles.cardDescription}>{item.description}</Text>

                    <Divider style={styles.cardDivider} />

                    <View style={styles.cardFooter}>
                      <Text style={styles.cardAction}>[open]</Text>
                      <Text style={styles.cardArrow}>→</Text>
                    </View>
                  </View>
                </View>
              </AnimatedCard>
            ))}
          </StaggeredList>
        </View>

        {/* Quick Stats */}
        <FadeIn delay={500}>
          <View style={styles.statsSection}>
            <Text style={styles.sectionTitle}>// quick_stats</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Text style={styles.statIcon}>{'{}'}</Text>
                <Text style={styles.statLabel}>status</Text>
                <Text style={styles.statValue}>online</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statIcon}>@:</Text>
                <Text style={styles.statLabel}>unread</Text>
                <Text style={[styles.statValue, unreadCount > 0 && styles.statValueAccent]}>
                  {unreadCount}
                </Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statIcon}>~$</Text>
                <Text style={styles.statLabel}>biometrics</Text>
                <Text style={styles.statValue}>{biometricsEnabled ? 'on' : 'off'}</Text>
              </View>
            </View>
          </View>
        </FadeIn>

        {/* Settings Section */}
        {biometricsEnabled && (
          <FadeIn delay={600}>
            <View style={styles.settingsSection}>
              <Text style={styles.sectionTitle}>// settings</Text>
              <Pressable
                style={styles.settingItem}
                onPress={disableBiometrics}
              >
                <Text style={styles.settingText}>Disable biometric login</Text>
                <Text style={styles.settingAction}>[disable]</Text>
              </Pressable>
            </View>
          </FadeIn>
        )}

        {/* Footer */}
        <FadeIn delay={700}>
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              dylancollins.me <Text style={styles.footerAccent}>admin</Text>
            </Text>
            <Text style={styles.footerVersion}>v1.0.0</Text>
          </View>
        </FadeIn>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xxl,
  },
  logoutText: {
    color: colors.textMuted,
    fontSize: typography.base,
  },

  // Welcome Section
  welcomeSection: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  welcomeText: {
    fontSize: typography.lg,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  welcomeAccent: {
    color: colors.accent,
  },

  // Menu Grid
  menuGrid: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  menuCard: {
    padding: 0,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  cardContent: {
    flexDirection: 'row',
  },
  cardIconContainer: {
    width: 56,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: colors.border,
  },
  cardIcon: {
    fontSize: typography.lg,
    color: colors.accent,
    fontWeight: typography.bold,
  },
  cardBody: {
    flex: 1,
    padding: spacing.lg,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: typography.md,
    fontWeight: typography.semibold,
    color: colors.text,
  },
  cardDescription: {
    fontSize: typography.sm,
    color: colors.textMuted,
    marginTop: spacing.sm,
  },
  cardDivider: {
    marginVertical: spacing.md,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardAction: {
    fontSize: typography.sm,
    color: colors.text,
  },
  cardArrow: {
    fontSize: typography.sm,
    color: colors.accent,
  },

  // Stats Section
  statsSection: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.sm,
    color: colors.textMuted,
    marginBottom: spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    alignItems: 'center',
  },
  statIcon: {
    fontSize: typography.lg,
    color: colors.accent,
    marginBottom: spacing.sm,
  },
  statLabel: {
    fontSize: typography.xs,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  statValue: {
    fontSize: typography.sm,
    color: colors.text,
    fontWeight: typography.semibold,
  },
  statValueAccent: {
    color: colors.accent,
  },

  // Settings Section
  settingsSection: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xl,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  settingText: {
    fontSize: typography.base,
    color: colors.text,
  },
  settingAction: {
    fontSize: typography.base,
    color: colors.textMuted,
  },

  // Footer
  footer: {
    padding: spacing.xl,
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  footerText: {
    fontSize: typography.sm,
    color: colors.textMuted,
  },
  footerAccent: {
    color: colors.accent,
  },
  footerVersion: {
    fontSize: typography.xs,
    color: colors.textDisabled,
    marginTop: spacing.xs,
  },
});

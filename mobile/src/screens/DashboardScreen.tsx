import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../contexts/AuthContext';
import { contactApi } from '../api';
import type { RootStackParamList } from '../../App';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function DashboardScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { user, logout } = useAuth();
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

  const menuItems = [
    { title: 'Blog Posts', description: 'Create, edit, and manage blog posts', screen: 'Posts' as const },
    { title: 'Projects', description: 'Manage your portfolio projects', screen: 'Projects' as const },
    { title: 'Now Page', description: "Update what you're currently doing", screen: 'Now' as const },
    { title: 'Contact Messages', description: 'View messages from visitors', screen: 'Contacts' as const, badge: unreadCount },
  ];

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#a78bfa" />}
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>// Dashboard</Text>
          <Text style={styles.subtitle}>{user?.email}</Text>
        </View>
        <TouchableOpacity onPress={logout}>
          <Text style={styles.logoutText}>[Logout]</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.grid}>
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.screen}
            style={styles.card}
            onPress={() => navigation.navigate(item.screen)}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              {item.badge ? (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{item.badge}</Text>
                </View>
              ) : null}
            </View>
            <View style={styles.divider} />
            <Text style={styles.cardDescription}>{item.description}</Text>
            <Text style={styles.cardAction}>[Open]</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 16,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  title: { fontSize: 20, fontWeight: 'bold', color: '#a78bfa' },
  subtitle: { fontSize: 12, color: '#737373', marginTop: 4 },
  logoutText: { color: '#737373', fontSize: 14 },
  grid: { padding: 16 },
  card: {
    backgroundColor: '#141414',
    borderWidth: 1,
    borderColor: '#333333',
    padding: 16,
    marginBottom: 16,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { fontSize: 16, fontWeight: '600', color: '#e5e5e5' },
  badge: { backgroundColor: '#a78bfa', paddingHorizontal: 8, paddingVertical: 2 },
  badgeText: { color: '#ffffff', fontSize: 12, fontWeight: '600' },
  divider: { height: 1, backgroundColor: '#333333', marginVertical: 12 },
  cardDescription: { fontSize: 14, color: '#737373' },
  cardAction: { fontSize: 14, color: '#e5e5e5', marginTop: 12 },
});

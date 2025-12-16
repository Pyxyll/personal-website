import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  RefreshControl,
  Alert,
  Modal,
  ScrollView,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { contactApi } from '../api';
import { ContactSubmission } from '../types';
import { colors, spacing, typography } from '../theme';
import { FadeIn, AnimatedCard } from '../components/Animated';
import { Divider, EmptyState } from '../components/UI';
import { resetLastCount } from '../services/notifications';

export default function ContactsScreen() {
  const navigation = useNavigation();
  const [contacts, setContacts] = useState<ContactSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedContact, setSelectedContact] = useState<ContactSubmission | null>(null);

  const fetchContacts = async () => {
    try {
      const data = await contactApi.getAll();
      setContacts(data);
      // Reset the notification count to current unread count
      const unreadCount = data.filter(c => !c.read).length;
      await resetLastCount(unreadCount);
    } catch {
      Alert.alert('Error', 'Failed to load');
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh contacts when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchContacts();
    }, [])
  );

  useEffect(() => {
    fetchContacts();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchContacts();
    setRefreshing(false);
  };

  const handleView = async (contact: ContactSubmission) => {
    setSelectedContact(contact);
    if (!contact.read) {
      try {
        await contactApi.markRead(contact.id);
        setContacts(contacts.map((c) => (c.id === contact.id ? { ...c, read: true } : c)));
      } catch {
        // Ignore
      }
    }
  };

  const handleDelete = (contact: ContactSubmission) => {
    Alert.alert('Delete', `Delete message from "${contact.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await contactApi.delete(contact.id);
            setContacts(contacts.filter((c) => c.id !== contact.id));
            setSelectedContact(null);
          } catch {
            Alert.alert('Error', 'Failed to delete');
          }
        },
      },
    ]);
  };

  const renderContact = ({ item, index }: { item: ContactSubmission; index: number }) => (
    <FadeIn delay={index * 50}>
      <AnimatedCard style={styles.card} onPress={() => handleView(item)}>
        <View style={styles.cardContent}>
          <View style={[styles.cardIndicator, !item.read && styles.cardIndicatorUnread]} />
          <View style={styles.cardBody}>
            <View style={styles.cardHeader}>
              <View style={styles.cardTitleRow}>
                {!item.read && <View style={styles.unreadDot} />}
                <Text style={[styles.cardTitle, !item.read && styles.unreadText]} numberOfLines={1}>
                  {item.name}
                </Text>
              </View>
              <Text style={styles.date}>[{new Date(item.created_at).toLocaleDateString()}]</Text>
            </View>
            <Text style={styles.email}>{item.email}</Text>
            <Text style={styles.preview} numberOfLines={2}>{item.message}</Text>
          </View>
        </View>
      </AnimatedCard>
    </FadeIn>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <FadeIn>
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
            <Text style={styles.backText}>{'<'} back</Text>
          </Pressable>
          <Text style={styles.title}>// messages</Text>
          <View style={{ width: 50 }} />
        </View>
      </FadeIn>

      <FlatList
        data={contacts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderContact}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.accent}
            colors={[colors.accent]}
          />
        }
        ListEmptyComponent={
          <FadeIn delay={100}>
            <EmptyState
              icon="@:"
              title={isLoading ? 'loading...' : 'no messages'}
              description={isLoading ? undefined : 'Messages from your contact form will appear here'}
            />
          </FadeIn>
        }
        showsVerticalScrollIndicator={false}
      />

      <Modal
        visible={selectedContact !== null}
        animationType="slide"
        transparent
        onRequestClose={() => setSelectedContact(null)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setSelectedContact(null)}>
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>// message</Text>
              <Pressable onPress={() => setSelectedContact(null)} hitSlop={8}>
                <Text style={styles.closeButton}>[x]</Text>
              </Pressable>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>
                  <Text style={styles.labelAccent}>$</Text> from
                </Text>
                <Text style={styles.fieldValue}>{selectedContact?.name}</Text>
              </View>

              <View style={styles.field}>
                <Text style={styles.fieldLabel}>
                  <Text style={styles.labelAccent}>$</Text> email
                </Text>
                <Text style={[styles.fieldValue, styles.emailValue]}>{selectedContact?.email}</Text>
              </View>

              <View style={styles.field}>
                <Text style={styles.fieldLabel}>
                  <Text style={styles.labelAccent}>$</Text> date
                </Text>
                <Text style={styles.fieldValue}>
                  {selectedContact ? new Date(selectedContact.created_at).toLocaleString() : ''}
                </Text>
              </View>

              <Divider />

              <View style={styles.field}>
                <Text style={styles.fieldLabel}>
                  <Text style={styles.labelAccent}>$</Text> message
                </Text>
                <View style={styles.messageContainer}>
                  <Text style={styles.messageText}>{selectedContact?.message}</Text>
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <Pressable
                style={styles.deleteButton}
                onPress={() => selectedContact && handleDelete(selectedContact)}
              >
                <Text style={styles.deleteButtonText}>[delete message]</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: 60,
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backText: {
    color: colors.accent,
    fontSize: typography.base,
  },
  title: {
    fontSize: typography.lg,
    fontWeight: typography.bold,
    color: colors.text,
  },
  list: {
    padding: spacing.lg,
  },
  card: {
    marginBottom: spacing.md,
    padding: 0,
    overflow: 'hidden',
  },
  cardContent: {
    flexDirection: 'row',
  },
  cardIndicator: {
    width: 4,
    backgroundColor: colors.border,
  },
  cardIndicatorUnread: {
    backgroundColor: colors.accent,
  },
  cardBody: {
    flex: 1,
    padding: spacing.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    backgroundColor: colors.accent,
    marginRight: spacing.sm,
  },
  cardTitle: {
    fontSize: typography.md,
    color: colors.textMuted,
  },
  unreadText: {
    color: colors.text,
    fontWeight: typography.semibold,
  },
  date: {
    fontSize: typography.xs,
    color: colors.textDisabled,
  },
  email: {
    fontSize: typography.sm,
    color: colors.accent,
    marginTop: spacing.xs,
  },
  preview: {
    fontSize: typography.sm,
    color: colors.textMuted,
    marginTop: spacing.sm,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: typography.lg,
    fontWeight: typography.bold,
    color: colors.accent,
  },
  closeButton: {
    fontSize: typography.md,
    color: colors.textMuted,
  },
  modalBody: {
    padding: spacing.lg,
  },
  field: {
    marginBottom: spacing.lg,
  },
  fieldLabel: {
    fontSize: typography.sm,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  labelAccent: {
    color: colors.accent,
  },
  fieldValue: {
    fontSize: typography.base,
    color: colors.text,
  },
  emailValue: {
    color: colors.accent,
  },
  messageContainer: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  messageText: {
    fontSize: typography.base,
    color: colors.text,
    lineHeight: 24,
  },
  modalActions: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  deleteButton: {
    alignItems: 'center',
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.destructive,
  },
  deleteButtonText: {
    color: colors.destructive,
    fontSize: typography.base,
  },
});

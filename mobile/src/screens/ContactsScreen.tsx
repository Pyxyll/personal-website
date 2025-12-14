import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Modal,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { contactApi } from '../api';
import { ContactSubmission } from '../types';

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
    } catch {
      Alert.alert('Error', 'Failed to load');
    } finally {
      setIsLoading(false);
    }
  };

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

  const renderContact = ({ item }: { item: ContactSubmission }) => (
    <TouchableOpacity style={styles.card} onPress={() => handleView(item)}>
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleRow}>
          {!item.read ? <View style={styles.unreadDot} /> : null}
          <Text style={[styles.cardTitle, !item.read ? styles.unreadText : null]} numberOfLines={1}>
            {item.name}
          </Text>
        </View>
        <Text style={styles.date}>{new Date(item.created_at).toLocaleDateString()}</Text>
      </View>
      <Text style={styles.email}>{item.email}</Text>
      <Text style={styles.preview} numberOfLines={2}>{item.message}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>[Back]</Text>
        </TouchableOpacity>
        <Text style={styles.title}>// Messages</Text>
        <View style={{ width: 50 }} />
      </View>

      <FlatList
        data={contacts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderContact}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#a78bfa" />}
        ListEmptyComponent={<Text style={styles.emptyText}>{isLoading ? 'Loading...' : 'No messages'}</Text>}
      />

      <Modal
        visible={selectedContact !== null}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSelectedContact(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Message</Text>
              <TouchableOpacity onPress={() => setSelectedContact(null)}>
                <Text style={styles.closeButton}>[X]</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>From</Text>
                <Text style={styles.fieldValue}>{selectedContact?.name}</Text>
              </View>
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Email</Text>
                <Text style={styles.fieldValue}>{selectedContact?.email}</Text>
              </View>
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Date</Text>
                <Text style={styles.fieldValue}>
                  {selectedContact ? new Date(selectedContact.created_at).toLocaleString() : ''}
                </Text>
              </View>
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Message</Text>
                <Text style={styles.messageText}>{selectedContact?.message}</Text>
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => selectedContact && handleDelete(selectedContact)}>
                <Text style={styles.deleteButtonText}>[Delete]</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  backText: { color: '#a78bfa', fontSize: 14 },
  title: { fontSize: 18, fontWeight: 'bold', color: '#e5e5e5' },
  list: { padding: 16 },
  card: {
    backgroundColor: '#141414',
    borderWidth: 1,
    borderColor: '#333333',
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#a78bfa', marginRight: 8 },
  cardTitle: { fontSize: 16, color: '#737373' },
  unreadText: { color: '#e5e5e5', fontWeight: '600' },
  date: { fontSize: 12, color: '#525252' },
  email: { fontSize: 12, color: '#a78bfa', marginTop: 4 },
  preview: { fontSize: 14, color: '#737373', marginTop: 8 },
  emptyText: { color: '#737373', textAlign: 'center', marginTop: 32 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#141414', borderTopWidth: 1, borderTopColor: '#333333', maxHeight: '80%' },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  modalTitle: { fontSize: 18, fontWeight: '600', color: '#e5e5e5' },
  closeButton: { fontSize: 16, color: '#737373' },
  modalBody: { padding: 16 },
  field: { marginBottom: 16 },
  fieldLabel: { fontSize: 12, color: '#737373', marginBottom: 4 },
  fieldValue: { fontSize: 14, color: '#e5e5e5' },
  messageText: { fontSize: 14, color: '#e5e5e5', lineHeight: 22 },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#333333',
  },
  deleteButtonText: { color: '#dc2626', fontSize: 14 },
});

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { nowApi } from '../api';
import { NowUpdate } from '../types';

export default function NowScreen() {
  const navigation = useNavigation();
  const [current, setCurrent] = useState<NowUpdate | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    status: '',
    location: '',
    working_on: '',
    learning: '',
    reading: '',
    watching: '',
    goals: '',
  });

  const fetchCurrent = async () => {
    try {
      const data = await nowApi.getCurrent();
      setCurrent(data);
      if (data) {
        setEditData({
          status: data.status || '',
          location: data.location || '',
          working_on: data.working_on?.join('\n') || '',
          learning: data.learning?.join('\n') || '',
          reading: data.reading?.join('\n') || '',
          watching: data.watching?.join('\n') || '',
          goals: data.goals?.join('\n') || '',
        });
      }
    } catch {
      Alert.alert('Error', 'Failed to load');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrent();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchCurrent();
    setRefreshing(false);
  };

  const handleSave = async () => {
    try {
      const updateData = {
        status: editData.status,
        location: editData.location || null,
        working_on: editData.working_on.split('\n').filter(Boolean),
        learning: editData.learning.split('\n').filter(Boolean),
        reading: editData.reading.split('\n').filter(Boolean),
        watching: editData.watching.split('\n').filter(Boolean),
        goals: editData.goals.split('\n').filter(Boolean),
      };

      if (current) {
        await nowApi.update(current.id, updateData);
      } else {
        await nowApi.create({ ...updateData, is_current: true });
      }

      await fetchCurrent();
      setIsEditing(false);
      Alert.alert('Success', 'Now page updated');
    } catch {
      Alert.alert('Error', 'Failed to save');
    }
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#a78bfa" />}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>[Back]</Text>
        </TouchableOpacity>
        <Text style={styles.title}>// Now</Text>
        <TouchableOpacity onPress={() => (isEditing ? handleSave() : setIsEditing(true))}>
          <Text style={styles.editButton}>{isEditing ? '[Save]' : '[Edit]'}</Text>
        </TouchableOpacity>
      </View>

      {isEditing ? (
        <TouchableOpacity style={styles.cancelRow} onPress={() => setIsEditing(false)}>
          <Text style={styles.cancelText}>[Cancel]</Text>
        </TouchableOpacity>
      ) : null}

      {isLoading ? (
        <Text style={styles.loadingText}>Loading...</Text>
      ) : (
        <>
          <View style={styles.section}>
            <Text style={styles.label}>Status</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={editData.status}
                onChangeText={(t) => setEditData({ ...editData, status: t })}
                placeholder="Status"
                placeholderTextColor="#737373"
              />
            ) : (
              <Text style={styles.value}>{current?.status || 'Not set'}</Text>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Location</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={editData.location}
                onChangeText={(t) => setEditData({ ...editData, location: t })}
                placeholder="Location"
                placeholderTextColor="#737373"
              />
            ) : (
              <Text style={styles.value}>{current?.location || 'Not set'}</Text>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Working On</Text>
            {isEditing ? (
              <TextInput
                style={[styles.input, styles.multiline]}
                value={editData.working_on}
                onChangeText={(t) => setEditData({ ...editData, working_on: t })}
                placeholder="One per line"
                placeholderTextColor="#737373"
                multiline={true}
                numberOfLines={4}
              />
            ) : (
              <View>
                {current?.working_on?.map((item, i) => (
                  <Text key={i} style={styles.listItem}>- {item}</Text>
                )) || <Text style={styles.value}>Nothing</Text>}
              </View>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Learning</Text>
            {isEditing ? (
              <TextInput
                style={[styles.input, styles.multiline]}
                value={editData.learning}
                onChangeText={(t) => setEditData({ ...editData, learning: t })}
                placeholder="One per line"
                placeholderTextColor="#737373"
                multiline={true}
                numberOfLines={4}
              />
            ) : (
              <View>
                {current?.learning?.map((item, i) => (
                  <Text key={i} style={styles.listItem}>- {item}</Text>
                )) || <Text style={styles.value}>Nothing</Text>}
              </View>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Reading</Text>
            {isEditing ? (
              <TextInput
                style={[styles.input, styles.multiline]}
                value={editData.reading}
                onChangeText={(t) => setEditData({ ...editData, reading: t })}
                placeholder="One per line"
                placeholderTextColor="#737373"
                multiline={true}
                numberOfLines={4}
              />
            ) : (
              <View>
                {current?.reading?.map((item, i) => (
                  <Text key={i} style={styles.listItem}>- {item}</Text>
                )) || <Text style={styles.value}>Nothing</Text>}
              </View>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Watching</Text>
            {isEditing ? (
              <TextInput
                style={[styles.input, styles.multiline]}
                value={editData.watching}
                onChangeText={(t) => setEditData({ ...editData, watching: t })}
                placeholder="One per line"
                placeholderTextColor="#737373"
                multiline={true}
                numberOfLines={4}
              />
            ) : (
              <View>
                {current?.watching?.map((item, i) => (
                  <Text key={i} style={styles.listItem}>- {item}</Text>
                )) || <Text style={styles.value}>Nothing</Text>}
              </View>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Goals</Text>
            {isEditing ? (
              <TextInput
                style={[styles.input, styles.multiline]}
                value={editData.goals}
                onChangeText={(t) => setEditData({ ...editData, goals: t })}
                placeholder="One per line"
                placeholderTextColor="#737373"
                multiline={true}
                numberOfLines={4}
              />
            ) : (
              <View>
                {current?.goals?.map((item, i) => (
                  <Text key={i} style={styles.listItem}>- {item}</Text>
                )) || <Text style={styles.value}>Nothing</Text>}
              </View>
            )}
          </View>
        </>
      )}

      <View style={{ height: 32 }} />
    </ScrollView>
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
  editButton: { color: '#e5e5e5', fontSize: 14 },
  cancelRow: { padding: 16, paddingBottom: 0 },
  cancelText: { color: '#737373', fontSize: 14 },
  loadingText: { color: '#737373', textAlign: 'center', marginTop: 32 },
  section: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#333333' },
  label: { fontSize: 14, color: '#e5e5e5', marginBottom: 8 },
  value: { fontSize: 14, color: '#737373' },
  input: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333333',
    padding: 12,
    color: '#e5e5e5',
    fontSize: 14,
  },
  multiline: { minHeight: 100, textAlignVertical: 'top' },
  listItem: { fontSize: 14, color: '#737373', marginBottom: 4 },
});

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  RefreshControl,
  Alert,
  TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { nowApi } from '../api';
import { NowUpdate } from '../types';
import { colors, spacing, typography } from '../theme';
import { FadeIn, StaggeredList } from '../components/Animated';
import { Divider } from '../components/UI';

interface NowField {
  key: keyof typeof defaultEdit;
  label: string;
  icon: string;
  multiline: boolean;
}

const defaultEdit = {
  status: '',
  location: '',
  working_on: '',
  learning: '',
  reading: '',
  watching: '',
  goals: '',
};

const fields: NowField[] = [
  { key: 'status', label: 'status', icon: '~$', multiline: false },
  { key: 'location', label: 'location', icon: '@:', multiline: false },
  { key: 'working_on', label: 'working_on', icon: '>_', multiline: true },
  { key: 'learning', label: 'learning', icon: '++', multiline: true },
  { key: 'reading', label: 'reading', icon: '[]', multiline: true },
  { key: 'watching', label: 'watching', icon: '<>', multiline: true },
  { key: 'goals', label: 'goals', icon: '**', multiline: true },
];

export default function NowScreen() {
  const navigation = useNavigation();
  const [current, setCurrent] = useState<NowUpdate | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(defaultEdit);
  const [saving, setSaving] = useState(false);

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
    setSaving(true);
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
    } finally {
      setSaving(false);
    }
  };

  const getFieldValue = (key: string): string | string[] | null => {
    if (!current) return null;
    return (current as any)[key];
  };

  const renderFieldValue = (key: string) => {
    const value = getFieldValue(key);
    if (!value) return <Text style={styles.emptyValue}>not set</Text>;

    if (Array.isArray(value)) {
      if (value.length === 0) return <Text style={styles.emptyValue}>empty</Text>;
      return (
        <View style={styles.listContainer}>
          {value.map((item, i) => (
            <View key={i} style={styles.listItem}>
              <Text style={styles.listBullet}>{'>'}</Text>
              <Text style={styles.listText}>{item}</Text>
            </View>
          ))}
        </View>
      );
    }

    return <Text style={styles.fieldValue}>{value}</Text>;
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <FadeIn>
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
            <Text style={styles.backText}>{'<'} back</Text>
          </Pressable>
          <Text style={styles.title}>// now</Text>
          <Pressable
            onPress={() => (isEditing ? handleSave() : setIsEditing(true))}
            disabled={saving}
            hitSlop={8}
          >
            <Text style={[styles.actionButton, saving && styles.disabled]}>
              {saving ? 'saving...' : isEditing ? '[save]' : '[edit]'}
            </Text>
          </Pressable>
        </View>
      </FadeIn>

      {isEditing && (
        <FadeIn>
          <Pressable style={styles.cancelRow} onPress={() => setIsEditing(false)}>
            <Text style={styles.cancelText}>[cancel editing]</Text>
          </Pressable>
        </FadeIn>
      )}

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
        {isLoading ? (
          <FadeIn>
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>loading</Text>
              <Text style={styles.loadingCursor}>_</Text>
            </View>
          </FadeIn>
        ) : (
          <StaggeredList staggerDelay={60}>
            {fields.map((field) => (
              <View key={field.key} style={styles.fieldCard}>
                <View style={styles.fieldHeader}>
                  <Text style={styles.fieldIcon}>{field.icon}</Text>
                  <Text style={styles.fieldLabel}>{field.label}</Text>
                </View>
                <Divider />
                {isEditing ? (
                  <TextInput
                    style={[styles.input, field.multiline && styles.multilineInput]}
                    value={editData[field.key]}
                    onChangeText={(t) => setEditData({ ...editData, [field.key]: t })}
                    placeholder={field.multiline ? 'One item per line' : `Enter ${field.label}`}
                    placeholderTextColor={colors.textDisabled}
                    multiline={field.multiline}
                    numberOfLines={field.multiline ? 4 : 1}
                  />
                ) : (
                  renderFieldValue(field.key)
                )}
              </View>
            ))}
          </StaggeredList>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
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
  actionButton: {
    color: colors.success,
    fontSize: typography.base,
  },
  disabled: {
    opacity: 0.5,
  },
  cancelRow: {
    padding: spacing.lg,
    paddingBottom: 0,
  },
  cancelText: {
    color: colors.textMuted,
    fontSize: typography.sm,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  loadingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  loadingText: {
    fontSize: typography.lg,
    color: colors.textMuted,
  },
  loadingCursor: {
    fontSize: typography.lg,
    color: colors.accent,
  },
  fieldCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  fieldHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fieldIcon: {
    fontSize: typography.md,
    color: colors.accent,
    fontWeight: typography.bold,
    marginRight: spacing.sm,
  },
  fieldLabel: {
    fontSize: typography.base,
    color: colors.text,
    fontWeight: typography.medium,
  },
  fieldValue: {
    fontSize: typography.base,
    color: colors.textSecondary,
  },
  emptyValue: {
    fontSize: typography.base,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
  listContainer: {
    gap: spacing.sm,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  listBullet: {
    color: colors.accent,
    fontSize: typography.base,
    marginRight: spacing.sm,
    width: 16,
  },
  listText: {
    fontSize: typography.base,
    color: colors.textSecondary,
    flex: 1,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    color: colors.text,
    fontSize: typography.base,
  },
  multilineInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
});

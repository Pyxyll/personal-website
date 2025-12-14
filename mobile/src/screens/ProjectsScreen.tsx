import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  RefreshControl,
  Alert,
  TextInput,
  Modal,
  ScrollView,
  Switch,
  Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { projectsApi } from '../api';
import { Project } from '../types';
import { colors, spacing, typography } from '../theme';
import { FadeIn, AnimatedCard } from '../components/Animated';
import { Badge, Divider, EmptyState } from '../components/UI';

const statusOptions = ['active', 'completed', 'wip', 'archived'] as const;
const statusColors: Record<string, { bg: string; text: string }> = {
  active: { bg: colors.success, text: '#fff' },
  completed: { bg: colors.info, text: '#fff' },
  wip: { bg: colors.warning, text: '#000' },
  archived: { bg: colors.textMuted, text: '#fff' },
};

const emptyProject = {
  title: '',
  slug: '',
  description: '',
  tags: '',
  status: 'wip' as const,
  github_url: '',
  demo_url: '',
  category: '',
  featured: false,
};

export default function ProjectsScreen() {
  const navigation = useNavigation();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [showEditor, setShowEditor] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState(emptyProject);
  const [saving, setSaving] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  const cursorOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const blink = Animated.loop(
      Animated.sequence([
        Animated.timing(cursorOpacity, { toValue: 0, duration: 500, useNativeDriver: true }),
        Animated.timing(cursorOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
      ])
    );
    blink.start();
    return () => blink.stop();
  }, []);

  const fetchProjects = useCallback(async () => {
    try {
      const data = await projectsApi.adminGetAll({ search: search || undefined });
      setProjects(data);
    } catch {
      Alert.alert('Error', 'Failed to load projects');
    } finally {
      setIsLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProjects();
    setRefreshing(false);
  };

  const openCreate = () => {
    setEditingProject(null);
    setFormData(emptyProject);
    setShowEditor(true);
  };

  const openEdit = (project: Project) => {
    setEditingProject(project);
    setFormData({
      title: project.title,
      slug: project.slug,
      description: project.description,
      tags: project.tags.join(', '),
      status: project.status,
      github_url: project.github_url || '',
      demo_url: project.demo_url || '',
      category: project.category || '',
      featured: project.featured,
    });
    setShowEditor(true);
  };

  const handleSave = async () => {
    if (!formData.title.trim()) {
      Alert.alert('Error', 'Title is required');
      return;
    }

    setSaving(true);
    try {
      const data = {
        title: formData.title,
        slug: formData.slug || formData.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        description: formData.description,
        tags: formData.tags.split(',').map((t) => t.trim()).filter(Boolean),
        status: formData.status,
        github_url: formData.github_url || null,
        demo_url: formData.demo_url || null,
        category: formData.category || null,
        featured: formData.featured,
      };

      if (editingProject) {
        await projectsApi.update(editingProject.id, data);
      } else {
        await projectsApi.create(data);
      }

      setShowEditor(false);
      fetchProjects();
      Alert.alert('Success', editingProject ? 'Project updated' : 'Project created');
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (project: Project) => {
    Alert.alert('Delete Project', `Delete "${project.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await projectsApi.delete(project.id);
            setProjects(projects.filter((p) => p.id !== project.id));
          } catch {
            Alert.alert('Error', 'Failed to delete');
          }
        },
      },
    ]);
  };

  const renderProject = ({ item, index }: { item: Project; index: number }) => (
    <FadeIn delay={index * 50}>
      <AnimatedCard style={styles.card} onPress={() => openEdit(item)}>
        <View style={styles.cardContent}>
          <View style={styles.cardIcon}>
            <Text style={styles.cardIconText}>{'{}'}</Text>
          </View>
          <View style={styles.cardBody}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
            </View>
            <View style={styles.badgeRow}>
              {item.featured && <Badge variant="accent">featured</Badge>}
              <View style={[styles.statusBadge, { backgroundColor: statusColors[item.status]?.bg || colors.textMuted }]}>
                <Text style={[styles.statusBadgeText, { color: statusColors[item.status]?.text || '#fff' }]}>
                  {item.status}
                </Text>
              </View>
            </View>
            <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
            <Divider />
            <View style={styles.actions}>
              <Pressable onPress={() => openEdit(item)} hitSlop={8}>
                <Text style={styles.actionText}>[edit]</Text>
              </Pressable>
              <Pressable onPress={() => handleDelete(item)} hitSlop={8}>
                <Text style={styles.deleteText}>[delete]</Text>
              </Pressable>
            </View>
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
          <Text style={styles.title}>// projects</Text>
          <Pressable onPress={openCreate} hitSlop={8}>
            <Text style={styles.addText}>[+ new]</Text>
          </Pressable>
        </View>
      </FadeIn>

      <FadeIn delay={50}>
        <View style={styles.searchContainer}>
          <View style={[styles.searchInputContainer, searchFocused && styles.searchInputFocused]}>
            <Text style={styles.searchPrefix}>$</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="search projects..."
              placeholderTextColor={colors.textDisabled}
              value={search}
              onChangeText={setSearch}
              onSubmitEditing={fetchProjects}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
            />
            {searchFocused && (
              <Animated.Text style={[styles.cursor, { opacity: cursorOpacity }]}>_</Animated.Text>
            )}
          </View>
        </View>
      </FadeIn>

      <FlatList
        data={projects}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderProject}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} colors={[colors.accent]} />
        }
        ListEmptyComponent={
          <FadeIn delay={100}>
            <EmptyState
              icon="{}"
              title={isLoading ? 'loading...' : 'no projects found'}
              description={isLoading ? undefined : 'Create your first project to get started'}
            />
          </FadeIn>
        }
        showsVerticalScrollIndicator={false}
      />

      <Modal visible={showEditor} animationType="slide" onRequestClose={() => setShowEditor(false)}>
        <View style={styles.modalContainer}>
          <StatusBar style="light" />

          <View style={styles.modalHeader}>
            <Pressable onPress={() => setShowEditor(false)} hitSlop={8}>
              <Text style={styles.backText}>[cancel]</Text>
            </Pressable>
            <Text style={styles.modalTitle}>// {editingProject ? 'edit_project' : 'new_project'}</Text>
            <Pressable onPress={handleSave} disabled={saving} hitSlop={8}>
              <Text style={[styles.saveText, saving && styles.disabled]}>{saving ? 'saving...' : '[save]'}</Text>
            </Pressable>
          </View>

          <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
            <View style={styles.formGroup}>
              <Text style={styles.label}><Text style={styles.labelAccent}>$</Text> title <Text style={styles.required}>*</Text></Text>
              <TextInput
                style={styles.input}
                value={formData.title}
                onChangeText={(t) => setFormData({ ...formData, title: t })}
                placeholder="Project title"
                placeholderTextColor={colors.textDisabled}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}><Text style={styles.labelAccent}>$</Text> slug</Text>
              <TextInput
                style={styles.input}
                value={formData.slug}
                onChangeText={(t) => setFormData({ ...formData, slug: t })}
                placeholder="auto-generated-from-title"
                placeholderTextColor={colors.textDisabled}
                autoCapitalize="none"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}><Text style={styles.labelAccent}>$</Text> description</Text>
              <TextInput
                style={[styles.input, styles.multiline]}
                value={formData.description}
                onChangeText={(t) => setFormData({ ...formData, description: t })}
                placeholder="Project description"
                placeholderTextColor={colors.textDisabled}
                multiline
                numberOfLines={4}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}><Text style={styles.labelAccent}>$</Text> status</Text>
              <View style={styles.statusRow}>
                {statusOptions.map((status) => (
                  <Pressable
                    key={status}
                    style={[
                      styles.statusButton,
                      formData.status === status && { backgroundColor: statusColors[status].bg, borderColor: statusColors[status].bg },
                    ]}
                    onPress={() => setFormData({ ...formData, status })}
                  >
                    <Text style={[styles.statusText, formData.status === status && { color: statusColors[status].text }]}>
                      [{status}]
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}><Text style={styles.labelAccent}>$</Text> tags</Text>
              <TextInput
                style={styles.input}
                value={formData.tags}
                onChangeText={(t) => setFormData({ ...formData, tags: t })}
                placeholder="react, typescript, web"
                placeholderTextColor={colors.textDisabled}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}><Text style={styles.labelAccent}>$</Text> category</Text>
              <TextInput
                style={styles.input}
                value={formData.category}
                onChangeText={(t) => setFormData({ ...formData, category: t })}
                placeholder="web, mobile, api"
                placeholderTextColor={colors.textDisabled}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}><Text style={styles.labelAccent}>$</Text> github_url</Text>
              <TextInput
                style={styles.input}
                value={formData.github_url}
                onChangeText={(t) => setFormData({ ...formData, github_url: t })}
                placeholder="https://github.com/user/repo"
                placeholderTextColor={colors.textDisabled}
                autoCapitalize="none"
                keyboardType="url"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}><Text style={styles.labelAccent}>$</Text> demo_url</Text>
              <TextInput
                style={styles.input}
                value={formData.demo_url}
                onChangeText={(t) => setFormData({ ...formData, demo_url: t })}
                placeholder="https://example.com"
                placeholderTextColor={colors.textDisabled}
                autoCapitalize="none"
                keyboardType="url"
              />
            </View>

            <View style={styles.switchContainer}>
              <View style={styles.switchRow}>
                <View>
                  <Text style={styles.switchLabel}>Featured</Text>
                  <Text style={styles.switchDescription}>Show on homepage</Text>
                </View>
                <Switch
                  value={formData.featured}
                  onValueChange={(v) => setFormData({ ...formData, featured: v })}
                  trackColor={{ false: colors.border, true: colors.accent }}
                  thumbColor={colors.text}
                />
              </View>
            </View>

            <View style={{ height: 50 }} />
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
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
  backText: { color: colors.accent, fontSize: typography.base },
  title: { fontSize: typography.lg, fontWeight: typography.bold, color: colors.text },
  addText: { color: colors.success, fontSize: typography.base },
  disabled: { opacity: 0.5 },

  searchContainer: { padding: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
  },
  searchInputFocused: { borderColor: colors.accent },
  searchPrefix: { color: colors.accent, fontSize: typography.base, marginRight: spacing.sm },
  searchInput: { flex: 1, paddingVertical: spacing.md, color: colors.text, fontSize: typography.base },
  cursor: { color: colors.accent, fontSize: typography.base },

  list: { padding: spacing.lg },
  card: { marginBottom: spacing.md, padding: 0, overflow: 'hidden' },
  cardContent: { flexDirection: 'row' },
  cardIcon: {
    width: 48,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: colors.border,
  },
  cardIconText: { color: colors.accent, fontSize: typography.base, fontWeight: typography.bold },
  cardBody: { flex: 1, padding: spacing.md },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  cardTitle: { fontSize: typography.md, fontWeight: typography.semibold, color: colors.text, flex: 1 },
  badgeRow: { flexDirection: 'row', gap: spacing.xs, marginTop: spacing.sm },
  statusBadge: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs },
  statusBadgeText: { fontSize: typography.xs, fontWeight: typography.semibold },
  description: { fontSize: typography.sm, color: colors.textMuted, marginTop: spacing.sm },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: spacing.lg },
  actionText: { color: colors.text, fontSize: typography.sm },
  deleteText: { color: colors.destructive, fontSize: typography.sm },

  modalContainer: { flex: 1, backgroundColor: colors.background },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: 60,
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: { fontSize: typography.lg, fontWeight: typography.bold, color: colors.accent },
  saveText: { color: colors.success, fontSize: typography.base },

  form: { padding: spacing.lg },
  formGroup: { marginBottom: spacing.lg },
  label: { fontSize: typography.sm, color: colors.textSecondary, marginBottom: spacing.sm },
  labelAccent: { color: colors.accent },
  required: { color: colors.destructive },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    color: colors.text,
    fontSize: typography.base,
  },
  multiline: { minHeight: 100, textAlignVertical: 'top' },
  statusRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  statusButton: {
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  statusText: { color: colors.textMuted, fontSize: typography.sm },
  switchContainer: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginTop: spacing.md,
  },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  switchLabel: { fontSize: typography.base, color: colors.text },
  switchDescription: { fontSize: typography.sm, color: colors.textMuted, marginTop: 2 },
});

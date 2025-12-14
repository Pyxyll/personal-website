import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  TextInput,
  Modal,
  ScrollView,
  Switch,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { projectsApi } from '../api';
import { Project } from '../types';

const statusOptions = ['active', 'completed', 'wip', 'archived'] as const;
const statusColors: Record<string, string> = {
  active: '#22c55e',
  completed: '#3b82f6',
  wip: '#f59e0b',
  archived: '#737373',
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

  const renderProject = ({ item }: { item: Project }) => (
    <TouchableOpacity style={styles.card} onPress={() => openEdit(item)}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
        <View style={styles.badges}>
          {item.featured ? <View style={styles.featuredBadge}><Text style={styles.badgeText}>Featured</Text></View> : null}
          <View style={[styles.badge, { backgroundColor: statusColors[item.status] || '#737373' }]}>
            <Text style={styles.badgeText}>{item.status}</Text>
          </View>
        </View>
      </View>
      <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
      <View style={styles.actions}>
        <TouchableOpacity onPress={() => openEdit(item)}>
          <Text style={styles.actionText}>[Edit]</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDelete(item)}>
          <Text style={[styles.actionText, styles.deleteText]}>[Delete]</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>[Back]</Text>
        </TouchableOpacity>
        <Text style={styles.title}>// Projects</Text>
        <TouchableOpacity onPress={openCreate}>
          <Text style={styles.addText}>[+ New]</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search..."
          placeholderTextColor="#737373"
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={fetchProjects}
        />
      </View>

      <FlatList
        data={projects}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderProject}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#a78bfa" />}
        ListEmptyComponent={<Text style={styles.emptyText}>{isLoading ? 'Loading...' : 'No projects'}</Text>}
      />

      <Modal visible={showEditor} animationType="slide" onRequestClose={() => setShowEditor(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowEditor(false)}>
              <Text style={styles.backText}>[Cancel]</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{editingProject ? 'Edit Project' : 'New Project'}</Text>
            <TouchableOpacity onPress={handleSave} disabled={saving}>
              <Text style={[styles.addText, saving ? styles.disabled : null]}>[Save]</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.form}>
            <Text style={styles.label}>Title *</Text>
            <TextInput
              style={styles.input}
              value={formData.title}
              onChangeText={(t) => setFormData({ ...formData, title: t })}
              placeholder="Project title"
              placeholderTextColor="#737373"
            />

            <Text style={styles.label}>Slug</Text>
            <TextInput
              style={styles.input}
              value={formData.slug}
              onChangeText={(t) => setFormData({ ...formData, slug: t })}
              placeholder="auto-generated-from-title"
              placeholderTextColor="#737373"
              autoCapitalize="none"
            />

            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.multiline]}
              value={formData.description}
              onChangeText={(t) => setFormData({ ...formData, description: t })}
              placeholder="Project description"
              placeholderTextColor="#737373"
              multiline={true}
              numberOfLines={4}
            />

            <Text style={styles.label}>Status</Text>
            <View style={styles.statusRow}>
              {statusOptions.map((status) => (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.statusButton,
                    formData.status === status ? { backgroundColor: statusColors[status] } : null,
                  ]}
                  onPress={() => setFormData({ ...formData, status })}
                >
                  <Text style={[styles.statusText, formData.status === status ? styles.statusTextActive : null]}>
                    {status}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Tags (comma separated)</Text>
            <TextInput
              style={styles.input}
              value={formData.tags}
              onChangeText={(t) => setFormData({ ...formData, tags: t })}
              placeholder="react, typescript, web"
              placeholderTextColor="#737373"
            />

            <Text style={styles.label}>Category</Text>
            <TextInput
              style={styles.input}
              value={formData.category}
              onChangeText={(t) => setFormData({ ...formData, category: t })}
              placeholder="web, mobile, api"
              placeholderTextColor="#737373"
            />

            <Text style={styles.label}>GitHub URL</Text>
            <TextInput
              style={styles.input}
              value={formData.github_url}
              onChangeText={(t) => setFormData({ ...formData, github_url: t })}
              placeholder="https://github.com/user/repo"
              placeholderTextColor="#737373"
              autoCapitalize="none"
              keyboardType="url"
            />

            <Text style={styles.label}>Demo URL</Text>
            <TextInput
              style={styles.input}
              value={formData.demo_url}
              onChangeText={(t) => setFormData({ ...formData, demo_url: t })}
              placeholder="https://example.com"
              placeholderTextColor="#737373"
              autoCapitalize="none"
              keyboardType="url"
            />

            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Featured</Text>
              <Switch
                value={formData.featured}
                onValueChange={(v) => setFormData({ ...formData, featured: v })}
                trackColor={{ false: '#333333', true: '#a78bfa' }}
                thumbColor={formData.featured ? '#ffffff' : '#737373'}
              />
            </View>

            <View style={{ height: 50 }} />
          </ScrollView>
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
  addText: { color: '#22c55e', fontSize: 14 },
  disabled: { opacity: 0.5 },
  searchContainer: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#333333' },
  searchInput: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333333',
    padding: 12,
    color: '#e5e5e5',
    fontSize: 14,
  },
  list: { padding: 16 },
  card: {
    backgroundColor: '#141414',
    borderWidth: 1,
    borderColor: '#333333',
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  cardTitle: { fontSize: 16, fontWeight: '600', color: '#e5e5e5', flex: 1, marginRight: 8 },
  badges: { flexDirection: 'row' },
  badge: { paddingHorizontal: 6, paddingVertical: 2, marginLeft: 4 },
  featuredBadge: { backgroundColor: '#a78bfa', paddingHorizontal: 6, paddingVertical: 2 },
  badgeText: { color: '#ffffff', fontSize: 10, fontWeight: '600' },
  description: { fontSize: 14, color: '#737373', marginTop: 8 },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#333333',
  },
  actionText: { color: '#a78bfa', fontSize: 14, marginLeft: 16 },
  deleteText: { color: '#dc2626' },
  emptyText: { color: '#737373', textAlign: 'center', marginTop: 32 },
  modalContainer: { flex: 1, backgroundColor: '#0a0a0a' },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#e5e5e5' },
  form: { padding: 16 },
  label: { fontSize: 14, color: '#e5e5e5', marginBottom: 4, marginTop: 16 },
  input: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333333',
    padding: 12,
    color: '#e5e5e5',
    fontSize: 14,
  },
  multiline: { minHeight: 100, textAlignVertical: 'top' },
  statusRow: { flexDirection: 'row', flexWrap: 'wrap' },
  statusButton: {
    borderWidth: 1,
    borderColor: '#333333',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    marginTop: 8,
  },
  statusText: { color: '#737373', fontSize: 12 },
  statusTextActive: { color: '#ffffff', fontWeight: '600' },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    paddingVertical: 8,
  },
  switchLabel: { fontSize: 14, color: '#e5e5e5' },
});

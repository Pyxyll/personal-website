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
import { postsApi } from '../api';
import { BlogPost } from '../types';

const emptyPost = {
  title: '',
  slug: '',
  description: '',
  content: '',
  tags: '',
  featured: false,
  published: false,
};

export default function PostsScreen() {
  const navigation = useNavigation();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [showEditor, setShowEditor] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [formData, setFormData] = useState(emptyPost);
  const [saving, setSaving] = useState(false);

  const fetchPosts = useCallback(async () => {
    try {
      const data = await postsApi.adminGetAll({ search: search || undefined });
      setPosts(data);
    } catch {
      Alert.alert('Error', 'Failed to load posts');
    } finally {
      setIsLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPosts();
    setRefreshing(false);
  };

  const openCreate = () => {
    setEditingPost(null);
    setFormData(emptyPost);
    setShowEditor(true);
  };

  const openEdit = (post: BlogPost) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      slug: post.slug,
      description: post.description,
      content: post.content,
      tags: post.tags.join(', '),
      featured: post.featured,
      published: post.published,
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
      // Only set published_at when newly publishing (not already published)
      const shouldSetPublishDate = formData.published && (!editingPost || !editingPost.published_at);

      const data = {
        title: formData.title,
        slug: formData.slug || formData.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        description: formData.description,
        content: formData.content,
        tags: formData.tags.split(',').map((t) => t.trim()).filter(Boolean),
        featured: formData.featured,
        published: formData.published,
        published_at: shouldSetPublishDate ? new Date().toISOString() : (formData.published ? editingPost?.published_at : null),
      };

      if (editingPost) {
        await postsApi.update(editingPost.id, data);
      } else {
        await postsApi.create(data);
      }

      setShowEditor(false);
      fetchPosts();
      Alert.alert('Success', editingPost ? 'Post updated' : 'Post created');
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (post: BlogPost) => {
    Alert.alert('Delete Post', `Delete "${post.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await postsApi.delete(post.id);
            setPosts(posts.filter((p) => p.id !== post.id));
          } catch {
            Alert.alert('Error', 'Failed to delete');
          }
        },
      },
    ]);
  };

  const renderPost = ({ item }: { item: BlogPost }) => (
    <TouchableOpacity style={styles.card} onPress={() => openEdit(item)}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
        <View style={styles.badges}>
          {item.featured ? <View style={styles.featuredBadge}><Text style={styles.badgeText}>Featured</Text></View> : null}
          <View style={[styles.badge, item.published ? styles.published : styles.draft]}>
            <Text style={styles.badgeText}>{item.published ? 'Published' : 'Draft'}</Text>
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
        <Text style={styles.title}>// Posts</Text>
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
          onSubmitEditing={fetchPosts}
        />
      </View>

      <FlatList
        data={posts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderPost}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#a78bfa" />}
        ListEmptyComponent={<Text style={styles.emptyText}>{isLoading ? 'Loading...' : 'No posts'}</Text>}
      />

      <Modal visible={showEditor} animationType="slide" onRequestClose={() => setShowEditor(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowEditor(false)}>
              <Text style={styles.backText}>[Cancel]</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{editingPost ? 'Edit Post' : 'New Post'}</Text>
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
              placeholder="Post title"
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
              placeholder="Brief description"
              placeholderTextColor="#737373"
              multiline={true}
              numberOfLines={3}
            />

            <Text style={styles.label}>Content</Text>
            <TextInput
              style={[styles.input, styles.contentInput]}
              value={formData.content}
              onChangeText={(t) => setFormData({ ...formData, content: t })}
              placeholder="Write your post content here (Markdown supported)"
              placeholderTextColor="#737373"
              multiline={true}
              numberOfLines={10}
            />

            <Text style={styles.label}>Tags (comma separated)</Text>
            <TextInput
              style={styles.input}
              value={formData.tags}
              onChangeText={(t) => setFormData({ ...formData, tags: t })}
              placeholder="react, typescript, web"
              placeholderTextColor="#737373"
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

            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Published</Text>
              <Switch
                value={formData.published}
                onValueChange={(v) => setFormData({ ...formData, published: v })}
                trackColor={{ false: '#333333', true: '#22c55e' }}
                thumbColor={formData.published ? '#ffffff' : '#737373'}
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
  published: { backgroundColor: '#22c55e' },
  draft: { backgroundColor: '#737373' },
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
  multiline: { minHeight: 80, textAlignVertical: 'top' },
  contentInput: { minHeight: 200, textAlignVertical: 'top' },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    paddingVertical: 8,
  },
  switchLabel: { fontSize: 14, color: '#e5e5e5' },
});

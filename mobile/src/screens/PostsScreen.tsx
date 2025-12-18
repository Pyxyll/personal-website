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
import { postsApi, imagesApi } from '../api';
import { BlogPost } from '../types';
import { colors, spacing, typography } from '../theme';
import { FadeIn, AnimatedCard } from '../components/Animated';
import { Badge, Divider, EmptyState } from '../components/UI';
import ImagePickerField from '../components/ImagePickerField';
import * as ImagePicker from 'expo-image-picker';

const emptyPost = {
  title: '',
  slug: '',
  description: '',
  content: '',
  tags: '',
  featured_image: null as string | null,
  featured_image_alt: '',
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
  const [searchFocused, setSearchFocused] = useState(false);
  const [insertingImage, setInsertingImage] = useState(false);

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
      featured_image: post.featured_image,
      featured_image_alt: post.featured_image_alt || '',
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
      const shouldSetPublishDate = formData.published && (!editingPost || !editingPost.published_at);

      const data = {
        title: formData.title,
        slug: formData.slug || formData.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        description: formData.description,
        content: formData.content,
        tags: formData.tags.split(',').map((t) => t.trim()).filter(Boolean),
        featured_image: formData.featured_image,
        featured_image_alt: formData.featured_image_alt || null,
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

  const insertContentImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please allow access to your photo library.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setInsertingImage(true);
      try {
        const response = await imagesApi.upload(result.assets[0].uri, 'content');
        const markdown = `\n![](${response.url})\n`;
        setFormData((prev) => ({
          ...prev,
          content: prev.content + markdown,
        }));
      } catch (error) {
        Alert.alert('Upload Failed', 'Failed to upload image. Please try again.');
      } finally {
        setInsertingImage(false);
      }
    }
  };

  const renderPost = ({ item, index }: { item: BlogPost; index: number }) => (
    <FadeIn delay={index * 50}>
      <AnimatedCard style={styles.card} onPress={() => openEdit(item)}>
        <View style={styles.cardContent}>
          <View style={styles.cardIcon}>
            <Text style={styles.cardIconText}>{'>_'}</Text>
          </View>
          <View style={styles.cardBody}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
            </View>
            <View style={styles.badgeRow}>
              {item.featured && <Badge variant="accent">featured</Badge>}
              <Badge variant={item.published ? 'success' : 'outline'}>
                {item.published ? 'published' : 'draft'}
              </Badge>
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

      {/* Header */}
      <FadeIn>
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
            <Text style={styles.backText}>{'<'} back</Text>
          </Pressable>
          <Text style={styles.title}>// posts</Text>
          <Pressable onPress={openCreate} hitSlop={8}>
            <Text style={styles.addText}>[+ new]</Text>
          </Pressable>
        </View>
      </FadeIn>

      {/* Search */}
      <FadeIn delay={50}>
        <View style={styles.searchContainer}>
          <View style={[styles.searchInputContainer, searchFocused && styles.searchInputFocused]}>
            <Text style={styles.searchPrefix}>$</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="search posts..."
              placeholderTextColor={colors.textDisabled}
              value={search}
              onChangeText={setSearch}
              onSubmitEditing={fetchPosts}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
            />
            {searchFocused && (
              <Animated.Text style={[styles.cursor, { opacity: cursorOpacity }]}>_</Animated.Text>
            )}
          </View>
        </View>
      </FadeIn>

      {/* List */}
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderPost}
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
              icon=">_"
              title={isLoading ? 'loading...' : 'no posts found'}
              description={isLoading ? undefined : 'Create your first post to get started'}
            />
          </FadeIn>
        }
        showsVerticalScrollIndicator={false}
      />

      {/* Editor Modal */}
      <Modal visible={showEditor} animationType="slide" onRequestClose={() => setShowEditor(false)}>
        <View style={styles.modalContainer}>
          <StatusBar style="light" />

          <View style={styles.modalHeader}>
            <Pressable onPress={() => setShowEditor(false)} hitSlop={8}>
              <Text style={styles.backText}>[cancel]</Text>
            </Pressable>
            <Text style={styles.modalTitle}>
              // {editingPost ? 'edit_post' : 'new_post'}
            </Text>
            <Pressable onPress={handleSave} disabled={saving} hitSlop={8}>
              <Text style={[styles.saveText, saving && styles.disabled]}>
                {saving ? 'saving...' : '[save]'}
              </Text>
            </Pressable>
          </View>

          <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>
                <Text style={styles.labelAccent}>$</Text> title <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                value={formData.title}
                onChangeText={(t) => setFormData({ ...formData, title: t })}
                placeholder="Post title"
                placeholderTextColor={colors.textDisabled}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>
                <Text style={styles.labelAccent}>$</Text> slug
              </Text>
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
              <Text style={styles.label}>
                <Text style={styles.labelAccent}>$</Text> description
              </Text>
              <TextInput
                style={[styles.input, styles.multiline]}
                value={formData.description}
                onChangeText={(t) => setFormData({ ...formData, description: t })}
                placeholder="Brief description"
                placeholderTextColor={colors.textDisabled}
                multiline
                numberOfLines={3}
              />
            </View>

            <ImagePickerField
              value={formData.featured_image}
              onChange={(url) => setFormData({ ...formData, featured_image: url })}
              label="$ featured_image"
              type="featured"
            />

            {formData.featured_image && (
              <View style={styles.formGroup}>
                <Text style={styles.label}>
                  <Text style={styles.labelAccent}>$</Text> image_alt_text
                </Text>
                <TextInput
                  style={styles.input}
                  value={formData.featured_image_alt}
                  onChangeText={(t) => setFormData({ ...formData, featured_image_alt: t })}
                  placeholder="Describe the image for accessibility"
                  placeholderTextColor={colors.textDisabled}
                />
              </View>
            )}

            <View style={styles.formGroup}>
              <View style={styles.contentHeader}>
                <Text style={[styles.label, { marginBottom: 0 }]}>
                  <Text style={styles.labelAccent}>$</Text> content
                </Text>
                <Pressable
                  style={styles.insertImageButton}
                  onPress={insertContentImage}
                  disabled={insertingImage}
                >
                  <Text style={[styles.insertImageText, insertingImage && styles.disabled]}>
                    {insertingImage ? 'uploading...' : '[+ image]'}
                  </Text>
                </Pressable>
              </View>
              <TextInput
                style={[styles.input, styles.contentInput]}
                value={formData.content}
                onChangeText={(t) => setFormData({ ...formData, content: t })}
                placeholder="Write your post content (Markdown supported)"
                placeholderTextColor={colors.textDisabled}
                multiline
                numberOfLines={10}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>
                <Text style={styles.labelAccent}>$</Text> tags
              </Text>
              <TextInput
                style={styles.input}
                value={formData.tags}
                onChangeText={(t) => setFormData({ ...formData, tags: t })}
                placeholder="react, typescript, web"
                placeholderTextColor={colors.textDisabled}
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

              <Divider />

              <View style={styles.switchRow}>
                <View>
                  <Text style={styles.switchLabel}>Published</Text>
                  <Text style={styles.switchDescription}>Make visible to public</Text>
                </View>
                <Switch
                  value={formData.published}
                  onValueChange={(v) => setFormData({ ...formData, published: v })}
                  trackColor={{ false: colors.border, true: colors.success }}
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
  addText: {
    color: colors.success,
    fontSize: typography.base,
  },
  disabled: {
    opacity: 0.5,
  },

  // Search
  searchContainer: {
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
  },
  searchInputFocused: {
    borderColor: colors.accent,
  },
  searchPrefix: {
    color: colors.accent,
    fontSize: typography.base,
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: spacing.md,
    color: colors.text,
    fontSize: typography.base,
  },
  cursor: {
    color: colors.accent,
    fontSize: typography.base,
  },

  // List
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
  cardIcon: {
    width: 48,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: colors.border,
  },
  cardIconText: {
    color: colors.accent,
    fontSize: typography.base,
    fontWeight: typography.bold,
  },
  cardBody: {
    flex: 1,
    padding: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardTitle: {
    fontSize: typography.md,
    fontWeight: typography.semibold,
    color: colors.text,
    flex: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  description: {
    fontSize: typography.sm,
    color: colors.textMuted,
    marginTop: spacing.sm,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.lg,
  },
  actionText: {
    color: colors.text,
    fontSize: typography.sm,
  },
  deleteText: {
    color: colors.destructive,
    fontSize: typography.sm,
  },

  // Modal
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
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
  modalTitle: {
    fontSize: typography.lg,
    fontWeight: typography.bold,
    color: colors.accent,
  },
  saveText: {
    color: colors.success,
    fontSize: typography.base,
  },

  // Form
  form: {
    padding: spacing.lg,
  },
  formGroup: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  labelAccent: {
    color: colors.accent,
  },
  required: {
    color: colors.destructive,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    color: colors.text,
    fontSize: typography.base,
  },
  multiline: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  contentInput: {
    minHeight: 200,
    textAlignVertical: 'top',
  },
  switchContainer: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginTop: spacing.md,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  switchLabel: {
    fontSize: typography.base,
    color: colors.text,
  },
  switchDescription: {
    fontSize: typography.sm,
    color: colors.textMuted,
    marginTop: 2,
  },

  // Content header with insert image button
  contentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  insertImageButton: {
    padding: spacing.xs,
  },
  insertImageText: {
    color: colors.accent,
    fontSize: typography.sm,
  },
});

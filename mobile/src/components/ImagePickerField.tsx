import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { colors, spacing, typography } from '../theme';
import { imagesApi } from '../api';

interface ImagePickerFieldProps {
  value: string | null;
  onChange: (url: string | null) => void;
  label?: string;
  type?: 'featured' | 'content';
}

export default function ImagePickerField({
  value,
  onChange,
  label = 'Image',
  type = 'featured',
}: ImagePickerFieldProps) {
  const [uploading, setUploading] = useState(false);
  const [localUri, setLocalUri] = useState<string | null>(null);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Please allow access to your photo library to upload images.'
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: type === 'featured' ? [1, 1] : undefined,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      await uploadImage(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Please allow camera access to take photos.'
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: type === 'featured' ? [1, 1] : undefined,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      await uploadImage(result.assets[0].uri);
    }
  };

  const uploadImage = async (uri: string) => {
    setUploading(true);
    setLocalUri(uri);

    try {
      const response = await imagesApi.upload(uri, type);
      onChange(response.url);
      setLocalUri(null);
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert('Upload Failed', 'Failed to upload image. Please try again.');
      setLocalUri(null);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = () => {
    Alert.alert('Remove Image', 'Are you sure you want to remove this image?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => {
          onChange(null);
          setLocalUri(null);
        },
      },
    ]);
  };

  const showOptions = () => {
    Alert.alert('Select Image', 'Choose an option', [
      { text: 'Take Photo', onPress: takePhoto },
      { text: 'Choose from Library', onPress: pickImage },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const displayUri = localUri || value;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>

      {displayUri ? (
        <View style={styles.previewContainer}>
          <Image
            source={{ uri: displayUri }}
            style={[
              styles.preview,
              type === 'featured' && styles.previewSquare,
            ]}
            resizeMode="cover"
          />
          {uploading && (
            <View style={styles.uploadingOverlay}>
              <ActivityIndicator size="large" color={colors.accent} />
              <Text style={styles.uploadingText}>Uploading...</Text>
            </View>
          )}
          {!uploading && (
            <View style={styles.actions}>
              <Pressable style={styles.actionButton} onPress={showOptions}>
                <Text style={styles.actionText}>[change]</Text>
              </Pressable>
              <Pressable style={styles.actionButton} onPress={removeImage}>
                <Text style={[styles.actionText, styles.removeText]}>
                  [remove]
                </Text>
              </Pressable>
            </View>
          )}
        </View>
      ) : (
        <Pressable style={styles.uploadButton} onPress={showOptions}>
          <Text style={styles.uploadIcon}>+</Text>
          <Text style={styles.uploadText}>
            {type === 'featured' ? 'Add Featured Image' : 'Add Image'}
          </Text>
          <Text style={styles.uploadHint}>
            {type === 'featured' ? '500x500 square crop' : 'Max 1200px width'}
          </Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: typography.sm,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  previewContainer: {
    position: 'relative',
  },
  preview: {
    width: '100%',
    height: 200,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  previewSquare: {
    height: 200,
    aspectRatio: 1,
    alignSelf: 'center',
  },
  uploadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadingText: {
    color: colors.text,
    fontSize: typography.sm,
    marginTop: spacing.sm,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.lg,
    marginTop: spacing.sm,
  },
  actionButton: {
    padding: spacing.sm,
  },
  actionText: {
    color: colors.textMuted,
    fontSize: typography.sm,
  },
  removeText: {
    color: colors.error,
  },
  uploadButton: {
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    backgroundColor: colors.surface,
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadIcon: {
    fontSize: typography.xxxl,
    color: colors.accent,
    marginBottom: spacing.sm,
  },
  uploadText: {
    fontSize: typography.base,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  uploadHint: {
    fontSize: typography.xs,
    color: colors.textMuted,
  },
});

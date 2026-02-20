import * as FileSystem from 'expo-file-system/legacy'
import * as ImagePicker from 'expo-image-picker'
import * as ImageManipulator from 'expo-image-manipulator'
import { generateId, nowISO } from '../utils/helpers'
import { ProjectPhoto } from '../types'

// ─── Constants ────────────────────────────────────────────────────────────────

const MAX_FILE_SIZE_BYTES = 1 * 1024 * 1024 // 1 MB
const MAX_DIMENSION = 1920

// ─── savePhoto ────────────────────────────────────────────────────────────────

/**
 * Save and compress a photo to Expo FileSystem app documents.
 * Compresses to max 1920x1920, quality 0.8. If result still > 1MB,
 * retries with quality 0.6, then 0.4.
 */
export async function savePhoto(
  uri: string,
  projectId: string,
  type: 'reference' | 'progress'
): Promise<ProjectPhoto> {
  const id = generateId()
  const dir = `${FileSystem.documentDirectory}photos/${projectId}/`
  const savedUri = `${dir}${id}.jpg`

  await FileSystem.makeDirectoryAsync(dir, { intermediates: true })

  const qualities = [0.8, 0.6, 0.4]

  for (let i = 0; i < qualities.length; i++) {
    const quality = qualities[i]
    const isLast = i === qualities.length - 1

    const result = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: MAX_DIMENSION, height: MAX_DIMENSION } }],
      { compress: quality, format: ImageManipulator.SaveFormat.JPEG }
    )

    await FileSystem.copyAsync({ from: result.uri, to: savedUri })

    const info = await FileSystem.getInfoAsync(savedUri)
    const fileSize = info.exists ? info.size : 0

    if (fileSize <= MAX_FILE_SIZE_BYTES || isLast) {
      return {
        id,
        uri: savedUri,
        type,
        isCover: false,
        fileSize,
        createdAt: nowISO(),
      }
    }
  }

  // Fallback: should not reach here
  const info = await FileSystem.getInfoAsync(savedUri)
  const fileSize = info.exists ? info.size : 0

  return {
    id,
    uri: savedUri,
    type,
    isCover: false,
    fileSize,
    createdAt: nowISO(),
  }
}

// ─── deletePhoto ──────────────────────────────────────────────────────────────

/**
 * Delete a photo file from FileSystem.
 */
export async function deletePhoto(photo: ProjectPhoto): Promise<void> {
  await FileSystem.deleteAsync(photo.uri, { idempotent: true })
}

// ─── deleteProjectPhotos ──────────────────────────────────────────────────────

/**
 * Delete all photos for a project (used when deleting a project).
 */
export async function deleteProjectPhotos(projectId: string): Promise<void> {
  const dir = `${FileSystem.documentDirectory}photos/${projectId}/`
  await FileSystem.deleteAsync(dir, { idempotent: true })
}

// ─── getTotalPhotoSize ────────────────────────────────────────────────────────

/**
 * Calculate total size of a photos array in bytes.
 */
export function getTotalPhotoSize(photos: ProjectPhoto[]): number {
  return photos.reduce((total, photo) => total + photo.fileSize, 0)
}

// ─── formatPhotoSize ──────────────────────────────────────────────────────────

/**
 * Format bytes to human-readable string (e.g. "2.4 MB").
 */
export function formatPhotoSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

// ─── pickPhotoFromLibrary ─────────────────────────────────────────────────────

/**
 * Pick a photo from device library using expo-image-picker.
 * Returns local URI string or null if cancelled or permission denied.
 */
export async function pickPhotoFromLibrary(): Promise<string | null> {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
  if (status !== 'granted') {
    return null
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    quality: 1,
  })

  if (result.canceled || !result.assets || result.assets.length === 0) {
    return null
  }

  return result.assets[0].uri
}

// ─── takePhoto ────────────────────────────────────────────────────────────────

/**
 * Take a photo using camera via expo-image-picker.
 * Returns local URI string or null if cancelled or permission denied.
 */
export async function takePhoto(): Promise<string | null> {
  const { status } = await ImagePicker.requestCameraPermissionsAsync()
  if (status !== 'granted') {
    return null
  }

  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    quality: 1,
  })

  if (result.canceled || !result.assets || result.assets.length === 0) {
    return null
  }

  return result.assets[0].uri
}

import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { useTranslation } from 'react-i18next'
import { ProjectPhoto } from '../types'

// ─── Props ────────────────────────────────────────────────────────────────────

interface PhotoGalleryProps {
  photos: ProjectPhoto[]
  onAdd: () => void
  onDelete: (photo: ProjectPhoto) => void
  onSetCover: (photo: ProjectPhoto) => void
  onPhotoPress?: (photo: ProjectPhoto) => void
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function PhotoGallery({
  photos,
  onAdd,
  onDelete,
  onSetCover,
  onPhotoPress,
}: PhotoGalleryProps) {
  const { t } = useTranslation()

  function handleLongPress(photo: ProjectPhoto) {
    const options: Array<{ text: string; style?: 'destructive' | 'cancel' | 'default'; onPress?: () => void }> = []

    if (!photo.isCover) {
      options.push({
        text: t('photoGallery.setCover'),
        onPress: () => onSetCover(photo),
      })
    }

    options.push({
      text: t('common.delete'),
      style: 'destructive',
      onPress: () => onDelete(photo),
    })

    options.push({
      text: t('common.cancel'),
      style: 'cancel',
    })

    Alert.alert(t('photoGallery.optionsTitle'), undefined, options, { cancelable: true })
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      {photos.map((photo) => (
        <TouchableOpacity
          key={photo.id}
          style={styles.thumbnail}
          onPress={() => onPhotoPress?.(photo)}
          onLongPress={() => handleLongPress(photo)}
          delayLongPress={400}
          activeOpacity={0.85}
        >
          <Image source={{ uri: photo.uri }} style={styles.image} resizeMode="cover" />

          {/* Cover indicator */}
          {photo.isCover && (
            <View style={styles.coverBadge}>
              <Text style={styles.coverBadgeText}>★</Text>
            </View>
          )}

        </TouchableOpacity>
      ))}

      {/* Add button */}
      <TouchableOpacity style={styles.addButton} onPress={onAdd} activeOpacity={0.7}>
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>
    </ScrollView>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const THUMBNAIL_SIZE = 80

const styles = StyleSheet.create({
  scrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
    paddingVertical: 4,
    gap: 8,
  },
  thumbnail: {
    width: THUMBNAIL_SIZE,
    height: THUMBNAIL_SIZE,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    width: THUMBNAIL_SIZE,
    height: THUMBNAIL_SIZE,
  },
  coverBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    borderRadius: 4,
    paddingHorizontal: 3,
    paddingVertical: 1,
  },
  coverBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  addButton: {
    width: THUMBNAIL_SIZE,
    height: THUMBNAIL_SIZE,
    borderRadius: 8,
    backgroundColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    fontSize: 28,
    color: '#9ca3af',
    fontWeight: '300',
    lineHeight: 32,
  },
})

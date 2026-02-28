import { useRef, useState } from 'react'
import {
  Dimensions,
  FlatList,
  Image,
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { ProjectPhoto } from '../types'

// ─── Props ────────────────────────────────────────────────────────────────────

interface PhotoViewerProps {
  photos: ProjectPhoto[]
  initialIndex: number
  visible: boolean
  onClose: () => void
}

// ─── Component ────────────────────────────────────────────────────────────────

const { width: screenWidth, height: screenHeight } = Dimensions.get('screen')

export default function PhotoViewer({ photos, initialIndex, visible, onClose }: PhotoViewerProps) {
  const clampedInitial = photos.length > 0
    ? Math.max(0, Math.min(initialIndex, photos.length - 1))
    : 0
  const [currentIndex, setCurrentIndex] = useState(clampedInitial)
  const flatListRef = useRef<FlatList<ProjectPhoto>>(null)

  // Guard: no photos
  if (photos.length === 0) {
    return null
  }

  const currentPhoto = photos[currentIndex]

  const handleMomentumScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = e.nativeEvent.contentOffset.x
    const index = Math.round(offsetX / screenWidth)
    setCurrentIndex(Math.max(0, Math.min(index, photos.length - 1)))
  }

  const getItemLayout = (_: ArrayLike<ProjectPhoto> | null | undefined, index: number) => ({
    length: screenWidth,
    offset: screenWidth * index,
    index,
  })

  const renderItem = ({ item }: { item: ProjectPhoto }) => (
    <ScrollView
      style={{ width: screenWidth }}
      maximumZoomScale={4}
      minimumZoomScale={1}
      showsHorizontalScrollIndicator={false}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
      centerContent={true}
      bouncesZoom={true}
    >
      <Image
        source={{ uri: item.uri }}
        style={styles.image}
        resizeMode="contain"
      />
    </ScrollView>
  )

  return (
    <Modal
      visible={visible}
      animationType="fade"
      presentationStyle="fullScreen"
      statusBarTranslucent={true}
      onRequestClose={onClose}
    >
      <StatusBar hidden />
      <View style={styles.container}>
        {/* Horizontal paging FlatList */}
        <FlatList
          ref={flatListRef}
          data={photos}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          initialScrollIndex={clampedInitial}
          getItemLayout={getItemLayout}
          onMomentumScrollEnd={handleMomentumScrollEnd}
        />

        {/* Close button */}
        <TouchableOpacity
          style={styles.closeButton}
          onPress={onClose}
          activeOpacity={0.8}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>

        {/* Bottom overlay: type badge + page indicator stacked at bottom-center */}
        <View style={styles.bottomOverlay}>
          {(currentPhoto.type === 'reference' || currentPhoto.type === 'progress') && (
            <View style={styles.typeBadge}>
              <Text style={styles.typeBadgeText}>
                {currentPhoto.type === 'reference' ? '參考圖' : '進度記錄'}
              </Text>
            </View>
          )}

          {/* Page indicator — only when multiple photos (R11.6) */}
          {photos.length > 1 && (
            <View style={styles.pageIndicator}>
              <Text style={styles.pageIndicatorText}>
                {currentIndex + 1} / {photos.length}
              </Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  scrollContent: {
    width: screenWidth,
    height: screenHeight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: screenWidth,
    height: screenHeight,
  },
  closeButton: {
    position: 'absolute',
    top: 48,
    right: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 22,
  },
  bottomOverlay: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
    gap: 8,
  },
  typeBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  typeBadgeText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '500',
  },
  pageIndicator: {
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  pageIndicatorText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
})

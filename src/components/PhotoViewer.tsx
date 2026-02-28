import { useRef, useState } from 'react'
import {
  Dimensions,
  FlatList,
  Image,
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
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
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const flatListRef = useRef<FlatList<ProjectPhoto>>(null)

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / screenWidth)
    setCurrentIndex(index)
  }

  const currentPhoto = photos[currentIndex]

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
        {/* Horizontally swipeable photo list */}
        <FlatList
          ref={flatListRef}
          data={photos}
          keyExtractor={(item) => item.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          initialScrollIndex={initialIndex}
          getItemLayout={(_, index) => ({
            length: screenWidth,
            offset: screenWidth * index,
            index,
          })}
          onMomentumScrollEnd={handleScroll}
          renderItem={({ item }) => (
            <View style={styles.page}>
              <Image
                source={{ uri: item.uri }}
                style={styles.image}
                resizeMode="contain"
              />
            </View>
          )}
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

        {/* Photo type badge */}
        {currentPhoto?.type === 'reference' && (
          <View style={styles.typeBadge}>
            <Text style={styles.typeBadgeText}>參考圖</Text>
          </View>
        )}
        {currentPhoto?.type === 'progress' && (
          <View style={styles.typeBadge}>
            <Text style={styles.typeBadgeText}>進度記錄</Text>
          </View>
        )}

        {/* Page indicator (only shown when there are multiple photos) */}
        {photos.length > 1 && (
          <View style={styles.pageIndicator}>
            <Text style={styles.pageIndicatorText}>
              {currentIndex + 1} / {photos.length}
            </Text>
          </View>
        )}
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
  page: {
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
  typeBadge: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
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
    position: 'absolute',
    top: 56,
    alignSelf: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  pageIndicatorText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '500',
  },
})

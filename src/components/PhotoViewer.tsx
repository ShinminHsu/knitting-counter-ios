import { type Ref, useEffect, useImperativeHandle, useRef, useState } from 'react'
import {
  Dimensions,
  FlatList,
  GestureResponderEvent,
  Image,
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { ProjectPhoto } from '../types'
import { resolvePhotoUri } from '../services/photoService'

// ─── Props ────────────────────────────────────────────────────────────────────

interface PhotoViewerProps {
  photos: ProjectPhoto[]
  initialIndex: number
  visible: boolean
  onClose: () => void
}

// ─── Component ────────────────────────────────────────────────────────────────

const { width: screenWidth, height: screenHeight } = Dimensions.get('screen')

const MAX_ZOOM_SCALE = 4
const DOUBLE_TAP_ZOOM_SCALE = 2.5
const DOUBLE_TAP_DELAY_MS = 300
/** zoomScale 超過此值才視為已放大，避免停在 1 倍時的浮點誤差 */
const ZOOMED_THRESHOLD = 1.01
const FULL_RECT = { x: 0, y: 0, width: screenWidth, height: screenHeight }

type ZoomRect = typeof FULL_RECT

// ─── ZoomablePhoto ────────────────────────────────────────────────────────────

interface ZoomablePhotoHandle {
  resetZoom: () => void
}

interface ZoomablePhotoProps {
  uri: string
  isActive: boolean
  onZoomChange: (zoomed: boolean) => void
  ref?: Ref<ZoomablePhotoHandle>
}

/** 單張照片：iOS 原生 ScrollView 縮放（雙指 1–4 倍、雙擊 1 ↔ 2.5 倍） */
function ZoomablePhoto({ uri, isActive, onZoomChange, ref }: ZoomablePhotoProps) {
  const scrollRef = useRef<ScrollView>(null)
  const zoomedRef = useRef(false)
  const lastTapRef = useRef(0)

  // RN 0.81 的 zoomToRect 只讀第二個參數決定是否動畫，rect 內的 animated 僅用來避免 deprecation warning
  const zoomTo = (rect: ZoomRect, animated: boolean) => {
    scrollRef.current?.scrollResponderZoomTo({ ...rect, animated }, animated)
  }

  const resetZoom = () => {
    zoomTo(FULL_RECT, false)
    zoomedRef.current = false
  }

  useImperativeHandle(ref, () => ({ resetZoom }))

  // Fabric 會回收原生 ScrollView 且不重設 zoomScale，掛載時先確保是 1 倍
  useEffect(() => {
    resetZoom()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const zoomed = (e.nativeEvent.zoomScale ?? 1) > ZOOMED_THRESHOLD
    if (zoomed !== zoomedRef.current) {
      zoomedRef.current = zoomed
      onZoomChange(zoomed)
    }
  }

  const handlePress = (e: GestureResponderEvent) => {
    const now = Date.now()
    if (now - lastTapRef.current > DOUBLE_TAP_DELAY_MS) {
      lastTapRef.current = now
      return
    }
    lastTapRef.current = 0

    if (zoomedRef.current) {
      zoomTo(FULL_RECT, true)
      return
    }
    // locationX/Y 為未縮放的內容座標，UIScrollView 會自動把 rect 限制在內容範圍內
    const { locationX, locationY } = e.nativeEvent
    const width = screenWidth / DOUBLE_TAP_ZOOM_SCALE
    const height = screenHeight / DOUBLE_TAP_ZOOM_SCALE
    zoomTo({ x: locationX - width / 2, y: locationY - height / 2, width, height }, true)
  }

  // 換到其他張時，把這張恢復成 1 倍
  useEffect(() => {
    if (!isActive && zoomedRef.current) {
      resetZoom()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive])

  return (
    <ScrollView
      ref={scrollRef}
      style={styles.zoomContainer}
      contentContainerStyle={styles.page}
      minimumZoomScale={1}
      maximumZoomScale={MAX_ZOOM_SCALE}
      centerContent
      bouncesZoom
      showsHorizontalScrollIndicator={false}
      showsVerticalScrollIndicator={false}
      scrollEventThrottle={16}
      onScroll={handleScroll}
    >
      <Pressable onPress={handlePress}>
        <Image source={{ uri }} style={styles.image} resizeMode="contain" />
      </Pressable>
    </ScrollView>
  )
}

// ─── PhotoViewer ──────────────────────────────────────────────────────────────

export default function PhotoViewer({ photos, initialIndex, visible, onClose }: PhotoViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  // 目前這張放大中時停用左右換張，拖曳只會平移照片
  const [isZoomed, setIsZoomed] = useState(false)
  const flatListRef = useRef<FlatList<ProjectPhoto>>(null)
  const activePhotoRef = useRef<ZoomablePhotoHandle>(null)

  // 關閉前先把目前這張恢復 1 倍：Fabric 回收原生 ScrollView 時不會重設 zoomScale
  const handleClose = () => {
    activePhotoRef.current?.resetZoom()
    onClose()
  }

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / screenWidth)
    if (index !== currentIndex) {
      setCurrentIndex(index)
      setIsZoomed(false)
    }
  }

  const currentPhoto = photos[currentIndex]

  return (
    <Modal
      visible={visible}
      animationType="fade"
      presentationStyle="fullScreen"
      statusBarTranslucent={true}
      onRequestClose={handleClose}
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
          scrollEnabled={!isZoomed}
          extraData={currentIndex}
          renderItem={({ item, index }) => (
            <ZoomablePhoto
              ref={index === currentIndex ? activePhotoRef : undefined}
              uri={resolvePhotoUri(item.uri)}
              isActive={index === currentIndex}
              onZoomChange={(zoomed) => {
                if (index === currentIndex) setIsZoomed(zoomed)
              }}
            />
          )}
        />

        {/* Close button */}
        <TouchableOpacity
          style={styles.closeButton}
          onPress={handleClose}
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
  zoomContainer: {
    width: screenWidth,
    height: screenHeight,
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
    bottom: 80,
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

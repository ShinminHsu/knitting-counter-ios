import { useRef, useState } from 'react'
import {
  Dimensions,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'

// ─── Slide Definitions ────────────────────────────────────────────────────────

interface CarouselSlide {
  iconName: keyof typeof Ionicons.glyphMap
  titleKey: string
  descriptionKey: string
}

const SLIDES: CarouselSlide[] = [
  {
    iconName: 'heart-outline',
    titleKey: 'onboarding.slide1Title',
    descriptionKey: 'onboarding.slide1Desc',
  },
  {
    iconName: 'folder-open-outline',
    titleKey: 'onboarding.slide2Title',
    descriptionKey: 'onboarding.slide2Desc',
  },
  {
    iconName: 'grid-outline',
    titleKey: 'onboarding.slide3Title',
    descriptionKey: 'onboarding.slide3Desc',
  },
  {
    iconName: 'radio-button-on-outline',
    titleKey: 'onboarding.slide4Title',
    descriptionKey: 'onboarding.slide4Desc',
  },
  {
    iconName: 'sparkles-outline',
    titleKey: 'onboarding.slide5Title',
    descriptionKey: 'onboarding.slide5Desc',
  },
]

const { width: SCREEN_WIDTH } = Dimensions.get('window')

// ─── Props ────────────────────────────────────────────────────────────────────

interface OnboardingCarouselProps {
  visible: boolean
  onDismiss: () => void
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function OnboardingCarousel({ visible, onDismiss }: OnboardingCarouselProps) {
  const { t } = useTranslation()
  const [currentIndex, setCurrentIndex] = useState(0)
  const flatListRef = useRef<FlatList>(null)

  const isLast = currentIndex === SLIDES.length - 1

  function handleNext() {
    if (isLast) {
      onDismiss()
      return
    }
    const next = currentIndex + 1
    flatListRef.current?.scrollToIndex({ index: next, animated: true })
    setCurrentIndex(next)
  }

  return (
    <Modal
      visible={visible}
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.container}>
        {/* Skip button */}
        <TouchableOpacity
          style={styles.skipButton}
          onPress={onDismiss}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.skipText}>{t('onboarding.carouselSkip')}</Text>
        </TouchableOpacity>

        {/* Slides */}
        <FlatList
          ref={flatListRef}
          data={SLIDES}
          keyExtractor={(_, i) => String(i)}
          horizontal
          pagingEnabled
          scrollEnabled={false}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={styles.slide}>
              <Ionicons name={item.iconName} size={80} color="#D97398" style={styles.slideIcon} />
              <Text style={styles.slideTitle}>{t(item.titleKey)}</Text>
              <Text style={styles.slideDesc}>{t(item.descriptionKey)}</Text>
            </View>
          )}
        />

        {/* Page dots */}
        <View style={styles.dotsRow}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={[styles.dot, i === currentIndex && styles.dotActive]}
            />
          ))}
        </View>

        {/* Next / Get Started button */}
        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>
            {isLast ? t('onboarding.carouselStart') : t('onboarding.carouselNext')}
          </Text>
        </TouchableOpacity>
      </View>
    </Modal>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#faf5f0',
    alignItems: 'center',
    paddingBottom: 48,
  },
  skipButton: {
    alignSelf: 'flex-end',
    marginTop: 60,
    marginRight: 24,
    paddingVertical: 8,
    paddingHorizontal: 4,
    minHeight: 44,
    justifyContent: 'center',
  },
  skipText: {
    fontSize: 16,
    color: '#9ca3af',
  },
  slide: {
    width: SCREEN_WIDTH,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  slideIcon: {
    marginBottom: 32,
  },
  slideTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 16,
  },
  slideDesc: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 32,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#e5e7eb',
  },
  dotActive: {
    backgroundColor: '#D97398',
    width: 20,
  },
  nextButton: {
    backgroundColor: '#D97398',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 48,
    minHeight: 54,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
})

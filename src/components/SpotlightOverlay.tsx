import { useEffect, useRef, useState } from 'react'
import {
  Animated,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { useTranslation } from 'react-i18next'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TargetRect {
  x: number
  y: number
  width: number
  height: number
}

export interface SpotlightStep {
  targetRect: TargetRect
  title: string
  description: string
  shape?: 'circle' | 'rect'
  padding?: number
}

interface SpotlightOverlayProps {
  steps: SpotlightStep[]
  onDismiss: () => void
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window')
const CALLOUT_HEIGHT_ESTIMATE = 160
const CALLOUT_MARGIN = 12

// ─── Component ────────────────────────────────────────────────────────────────

export default function SpotlightOverlay({ steps, onDismiss }: SpotlightOverlayProps) {
  const { t } = useTranslation()
  const [currentStep, setCurrentStep] = useState(0)
  const opacityAnim = useRef(new Animated.Value(0)).current

  const step = steps[currentStep]
  const isLast = currentStep === steps.length - 1

  useEffect(() => {
    Animated.timing(opacityAnim, {
      toValue: 1,
      duration: 250,
      useNativeDriver: true,
    }).start()
  }, [opacityAnim])

  // Re-animate when step changes
  useEffect(() => {
    opacityAnim.setValue(0)
    Animated.timing(opacityAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start()
  }, [currentStep, opacityAnim])

  function handleNext() {
    if (isLast) {
      onDismiss()
    } else {
      setCurrentStep((s) => s + 1)
    }
  }

  if (!step) return null

  const padding = step.padding ?? 8
  const highlight = {
    x: step.targetRect.x - padding,
    y: step.targetRect.y - padding,
    width: step.targetRect.width + padding * 2,
    height: step.targetRect.height + padding * 2,
  }
  const borderRadius = step.shape === 'circle'
    ? Math.max(highlight.width, highlight.height) / 2
    : 10

  // Callout positioning: prefer below, fallback to above
  const spaceBelow = SCREEN_HEIGHT - (highlight.y + highlight.height)
  const calloutTop = spaceBelow >= CALLOUT_HEIGHT_ESTIMATE + CALLOUT_MARGIN * 2
    ? highlight.y + highlight.height + CALLOUT_MARGIN
    : highlight.y - CALLOUT_HEIGHT_ESTIMATE - CALLOUT_MARGIN

  return (
    <Animated.View style={[styles.container, { opacity: opacityAnim }]}>
      {/* Top panel */}
      <View style={[styles.overlay, { top: 0, left: 0, right: 0, height: Math.max(0, highlight.y) }]} />
      {/* Bottom panel */}
      <View style={[styles.overlay, { top: highlight.y + highlight.height, left: 0, right: 0, bottom: 0 }]} />
      {/* Left panel */}
      <View style={[styles.overlay, {
        top: highlight.y,
        left: 0,
        width: Math.max(0, highlight.x),
        height: highlight.height,
      }]} />
      {/* Right panel */}
      <View style={[styles.overlay, {
        top: highlight.y,
        left: highlight.x + highlight.width,
        right: 0,
        height: highlight.height,
      }]} />

      {/* Highlight border */}
      <View style={[styles.highlightBorder, {
        top: highlight.y,
        left: highlight.x,
        width: highlight.width,
        height: highlight.height,
        borderRadius,
      }]} />

      {/* Callout bubble */}
      <View style={[styles.callout, {
        top: calloutTop,
        left: 16,
        right: 16,
      }]}>
        <Text style={styles.calloutTitle}>{step.title}</Text>
        <Text style={styles.calloutDesc}>{step.description}</Text>
        <View style={styles.calloutFooter}>
          <Text style={styles.stepCounter}>{currentStep + 1} / {steps.length}</Text>
          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <Text style={styles.nextButtonText}>
              {isLast ? t('onboarding.spotlightDone') : t('onboarding.spotlightNext')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Skip button */}
      <TouchableOpacity
        style={styles.skipButton}
        onPress={onDismiss}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Text style={styles.skipText}>{t('onboarding.spotlightSkip')}</Text>
      </TouchableOpacity>
    </Animated.View>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    zIndex: 9999,
  },
  overlay: {
    position: 'absolute',
    backgroundColor: 'rgba(0,0,0,0.72)',
  },
  highlightBorder: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: '#D97398',
  },
  callout: {
    position: 'absolute',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  calloutTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 8,
  },
  calloutDesc: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 21,
    marginBottom: 16,
  },
  calloutFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepCounter: {
    fontSize: 13,
    color: '#9ca3af',
    fontWeight: '500',
  },
  nextButton: {
    backgroundColor: '#D97398',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  skipButton: {
    position: 'absolute',
    top: 56,
    right: 20,
    minHeight: 44,
    minWidth: 44,
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  skipText: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.7)',
  },
})

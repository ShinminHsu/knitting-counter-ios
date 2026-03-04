import { useEffect, useRef } from 'react'
import { Animated, Modal, StyleSheet, Text, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { loadInterstitialAd, showInterstitialAd } from '../services/adsService'

// ─── Props ────────────────────────────────────────────────────────────────────

interface CompletionModalProps {
  visible: boolean
  onClose: () => void
  /** Pass true if interstitial ad has already been shown for this project (Req 11.15) */
  interstitialShown?: boolean
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function CompletionModal({
  visible,
  onClose,
  interstitialShown = false,
}: CompletionModalProps) {
  const { t } = useTranslation()
  const scaleAnim = useRef(new Animated.Value(0)).current
  const opacityAnim = useRef(new Animated.Value(0)).current

  // Animate the card in/out when visibility changes
  useEffect(() => {
    if (visible) {
      scaleAnim.setValue(0)
      opacityAnim.setValue(0)
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 50,
          friction: 5,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start()
    } else {
      scaleAnim.setValue(0)
      opacityAnim.setValue(0)
    }
  }, [visible, scaleAnim, opacityAnim])

  // After ≥2 seconds: show interstitial (only if not already shown), then call onClose (Req 11.10–11.15)
  useEffect(() => {
    if (!visible) return
    const timer = setTimeout(async () => {
      if (!interstitialShown) {
        const ad = await loadInterstitialAd()
        showInterstitialAd(ad, onClose)
      } else {
        onClose()
      }
    }, 800)
    return () => clearTimeout(timer)
  }, [visible, interstitialShown, onClose])

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.card,
            {
              transform: [{ scale: scaleAnim }],
              opacity: opacityAnim,
            },
          ]}
        >
          <Text style={styles.subtitle}>{t('completion.subtitle')}</Text>

        </Animated.View>
      </View>
    </Modal>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingVertical: 40,
    paddingHorizontal: 32,
    alignItems: 'center',
    width: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  emoji: {
    fontSize: 80,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#C4527F',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 24,
  },
  loading: {
    fontSize: 13,
    color: '#9ca3af',
  },
})

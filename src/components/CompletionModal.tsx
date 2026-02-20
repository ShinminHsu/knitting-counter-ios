import { useEffect, useRef } from 'react'
import { Animated, Modal, StyleSheet, Text, View } from 'react-native'
import { loadInterstitialAd, showInterstitialAd } from '../services/adsService'

// ─── Props ────────────────────────────────────────────────────────────────────

interface CompletionModalProps {
  visible: boolean
  onClose: () => void
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function CompletionModal({ visible, onClose }: CompletionModalProps) {
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

  useEffect(() => {
    if (!visible) return
    const timer = setTimeout(async () => {
      const ad = await loadInterstitialAd()
      showInterstitialAd(ad, onClose)
    }, 2000)
    return () => clearTimeout(timer)
  }, [visible, onClose])

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
          {/* Celebration emoji with bounce animation */}
          <Animated.Text
            style={[
              styles.emoji,
              {
                transform: [
                  {
                    scale: scaleAnim.interpolate({
                      inputRange: [0, 0.5, 1],
                      outputRange: [0, 1.2, 1],
                    }),
                  },
                ],
              },
            ]}
          >
            🎉
          </Animated.Text>

          <Text style={styles.title}>恭喜完成！</Text>
          <Text style={styles.subtitle}>太棒了！</Text>

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

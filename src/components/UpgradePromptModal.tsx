import { useEffect, useState } from 'react'
import { ActivityIndicator, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { RewardedAd } from 'react-native-google-mobile-ads'
import { loadRewardedAd, showRewardedAd } from '../services/adsService'
import { purchasePremium } from '../services/iapService'
import { logRewardedAdWatched, logRewardedAdDeclined } from '../services/analyticsService'
import { RewardType } from '../constants/analytics'

// ─── Props ────────────────────────────────────────────────────────────────────

interface UpgradePromptModalProps {
  visible: boolean
  onClose: () => void
  title: string
  description: string
  hasAdOption: boolean
  rewardType?: RewardType
  onAdRewarded: () => void
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function UpgradePromptModal({
  visible,
  onClose,
  title,
  description,
  hasAdOption,
  rewardType,
  onAdRewarded,
}: UpgradePromptModalProps) {
  const { t } = useTranslation()
  const [ad, setAd] = useState<RewardedAd | null>(null)
  const [adLoading, setAdLoading] = useState(false)
  const [purchasing, setPurchasing] = useState(false)

  useEffect(() => {
    if (visible && hasAdOption) {
      setAdLoading(true)
      loadRewardedAd().then((loaded) => {
        setAd(loaded)
        setAdLoading(false)
      })
    } else {
      setAd(null)
      setAdLoading(false)
    }
  }, [visible, hasAdOption])

  function handleWatchAd() {
    showRewardedAd(
      ad,
      () => {
        if (rewardType) logRewardedAdWatched(rewardType)
        onAdRewarded()
        onClose()
      },
      () => {
        onClose()
      }
    )
  }

  async function handleBuyPremium() {
    setPurchasing(true)
    const result = await purchasePremium()
    setPurchasing(false)
    if (result === 'purchased') onClose()
  }

  function handleMaybeLater() {
    if (hasAdOption && rewardType) logRewardedAdDeclined(rewardType)
    onClose()
  }

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.description}>{description}</Text>

          {hasAdOption && (
            <TouchableOpacity
              style={[styles.button, styles.adButton, (adLoading || !ad) && styles.buttonDisabled]}
              onPress={handleWatchAd}
              disabled={adLoading || !ad}
            >
              {adLoading
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.buttonText}>{t('upgrade.watchAd')}</Text>
              }
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.button, styles.premiumButton, purchasing && styles.buttonDisabled]}
            onPress={handleBuyPremium}
            disabled={purchasing}
          >
            {purchasing
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.buttonText}>{t('upgrade.buyPremium', { price: '4.99' })}</Text>
            }
          </TouchableOpacity>

          <TouchableOpacity style={styles.laterButton} onPress={handleMaybeLater}>
            <Text style={styles.laterText}>{t('upgrade.maybeLater')}</Text>
          </TouchableOpacity>
        </View>
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
    paddingHorizontal: 24,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingVertical: 32,
    paddingHorizontal: 24,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#C4527F',
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 15,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  button: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 12,
    minHeight: 48,
    justifyContent: 'center',
  },
  adButton: {
    backgroundColor: '#D97398',
  },
  premiumButton: {
    backgroundColor: '#C4527F',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  laterButton: {
    alignItems: 'center',
    paddingVertical: 8,
    minHeight: 44,
    justifyContent: 'center',
  },
  laterText: {
    fontSize: 15,
    color: '#9ca3af',
  },
})

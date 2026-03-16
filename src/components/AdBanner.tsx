import { useState } from 'react'
import { View, StyleSheet } from 'react-native'
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads'
import { useEntitlementStore } from '../stores/useEntitlementStore'
import { AD_UNIT_IDS } from '../constants/adUnits'

interface AdBannerProps {
  size?: BannerAdSize
}

export default function AdBanner({ size }: AdBannerProps) {
  const isPremium = useEntitlementStore((s) => s.isPremium)
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasFailed, setHasFailed] = useState(false)

  if (isPremium) return null
  if (hasFailed) return null

  return (
    <View style={styles.container}>
      {!isLoaded && <View style={styles.placeholder} />}
      <View style={!isLoaded ? styles.hidden : undefined}>
        <BannerAd
          unitId={AD_UNIT_IDS.BANNER}
          size={size ?? BannerAdSize.BANNER}
          onAdLoaded={() => setIsLoaded(true)}
          onAdFailedToLoad={() => setHasFailed(true)}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  placeholder: {
    height: 50,
    width: '100%',
    backgroundColor: '#f3f4f6',
  },
  hidden: {
    position: 'absolute',
    opacity: 0,
  },
})

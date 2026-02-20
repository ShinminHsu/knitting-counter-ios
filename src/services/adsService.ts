import MobileAds, { InterstitialAd, AdEventType } from 'react-native-google-mobile-ads'
import { requestTrackingPermissionsAsync } from 'expo-tracking-transparency'
import { AD_UNIT_IDS } from '../constants/adUnits'

export async function initializeAds(): Promise<void> {
  try {
    await requestTrackingPermissionsAsync()
  } catch {
    // ATT unavailable (simulator) or denied - continue anyway
  }
  try {
    await MobileAds().initialize()
  } catch {
    // AdMob init failed - continue, ads just won't show
  }
}

export async function loadInterstitialAd(): Promise<InterstitialAd | null> {
  return new Promise((resolve) => {
    try {
      const ad = InterstitialAd.createForAdRequest(AD_UNIT_IDS.INTERSTITIAL)
      const unsubscribeLoaded = ad.addAdEventListener(AdEventType.LOADED, () => {
        unsubscribeLoaded()
        resolve(ad)
      })
      const unsubscribeError = ad.addAdEventListener(AdEventType.ERROR, () => {
        unsubscribeError()
        resolve(null)
      })
      ad.load()
    } catch {
      resolve(null)
    }
  })
}

export function showInterstitialAd(
  ad: InterstitialAd | null,
  onClose: () => void
): void {
  if (!ad) {
    onClose()
    return
  }
  try {
    ad.addAdEventListener(AdEventType.CLOSED, () => { onClose() })
    ad.addAdEventListener(AdEventType.ERROR, () => { onClose() })
    ad.show()
  } catch {
    onClose()
  }
}

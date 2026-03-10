import MobileAds, { InterstitialAd, AdEventType, RewardedAd, RewardedAdEventType } from 'react-native-google-mobile-ads'
import { requestTrackingPermissionsAsync } from 'expo-tracking-transparency'
import { AD_UNIT_IDS } from '../constants/adUnits'
import { mmkv, STORAGE_KEYS } from '../stores/mmkvStorage'

/** Initializes AdMob immediately. Does NOT request ATT — call requestATTIfNeeded() separately. */
export async function initializeAdMob(): Promise<void> {
  try {
    await MobileAds().initialize()
  } catch {
    // AdMob init failed - continue, ads just won't show
  }
}

/**
 * Requests ATT permission if not already requested.
 * Safe to call multiple times — reads MMKV flag and short-circuits if already done.
 */
export async function requestATTIfNeeded(): Promise<void> {
  try {
    const already = mmkv.getBoolean(STORAGE_KEYS.ATT_REQUESTED)
    if (already) return
    await requestTrackingPermissionsAsync()
    mmkv.set(STORAGE_KEYS.ATT_REQUESTED, true)
  } catch {
    // ATT unavailable (simulator) — still mark as requested to avoid future attempts
    mmkv.set(STORAGE_KEYS.ATT_REQUESTED, true)
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

export async function loadRewardedAd(): Promise<RewardedAd | null> {
  return new Promise((resolve) => {
    try {
      const ad = RewardedAd.createForAdRequest(AD_UNIT_IDS.REWARDED)
      const unsubscribeLoaded = ad.addAdEventListener(RewardedAdEventType.LOADED, () => {
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

export function showRewardedAd(
  ad: RewardedAd | null,
  onRewarded: () => void,
  onClose: () => void
): void {
  // DEV shortcut: skip real ad to avoid simulator crashes
  if (__DEV__) {
    onRewarded()
    onClose()
    return
  }

  if (!ad) {
    onClose()
    return
  }

  let rewarded = false
  try {
    ad.addAdEventListener(RewardedAdEventType.EARNED_REWARD, () => {
      rewarded = true
      onRewarded()
    })
    ad.addAdEventListener(AdEventType.CLOSED, () => {
      // only call onClose once — onRewarded does NOT call onClose
      onClose()
    })
    ad.addAdEventListener(AdEventType.ERROR, () => {
      if (!rewarded) onClose()
    })
    ad.show()
  } catch {
    onClose()
  }
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

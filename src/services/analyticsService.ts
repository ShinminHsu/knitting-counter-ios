import analytics from '@react-native-firebase/analytics'
import { ANALYTICS_EVENTS, RewardType } from '../constants/analytics'
import { CraftType } from '../types'

export async function logScreenView(screenName: string): Promise<void> {
  try {
    await analytics().logScreenView({ screen_name: screenName, screen_class: screenName })
  } catch {}
}

export async function logProjectCreated(craftType: CraftType): Promise<void> {
  try {
    await analytics().logEvent(ANALYTICS_EVENTS.PROJECT_CREATED, { craft_type: craftType })
  } catch {}
}

export async function logTrackingStarted(): Promise<void> {
  try {
    await analytics().logEvent(ANALYTICS_EVENTS.TRACKING_STARTED)
  } catch {}
}

export async function logChartCompleted(): Promise<void> {
  try {
    await analytics().logEvent(ANALYTICS_EVENTS.CHART_COMPLETED)
  } catch {}
}

export async function logRoundAdded(): Promise<void> {
  try {
    await analytics().logEvent(ANALYTICS_EVENTS.ADD_ROUND)
  } catch {}
}

// Intentionally not implemented — too noisy (called on every stitch tap)
export async function logStitchAdded(): Promise<void> {}

export async function logTemplateUsed(): Promise<void> {
  try {
    await analytics().logEvent(ANALYTICS_EVENTS.USE_TEMPLATE)
  } catch {}
}

export async function logImport(): Promise<void> {
  try {
    await analytics().logEvent(ANALYTICS_EVENTS.IMPORT_PROJECT)
  } catch {}
}

export async function logExport(): Promise<void> {
  try {
    await analytics().logEvent(ANALYTICS_EVENTS.EXPORT_PROJECT)
  } catch {}
}

// ── Ad behavior ──────────────────────────────────────────────────────────────

export async function logRewardedAdWatched(rewardType: RewardType): Promise<void> {
  try {
    await analytics().logEvent(ANALYTICS_EVENTS.REWARDED_AD_WATCHED, { reward_type: rewardType })
  } catch {}
}

export async function logRewardedAdDeclined(rewardType: RewardType): Promise<void> {
  try {
    await analytics().logEvent(ANALYTICS_EVENTS.REWARDED_AD_DECLINED, { reward_type: rewardType })
  } catch {}
}

export async function logInterstitialShown(): Promise<void> {
  try {
    await analytics().logEvent(ANALYTICS_EVENTS.INTERSTITIAL_SHOWN)
  } catch {}
}

export async function logIAPPurchaseCompleted(): Promise<void> {
  try {
    await analytics().logEvent(ANALYTICS_EVENTS.IAP_PURCHASE_COMPLETED)
  } catch {}
}

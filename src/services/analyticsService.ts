import { mmkv, STORAGE_KEYS } from '../stores/mmkvStorage'
import { ANALYTICS_EVENTS, RewardType } from '../constants/analytics'
import { FIREBASE_CONFIG, FIREBASE_MP_ENDPOINT } from '../constants/firebase'
import { CraftType } from '../types'

// ── Client ID (persistent device identifier) ──────────────────────────────────

function getClientId(): string {
  let id = mmkv.getString(STORAGE_KEYS.GA_CLIENT_ID)
  if (!id) {
    id = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0
      return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16)
    })
    mmkv.set(STORAGE_KEYS.GA_CLIENT_ID, id)
  }
  return id
}

// ── Core send function ─────────────────────────────────────────────────────────

async function sendEvent(name: string, params?: Record<string, string>): Promise<void> {
  const { measurement_id, api_secret } = FIREBASE_CONFIG
  console.log(`[GA] sendEvent: ${name}, mid=${measurement_id ? 'OK' : 'MISSING'}, secret=${api_secret ? 'OK' : 'MISSING'}`)
  if (!measurement_id || !api_secret) return

  try {
    const res = await fetch(
      `${FIREBASE_MP_ENDPOINT}?measurement_id=${measurement_id}&api_secret=${api_secret}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: getClientId(),
          events: [{ name, params: params ?? {} }],
        }),
      }
    )
    console.log(`[GA] ${name} → status ${res.status}`)
  } catch (e) {
    console.log(`[GA] fetch error`, e)
  }
}

// ── Screen & feature events ────────────────────────────────────────────────────

export async function logScreenView(screenName: string): Promise<void> {
  sendEvent(ANALYTICS_EVENTS.SCREEN_VIEW, {
    screen_name: screenName,
    screen_class: screenName,
  })
}

export async function logProjectCreated(craftType: CraftType): Promise<void> {
  sendEvent(ANALYTICS_EVENTS.PROJECT_CREATED, { craft_type: craftType })
}

export async function logTrackingStarted(): Promise<void> {
  sendEvent(ANALYTICS_EVENTS.TRACKING_STARTED)
}

export async function logChartCompleted(): Promise<void> {
  sendEvent(ANALYTICS_EVENTS.CHART_COMPLETED)
}

export async function logRoundAdded(): Promise<void> {
  sendEvent(ANALYTICS_EVENTS.ADD_ROUND)
}

// Intentionally not implemented — too noisy
export async function logStitchAdded(): Promise<void> {}

export async function logTemplateUsed(): Promise<void> {
  sendEvent(ANALYTICS_EVENTS.USE_TEMPLATE)
}

export async function logImport(): Promise<void> {
  sendEvent(ANALYTICS_EVENTS.IMPORT_PROJECT)
}

export async function logExport(): Promise<void> {
  sendEvent(ANALYTICS_EVENTS.EXPORT_PROJECT)
}

// ── Ad behavior ───────────────────────────────────────────────────────────────

export async function logRewardedAdWatched(rewardType: RewardType): Promise<void> {
  sendEvent(ANALYTICS_EVENTS.REWARDED_AD_WATCHED, { reward_type: rewardType })
}

export async function logRewardedAdDeclined(rewardType: RewardType): Promise<void> {
  sendEvent(ANALYTICS_EVENTS.REWARDED_AD_DECLINED, { reward_type: rewardType })
}

export async function logInterstitialShown(): Promise<void> {
  sendEvent(ANALYTICS_EVENTS.INTERSTITIAL_SHOWN)
}

export async function logIAPPurchaseCompleted(): Promise<void> {
  sendEvent(ANALYTICS_EVENTS.IAP_PURCHASE_COMPLETED)
}

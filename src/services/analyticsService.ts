import Constants from 'expo-constants'
import { mmkv, STORAGE_KEYS } from '../stores/mmkvStorage'
import { ANALYTICS_EVENTS, RewardType } from '../constants/analytics'
import { FIREBASE_CONFIG, FIREBASE_MP_ENDPOINT } from '../constants/firebase'
import { useEntitlementStore } from '../stores/useEntitlementStore'
import i18n from '../i18n'
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

// ── Session ID (resets each app launch) ───────────────────────────────────────

const SESSION_ID = Date.now().toString()

// ── Core send function ─────────────────────────────────────────────────────────

const APP_VERSION = Constants.expoConfig?.version ?? 'unknown'

let warnedMissingConfig = false

/** 每個事件都帶的共用參數（GA4 網站串流不會自動帶 App 版本） */
function sharedParams(): Record<string, string> {
  return {
    app_version: APP_VERSION,
    // 命名避開 GA4 自動收集的 language
    app_language: i18n.language,
    is_premium: String(useEntitlementStore.getState().isPremium),
    ...(__DEV__ ? { debug_mode: '1' } : {}),
  }
}

async function sendEvent(name: string, params?: Record<string, string | number>): Promise<void> {
  const { measurement_id, api_secret } = FIREBASE_CONFIG
  if (!measurement_id || !api_secret) {
    if (__DEV__ && !warnedMissingConfig) {
      warnedMissingConfig = true
      const missing = [
        !measurement_id && 'EXPO_PUBLIC_GA_MEASUREMENT_ID',
        !api_secret && 'EXPO_PUBLIC_GA_API_SECRET',
      ]
        .filter(Boolean)
        .join(', ')
      console.warn(
        `[analytics] 不會送出任何事件：${missing} 是空的。本機請設定 .env（見 .env.example），EAS build 會讀 EAS 環境變數`
      )
    }
    return
  }

  try {
    const res = await fetch(
      `${FIREBASE_MP_ENDPOINT}?measurement_id=${measurement_id}&api_secret=${api_secret}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: getClientId(),
          events: [{
            name,
            params: {
              session_id: SESSION_ID,
              engagement_time_msec: '100',
              ...sharedParams(),
              ...(params ?? {}),
            },
          }],
        }),
      }
    )
    // Measurement Protocol 對錯誤的 payload 也回 2xx，但設定錯誤（例如金鑰不符）會回 4xx
    if (!res.ok && __DEV__) {
      console.warn(`[analytics] ${name} 被拒絕：HTTP ${res.status}`)
    }
  } catch (error) {
    if (__DEV__) console.warn(`[analytics] ${name} 送出失敗`, error)
  }
}

// ── Screen & feature events ────────────────────────────────────────────────────

export async function logScreenView(screenName: string): Promise<void> {
  sendEvent(ANALYTICS_EVENTS.SCREEN_VIEW, {
    page_title: screenName,
    page_location: `app://${screenName}`,
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

// ── Knitting behaviour ────────────────────────────────────────────────────────

export async function logAppLaunch(): Promise<void> {
  sendEvent(ANALYTICS_EVENTS.APP_LAUNCH)
}

export async function logChartCreated(craftType: CraftType): Promise<void> {
  sendEvent(ANALYTICS_EVENTS.CHART_CREATED, { craft_type: craftType })
}

export async function logPhotoAdded(source: 'camera' | 'library'): Promise<void> {
  sendEvent(ANALYTICS_EVENTS.PHOTO_ADDED, { source })
}

export async function logCustomStitchCreated(craftType: CraftType): Promise<void> {
  sendEvent(ANALYTICS_EVENTS.CUSTOM_STITCH_CREATED, { craft_type: craftType })
}

export async function logTemplateCreated(
  source: 'library' | 'round_editor',
  stitchCount: number
): Promise<void> {
  sendEvent(ANALYTICS_EVENTS.TEMPLATE_CREATED, { source, stitch_count: stitchCount })
}

/** 離開圈數編輯頁時的摘要 */
export async function logRoundEdited(params: {
  itemsCount: number
  itemsAdded: number
  durationSec: number
}): Promise<void> {
  sendEvent(ANALYTICS_EVENTS.ROUND_EDITED, {
    items_count: params.itemsCount,
    items_added: params.itemsAdded,
    duration_sec: params.durationSec,
  })
}

/** 離開追蹤頁時的摘要 */
export async function logTrackingSessionEnd(params: {
  durationSec: number
  advanceActions: number
  roundsCompleted: number
  chartCompleted: boolean
  craftType: CraftType
}): Promise<void> {
  sendEvent(ANALYTICS_EVENTS.TRACKING_SESSION_END, {
    duration_sec: params.durationSec,
    advance_actions: params.advanceActions,
    rounds_completed: params.roundsCompleted,
    chart_completed: String(params.chartCompleted),
    craft_type: params.craftType,
  })
}

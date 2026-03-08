/**
 * Firebase Analytics Measurement Protocol 設定
 * 從 .env 讀取（參考 .env.example）
 */
export const FIREBASE_CONFIG = {
  measurement_id: process.env.EXPO_PUBLIC_GA_MEASUREMENT_ID ?? '',
  api_secret: process.env.EXPO_PUBLIC_GA_API_SECRET ?? '',
} as const

export const FIREBASE_MP_ENDPOINT = 'https://www.google-analytics.com/mp/collect'

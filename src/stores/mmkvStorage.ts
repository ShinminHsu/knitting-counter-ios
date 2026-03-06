import { createMMKV } from 'react-native-mmkv'
import { StateStorage } from 'zustand/middleware'

/**
 * 全域共用的 MMKV 實例
 * 所有 Zustand store 共用同一個 MMKV instance，各自使用不同 key
 */
export const mmkv = createMMKV()

/**
 * Zustand persist middleware 用的 MMKV storage adapter（Req 7.1）
 *
 * 使用 react-native-mmkv 取代 AsyncStorage：
 * - 同步讀寫，無需 await
 * - 比 AsyncStorage 快約 10x
 * - 支援 app 意外終止時的資料保全（Req 7.2）
 */
export const mmkvStorage: StateStorage = {
  getItem: (key: string): string | null => {
    return mmkv.getString(key) ?? null
  },
  setItem: (key: string, value: string): void => {
    mmkv.set(key, value)
  },
  removeItem: (key: string): void => {
    mmkv.remove(key)
  },
}

/** MMKV storage keys，集中管理避免 typo */
export const STORAGE_KEYS = {
  PROJECTS: 'projects',
  CUSTOM_STITCHES: 'customStitches',
  TEMPLATES: 'templates',
  LANGUAGE: 'language',
  STITCH_DISPLAY_MODE: 'stitchDisplayMode',
  SETTINGS: 'settings',
  ONBOARDING: 'onboarding',
} as const

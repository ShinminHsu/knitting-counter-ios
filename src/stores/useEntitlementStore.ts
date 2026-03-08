import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { mmkvStorage, STORAGE_KEYS } from './mmkvStorage'
import { StitchCategoryLockKey } from '../constants/stitches'

const FREE_MAX_PROJECTS = 3
const FREE_MAX_PHOTOS = 1
const AD_PROJECT_SLOTS = 2   // max extra slots via ads
const AD_PHOTO_SLOTS = 2     // max extra slots via ads

// ─── State & Actions Interface ─────────────────────────────────────────────────

interface EntitlementState {
  isPremium: boolean
  premiumSource: 'iap' | 'voucher' | null
  voucherCode: string | null
  adUnlockedProjectCount: number  // 0–2
  adUnlockedPhotoCount: number    // 0–2
  unlockedStitchCategories: Record<StitchCategoryLockKey, boolean>

  // Actions
  setPremium: (source: 'iap' | 'voucher', voucherCode?: string) => void
  incrementAdUnlockedProjects: () => void
  incrementAdUnlockedPhotos: () => void
  unlockStitchCategory: (key: StitchCategoryLockKey) => void

  // Computed getters
  maxProjects: () => number
  maxPhotosPerProject: () => number
  canUseCustomStitches: () => boolean
  canExport: () => boolean
  isStitchCategoryUnlocked: (key: StitchCategoryLockKey) => boolean
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useEntitlementStore = create<EntitlementState>()(
  persist(
    (set, get) => ({
      isPremium: false,
      premiumSource: null,
      voucherCode: null,
      adUnlockedProjectCount: 0,
      adUnlockedPhotoCount: 0,
      unlockedStitchCategories: {
        basic: false,
        inc: false,
        dec: false,
        special: false,
        cable: false,
      },

      setPremium: (source, voucherCode) =>
        set({ isPremium: true, premiumSource: source, voucherCode: voucherCode ?? null }),

      incrementAdUnlockedProjects: () =>
        set((s) => ({
          adUnlockedProjectCount: Math.min(s.adUnlockedProjectCount + 1, AD_PROJECT_SLOTS),
        })),

      incrementAdUnlockedPhotos: () =>
        set((s) => ({
          adUnlockedPhotoCount: Math.min(s.adUnlockedPhotoCount + 1, AD_PHOTO_SLOTS),
        })),

      unlockStitchCategory: (key) =>
        set((s) => ({
          unlockedStitchCategories: { ...s.unlockedStitchCategories, [key]: true },
        })),

      maxProjects: () => {
        const s = get()
        if (s.isPremium) return Infinity
        return FREE_MAX_PROJECTS + s.adUnlockedProjectCount
      },

      maxPhotosPerProject: () => {
        const s = get()
        if (s.isPremium) return Infinity
        return FREE_MAX_PHOTOS + s.adUnlockedPhotoCount
      },

      canUseCustomStitches: () => get().isPremium,

      canExport: () => get().isPremium,

      isStitchCategoryUnlocked: (key) => {
        const s = get()
        if (s.isPremium) return true
        if (key === 'basic') return true  // basic is always free
        return s.unlockedStitchCategories[key] ?? false
      },
    }),
    {
      name: STORAGE_KEYS.ENTITLEMENTS,
      storage: createJSONStorage(() => mmkvStorage),
    }
  )
)

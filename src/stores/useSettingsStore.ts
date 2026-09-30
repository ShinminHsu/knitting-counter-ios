import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { mmkvStorage, STORAGE_KEYS } from './mmkvStorage'

// ─── State & Actions Interface ─────────────────────────────────────────────────

interface SettingsState {
  /** Whether the user has seen the multi-select long-press hint (Req 5.9) */
  hasSeenMultiSelectHint: boolean

  /** Mark multi-select hint as seen — persists across app restarts */
  markMultiSelectHintSeen: () => void

  /** Whether automatic iCloud backup is on (default on) */
  iCloudBackupEnabled: boolean

  setICloudBackupEnabled: (enabled: boolean) => void
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      hasSeenMultiSelectHint: false,

      markMultiSelectHintSeen: () => set({ hasSeenMultiSelectHint: true }),

      iCloudBackupEnabled: true,

      setICloudBackupEnabled: (enabled) => set({ iCloudBackupEnabled: enabled }),
    }),
    {
      name: STORAGE_KEYS.SETTINGS,
      storage: createJSONStorage(() => mmkvStorage),
    }
  )
)

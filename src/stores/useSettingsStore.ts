import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { mmkvStorage, STORAGE_KEYS } from './mmkvStorage'

// ─── State & Actions Interface ─────────────────────────────────────────────────

interface SettingsState {
  /** Whether the user has seen the multi-select hint (Req 5.9) */
  hasSeenMultiSelectHint: boolean

  /** Mark the multi-select hint as seen so it is not shown again */
  markMultiSelectHintSeen: () => void
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      hasSeenMultiSelectHint: false,

      markMultiSelectHintSeen: () => {
        set({ hasSeenMultiSelectHint: true })
      },
    }),
    {
      name: STORAGE_KEYS.SETTINGS,
      storage: createJSONStorage(() => mmkvStorage),
    }
  )
)

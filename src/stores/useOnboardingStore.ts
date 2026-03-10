import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { mmkvStorage, STORAGE_KEYS } from './mmkvStorage'

// ─── State & Actions Interface ─────────────────────────────────────────────────

interface OnboardingState {
  /** Whether the user has completed or skipped the first-launch carousel */
  hasSeenCarousel: boolean

  /** Per-screen spotlight seen flags, keyed by SCREEN_NAMES value */
  seenSpotlights: Record<string, boolean>

  /** Mark the carousel as seen — persists across app restarts */
  markCarouselSeen: () => void

  /** Mark the spotlight for a specific screen as seen */
  markSpotlightSeen: (screenName: string) => void

  /** Reset carousel seen flag (for "replay tutorial" button in Help Center) */
  resetCarousel: () => void

  /** Reset all spotlight seen flags so they replay when user revisits each screen */
  resetSpotlights: () => void
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      hasSeenCarousel: false,
      seenSpotlights: {},

      markCarouselSeen: () => set({ hasSeenCarousel: true }),

      markSpotlightSeen: (screenName: string) =>
        set((state) => ({
          seenSpotlights: { ...state.seenSpotlights, [screenName]: true },
        })),

      resetCarousel: () => set({ hasSeenCarousel: false }),

      resetSpotlights: () => set({ seenSpotlights: {} }),
    }),
    {
      name: STORAGE_KEYS.ONBOARDING,
      storage: createJSONStorage(() => mmkvStorage),
    }
  )
)

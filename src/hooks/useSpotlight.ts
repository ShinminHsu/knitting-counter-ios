import { useEffect, useRef, useState } from 'react'
import { InteractionManager, View } from 'react-native'
import { useOnboardingStore } from '../stores/useOnboardingStore'
import { SpotlightStep, TargetRect } from '../components/SpotlightOverlay'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SpotlightStepConfig {
  ref: React.RefObject<View | null>
  title: string         // already-translated text
  description: string   // already-translated text
  shape?: 'circle' | 'rect'
  padding?: number
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Manages spotlight display for a screen.
 * - Checks if the spotlight has been seen before
 * - Measures ref positions after the screen settles
 * - Returns resolved steps with real coordinates
 */
export function useSpotlight(
  screenName: string,
  steps: SpotlightStepConfig[]
): {
  showSpotlight: boolean
  resolvedSteps: SpotlightStep[]
  dismiss: () => void
} {
  const seenSpotlights = useOnboardingStore((s) => s.seenSpotlights)
  const markSpotlightSeen = useOnboardingStore((s) => s.markSpotlightSeen)
  const hasSeenCarousel = useOnboardingStore((s) => s.hasSeenCarousel)

  const [showSpotlight, setShowSpotlight] = useState(false)
  const [resolvedSteps, setResolvedSteps] = useState<SpotlightStep[]>([])
  const hasMeasured = useRef(false)

  const alreadySeen = !!seenSpotlights[screenName]

  useEffect(() => {
    // Don't measure until the onboarding carousel is fully dismissed —
    // measuring while the carousel modal is animating away returns wrong coordinates
    if (alreadySeen || hasMeasured.current || !hasSeenCarousel) return

    const task = InteractionManager.runAfterInteractions(() => {
      const timer = setTimeout(() => {
        requestAnimationFrame(() => {
        hasMeasured.current = true

        const measured: SpotlightStep[] = []
        let pending = steps.length

        steps.forEach((step) => {
          if (!step.ref.current) {
            pending--
            if (pending === 0) finalize(measured)
            return
          }

          step.ref.current.measureInWindow((x, y, width, height) => {
            if (width > 0 && height > 0) {
              measured.push({
                targetRect: { x, y, width, height } as TargetRect,
                title: step.title,
                description: step.description,
                shape: step.shape,
                padding: step.padding,
              })
            }
            pending--
            if (pending === 0) finalize(measured)
          })
        })

        if (steps.length === 0) finalize([])
        }) // requestAnimationFrame
      }, 800)

      return () => clearTimeout(timer)
    })

    return () => task.cancel()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screenName, alreadySeen, hasSeenCarousel])

  function finalize(measured: SpotlightStep[]) {
    if (measured.length === 0) {
      // All refs failed — mark as seen silently
      markSpotlightSeen(screenName)
      return
    }
    setResolvedSteps(measured)
    setShowSpotlight(true)
  }

  function dismiss() {
    setShowSpotlight(false)
    markSpotlightSeen(screenName)
  }

  return { showSpotlight, resolvedSteps, dismiss }
}

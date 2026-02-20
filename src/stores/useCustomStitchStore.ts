import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { CraftType, CustomStitchPattern } from '../types'
import { mmkvStorage, STORAGE_KEYS } from './mmkvStorage'

// ─── 內部工具 ─────────────────────────────────────────────────────────────────

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

// ─── State & Actions Interface ─────────────────────────────────────────────────

interface CustomStitchState {
  customStitches: CustomStitchPattern[]

  /** 依 craftType 取得自訂針法（Req 5.2） */
  getByType: (craftType: CraftType) => CustomStitchPattern[]

  /** 新增自訂針法 */
  addCustomStitch: (
    params: Pick<CustomStitchPattern, 'name' | 'abbr' | 'englishName' | 'craftType'> &
      Partial<Pick<CustomStitchPattern, 'description'>>
  ) => CustomStitchPattern

  /** 更新自訂針法 */
  updateCustomStitch: (
    id: string,
    updates: Partial<Pick<CustomStitchPattern, 'name' | 'abbr' | 'englishName' | 'description'>>
  ) => void

  /** 刪除自訂針法 */
  deleteCustomStitch: (id: string) => void

  /** 記錄使用（更新 lastUsed 與 useCount） */
  incrementUseCount: (id: string) => void
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useCustomStitchStore = create<CustomStitchState>()(
  persist(
    (set, get) => ({
      customStitches: [],

      getByType: (craftType) => {
        return get().customStitches.filter((s) => s.craftType === craftType)
      },

      addCustomStitch: (params) => {
        const stitch: CustomStitchPattern = {
          id: generateId(),
          name: params.name,
          abbr: params.abbr,
          englishName: params.englishName,
          craftType: params.craftType,
          ...(params.description !== undefined && { description: params.description }),
          createdAt: new Date().toISOString(),
          useCount: 0,
        }
        set((state) => ({ customStitches: [...state.customStitches, stitch] }))
        return stitch
      },

      updateCustomStitch: (id, updates) => {
        set((state) => ({
          customStitches: state.customStitches.map((s) =>
            s.id === id ? { ...s, ...updates } : s
          ),
        }))
      },

      deleteCustomStitch: (id) => {
        set((state) => ({
          customStitches: state.customStitches.filter((s) => s.id !== id),
        }))
      },

      incrementUseCount: (id) => {
        set((state) => ({
          customStitches: state.customStitches.map((s) =>
            s.id === id
              ? { ...s, useCount: s.useCount + 1, lastUsed: new Date().toISOString() }
              : s
          ),
        }))
      },
    }),
    {
      name: STORAGE_KEYS.CUSTOM_STITCHES,
      storage: createJSONStorage(() => mmkvStorage),
    }
  )
)

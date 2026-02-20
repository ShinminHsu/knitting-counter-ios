import {
  CraftType,
  CustomStitchPattern,
  PatternItem,
  PatternItemType,
  StitchGroupTemplate,
  StitchInfo,
  StitchType,
} from '../types'
import { generateId } from './helpers'

// ─── Custom Stitch Helpers ─────────────────────────────────────────────────────

/** 建立新的自訂針法，帶有正確預設值 */
export function createCustomStitch(params: {
  name: string
  abbr: string
  craftType: CraftType
  englishName?: string
  description?: string
}): CustomStitchPattern {
  return {
    id: generateId(),
    name: params.name,
    abbr: params.abbr,
    englishName: params.englishName ?? params.name,
    craftType: params.craftType,
    description: params.description,
    createdAt: new Date().toISOString(),
    useCount: 0,
  }
}

/** 依 craftType 篩選自訂針法清單（Req 5.2） */
export function filterCustomStitchesByCraft(
  stitches: CustomStitchPattern[],
  craftType: CraftType
): CustomStitchPattern[] {
  return stitches.filter((s) => s.craftType === craftType)
}

// ─── Template Helpers ──────────────────────────────────────────────────────────

/** 建立新的針法群組樣板，帶有正確預設值 */
export function createTemplate(params: {
  name: string
  stitches: StitchInfo[]
  repeatCount?: number
  description?: string
  category?: string
}): StitchGroupTemplate {
  return {
    id: generateId(),
    name: params.name,
    description: params.description,
    stitches: params.stitches,
    repeatCount: params.repeatCount ?? 1,
    category: params.category,
    createdAt: new Date().toISOString(),
    useCount: 0,
  }
}

/**
 * 即時搜尋樣板（Req 5.5）
 * 依名稱關鍵字過濾，不分大小寫
 */
export function searchTemplates(
  templates: StitchGroupTemplate[],
  query: string
): StitchGroupTemplate[] {
  const q = query.trim().toLowerCase()
  if (!q) return templates
  return templates.filter((t) => t.name.toLowerCase().includes(q))
}

/**
 * 將樣板展開為 PatternItem[]（Req 5.4）
 * 插入段落時使用，產生對應的 STITCH 項目
 */
export function expandTemplateToItems(
  template: StitchGroupTemplate,
  startOrder: number = 0
): PatternItem[] {
  const now = new Date().toISOString()
  return template.stitches.map((stitch, index) => ({
    id: generateId(),
    type: PatternItemType.STITCH,
    order: startOrder + index,
    createdAt: now,
    data: {
      id: generateId(),
      type: stitch.type,
      count: stitch.count * template.repeatCount,
      customName: stitch.customName,
      customAbbr: stitch.customAbbr,
    } satisfies StitchInfo,
  }))
}

/**
 * 依自訂針法建立對應的 StitchInfo
 * 用於在段落中加入自訂針法時
 */
export function customStitchToStitchInfo(
  custom: CustomStitchPattern,
  count: number = 1
): StitchInfo {
  return {
    id: generateId(),
    type: StitchType.CUSTOM,
    count,
    customName: custom.name,
    customAbbr: custom.abbr,
  }
}

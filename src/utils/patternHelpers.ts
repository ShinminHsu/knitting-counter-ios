import {
  PatternItem,
  PatternItemType,
  StitchGroup,
  StitchInfo,
  StitchType,
  StitchTypeInfo,
} from '../types'

/** StitchInfo type guard */
export function isStitchInfo(data: StitchInfo | StitchGroup): data is StitchInfo {
  return !('stitches' in data)
}

/** StitchGroup type guard */
export function isStitchGroup(data: StitchInfo | StitchGroup): data is StitchGroup {
  return 'stitches' in data
}

/** PatternItem 取得 stitch 資料（僅在 type === STITCH 時使用） */
export function getStitchFromItem(item: PatternItem): StitchInfo | null {
  if (item.type === PatternItemType.STITCH && isStitchInfo(item.data)) {
    return item.data
  }
  return null
}

/** PatternItem 取得 group 資料（僅在 type === GROUP 時使用） */
export function getGroupFromItem(item: PatternItem): StitchGroup | null {
  if (item.type === PatternItemType.GROUP && isStitchGroup(item.data)) {
    return item.data
  }
  return null
}

/**
 * 計算單一 StitchInfo 的實際針目數
 * 加針類型（stitchCount > 1）每針目乘以對應倍數
 */
export function calcStitchInfoCount(stitch: StitchInfo): number {
  const info = StitchTypeInfo[stitch.type]
  return stitch.count * info.stitchCount
}

/**
 * 計算一個 PatternItem 的總針目數
 * - STITCH：count × stitchCount
 * - GROUP：各 stitch 的總針目數 × repeatCount
 */
export function calcPatternItemCount(item: PatternItem): number {
  if (item.type === PatternItemType.STITCH) {
    const stitch = item.data as StitchInfo
    return calcStitchInfoCount(stitch)
  } else {
    const group = item.data as StitchGroup
    const perRepeat = group.stitches.reduce(
      (sum, s) => sum + calcStitchInfoCount(s),
      0
    )
    return perRepeat * group.repeatCount
  }
}

/**
 * 計算一圈的總針目數
 */
export function calcRoundTotalStitches(patternItems: PatternItem[]): number {
  return patternItems.reduce((sum, item) => sum + calcPatternItemCount(item), 0)
}

/**
 * 取得 StitchInfo 的顯示縮寫
 * 自訂針法使用 customAbbr，否則使用 StitchTypeInfo 的 abbr
 */
export function getStitchAbbr(stitch: StitchInfo): string {
  if (stitch.type === StitchType.CUSTOM) {
    return stitch.customAbbr ?? stitch.customName ?? 'custom'
  }
  return StitchTypeInfo[stitch.type].abbr
}

/**
 * 取得 StitchInfo 的顯示中文名稱
 * 自訂針法使用 customName，否則使用 StitchTypeInfo 的 label
 */
export function getStitchLabel(stitch: StitchInfo): string {
  if (stitch.type === StitchType.CUSTOM) {
    return stitch.customName ?? '自訂'
  }
  return StitchTypeInfo[stitch.type].label
}

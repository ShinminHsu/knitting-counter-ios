import { CraftType, StitchType } from '../types'

// ─── 依 craftType 的針法清單 ──────────────────────────────────────────────────

const CROCHET_STITCHES: StitchType[] = [
  // 基礎
  StitchType.MAGIC_RING,
  StitchType.CHAIN,
  StitchType.SLIP_STITCH,
  StitchType.SINGLE,
  StitchType.HALF_DOUBLE,
  StitchType.DOUBLE,
  StitchType.TREBLE,
  StitchType.CH3_PICOT,
  StitchType.DTR,
  // 加針
  StitchType.SC_INC,
  StitchType.SC3INC,
  StitchType.HDC_INC,
  StitchType.HDC3_INC,
  StitchType.DC_INC,
  StitchType.DC3_INC,
  // 減針
  StitchType.SC2TOG,
  StitchType.SC3TOG,
  StitchType.HDC2TOG,
  StitchType.HDC3TOG,
  StitchType.DC2TOG,
  StitchType.DC3TOG,
  // 特殊
  StitchType.DC3_CLUSTER,
  StitchType.HDC3_CLUSTER,
  StitchType.DC5_POPCORN,
  StitchType.DC5_SHELL,
  // 自訂
  StitchType.CUSTOM,
]

const KNITTING_STITCHES: StitchType[] = [
  // 基礎
  StitchType.CAST_ON,
  StitchType.BIND_OFF,
  StitchType.KNIT,
  StitchType.PURL,
  StitchType.YARN_OVER,
  StitchType.SLIP_WYIB,
  StitchType.SLIP_WYIF,
  StitchType.BACKWARD_LOOP_CO,
  StitchType.K_TBL,
  StitchType.P_TBL,
  // 減針 2→1
  StitchType.K2TOG,
  StitchType.P2TOG,
  StitchType.SSK,
  StitchType.SSP,
  // 減針 3→1
  StitchType.K3TOG,
  StitchType.P3TOG,
  StitchType.SSSK,
  StitchType.SSSP,
  StitchType.S2KP2,
  StitchType.SSPP2,
  // 加針
  StitchType.LLI,
  StitchType.LLPI,
  StitchType.RLI,
  StitchType.RLPI,
  // 麻花／交叉
  StitchType.CABLE_2ST_RC,
  StitchType.CABLE_2ST_LC,
  StitchType.CABLE_2ST_RPC,
  StitchType.CABLE_2ST_LPC,
  // 自訂
  StitchType.CUSTOM,
]

/** 依 craftType 取得可用針法清單 */
export const STITCH_TYPES_BY_CRAFT: Record<CraftType, StitchType[]> = {
  crochet: CROCHET_STITCHES,
  knitting: KNITTING_STITCHES,
}

// ─── Stitch Picker 分組（UI 用）──────────────────────────────────────────────

export interface StitchCategory {
  label: string
  stitches: StitchType[]
}

export const CROCHET_STITCH_CATEGORIES: StitchCategory[] = [
  {
    label: 'stitch.category.crochetBasic',
    stitches: [
      StitchType.MAGIC_RING,
      StitchType.CHAIN,
      StitchType.SLIP_STITCH,
      StitchType.SINGLE,
      StitchType.HALF_DOUBLE,
      StitchType.DOUBLE,
      StitchType.TREBLE,
      StitchType.CH3_PICOT,
      StitchType.DTR,
    ],
  },
  {
    label: 'stitch.category.crochetIncrease',
    stitches: [
      StitchType.SC_INC,
      StitchType.SC3INC,
      StitchType.HDC_INC,
      StitchType.HDC3_INC,
      StitchType.DC_INC,
      StitchType.DC3_INC,
    ],
  },
  {
    label: 'stitch.category.crochetDecrease',
    stitches: [
      StitchType.SC2TOG,
      StitchType.SC3TOG,
      StitchType.HDC2TOG,
      StitchType.HDC3TOG,
      StitchType.DC2TOG,
      StitchType.DC3TOG,
    ],
  },
  {
    label: 'stitch.category.crochetSpecial',
    stitches: [
      StitchType.DC3_CLUSTER,
      StitchType.HDC3_CLUSTER,
      StitchType.DC5_POPCORN,
      StitchType.DC5_SHELL,
    ],
  },
]

export const KNITTING_STITCH_CATEGORIES: StitchCategory[] = [
  {
    label: 'stitch.category.knitBasic',
    stitches: [
      StitchType.CAST_ON,
      StitchType.BIND_OFF,
      StitchType.KNIT,
      StitchType.PURL,
      StitchType.YARN_OVER,
      StitchType.SLIP_WYIB,
      StitchType.SLIP_WYIF,
      StitchType.BACKWARD_LOOP_CO,
      StitchType.K_TBL,
      StitchType.P_TBL,
    ],
  },
  {
    label: 'stitch.category.knitDecrease2',
    stitches: [
      StitchType.K2TOG,
      StitchType.P2TOG,
      StitchType.SSK,
      StitchType.SSP,
    ],
  },
  {
    label: 'stitch.category.knitDecrease3',
    stitches: [
      StitchType.K3TOG,
      StitchType.P3TOG,
      StitchType.SSSK,
      StitchType.SSSP,
      StitchType.S2KP2,
      StitchType.SSPP2,
    ],
  },
  {
    label: 'stitch.category.knitIncrease',
    stitches: [
      StitchType.LLI,
      StitchType.LLPI,
      StitchType.RLI,
      StitchType.RLPI,
    ],
  },
  {
    label: 'stitch.category.knitCable',
    stitches: [
      StitchType.CABLE_2ST_RC,
      StitchType.CABLE_2ST_LC,
      StitchType.CABLE_2ST_RPC,
      StitchType.CABLE_2ST_LPC,
    ],
  },
]

/** 依 craftType 取得 stitch picker 的分組清單 */
export const STITCH_CATEGORIES_BY_CRAFT: Record<CraftType, StitchCategory[]> = {
  crochet: CROCHET_STITCH_CATEGORIES,
  knitting: KNITTING_STITCH_CATEGORIES,
}

// ─── Stitch category lock keys（free plan gating）────────────────────────────

export type StitchCategoryLockKey = 'basic' | 'inc' | 'dec' | 'special' | 'cable'

/** 將 category label 對應到 lock key，用於判斷該分類是否已解鎖 */
export const STITCH_CATEGORY_LOCK_KEY: Record<string, StitchCategoryLockKey> = {
  'stitch.category.crochetBasic':    'basic',
  'stitch.category.crochetIncrease': 'inc',
  'stitch.category.crochetDecrease': 'dec',
  'stitch.category.crochetSpecial':  'special',
  'stitch.category.knitBasic':       'basic',
  'stitch.category.knitIncrease':    'inc',
  'stitch.category.knitDecrease2':   'dec',
  'stitch.category.knitDecrease3':   'dec',
  'stitch.category.knitCable':       'cable',
}

// ─── 加針類型（Req 4.15：加針計為 2 針）────────────────────────────────────────

/** 加針針法清單：這些針法在計算針目數時佔 2 針以上（stitchCount > 1）*/
export const INCREASE_STITCH_TYPES: StitchType[] = [
  // 鉤針加針
  StitchType.SC_INC,
  StitchType.SC3INC,
  StitchType.HDC_INC,
  StitchType.HDC3_INC,
  StitchType.DC_INC,
  StitchType.DC3_INC,
  // 棒針加針
  StitchType.LLI,
  StitchType.LLPI,
  StitchType.RLI,
  StitchType.RLPI,
]

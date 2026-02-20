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
  // 加針
  StitchType.SC_INC,
  StitchType.HDC_INC,
  StitchType.DC_INC,
  StitchType.TR_INC,
  // 減針
  StitchType.SC2TOG,
  StitchType.HDC2TOG,
  StitchType.HDC3TOG,
  StitchType.DC2TOG,
  StitchType.DC3TOG,
  StitchType.TR3TOG,
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
  StitchType.WRAP_AND_TURN,
  // 減針 2→1
  StitchType.SSK,
  StitchType.SSP,
  StitchType.K2TOG,
  StitchType.P2TOG,
  // 減針 3→1
  StitchType.SSSK,
  StitchType.SSSP,
  StitchType.K3TOG,
  StitchType.P3TOG,
  StitchType.CDD,
  StitchType.CDDP,
  // 加針
  StitchType.M1L,
  StitchType.M1LP,
  StitchType.M1R,
  StitchType.M1RP,
  StitchType.K_TBL,
  StitchType.P_TBL,
  // 麻花／交叉
  StitchType.CABLE_1_1_RC,
  StitchType.CABLE_1_1_LC,
  StitchType.CABLE_2_2_RC,
  StitchType.CABLE_2_2_LC,
  StitchType.CABLE_1_1_RPC,
  StitchType.CABLE_1_1_LPC,
  StitchType.CABLE_2_2_RPC,
  StitchType.CABLE_2_2_LPC,
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
    label: '基礎針法',
    stitches: [
      StitchType.MAGIC_RING,
      StitchType.CHAIN,
      StitchType.SLIP_STITCH,
      StitchType.SINGLE,
      StitchType.HALF_DOUBLE,
      StitchType.DOUBLE,
      StitchType.TREBLE,
    ],
  },
  {
    label: '加針',
    stitches: [
      StitchType.SC_INC,
      StitchType.HDC_INC,
      StitchType.DC_INC,
      StitchType.TR_INC,
    ],
  },
  {
    label: '減針',
    stitches: [
      StitchType.SC2TOG,
      StitchType.HDC2TOG,
      StitchType.HDC3TOG,
      StitchType.DC2TOG,
      StitchType.DC3TOG,
      StitchType.TR3TOG,
    ],
  },
  {
    label: '特殊針法',
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
    label: '基礎針法',
    stitches: [
      StitchType.CAST_ON,
      StitchType.BIND_OFF,
      StitchType.KNIT,
      StitchType.PURL,
      StitchType.YARN_OVER,
      StitchType.SLIP_WYIB,
      StitchType.SLIP_WYIF,
      StitchType.WRAP_AND_TURN,
    ],
  },
  {
    label: '減針',
    stitches: [
      StitchType.SSK,
      StitchType.SSP,
      StitchType.K2TOG,
      StitchType.P2TOG,
      StitchType.SSSK,
      StitchType.SSSP,
      StitchType.K3TOG,
      StitchType.P3TOG,
      StitchType.CDD,
      StitchType.CDDP,
    ],
  },
  {
    label: '加針',
    stitches: [
      StitchType.M1L,
      StitchType.M1LP,
      StitchType.M1R,
      StitchType.M1RP,
      StitchType.K_TBL,
      StitchType.P_TBL,
    ],
  },
  {
    label: '麻花／交叉',
    stitches: [
      StitchType.CABLE_1_1_RC,
      StitchType.CABLE_1_1_LC,
      StitchType.CABLE_2_2_RC,
      StitchType.CABLE_2_2_LC,
      StitchType.CABLE_1_1_RPC,
      StitchType.CABLE_1_1_LPC,
      StitchType.CABLE_2_2_RPC,
      StitchType.CABLE_2_2_LPC,
    ],
  },
]

/** 依 craftType 取得 stitch picker 的分組清單 */
export const STITCH_CATEGORIES_BY_CRAFT: Record<CraftType, StitchCategory[]> = {
  crochet: CROCHET_STITCH_CATEGORIES,
  knitting: KNITTING_STITCH_CATEGORIES,
}

// ─── 加針類型（Req 4.15：加針計為 2 針）────────────────────────────────────────

/** 加針針法清單：這些針法在計算針目數時佔 2 針（stitchCount = 2）*/
export const INCREASE_STITCH_TYPES: StitchType[] = [
  // 鉤針加針
  StitchType.SC_INC,
  StitchType.HDC_INC,
  StitchType.DC_INC,
  StitchType.TR_INC,
  // 棒針加針
  StitchType.M1L,
  StitchType.M1LP,
  StitchType.M1R,
  StitchType.M1RP,
]

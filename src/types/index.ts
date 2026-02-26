// ─── Craft Type ───────────────────────────────────────────────────────────────

export type CraftType = 'crochet' | 'knitting'

// ─── Stitch Types ─────────────────────────────────────────────────────────────

export enum StitchType {
  // ── 棒針基礎 ──────────────────────────────────
  CAST_ON = 'cast_on',
  BIND_OFF = 'bind_off',
  KNIT = 'knit',
  PURL = 'purl',
  YARN_OVER = 'yarn_over',
  SLIP_WYIB = 'slip_wyib',
  SLIP_WYIF = 'slip_wyif',
  WRAP_AND_TURN = 'wrap_and_turn',

  // ── 棒針減針（2→1）──────────────────────────
  SSK = 'ssk',
  SSP = 'ssp',
  K2TOG = 'k2tog',
  P2TOG = 'p2tog',

  // ── 棒針減針（3→1）──────────────────────────
  SSSK = 'sssk',
  SSSP = 'sssp',
  K3TOG = 'k3tog',
  P3TOG = 'p3tog',
  CDD = 'cdd',
  CDDP = 'cddp',

  // ── 棒針加針 ──────────────────────────────────
  M1L = 'm1l',
  M1LP = 'm1lp',
  M1R = 'm1r',
  M1RP = 'm1rp',
  K_TBL = 'k_tbl',
  P_TBL = 'p_tbl',

  // ── 棒針麻花／交叉 ───────────────────────────
  CABLE_1_1_RC = 'cable_1_1_rc',
  CABLE_1_1_LC = 'cable_1_1_lc',
  CABLE_2_2_RC = 'cable_2_2_rc',
  CABLE_2_2_LC = 'cable_2_2_lc',
  CABLE_1_1_RPC = 'cable_1_1_rpc',
  CABLE_1_1_LPC = 'cable_1_1_lpc',
  CABLE_2_2_RPC = 'cable_2_2_rpc',
  CABLE_2_2_LPC = 'cable_2_2_lpc',

  // ── 鉤針基礎 ──────────────────────────────────
  MAGIC_RING = 'magic_ring',
  CHAIN = 'chain',
  SLIP_STITCH = 'slip_stitch',
  SINGLE = 'single',
  HALF_DOUBLE = 'half_double',
  DOUBLE = 'double',
  TREBLE = 'treble',

  // ── 鉤針加針 ──────────────────────────────────
  SC_INC = 'sc_inc',
  HDC_INC = 'hdc_inc',
  DC_INC = 'dc_inc',
  TR_INC = 'tr_inc',

  // ── 鉤針減針 ──────────────────────────────────
  SC2TOG = 'sc2tog',
  HDC2TOG = 'hdc2tog',
  HDC3TOG = 'hdc3tog',
  DC2TOG = 'dc2tog',
  DC3TOG = 'dc3tog',
  TR3TOG = 'tr3tog',

  // ── 鉤針特殊針法 ──────────────────────────────
  DC3_CLUSTER = 'dc3_cluster',
  HDC3_CLUSTER = 'hdc3_cluster',
  DC5_POPCORN = 'dc5_popcorn',
  DC5_SHELL = 'dc5_shell',

  // ── 自訂（通用）──────────────────────────────
  CUSTOM = 'custom',
}

export interface StitchTypeDetails {
  /** 中文名稱 */
  label: string
  /** 英文縮寫（UI 顯示用） */
  abbr: string
  /** 英文全名 */
  englishName: string
  /**
   * 此針法在圈/行中佔的針目數
   * - 一般針法 = 1
   * - 加針 = 2（在結果行新增 1 針）
   * - 5長針貝殼針 = 5
   */
  stitchCount: number
}

export const StitchTypeInfo: Record<StitchType, StitchTypeDetails> = {
  // ── 棒針基礎 ──────────────────────────────────
  [StitchType.CAST_ON]:       { label: '起針',             abbr: 'co',       englishName: 'cast on',                       stitchCount: 1 },
  [StitchType.BIND_OFF]:      { label: '收針',             abbr: 'bo',       englishName: 'bind off',                      stitchCount: 1 },
  [StitchType.KNIT]:          { label: '下針',             abbr: 'k',        englishName: 'knit',                          stitchCount: 1 },
  [StitchType.PURL]:          { label: '上針',             abbr: 'p',        englishName: 'purl',                          stitchCount: 1 },
  [StitchType.YARN_OVER]:     { label: '掛針',             abbr: 'yo',       englishName: 'yarn over',                     stitchCount: 1 },
  [StitchType.SLIP_WYIB]:     { label: '滑針',             abbr: 'sl1-wyib', englishName: 'slip 1 with yarn in back',      stitchCount: 1 },
  [StitchType.SLIP_WYIF]:     { label: '浮針',             abbr: 'sl1-wyif', englishName: 'slip 1 with yarn in front',     stitchCount: 1 },
  [StitchType.WRAP_AND_TURN]: { label: '捲針',             abbr: 'w&t',      englishName: 'wrap and turn',                 stitchCount: 1 },

  // ── 棒針減針（2→1）──────────────────────────
  [StitchType.SSK]:   { label: '左上2併針',       abbr: 'ssk',   englishName: 'slip, slip, knit',   stitchCount: 1 },
  [StitchType.SSP]:   { label: '左上2併針（上針）', abbr: 'ssp',   englishName: 'slip, slip, purl',   stitchCount: 1 },
  [StitchType.K2TOG]: { label: '右上2併針',       abbr: 'k2tog', englishName: 'knit 2 together',    stitchCount: 1 },
  [StitchType.P2TOG]: { label: '右上2併針（上針）', abbr: 'p2tog', englishName: 'purl 2 together',    stitchCount: 1 },

  // ── 棒針減針（3→1）──────────────────────────
  [StitchType.SSSK]:  { label: '左上3併針',       abbr: 'sssk',  englishName: 'slip, slip, slip, knit',             stitchCount: 1 },
  [StitchType.SSSP]:  { label: '左上3併針（上針）', abbr: 'sssp',  englishName: 'slip, slip, slip, purl',             stitchCount: 1 },
  [StitchType.K3TOG]: { label: '右上3併針',       abbr: 'k3tog', englishName: 'knit 3 together',                    stitchCount: 1 },
  [StitchType.P3TOG]: { label: '右上3併針（上針）', abbr: 'p3tog', englishName: 'purl 3 together',                    stitchCount: 1 },
  [StitchType.CDD]:   { label: '中上3併針',       abbr: 'cdd',   englishName: 'central double decrease',            stitchCount: 1 },
  [StitchType.CDDP]:  { label: '中上3併針（上針）', abbr: 'cddp',  englishName: 'central double decrease purlwise',   stitchCount: 1 },

  // ── 棒針加針 ──────────────────────────────────
  [StitchType.M1L]:   { label: '左加針',       abbr: 'm1l',   englishName: 'make 1 left',         stitchCount: 2 },
  [StitchType.M1LP]:  { label: '左加針（上針）', abbr: 'm1lp',  englishName: 'make 1 left purlwise', stitchCount: 2 },
  [StitchType.M1R]:   { label: '右加針',       abbr: 'm1r',   englishName: 'make 1 right',        stitchCount: 2 },
  [StitchType.M1RP]:  { label: '右加針（上針）', abbr: 'm1rp',  englishName: 'make 1 right purlwise', stitchCount: 2 },
  [StitchType.K_TBL]: { label: '扭針',         abbr: 'k1-tbl', englishName: 'knit 1 through back loop',  stitchCount: 1 },
  [StitchType.P_TBL]: { label: '扭針（上針）',   abbr: 'p1-tbl', englishName: 'purl 1 through back loop', stitchCount: 1 },

  // ── 棒針麻花／交叉 ───────────────────────────
  [StitchType.CABLE_1_1_RC]:  { label: '右上1針交叉',       abbr: '1/1 RC',  englishName: '1 over 1 right cross',       stitchCount: 1 },
  [StitchType.CABLE_1_1_LC]:  { label: '左上1針交叉',       abbr: '1/1 LC',  englishName: '1 over 1 left cross',        stitchCount: 1 },
  [StitchType.CABLE_2_2_RC]:  { label: '右上2針交叉',       abbr: '2/2 RC',  englishName: '2 over 2 right cross',       stitchCount: 1 },
  [StitchType.CABLE_2_2_LC]:  { label: '左上2針交叉',       abbr: '2/2 LC',  englishName: '2 over 2 left cross',        stitchCount: 1 },
  [StitchType.CABLE_1_1_RPC]: { label: '左套右1針交叉',     abbr: '1/1 RPC', englishName: '1 over 1 right purl cross',  stitchCount: 1 },
  [StitchType.CABLE_1_1_LPC]: { label: '右套左1針交叉',     abbr: '1/1 LPC', englishName: '1 over 1 left purl cross',   stitchCount: 1 },
  [StitchType.CABLE_2_2_RPC]: { label: '左套右2針變化交叉', abbr: '2/2 RPC', englishName: '2 over 2 right purl cross',  stitchCount: 1 },
  [StitchType.CABLE_2_2_LPC]: { label: '右套左2針變化交叉', abbr: '2/2 LPC', englishName: '2 over 2 left purl cross',   stitchCount: 1 },

  // ── 鉤針基礎 ──────────────────────────────────
  [StitchType.MAGIC_RING]:   { label: '魔術環', abbr: 'mr',    englishName: 'magic ring',           stitchCount: 1 },
  [StitchType.CHAIN]:        { label: '鎖針',   abbr: 'ch',    englishName: 'chain',               stitchCount: 1 },
  [StitchType.SLIP_STITCH]:  { label: '引拔針', abbr: 'sl st', englishName: 'slip stitch',          stitchCount: 1 },
  [StitchType.SINGLE]:       { label: '短針',   abbr: 'sc',    englishName: 'single crochet',       stitchCount: 1 },
  [StitchType.HALF_DOUBLE]:  { label: '中長針', abbr: 'hdc',   englishName: 'half double crochet',  stitchCount: 1 },
  [StitchType.DOUBLE]:       { label: '長針',   abbr: 'dc',    englishName: 'double crochet',       stitchCount: 1 },
  [StitchType.TREBLE]:       { label: '長長針', abbr: 'tr',    englishName: 'treble crochet',       stitchCount: 1 },

  // ── 鉤針加針 ──────────────────────────────────
  [StitchType.SC_INC]:  { label: '短針加針',   abbr: 'sc-inc',  englishName: '2 single crochets in 1 st',       stitchCount: 2 },
  [StitchType.HDC_INC]: { label: '中長針加針', abbr: 'hdc-inc', englishName: '2 half double crochets in 1 st',  stitchCount: 2 },
  [StitchType.DC_INC]:  { label: '長針加針',   abbr: 'dc-inc',  englishName: '2 double crochets in 1 st',       stitchCount: 2 },
  [StitchType.TR_INC]:  { label: '長長針加針', abbr: 'tr-inc',  englishName: '2 treble crochets in 1 st',       stitchCount: 2 },

  // ── 鉤針減針 ──────────────────────────────────
  [StitchType.SC2TOG]:  { label: '短針減針',       abbr: 'sc2tog',  englishName: 'single crochet 2 together',        stitchCount: 1 },
  [StitchType.HDC2TOG]: { label: '中長針2併針',    abbr: 'hdc2tog', englishName: 'half double crochet 2 together',   stitchCount: 1 },
  [StitchType.HDC3TOG]: { label: '中長針3併針',    abbr: 'hdc3tog', englishName: 'half double crochet 3 together',   stitchCount: 1 },
  [StitchType.DC2TOG]:  { label: '長針2併針',      abbr: 'dc2tog',  englishName: 'double crochet 2 together',        stitchCount: 1 },
  [StitchType.DC3TOG]:  { label: '長針3併針',      abbr: 'dc3tog',  englishName: 'double crochet 3 together',        stitchCount: 1 },
  [StitchType.TR3TOG]:  { label: '長長針3併針',    abbr: 'tr3tog',  englishName: 'treble crochet 3 together',        stitchCount: 1 },

  // ── 鉤針特殊針法 ──────────────────────────────
  [StitchType.DC3_CLUSTER]:  { label: '3長針玉針',    abbr: '3-dc cluster',  englishName: '3-dc cluster',  stitchCount: 1 },
  [StitchType.HDC3_CLUSTER]: { label: '3中長針玉針',  abbr: '3-hdc cluster', englishName: '3-hdc cluster', stitchCount: 1 },
  [StitchType.DC5_POPCORN]:  { label: '5長針爆米花針', abbr: '5-dc popcorn',  englishName: '5-dc popcorn',  stitchCount: 1 },
  [StitchType.DC5_SHELL]:    { label: '5長針貝殼針',  abbr: '5-dc shell',    englishName: '5-dc shell',    stitchCount: 5 },

  // ── 自訂 ──────────────────────────────────────
  [StitchType.CUSTOM]: { label: '自訂', abbr: 'custom', englishName: 'custom stitch', stitchCount: 1 },
}

/** 加針類型（stitchCount > 1），進度計算時需用 stitchCount 取代預設的 1 */
export const MULTI_COUNT_STITCH_TYPES = new Set<StitchType>(
  (Object.keys(StitchTypeInfo) as StitchType[]).filter(
    (t) => StitchTypeInfo[t].stitchCount > 1
  )
)

// ─── Pattern Item Types ────────────────────────────────────────────────────────

export interface StitchInfo {
  id: string
  type: StitchType
  count: number
  /** 自訂針法名稱（type 為 CUSTOM 時使用）*/
  customName?: string
  /** 自訂針法縮寫（type 為 CUSTOM 時使用）*/
  customAbbr?: string
}

export interface StitchGroup {
  id: string
  name: string
  stitches: StitchInfo[]
  repeatCount: number
  /** 已完成的重複次數，預設為 0 */
  completedRepeats?: number
}

export enum PatternItemType {
  STITCH = 'stitch',
  GROUP = 'group',
}

export interface PatternItem {
  id: string
  type: PatternItemType
  /** 排序用數字，越小越前 */
  order: number
  /** 建立時間（ISO string），作為排序輔助 */
  createdAt: string
  data: StitchInfo | StitchGroup
}

// ─── Round & Chart ────────────────────────────────────────────────────────────

export interface Round {
  id: string
  roundNumber: number
  patternItems: PatternItem[]
  notes?: string
}

export interface Chart {
  id: string
  name: string
  description?: string
  rounds: Round[]
  currentRound: number
  currentStitch: number
  /** 參考織圖圖片的 Expo FileSystem 本地路徑（每張 Chart 一張）*/
  referenceImageUri?: string
  /** ISO string */
  createdAt: string
  /** ISO string */
  updatedAt: string
  isCompleted?: boolean
  notes?: string
  /** 段落計數起始值：0 或 1（未設定時沿用 Project 的預設值）*/
  roundStartNumber?: 0 | 1
}

// ─── Project ──────────────────────────────────────────────────────────────────

export interface ProjectPhoto {
  id: string
  /** Expo FileSystem 本地路徑 */
  uri: string
  type: 'reference' | 'progress'
  isCover: boolean
  /** 壓縮後檔案大小（bytes）*/
  fileSize: number
  /** ISO string */
  createdAt: string
}

export interface WorkSession {
  id: string
  /** ISO string */
  startTime: string
  /** 秒數 */
  duration: number
  roundsCompleted: number
  stitchesCompleted: number
}

export interface Project {
  id: string
  name: string
  craftType: CraftType
  /** 段落計數起始值：0 或 1 */
  roundStartNumber: 0 | 1
  source?: string
  notes?: string
  charts: Chart[]
  currentChartId?: string
  photos: ProjectPhoto[]
  sessions: WorkSession[]
  /** ISO string */
  createdAt: string
  /** ISO string */
  updatedAt: string
  isCompleted?: boolean
  /** 完成後 interstitial 廣告是否已顯示（只顯示一次）*/
  interstitialShown?: boolean
}

// ─── Custom Stitches & Templates ──────────────────────────────────────────────

export interface CustomStitchPattern {
  id: string
  name: string
  abbr: string
  englishName: string
  craftType: CraftType
  description?: string
  /** ISO string */
  createdAt: string
  /** ISO string */
  lastUsed?: string
  useCount: number
}

export interface StitchGroupTemplate {
  id: string
  name: string
  description?: string
  stitches: StitchInfo[]
  repeatCount: number
  category?: string
  /** ISO string */
  createdAt: string
  /** ISO string */
  lastUsed?: string
  useCount: number
}

// ─── Import / Export ──────────────────────────────────────────────────────────

export enum ExportType {
  PATTERN_ONLY = 'pattern_only',
  FULL_PROJECT = 'full_project',
}

export interface ProjectExportData {
  version: string
  exportType: ExportType
  /** ISO string */
  exportDate: string
  project: Omit<Project, 'photos' | 'sessions'>
  /** 可選：匯出時是否包含照片 */
  photos?: ProjectPhoto[]
}

export enum ImportMode {
  CREATE_NEW = 'create_new',
  OVERWRITE_EXISTING = 'overwrite_existing',
  MERGE_PATTERN = 'merge_pattern',
}

export interface ImportResult {
  success: boolean
  project?: Project
  errors: string[]
  warnings: string[]
}

// ─── Chart Summary (UI helper) ────────────────────────────────────────────────

export interface ChartSummary {
  id: string
  name: string
  roundCount: number
  totalStitches: number
  /** 0–100 */
  currentProgress: number
  isCompleted: boolean
  /** ISO string */
  updatedAt: string
}

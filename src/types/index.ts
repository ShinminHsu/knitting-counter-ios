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
  BACKWARD_LOOP_CO = 'backward_loop_co',
  K_TBL = 'k_tbl',
  P_TBL = 'p_tbl',

  // ── 棒針減針（2→1）──────────────────────────
  K2TOG = 'k2tog',
  P2TOG = 'p2tog',
  SSK = 'ssk',
  SSP = 'ssp',

  // ── 棒針減針（3→1）──────────────────────────
  K3TOG = 'k3tog',
  P3TOG = 'p3tog',
  SSSK = 'sssk',
  SSSP = 'sssp',
  S2KP2 = 's2kp2',
  SSPP2 = 'sspp2',

  // ── 棒針加針 ──────────────────────────────────
  LLI = 'lli',
  LLPI = 'llpi',
  RLI = 'rli',
  RLPI = 'rlpi',

  // ── 棒針麻花／交叉 ───────────────────────────
  CABLE_2ST_RC = 'cable_2st_rc',
  CABLE_2ST_LC = 'cable_2st_lc',
  CABLE_2ST_RPC = 'cable_2st_rpc',
  CABLE_2ST_LPC = 'cable_2st_lpc',

  // ── 鉤針基礎 ──────────────────────────────────
  MAGIC_RING = 'magic_ring',
  CHAIN = 'chain',
  SLIP_STITCH = 'slip_stitch',
  SINGLE = 'single',
  HALF_DOUBLE = 'half_double',
  DOUBLE = 'double',
  TREBLE = 'treble',
  CH3_PICOT = 'ch3_picot',
  DTR = 'dtr',

  // ── 鉤針加針 ──────────────────────────────────
  SC_INC = 'sc_inc',
  SC3INC = 'sc3inc',
  HDC_INC = 'hdc_inc',
  HDC3_INC = 'hdc3_inc',
  DC_INC = 'dc_inc',
  DC3_INC = 'dc3_inc',

  // ── 鉤針減針 ──────────────────────────────────
  SC2TOG = 'sc2tog',
  SC3TOG = 'sc3tog',
  HDC2TOG = 'hdc2tog',
  HDC3TOG = 'hdc3tog',
  DC2TOG = 'dc2tog',
  DC3TOG = 'dc3tog',

  // ── 鉤針特殊針法 ──────────────────────────────
  DC3_CLUSTER = 'dc3_cluster',
  HDC3_CLUSTER = 'hdc3_cluster',
  DC5_POPCORN = 'dc5_popcorn',
  DC5_SHELL = 'dc5_shell',

  // ── 自訂（通用）──────────────────────────────
  CUSTOM = 'custom',
}

export interface StitchTypeDetails {
  /** 英文縮寫（UI 顯示用） */
  abbr: string
  /** 英文全名（搜尋用）*/
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
  [StitchType.CAST_ON]:         { abbr: 'co',              englishName: 'cast on',                       stitchCount: 1 },
  [StitchType.BIND_OFF]:        { abbr: 'bo',              englishName: 'bind off',                      stitchCount: 1 },
  [StitchType.KNIT]:            { abbr: 'k',               englishName: 'knit',                          stitchCount: 1 },
  [StitchType.PURL]:            { abbr: 'p',               englishName: 'purl',                          stitchCount: 1 },
  [StitchType.YARN_OVER]:       { abbr: 'yo',              englishName: 'yarn over',                     stitchCount: 1 },
  [StitchType.SLIP_WYIB]:       { abbr: 'sl1-wyib',        englishName: 'slip 1 with yarn in back',      stitchCount: 1 },
  [StitchType.SLIP_WYIF]:       { abbr: 'sl1-wyif',        englishName: 'slip 1 with yarn in front',     stitchCount: 1 },
  [StitchType.BACKWARD_LOOP_CO]:{ abbr: 'backward loop co',englishName: 'Backward Loop Cast-on',         stitchCount: 1 },
  [StitchType.K_TBL]:           { abbr: 'k1 tbl',          englishName: 'knit 1 through back loop',      stitchCount: 1 },
  [StitchType.P_TBL]:           { abbr: 'p1 tbl',          englishName: 'purl 1 through back loop',      stitchCount: 1 },

  // ── 棒針減針（2→1）──────────────────────────
  [StitchType.K2TOG]: { abbr: 'k2tog', englishName: 'knit 2 together',  stitchCount: 1 },
  [StitchType.P2TOG]: { abbr: 'p2tog', englishName: 'purl 2 together',  stitchCount: 1 },
  [StitchType.SSK]:   { abbr: 'ssk',   englishName: 'slip slip knit',   stitchCount: 1 },
  [StitchType.SSP]:   { abbr: 'ssp',   englishName: 'slip slip purl',   stitchCount: 1 },

  // ── 棒針減針（3→1）──────────────────────────
  [StitchType.K3TOG]: { abbr: 'k3tog', englishName: 'knit 3 together',              stitchCount: 1 },
  [StitchType.P3TOG]: { abbr: 'p3tog', englishName: 'purl 3 together',              stitchCount: 1 },
  [StitchType.SSSK]:  { abbr: 'sssk',  englishName: 'slip slip slip knit',          stitchCount: 1 },
  [StitchType.SSSP]:  { abbr: 'sssp',  englishName: 'slip slip slip purl',          stitchCount: 1 },
  [StitchType.S2KP2]: { abbr: 's2kp2', englishName: 'slip 2 knit 1 pass 2 over',   stitchCount: 1 },
  [StitchType.SSPP2]: { abbr: 'sspp2', englishName: 'slip slip purl pass 2 over',  stitchCount: 1 },

  // ── 棒針加針 ──────────────────────────────────
  [StitchType.LLI]:  { abbr: 'lli',  englishName: 'left lifted increase',       stitchCount: 2 },
  [StitchType.LLPI]: { abbr: 'llpi', englishName: 'left lifted purl increase',  stitchCount: 2 },
  [StitchType.RLI]:  { abbr: 'rli',  englishName: 'right lifted increase',      stitchCount: 2 },
  [StitchType.RLPI]: { abbr: 'rlpi', englishName: 'right lifted purl increase', stitchCount: 2 },

  // ── 棒針麻花／交叉 ───────────────────────────
  [StitchType.CABLE_2ST_RC]:  { abbr: '2-st RC',  englishName: '2-st right cross',      stitchCount: 1 },
  [StitchType.CABLE_2ST_LC]:  { abbr: '2-st LC',  englishName: '2-st left cross',       stitchCount: 1 },
  [StitchType.CABLE_2ST_RPC]: { abbr: '2-st RPC', englishName: '2-st right purl cross', stitchCount: 1 },
  [StitchType.CABLE_2ST_LPC]: { abbr: '2-st LPC', englishName: '2-st left purl cross',  stitchCount: 1 },

  // ── 鉤針基礎 ──────────────────────────────────
  [StitchType.MAGIC_RING]:  { abbr: 'mr',        englishName: 'magic ring',             stitchCount: 1 },
  [StitchType.CHAIN]:       { abbr: 'ch',        englishName: 'chain',                  stitchCount: 1 },
  [StitchType.SLIP_STITCH]: { abbr: 'sl st',     englishName: 'slip stitch',            stitchCount: 1 },
  [StitchType.SINGLE]:      { abbr: 'sc',        englishName: 'single crochet',         stitchCount: 1 },
  [StitchType.HALF_DOUBLE]: { abbr: 'hdc',       englishName: 'half double crochet',    stitchCount: 1 },
  [StitchType.DOUBLE]:      { abbr: 'dc',        englishName: 'double crochet',         stitchCount: 1 },
  [StitchType.TREBLE]:      { abbr: 'tr',        englishName: 'treble crochet',         stitchCount: 1 },
  [StitchType.CH3_PICOT]:   { abbr: 'ch-3 picot',englishName: 'ch-3 picot',             stitchCount: 1 },
  [StitchType.DTR]:         { abbr: 'dtr',       englishName: 'double treble crochet',  stitchCount: 1 },

  // ── 鉤針加針 ──────────────────────────────────
  [StitchType.SC_INC]:   { abbr: 'sc inc',   englishName: '2 single crochets in 1 st',      stitchCount: 2 },
  [StitchType.SC3INC]:   { abbr: 'sc3inc',   englishName: '3 single crochets in 1 st',      stitchCount: 3 },
  [StitchType.HDC_INC]:  { abbr: 'hdc inc',  englishName: '2 half double crochets in 1 st', stitchCount: 2 },
  [StitchType.HDC3_INC]: { abbr: 'hdc3inc',  englishName: '3 half double crochets in 1 st', stitchCount: 3 },
  [StitchType.DC_INC]:   { abbr: 'dc inc',   englishName: '2 double crochets in 1 st',      stitchCount: 2 },
  [StitchType.DC3_INC]:  { abbr: 'dc3inc',   englishName: '3 double crochets in 1 st',      stitchCount: 3 },

  // ── 鉤針減針 ──────────────────────────────────
  [StitchType.SC2TOG]:  { abbr: 'sc2tog',  englishName: 'single crochet 2 together',      stitchCount: 1 },
  [StitchType.SC3TOG]:  { abbr: 'sc3tog',  englishName: 'single crochet 3 together',      stitchCount: 1 },
  [StitchType.HDC2TOG]: { abbr: 'hdc2tog', englishName: 'half double crochet 2 together', stitchCount: 1 },
  [StitchType.HDC3TOG]: { abbr: 'hdc3tog', englishName: 'half double crochet 3 together', stitchCount: 1 },
  [StitchType.DC2TOG]:  { abbr: 'dc2tog',  englishName: 'double crochet 2 together',      stitchCount: 1 },
  [StitchType.DC3TOG]:  { abbr: 'dc3tog',  englishName: 'double crochet 3 together',      stitchCount: 1 },

  // ── 鉤針特殊針法 ──────────────────────────────
  [StitchType.DC3_CLUSTER]:  { abbr: '3dc-clu',    englishName: '3-dc cluster',  stitchCount: 1 },
  [StitchType.HDC3_CLUSTER]: { abbr: '3hdc-clu',   englishName: '3-hdc cluster', stitchCount: 1 },
  [StitchType.DC5_POPCORN]:  { abbr: '5dc popcorn',englishName: '5-dc popcorn',  stitchCount: 1 },
  [StitchType.DC5_SHELL]:    { abbr: '5dc shell',   englishName: '5-dc shell',    stitchCount: 5 },

  // ── 自訂 ──────────────────────────────────────
  [StitchType.CUSTOM]: { abbr: 'custom', englishName: 'custom stitch', stitchCount: 1 },
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
  /** 適用的編織類型，未設定時預設顯示鉤針針法 */
  craftType?: CraftType
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

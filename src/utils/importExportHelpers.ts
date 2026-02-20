import {
  ExportType,
  ImportMode,
  ImportResult,
  Project,
  ProjectExportData,
} from '../types'

/** 匯出資料格式版本，與 Web 版保持一致 */
export const EXPORT_VERSION = '1.0'

// ─── Export ───────────────────────────────────────────────────────────────────

/**
 * 將 Project 序列化為匯出用的 JSON 物件（Req 8.1）
 * 預設不含照片；傳入 includePhotos=true 時包含
 */
export function buildExportData(
  project: Project,
  includePhotos: boolean = false
): ProjectExportData {
  const { photos, sessions, ...projectWithoutBinary } = project
  return {
    version: EXPORT_VERSION,
    exportType: ExportType.FULL_PROJECT,
    exportDate: new Date().toISOString(),
    project: projectWithoutBinary,
    ...(includePhotos ? { photos } : {}),
  }
}

/** 將匯出物件序列化為 JSON 字串，供 Share Sheet 使用 */
export function serializeExportData(data: ProjectExportData): string {
  return JSON.stringify(data, null, 2)
}

// ─── Import Validation ─────────────────────────────────────────────────────────

/**
 * 驗證匯入的 JSON 資料是否符合格式（Req 8.4）
 * 回傳 { valid: true } 或 { valid: false, errors: string[] }
 */
export function validateImportData(
  raw: unknown
): { valid: true; data: ProjectExportData } | { valid: false; errors: string[] } {
  const errors: string[] = []

  if (typeof raw !== 'object' || raw === null) {
    return { valid: false, errors: ['資料格式錯誤：不是有效的 JSON 物件'] }
  }

  const obj = raw as Record<string, unknown>

  if (typeof obj.version !== 'string') {
    errors.push('缺少欄位：version')
  }
  if (typeof obj.exportDate !== 'string') {
    errors.push('缺少欄位：exportDate')
  }
  if (!Object.values(ExportType).includes(obj.exportType as ExportType)) {
    errors.push(`exportType 不合法：${String(obj.exportType)}`)
  }

  const project = obj.project
  if (typeof project !== 'object' || project === null) {
    errors.push('缺少欄位：project')
  } else {
    const p = project as Record<string, unknown>
    if (typeof p.id !== 'string') errors.push('project.id 缺少或格式錯誤')
    if (typeof p.name !== 'string') errors.push('project.name 缺少或格式錯誤')
    if (p.craftType !== 'crochet' && p.craftType !== 'knitting') {
      errors.push(`project.craftType 不合法：${String(p.craftType)}`)
    }
    if (!Array.isArray(p.charts)) errors.push('project.charts 缺少或不是陣列')
  }

  if (errors.length > 0) {
    return { valid: false, errors }
  }

  return { valid: true, data: raw as ProjectExportData }
}

/**
 * 解析 JSON 字串並驗證（Req 8.4）
 * 同時處理 JSON.parse 失敗與格式驗證
 */
export function parseAndValidateImport(
  jsonString: string
): { valid: true; data: ProjectExportData } | { valid: false; errors: string[] } {
  let parsed: unknown
  try {
    parsed = JSON.parse(jsonString)
  } catch {
    return { valid: false, errors: ['無法解析 JSON：檔案格式不正確'] }
  }
  return validateImportData(parsed)
}

// ─── Import Result Helpers ─────────────────────────────────────────────────────

/** 建立匯入成功的結果 */
export function importSuccess(project: Project, warnings: string[] = []): ImportResult {
  return { success: true, project, errors: [], warnings }
}

/** 建立匯入失敗的結果 */
export function importFailure(errors: string[], warnings: string[] = []): ImportResult {
  return { success: false, errors, warnings }
}

/**
 * 依 ImportMode 取得對應的操作說明文字（UI 用）
 */
export function importModeLabel(mode: ImportMode): string {
  switch (mode) {
    case ImportMode.CREATE_NEW:
      return '建立新專案'
    case ImportMode.OVERWRITE_EXISTING:
      return '覆寫現有專案'
    case ImportMode.MERGE_PATTERN:
      return '合併織圖'
  }
}

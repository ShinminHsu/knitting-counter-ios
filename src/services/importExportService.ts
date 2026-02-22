import * as FileSystem from 'expo-file-system/legacy'
import * as Sharing from 'expo-sharing'
import * as DocumentPicker from 'expo-document-picker'
import { Project, ProjectExportData, ExportType } from '../types'
import { generateId, nowISO } from '../utils/helpers'

// ─── exportProject ────────────────────────────────────────────────────────────

/**
 * Export a project to JSON and share via iOS Share Sheet (Req 8.1)
 * @param project The project to export
 * @param includePhotos Whether to include photo data (Req 8.5) - default false
 */
export async function exportProject(
  project: Project,
  includePhotos: boolean = false
): Promise<void> {
  const projectData: Omit<Project, 'photos' | 'sessions'> = {
    id: project.id,
    name: project.name,
    craftType: project.craftType,
    roundStartNumber: project.roundStartNumber,
    source: project.source,
    notes: project.notes,
    charts: project.charts,
    currentChartId: project.currentChartId,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
    isCompleted: project.isCompleted,
    interstitialShown: project.interstitialShown,
  }

  const exportData: ProjectExportData = {
    version: '1.0',
    exportType: ExportType.FULL_PROJECT,
    exportDate: nowISO(),
    project: projectData,
    photos: includePhotos ? project.photos : undefined,
  }

  const json = JSON.stringify(exportData, null, 2)
  const filePath = `${FileSystem.documentDirectory}export_${project.id}.json`

  try {
    await FileSystem.writeAsStringAsync(filePath, json, {
      encoding: FileSystem.EncodingType.UTF8,
    })
    await Sharing.shareAsync(filePath, {
      mimeType: 'application/json',
      dialogTitle: '匯出專案',
    })
  } finally {
    await FileSystem.deleteAsync(filePath, { idempotent: true })
  }
}

// ─── pickImportFile ───────────────────────────────────────────────────────────

/**
 * Let user pick a JSON file to import (Req 8.2)
 * Returns the file URI or null if cancelled
 */
export async function pickImportFile(): Promise<string | null> {
  const result = await DocumentPicker.getDocumentAsync({
    type: 'application/json',
    copyToCacheDirectory: true,
  })

  if (result.canceled || !result.assets || result.assets.length === 0) {
    return null
  }

  return result.assets[0].uri
}

// ─── parseImportFile ──────────────────────────────────────────────────────────

/**
 * Read and parse a JSON file from URI
 * Returns parsed data or throws with descriptive error message (Req 8.4)
 */
export async function parseImportFile(uri: string): Promise<ProjectExportData> {
  let content: string
  try {
    content = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.UTF8,
    })
  } catch {
    throw new Error('無法讀取檔案，請確認檔案是否存在且可讀取')
  }

  let data: unknown
  try {
    data = JSON.parse(content)
  } catch {
    throw new Error('檔案格式錯誤：無法解析 JSON 內容')
  }

  validateImportData(data)
  return data as ProjectExportData
}

// ─── validateImportData ───────────────────────────────────────────────────────

/**
 * Validate import data structure
 * Returns true if valid, throws Error with descriptive message if invalid
 */
export function validateImportData(data: unknown): data is ProjectExportData {
  if (typeof data !== 'object' || data === null || Array.isArray(data)) {
    throw new Error('無效的檔案格式：根資料必須是物件')
  }

  const obj = data as Record<string, unknown>

  if (typeof obj['project'] !== 'object' || obj['project'] === null || Array.isArray(obj['project'])) {
    throw new Error('缺少必要欄位：project')
  }

  const project = obj['project'] as Record<string, unknown>

  if (typeof project['id'] !== 'string' || project['id'] === '') {
    throw new Error('缺少必要欄位：project.id')
  }

  if (typeof project['name'] !== 'string' || project['name'] === '') {
    throw new Error('缺少必要欄位：project.name')
  }

  if (!Array.isArray(project['charts'])) {
    throw new Error('缺少必要欄位：project.charts')
  }

  if (project['craftType'] !== 'crochet' && project['craftType'] !== 'knitting') {
    throw new Error('無效的 craftType 值：必須是 "crochet" 或 "knitting"')
  }

  return true
}

// ─── prepareProjectForImport ──────────────────────────────────────────────────

/**
 * Prepare an imported project for insertion (assign new ID to avoid conflicts)
 * Used for ImportMode.CREATE_NEW
 */
export function prepareProjectForImport(exportData: ProjectExportData): Project {
  const now = nowISO()
  const newProject: Project = {
    ...exportData.project,
    id: generateId(),
    createdAt: now,
    updatedAt: now,
    photos: [],
    sessions: [],
  }
  return newProject
}

// ─── mergeProjectCharts ───────────────────────────────────────────────────────

/**
 * Merge charts from exported data into an existing project
 * Used for ImportMode.MERGE_PATTERN
 * New IDs are assigned to imported charts to avoid conflicts.
 */
export function mergeProjectCharts(existing: Project, exportData: ProjectExportData): Project {
  const now = nowISO()
  const importedCharts = exportData.project.charts.map((chart) => ({
    ...chart,
    id: generateId(),
    createdAt: now,
    updatedAt: now,
  }))
  return {
    ...existing,
    charts: [...existing.charts, ...importedCharts],
    updatedAt: now,
  }
}

// ─── prepareOverwriteProject ──────────────────────────────────────────────────

/**
 * Prepare an imported project to overwrite an existing one.
 * Preserves the existing project's ID, photos, and sessions.
 * Used for ImportMode.OVERWRITE_EXISTING
 */
export function prepareOverwriteProject(existing: Project, exportData: ProjectExportData): Project {
  const now = nowISO()
  return {
    ...exportData.project,
    id: existing.id,
    photos: existing.photos,
    sessions: existing.sessions,
    updatedAt: now,
  }
}

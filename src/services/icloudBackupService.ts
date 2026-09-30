import * as FileSystem from 'expo-file-system/legacy'
import { AppState } from 'react-native'
import { CloudKVStorage, CloudStorage, CloudStorageScope } from 'react-native-cloud-storage'
import { sha256 } from 'js-sha256'
import {
  BackupLibraryFile,
  BackupManifest,
  BackupProjectFile,
  BackupState,
  Project,
  ProjectPhoto,
} from '../types'
import { mmkv, STORAGE_KEYS } from '../stores/mmkvStorage'
import { useProjectStore } from '../stores/useProjectStore'
import { useCustomStitchStore } from '../stores/useCustomStitchStore'
import { useTemplateStore } from '../stores/useTemplateStore'
import { useSettingsStore } from '../stores/useSettingsStore'
import { AD_PHOTO_SLOTS, AD_PROJECT_SLOTS, useEntitlementStore } from '../stores/useEntitlementStore'
import { validateProjectShape } from '../utils/importExportHelpers'
import { PHOTO_DIR } from '../utils/photoPathUtils'
import { resolvePhotoUri } from './photoService'
import { redeemVoucher } from './voucherService'

// ─── Constants ────────────────────────────────────────────────────────────────

export const BACKUP_SCHEMA_VERSION = 1

/** 所有備份檔都放在 iCloud container 的 AppData scope（不會出現在「檔案」App） */
const SCOPE = CloudStorageScope.AppData
const MANIFEST_PATH = 'manifest.json'
const LIBRARY_PATH = 'library.json'
const PROJECTS_DIR = 'projects'
const PHOTOS_DIR = 'photos'
const ENTITLEMENTS_KV_KEY = 'entitlements.v1'

const FLUSH_DEBOUNCE_MS = 5000
const SYNC_RETRY_DELAY_MS = 2000
const SYNC_READ_ATTEMPTS = 4
const PHOTO_READ_ATTEMPTS = 3
const RESTORE_CHECK_ATTEMPTS = 3

const projectPath = (projectId: string) => `${PROJECTS_DIR}/${projectId}.json`
const photoDirPath = (projectId: string) => `${PHOTOS_DIR}/${projectId}`
const photoPath = (projectId: string, photoId: string) => `${photoDirPath(projectId)}/${photoId}.b64`

const cloud = () => CloudStorage.getDefaultInstance()
const kv = () => CloudKVStorage.getDefaultInstance()

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

function logDev(action: string, path: string): void {
  if (__DEV__) console.log(`[iCloudBackup] ${action} ${path}`)
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface RestorableBackup {
  projectCount: number
  /** ISO string */
  updatedAt: string
}

export type RestoreOutcome =
  | { status: 'restored'; restored: number; failed: number }
  | { status: 'noBackup' }
  | { status: 'unsupportedVersion' }
  | { status: 'unavailable' }
  | { status: 'error' }

// ─── Backup state (MMKV) ──────────────────────────────────────────────────────

const DEFAULT_BACKUP_STATE: BackupState = {
  uploadedProjects: {},
  uploadedPhotos: {},
  libraryHash: null,
  lastBackupAt: null,
  lastError: null,
  restorePromptHandled: false,
}

const stateListeners = new Set<() => void>()

export function getBackupState(): BackupState {
  const raw = mmkv.getString(STORAGE_KEYS.BACKUP_STATE)
  if (!raw) return { ...DEFAULT_BACKUP_STATE, uploadedProjects: {}, uploadedPhotos: {} }
  try {
    return { ...DEFAULT_BACKUP_STATE, ...(JSON.parse(raw) as Partial<BackupState>) }
  } catch {
    return { ...DEFAULT_BACKUP_STATE, uploadedProjects: {}, uploadedPhotos: {} }
  }
}

function saveBackupState(state: BackupState): void {
  mmkv.set(STORAGE_KEYS.BACKUP_STATE, JSON.stringify(state))
  stateListeners.forEach((listener) => listener())
}

export function subscribeBackupState(listener: () => void): () => void {
  stateListeners.add(listener)
  return () => {
    stateListeners.delete(listener)
  }
}

export function markRestorePromptHandled(): void {
  saveBackupState({ ...getBackupState(), restorePromptHandled: true })
}

// ─── iCloud availability ──────────────────────────────────────────────────────

export async function isICloudAvailable(): Promise<boolean> {
  // 帳號層級：是否登入 iCloud
  if (!(await cloud().isCloudAvailable())) return false
  try {
    // 容器層級：iCloud 雲碟可能只對 Stitchie 關閉，此時帳號還在但讀不到容器
    await cloud().readdir('/', SCOPE)
    return true
  } catch {
    return false
  }
}

export function subscribeICloudAvailability(listener: (available: boolean) => void): () => void {
  cloud().subscribeToCloudAvailability(listener)
  return () => cloud().unsubscribeFromCloudAvailability(listener)
}

// ─── Remote file helpers ──────────────────────────────────────────────────────

/** 讀取 iCloud 檔案；重裝後檔案可能只有佔位檔，第一次失敗時要求下載再重試 */
async function readTextWithSync(path: string, attempts = SYNC_READ_ATTEMPTS): Promise<string> {
  let lastError: unknown
  for (let attempt = 0; attempt < attempts; attempt++) {
    try {
      return await cloud().readFile(path, SCOPE)
    } catch (error) {
      lastError = error
    }
    if (attempt === 0) await cloud().triggerSync(path, SCOPE).catch(() => {})
    if (attempt < attempts - 1) await sleep(SYNC_RETRY_DELAY_MS)
  }
  throw lastError
}

/** iCloud 是否知道這個檔案（包含尚未下載的 `.<name>.icloud` 佔位檔） */
async function isListedInCloud(path: string): Promise<boolean> {
  const slash = path.lastIndexOf('/')
  const dir = slash >= 0 ? path.slice(0, slash) : '/'
  const name = path.slice(slash + 1)
  const entries = await cloud().readdir(dir, SCOPE).catch((): string[] => [])
  return entries.some((entry) => entry === name || entry === `.${name}.icloud`)
}

async function ensureCloudDir(path: string): Promise<void> {
  if (!(await cloud().exists(path, SCOPE))) await cloud().mkdir(path, SCOPE)
}

async function writeToCloud(path: string, data: string): Promise<void> {
  await cloud().writeFile(path, data, SCOPE)
  logDev('wrote', path)
}

async function removeFromCloud(path: string, isDirectory: boolean): Promise<void> {
  if (!(await cloud().exists(path, SCOPE))) return
  if (isDirectory) {
    await cloud().rmdir(path, { recursive: true }, SCOPE)
  } else {
    await cloud().unlink(path, SCOPE)
  }
  logDev('deleted', path)
}

function parseManifest(raw: string): BackupManifest {
  const data = JSON.parse(raw) as Partial<BackupManifest>
  if (
    typeof data.schemaVersion !== 'number' ||
    typeof data.projects !== 'object' || data.projects === null ||
    typeof data.deleted !== 'object' || data.deleted === null
  ) {
    throw new Error('Invalid backup manifest')
  }
  return data as BackupManifest
}

/** 讀取 iCloud 上的 manifest：沒有備份時回傳 null；檔案存在但讀不到時拋出錯誤 */
async function loadRemoteManifest(): Promise<BackupManifest | null> {
  try {
    return parseManifest(await cloud().readFile(MANIFEST_PATH, SCOPE))
  } catch {
    // 本機沒有可讀的副本，改確認 iCloud 上是否真的有這個檔案
  }
  if (!(await isListedInCloud(MANIFEST_PATH))) return null
  return parseManifest(await readTextWithSync(MANIFEST_PATH))
}

function emptyManifest(): BackupManifest {
  return { schemaVersion: BACKUP_SCHEMA_VERSION, updatedAt: new Date().toISOString(), projects: {}, deleted: {} }
}

function currentLibrary() {
  const { customStitches } = useCustomStitchStore.getState()
  const { templates } = useTemplateStore.getState()
  // 自訂針法與範本沒有 updatedAt，用內容雜湊判斷是否需要重新上傳
  return { customStitches, templates, hash: sha256(JSON.stringify({ customStitches, templates })) }
}

// ─── Flush ────────────────────────────────────────────────────────────────────

let flushRunning: Promise<void> | null = null
let flushFollowUp: Promise<void> | null = null
let followUpForce = false
let debounceTimer: ReturnType<typeof setTimeout> | null = null
let restoreInProgress = false

async function backUpProject(
  project: Project,
  state: BackupState,
  force: boolean,
  errors: string[]
): Promise<boolean> {
  let wrote = false
  const photos = project.photos ?? []
  const uploaded = new Set(state.uploadedPhotos[project.id] ?? [])

  const pendingPhotos = photos.filter((photo) => !uploaded.has(photo.id))
  if (pendingPhotos.length > 0) {
    try {
      await ensureCloudDir(photoDirPath(project.id))
      for (const photo of pendingPhotos) {
        const localUri = resolvePhotoUri(photo.uri)
        // 本機檔案已不存在的照片（孤兒 metadata）略過，交給專案頁的清理邏輯
        if (!(await FileSystem.getInfoAsync(localUri)).exists) continue
        try {
          const base64 = await FileSystem.readAsStringAsync(localUri, { encoding: FileSystem.EncodingType.Base64 })
          await writeToCloud(photoPath(project.id, photo.id), base64)
          uploaded.add(photo.id)
          wrote = true
        } catch (error) {
          errors.push(errorMessage(error))
        }
      }
    } catch (error) {
      errors.push(errorMessage(error))
    }
  }

  // 已從專案移除的照片：刪除 iCloud 上的檔案；刪除失敗就保留追蹤，下次重試
  const currentPhotoIds = new Set(photos.map((photo) => photo.id))
  for (const photoId of [...uploaded]) {
    if (currentPhotoIds.has(photoId)) continue
    try {
      await removeFromCloud(photoPath(project.id, photoId), false)
      uploaded.delete(photoId)
      wrote = true
    } catch (error) {
      errors.push(errorMessage(error))
    }
  }
  state.uploadedPhotos[project.id] = [...uploaded]

  if (force || state.uploadedProjects[project.id] !== project.updatedAt) {
    try {
      const file: BackupProjectFile = {
        schemaVersion: BACKUP_SCHEMA_VERSION,
        savedAt: new Date().toISOString(),
        project,
      }
      await writeToCloud(projectPath(project.id), JSON.stringify(file))
      state.uploadedProjects[project.id] = project.updatedAt
      wrote = true
    } catch (error) {
      errors.push(errorMessage(error))
    }
  }

  return wrote
}

async function performFlush(force: boolean): Promise<void> {
  if (restoreInProgress) return
  if (!useSettingsStore.getState().iCloudBackupEnabled) {
    logDev('skipped', 'backup toggle is off')
    return
  }
  if (!(await isICloudAvailable())) {
    logDev('skipped', 'iCloud unavailable')
    return
  }

  const state = getBackupState()
  const { projects, deletedProjects } = useProjectStore.getState()
  const errors: string[] = []

  let manifest: BackupManifest
  try {
    const remoteManifest = await loadRemoteManifest()
    // iCloud 上的備份被外部刪除（系統設定刪除 App 資料、關閉再開啟 iCloud 雲碟）：
    // 本機紀錄會誤以為檔案還在，清空後重新完整上傳
    if (!remoteManifest && (Object.keys(state.uploadedProjects).length > 0 || state.libraryHash !== null)) {
      logDev('reset', 'cloud backup missing, re-uploading everything')
      state.uploadedProjects = {}
      state.uploadedPhotos = {}
      state.libraryHash = null
    }
    manifest = remoteManifest ?? emptyManifest()
  } catch (error) {
    saveBackupState({ ...state, lastError: errorMessage(error) })
    return
  }
  // 較新版本 App 建立的備份不覆寫
  if (manifest.schemaVersion > BACKUP_SCHEMA_VERSION) return
  const manifestBefore = JSON.stringify(manifest)

  // 還原決定前：iCloud 上有這次安裝沒上傳過的專案，不能讓本機資料覆蓋備份
  let skipLibrary = false
  if (!state.restorePromptHandled) {
    const unknownRemoteIds = Object.keys(manifest.projects).filter(
      (id) => !(id in manifest.deleted) && !(id in state.uploadedProjects)
    )
    if (unknownRemoteIds.length === 0) {
      state.restorePromptHandled = true
    } else if (projects.length === 0) {
      logDev('skipped', 'waiting for the restore decision')
      return
    } else {
      // 使用者在還原提示前就建立了專案：照常備份專案（manifest 會合併），但保留 iCloud 上的 library
      skipLibrary = true
      logDev('skipped', 'library.json (restore decision pending)')
    }
  }

  let wrote = false
  try {
    await ensureCloudDir(PROJECTS_DIR)
    await ensureCloudDir(PHOTOS_DIR)
  } catch (error) {
    saveBackupState({ ...state, lastError: errorMessage(error) })
    return
  }

  for (const project of projects) {
    wrote = (await backUpProject(project, state, force, errors)) || wrote
    saveBackupState(state)
  }

  // Tombstones：只刪除本機明確刪除過的專案，其他 iCloud 上的專案一律保留
  const clearedTombstones: string[] = []
  for (const [projectId, deletedAt] of Object.entries(deletedProjects)) {
    try {
      await removeFromCloud(projectPath(projectId), false)
      await removeFromCloud(photoDirPath(projectId), true)
      delete manifest.projects[projectId]
      manifest.deleted[projectId] = deletedAt
      delete state.uploadedProjects[projectId]
      delete state.uploadedPhotos[projectId]
      clearedTombstones.push(projectId)
    } catch (error) {
      errors.push(errorMessage(error))
    }
  }

  // 每次都把已上傳的本機專案寫回 manifest，前一次 manifest 寫入失敗也能自動補上
  for (const project of projects) {
    const uploadedAt = state.uploadedProjects[project.id]
    if (!uploadedAt) continue
    manifest.projects[project.id] = uploadedAt
    delete manifest.deleted[project.id]
  }

  if (!skipLibrary) {
    const { customStitches, templates, hash } = currentLibrary()
    if (force || hash !== state.libraryHash) {
      try {
        const file: BackupLibraryFile = {
          schemaVersion: BACKUP_SCHEMA_VERSION,
          savedAt: new Date().toISOString(),
          customStitches,
          templates,
        }
        await writeToCloud(LIBRARY_PATH, JSON.stringify(file))
        state.libraryHash = hash
        wrote = true
      } catch (error) {
        errors.push(errorMessage(error))
      }
    }
  }

  // manifest 最後寫，確保它列出的專案檔都已經寫入
  manifest.schemaVersion = BACKUP_SCHEMA_VERSION
  if (force || wrote || JSON.stringify(manifest) !== manifestBefore) {
    manifest.updatedAt = new Date().toISOString()
    try {
      await writeToCloud(MANIFEST_PATH, JSON.stringify(manifest))
      wrote = true
      if (clearedTombstones.length > 0) {
        useProjectStore.getState().clearTombstones(clearedTombstones)
      }
    } catch (error) {
      errors.push(errorMessage(error))
    }
  }

  state.lastError = errors[0] ?? null
  if ((wrote || force) && errors.length === 0) {
    state.lastBackupAt = new Date().toISOString()
  }
  saveBackupState(state)
}

/**
 * 執行一次備份。同一時間只跑一個 flush；執行中再呼叫會排入恰好一個後續 flush。
 * performFlush 不會拋出錯誤，失敗記錄在 BackupState.lastError。
 */
export function flushBackup({ force = false }: { force?: boolean } = {}): Promise<void> {
  if (!flushRunning) {
    flushRunning = performFlush(force).finally(() => {
      flushRunning = null
    })
    return flushRunning
  }
  followUpForce = followUpForce || force
  if (!flushFollowUp) {
    flushFollowUp = flushRunning.then(() => {
      const nextForce = followUpForce
      flushFollowUp = null
      followUpForce = false
      return flushBackup({ force: nextForce })
    })
  }
  return flushFollowUp
}

function scheduleFlush(): void {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    debounceTimer = null
    void flushBackup()
  }, FLUSH_DEBOUNCE_MS)
}

/** 立即備份（App 進背景、離開追蹤頁） */
export function flushBackupNow(): void {
  if (debounceTimer) {
    clearTimeout(debounceTimer)
    debounceTimer = null
  }
  void flushBackup()
}

// ─── Entitlements (iCloud key-value store) ────────────────────────────────────

interface EntitlementSnapshot {
  voucherCode: string | null
  adUnlockedProjectCount: number
  adUnlockedPhotoCount: number
  templateUnlocked: boolean
  unlockedStitchCategories: Record<string, boolean>
}

function entitlementSnapshot(): EntitlementSnapshot {
  const s = useEntitlementStore.getState()
  return {
    // IAP 的 premium 不寫入 iCloud，由 restorePurchases() 恢復
    voucherCode: s.premiumSource === 'voucher' ? s.voucherCode : null,
    adUnlockedProjectCount: s.adUnlockedProjectCount,
    adUnlockedPhotoCount: s.adUnlockedPhotoCount,
    templateUnlocked: s.templateUnlocked,
    unlockedStitchCategories: { ...s.unlockedStitchCategories },
  }
}

function parseEntitlements(raw: string | null): EntitlementSnapshot | null {
  if (!raw) return null
  try {
    const data = JSON.parse(raw)
    return {
      voucherCode: typeof data.voucherCode === 'string' ? data.voucherCode : null,
      adUnlockedProjectCount: Number.isFinite(data.adUnlockedProjectCount) ? data.adUnlockedProjectCount : 0,
      adUnlockedPhotoCount: Number.isFinite(data.adUnlockedPhotoCount) ? data.adUnlockedPhotoCount : 0,
      templateUnlocked: data.templateUnlocked === true,
      unlockedStitchCategories:
        typeof data.unlockedStitchCategories === 'object' && data.unlockedStitchCategories !== null
          ? data.unlockedStitchCategories
          : {},
    }
  } catch {
    return null
  }
}

/** 合併規則：次數取最大值、布林取 OR、兌換碼取非 null */
function mergeEntitlements(a: EntitlementSnapshot, b: EntitlementSnapshot): EntitlementSnapshot {
  const categories: Record<string, boolean> = { ...a.unlockedStitchCategories }
  for (const [key, unlocked] of Object.entries(b.unlockedStitchCategories)) {
    categories[key] = categories[key] === true || unlocked === true
  }
  return {
    voucherCode: a.voucherCode ?? b.voucherCode,
    adUnlockedProjectCount: Math.max(a.adUnlockedProjectCount, b.adUnlockedProjectCount),
    adUnlockedPhotoCount: Math.max(a.adUnlockedPhotoCount, b.adUnlockedPhotoCount),
    templateUnlocked: a.templateUnlocked || b.templateUnlocked,
    unlockedStitchCategories: categories,
  }
}

async function pushEntitlements(): Promise<void> {
  try {
    if (!(await isICloudAvailable())) return
    const raw = await kv().getItem(ENTITLEMENTS_KV_KEY)
    const remote = parseEntitlements(raw)
    const merged = remote ? mergeEntitlements(entitlementSnapshot(), remote) : entitlementSnapshot()
    const next = JSON.stringify(merged)
    if (next !== raw) {
      await kv().setItem(ENTITLEMENTS_KV_KEY, next)
      logDev('wrote kv', ENTITLEMENTS_KV_KEY)
    }
  } catch (error) {
    if (__DEV__) console.warn('[iCloudBackup] entitlements push failed', error)
  }
}

async function pullEntitlements(): Promise<void> {
  try {
    if (!(await isICloudAvailable())) return
    const remote = parseEntitlements(await kv().getItem(ENTITLEMENTS_KV_KEY))
    if (remote) {
      const local = useEntitlementStore.getState()
      const merged = mergeEntitlements(entitlementSnapshot(), remote)
      const categories = { ...local.unlockedStitchCategories }
      ;(Object.keys(categories) as Array<keyof typeof categories>).forEach((key) => {
        categories[key] = categories[key] || merged.unlockedStitchCategories[key] === true
      })
      useEntitlementStore.setState({
        adUnlockedProjectCount: Math.min(merged.adUnlockedProjectCount, AD_PROJECT_SLOTS),
        adUnlockedPhotoCount: Math.min(merged.adUnlockedPhotoCount, AD_PHOTO_SLOTS),
        templateUnlocked: merged.templateUnlocked,
        unlockedStitchCategories: categories,
      })
      // redeemVoucher 會重新比對 SHA-256，無效的兌換碼不會開通 premium
      if (!local.isPremium && merged.voucherCode) {
        redeemVoucher(merged.voucherCode)
      }
    }
    await pushEntitlements()
  } catch (error) {
    if (__DEV__) console.warn('[iCloudBackup] entitlements pull failed', error)
  }
}

type EntitlementStoreState = ReturnType<typeof useEntitlementStore.getState>

function entitlementsChanged(next: EntitlementStoreState, prev: EntitlementStoreState): boolean {
  return (
    next.voucherCode !== prev.voucherCode ||
    next.premiumSource !== prev.premiumSource ||
    next.adUnlockedProjectCount !== prev.adUnlockedProjectCount ||
    next.adUnlockedPhotoCount !== prev.adUnlockedPhotoCount ||
    next.templateUnlocked !== prev.templateUnlocked ||
    next.unlockedStitchCategories !== prev.unlockedStitchCategories
  )
}

// ─── Init ─────────────────────────────────────────────────────────────────────

let initialized = false

/** 啟動 iCloud 自動備份，回傳 cleanup（在 app/_layout.tsx 掛載時呼叫） */
export function initICloudBackup(): () => void {
  if (initialized) return () => {}
  initialized = true

  const unsubscribers = [
    useProjectStore.subscribe((state, prev) => {
      if (state.projects !== prev.projects || state.deletedProjects !== prev.deletedProjects) scheduleFlush()
    }),
    useCustomStitchStore.subscribe((state, prev) => {
      if (state.customStitches !== prev.customStitches) scheduleFlush()
    }),
    useTemplateStore.subscribe((state, prev) => {
      if (state.templates !== prev.templates) scheduleFlush()
    }),
    useSettingsStore.subscribe((state, prev) => {
      if (state.iCloudBackupEnabled && !prev.iCloudBackupEnabled) scheduleFlush()
    }),
    useEntitlementStore.subscribe((state, prev) => {
      if (entitlementsChanged(state, prev)) void pushEntitlements()
    }),
  ]

  const appStateSubscription = AppState.addEventListener('change', (nextState) => {
    if (nextState === 'background') flushBackupNow()
  })

  const handleAvailability = (available: boolean) => {
    if (!available) return
    scheduleFlush()
    void pullEntitlements()
  }
  const unsubscribeAvailability = subscribeICloudAvailability(handleAvailability)

  void pullEntitlements()
  scheduleFlush()

  return () => {
    unsubscribers.forEach((unsubscribe) => unsubscribe())
    appStateSubscription.remove()
    unsubscribeAvailability()
    if (debounceTimer) {
      clearTimeout(debounceTimer)
      debounceTimer = null
    }
    initialized = false
  }
}

// ─── Restore ──────────────────────────────────────────────────────────────────

function restorableProjectIds(manifest: BackupManifest): string[] {
  const { deletedProjects } = useProjectStore.getState()
  return Object.keys(manifest.projects).filter((id) => !(id in manifest.deleted) && !(id in deletedProjects))
}

/** 首頁還原提示用：iCloud 上有可還原的專案時回傳數量與更新時間 */
export async function getRestorableBackup(): Promise<RestorableBackup | null> {
  if (!(await isICloudAvailable())) return null
  for (let attempt = 0; attempt < RESTORE_CHECK_ATTEMPTS; attempt++) {
    try {
      const manifest = await loadRemoteManifest()
      if (manifest) {
        const projectCount = restorableProjectIds(manifest).length
        return projectCount > 0 ? { projectCount, updatedAt: manifest.updatedAt } : null
      }
    } catch {
      return null
    }
    // 新安裝時 iCloud 目錄清單可能還沒同步完成
    if (attempt < RESTORE_CHECK_ATTEMPTS - 1) await sleep(SYNC_RETRY_DELAY_MS)
  }
  return null
}

async function restoreProject(projectId: string, state: BackupState): Promise<'restored' | 'skipped' | 'failed'> {
  let project: Project
  try {
    const file = JSON.parse(await readTextWithSync(projectPath(projectId))) as Partial<BackupProjectFile>
    if (validateProjectShape(file.project).length > 0) return 'failed'
    project = file.project as Project
    if (project.id !== projectId || typeof project.updatedAt !== 'string') return 'failed'
  } catch {
    return 'failed'
  }

  const local = useProjectStore.getState().projects.find((p) => p.id === projectId)
  if (local && local.updatedAt >= project.updatedAt) return 'skipped'

  const remotePhotos: ProjectPhoto[] = Array.isArray(project.photos) ? project.photos : []
  const photos: ProjectPhoto[] = []
  try {
    await FileSystem.makeDirectoryAsync(`${FileSystem.documentDirectory}${PHOTO_DIR}${projectId}/`, {
      intermediates: true,
    })
  } catch {
    return 'failed'
  }
  for (const photo of remotePhotos) {
    const relativeUri = `${PHOTO_DIR}${projectId}/${photo.id}.jpg`
    try {
      const base64 = await readTextWithSync(photoPath(projectId, photo.id), PHOTO_READ_ATTEMPTS)
      await FileSystem.writeAsStringAsync(`${FileSystem.documentDirectory}${relativeUri}`, base64, {
        encoding: FileSystem.EncodingType.Base64,
      })
      photos.push({ ...photo, uri: relativeUri })
    } catch {
      // 讀不到的照片從還原的專案中移除
    }
  }

  useProjectStore.getState().overwriteProject({
    ...project,
    photos,
    sessions: Array.isArray(project.sessions) ? project.sessions : [],
  })
  state.uploadedProjects[projectId] = project.updatedAt
  // 追蹤 iCloud 上所有照片 id：還原時讀不到的照片會在下次 flush 被當成已移除而清掉
  state.uploadedPhotos[projectId] = remotePhotos.map((photo) => photo.id)
  saveBackupState(state)
  logDev('restored', `${projectPath(projectId)} (${photos.length}/${remotePhotos.length} photos)`)
  return 'restored'
}

function mergeById<T extends { id: string }>(local: T[], remote: T[]): T[] {
  const localIds = new Set(local.map((item) => item.id))
  return [...local, ...remote.filter((item) => typeof item?.id === 'string' && !localIds.has(item.id))]
}

async function restoreLibrary(): Promise<void> {
  let file: Partial<BackupLibraryFile>
  try {
    if (!(await isListedInCloud(LIBRARY_PATH))) return
    file = JSON.parse(await readTextWithSync(LIBRARY_PATH)) as Partial<BackupLibraryFile>
  } catch {
    return
  }
  // 自訂針法與範本沒有 updatedAt：同 id 兩邊都有時保留本機版本
  const { customStitches, templates } = file
  if (Array.isArray(customStitches)) {
    useCustomStitchStore.setState((s) => ({ customStitches: mergeById(s.customStitches, customStitches) }))
  }
  if (Array.isArray(templates)) {
    useTemplateStore.setState((s) => ({ templates: mergeById(s.templates, templates) }))
  }
}

/** 從 iCloud 合併還原：不刪除本機資料，同一專案保留 updatedAt 較新的版本，不受專案數上限限制 */
export async function restoreFromBackup(): Promise<RestoreOutcome> {
  if (!(await isICloudAvailable())) return { status: 'unavailable' }

  restoreInProgress = true
  if (debounceTimer) {
    clearTimeout(debounceTimer)
    debounceTimer = null
  }
  try {
    await (flushFollowUp ?? flushRunning ?? Promise.resolve())

    let manifest: BackupManifest | null
    try {
      manifest = await loadRemoteManifest()
    } catch {
      return { status: 'error' }
    }
    if (!manifest) {
      markRestorePromptHandled()
      return { status: 'noBackup' }
    }
    if (manifest.schemaVersion > BACKUP_SCHEMA_VERSION) return { status: 'unsupportedVersion' }

    const state = getBackupState()
    let restored = 0
    let failed = 0
    for (const projectId of restorableProjectIds(manifest)) {
      const result = await restoreProject(projectId, state)
      if (result === 'restored') restored++
      if (result === 'failed') failed++
    }
    await restoreLibrary()

    // 合併後的 library 在下次 flush 重新上傳
    state.libraryHash = null
    state.restorePromptHandled = true
    saveBackupState(state)
    logDev('restore finished', `${restored} restored, ${failed} failed`)
    return { status: 'restored', restored, failed }
  } finally {
    restoreInProgress = false
    scheduleFlush()
  }
}

// ─── Delete backup ────────────────────────────────────────────────────────────

/** 刪除 iCloud 上的所有備份並關閉自動備份；本機資料不受影響。失敗時拋出錯誤 */
export async function deleteBackup(): Promise<void> {
  useSettingsStore.getState().setICloudBackupEnabled(false)
  if (debounceTimer) {
    clearTimeout(debounceTimer)
    debounceTimer = null
  }
  await (flushFollowUp ?? flushRunning ?? Promise.resolve())

  await Promise.all([
    removeFromCloud(PROJECTS_DIR, true),
    removeFromCloud(PHOTOS_DIR, true),
    removeFromCloud(LIBRARY_PATH, false),
    removeFromCloud(MANIFEST_PATH, false),
  ])
  await kv().removeItem(ENTITLEMENTS_KV_KEY)

  saveBackupState({
    ...DEFAULT_BACKUP_STATE,
    uploadedProjects: {},
    uploadedPhotos: {},
    restorePromptHandled: true,
  })
}

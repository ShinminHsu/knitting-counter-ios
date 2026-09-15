import { Project, ProjectPhoto } from '../types'

/** 照片存放目錄（相對於 Documents directory） */
export const PHOTO_DIR = 'photos/'

/** 舊版完整路徑：file:///…/Application/<UUID>/Documents/photos/<projectId>/<photoId>.jpg */
const LEGACY_ABSOLUTE_PHOTO_PATH = /\/Documents\/(photos\/.+)$/

/** uri 是否為相對於 Documents directory 的照片路徑 */
export function isRelativePhotoPath(uri: string): boolean {
  return uri.startsWith(PHOTO_DIR)
}

/**
 * 將照片 uri 轉為相對路徑 `photos/<projectId>/<photoId>.jpg`
 * - 已是相對路徑 → 原樣回傳
 * - 舊版完整路徑（含 /Documents/photos/）→ 取出 photos/ 之後的部分
 * - 其他格式 → null
 */
export function toRelativePhotoPath(uri: string): string | null {
  if (isRelativePhotoPath(uri)) return uri
  const match = uri.match(LEGACY_ABSOLUTE_PHOTO_PATH)
  return match ? match[1] : null
}

function migratePhoto(photo: ProjectPhoto): ProjectPhoto {
  if (typeof photo?.uri !== 'string') return photo
  return { ...photo, uri: toRelativePhotoPath(photo.uri) ?? photo.uri }
}

/**
 * useProjectStore persist migration v0 → v1
 * 把照片 uri 從完整路徑轉成相對路徑；無法辨識的格式保留原值
 */
export function migrateProjectsToV1(persisted: unknown): unknown {
  const state = persisted as { projects?: Project[] } | null
  if (!state || !Array.isArray(state.projects)) return persisted
  return {
    ...state,
    projects: state.projects.map((project) =>
      Array.isArray(project?.photos)
        ? { ...project, photos: project.photos.map(migratePhoto) }
        : project
    ),
  }
}

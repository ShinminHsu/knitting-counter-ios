import i18n from '../i18n'

// ─── Import Validation ─────────────────────────────────────────────────────────

/**
 * 驗證 project 物件的必要欄位（匯入與 iCloud 還原共用）
 * 回傳錯誤訊息陣列，空陣列代表通過；順序即檢查順序
 */
export function validateProjectShape(project: unknown): string[] {
  // 訊息在呼叫當下才解析，匯入失敗的 Alert 會顯示當前語言
  const missing = (field: string) => i18n.t('importExport.errorMissingField', { field })

  if (typeof project !== 'object' || project === null || Array.isArray(project)) {
    return [missing('project')]
  }

  const p = project as Record<string, unknown>
  const errors: string[] = []

  if (typeof p.id !== 'string' || p.id === '') errors.push(missing('project.id'))
  if (typeof p.name !== 'string' || p.name === '') errors.push(missing('project.name'))
  if (!Array.isArray(p.charts)) errors.push(missing('project.charts'))
  if (p.craftType !== 'crochet' && p.craftType !== 'knitting') {
    errors.push(i18n.t('importExport.errorInvalidCraftType'))
  }

  return errors
}
